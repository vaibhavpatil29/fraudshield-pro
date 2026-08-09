from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import Optional
from app.core.database import get_db
from app.models.transaction import FraudAlert, Transaction
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("")
async def list_alerts(
    status: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(FraudAlert).order_by(FraudAlert.created_at.desc())
    if status:
        query = query.where(FraudAlert.status == status)

    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    result = await db.execute(query.limit(limit).offset(offset))
    alerts = result.scalars().all()

    alert_list = []
    for a in alerts:
        txn = await db.get(Transaction, a.transaction_id)
        alert_list.append({
            "id": str(a.id),
            "transaction_id": str(a.transaction_id),
            "fraud_score": a.fraud_score,
            "shap_reasons": a.shap_reasons,
            "status": a.status,
            "created_at": str(a.created_at),
            "amount": txn.amount if txn else None,
            "merchant": txn.merchant if txn else None,
            "user_id": txn.user_id if txn else None,
        })

    return {"total": total, "alerts": alert_list}

@router.patch("/{alert_id}")
async def update_alert(
    alert_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await db.execute(
        update(FraudAlert)
        .where(FraudAlert.id == alert_id)
        .values(status=payload.get("status", "pending"))
    )
    await db.commit()
    return {"message": "Alert updated"}