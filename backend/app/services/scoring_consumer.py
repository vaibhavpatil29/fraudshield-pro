import asyncio
import json
import logging
from aiokafka import AIOKafkaConsumer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.transaction import Transaction, FraudAlert, TransactionStatus
from app.models.rule import Rule
from app.ml.inference import score_transaction
from app.services.rule_engine import evaluate_rules

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scoring_consumer")

FRAUD_THRESHOLD = 0.5  # Score above this → create alert
BLOCK_THRESHOLD = 0.8  # Score above this → auto block

async def process_transaction(txn_data: dict, db: AsyncSession):
    txn_id = txn_data.get("id")

    try:
        # 1. Score with ML
        result = score_transaction(txn_data)
        fraud_score  = result["fraud_score"]
        shap_reasons = result["shap_reasons"]
        logger.info(f"Scored {txn_id}: {fraud_score:.4f}")

        # 2. Run rule engine
        rules_result = await db.execute(
            select(Rule).where(Rule.is_active == True)
        )
        active_rules = rules_result.scalars().all()
        txn_data["fraud_score"] = fraud_score
        triggered_rule = evaluate_rules(txn_data, active_rules)

        # 3. Determine final status
        if triggered_rule and triggered_rule["action"] == "block":
            new_status = TransactionStatus.blocked
        elif fraud_score >= BLOCK_THRESHOLD:
            new_status = TransactionStatus.blocked
        elif triggered_rule and triggered_rule["action"] == "flag":
            new_status = TransactionStatus.flagged
        elif fraud_score >= FRAUD_THRESHOLD:
            new_status = TransactionStatus.flagged
        else:
            new_status = TransactionStatus.approved

        # Add rule info to shap_reasons if triggered
        if triggered_rule:
            shap_reasons = shap_reasons + [{"rule_triggered": triggered_rule["rule_name"],
                                             "rule_action": triggered_rule["action"]}]
            logger.warning(f"Rule triggered: {triggered_rule['rule_name']} → {triggered_rule['action']}")

        # 4. Update transaction
        await db.execute(
            update(Transaction)
            .where(Transaction.id == txn_id)
            .values(
                fraud_score=fraud_score,
                shap_reasons=shap_reasons,
                status=new_status
            )
        )

        # 5. Create alert if flagged or blocked
        if new_status in [TransactionStatus.flagged, TransactionStatus.blocked]:
            alert = FraudAlert(
                transaction_id=txn_id,
                fraud_score=fraud_score,
                shap_reasons=shap_reasons,
                status="pending"
            )
            db.add(alert)
            logger.warning(f"ALERT created: {txn_id} | score: {fraud_score:.4f} | status: {new_status.value}")

        await db.commit()

    except Exception as e:
        logger.error(f"Error processing {txn_id}: {e}")
        await db.rollback()
        
async def start_scoring_consumer():
    kwargs = {
        "bootstrap_servers": settings.KAFKA_BOOTSTRAP_SERVERS,
        "group_id": "fraud-scoring-group",
        "value_deserializer": lambda v: json.loads(v.decode("utf-8")),
        "auto_offset_reset": "earliest"
    }
    if settings.KAFKA_SASL_USERNAME:
        kwargs.update({
            "security_protocol": "SASL_SSL",
            "sasl_mechanism": "SCRAM-SHA-256",
            "sasl_plain_username": settings.KAFKA_SASL_USERNAME,
            "sasl_plain_password": settings.KAFKA_SASL_PASSWORD,
            "ssl_context": __import__('ssl').create_default_context(),
        })
    consumer = AIOKafkaConsumer(settings.KAFKA_TOPIC_RAW, **kwargs)
    await consumer.start()

    try:
        async for message in consumer:
            txn_data = message.value
            logger.info(f"Received transaction: {txn_data.get('id')}")

            async with AsyncSessionLocal() as db:
                await process_transaction(txn_data, db)

    except asyncio.CancelledError:
        logger.info("Consumer shutting down...")
    finally:
        await consumer.stop()
        logger.info("Consumer stopped.")

if __name__ == "__main__":
    asyncio.run(start_scoring_consumer())