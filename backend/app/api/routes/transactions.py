from app.core.dependencies import get_current_user
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import uuid

from app.core.database import get_db
from app.models.transaction import Transaction, TransactionStatus
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionListResponse
from app.services.kafka_producer import publish_transaction
from app.services.user_profile import update_user_profile

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(
    payload: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Create and save transaction to DB
    txn = Transaction(
        id=uuid.uuid4(),
        user_id=payload.user_id,
        amount=payload.amount,
        currency=payload.currency,
        merchant=payload.merchant,
        merchant_category=payload.merchant_category,
        device_id=payload.device_id,
        ip_address=payload.ip_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=TransactionStatus.pending
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    # 2. Update Redis user profile
    txn_dict = {
        "id": str(txn.id),
        "user_id": txn.user_id,
        "amount": txn.amount,
        "merchant": txn.merchant,
        "device_id": txn.device_id,
        "currency": txn.currency,
        "created_at": str(txn.created_at)
    }
    await update_user_profile(payload.user_id, txn_dict)

    # 3. Publish to Kafka (async — doesn't block response)
    await publish_transaction(txn_dict)

    return txn

@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    status: Optional[TransactionStatus] = None,
    user_id: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Transaction).order_by(Transaction.created_at.desc())

    if status:
        query = query.where(Transaction.status == status)
    if user_id:
        query = query.where(Transaction.user_id == user_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    result = await db.execute(query.limit(limit).offset(offset))
    transactions = result.scalars().all()

    return TransactionListResponse(total=total, transactions=transactions)

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Transaction).where(Transaction.id == transaction_id)
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn

@router.get("/stats/summary")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import text

    result = await db.execute(text("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flagged,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            AVG(fraud_score) as avg_score
        FROM transactions
    """))
    row = result.fetchone()

    total    = int(row.total or 0)
    approved = int(row.approved or 0)
    flagged  = int(row.flagged or 0)
    blocked  = int(row.blocked or 0)
    avg_score = float(row.avg_score or 0)

    return {
        "total_transactions": total,
        "approved": approved,
        "flagged": flagged,
        "blocked": blocked,
        "fraud_rate": round((flagged + blocked) / total * 100, 2) if total else 0,
        "avg_fraud_score": round(avg_score, 4)
    }