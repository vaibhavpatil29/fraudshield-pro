import json
from aiokafka import AIOKafkaProducer
from app.core.config import settings

_producer = None

async def get_producer() -> AIOKafkaProducer:
    global _producer
    if _producer is None:
        kwargs = {
            "bootstrap_servers": settings.KAFKA_BOOTSTRAP_SERVERS,
            "value_serializer": lambda v: json.dumps(v, default=str).encode("utf-8")
        }
        if settings.KAFKA_SASL_USERNAME:
            kwargs.update({
                "security_protocol": "SASL_SSL",
                "sasl_mechanism": "SCRAM-SHA-256",
                "sasl_plain_username": settings.KAFKA_SASL_USERNAME,
                "sasl_plain_password": settings.KAFKA_SASL_PASSWORD,
            })
        _producer = AIOKafkaProducer(**kwargs)
        await _producer.start()
    return _producer

async def publish_transaction(transaction_data: dict):
    try:
        producer = await get_producer()
        await producer.send_and_wait(
            settings.KAFKA_TOPIC_RAW,
            value=transaction_data
        )
        print(f"Published transaction {transaction_data['id']} to Kafka")
    except Exception as e:
        print(f"Kafka publish failed: {e}")
        # Don't raise — transaction is already saved to DB
        # Kafka failure shouldn't fail the API response

async def close_producer():
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None