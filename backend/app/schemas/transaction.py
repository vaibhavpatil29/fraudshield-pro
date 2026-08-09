from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.models.transaction import TransactionStatus

class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    currency: str = "INR"
    merchant: str
    merchant_category: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TransactionResponse(BaseModel):
    id: UUID
    user_id: str
    amount: float
    currency: str
    merchant: str
    merchant_category: Optional[str]
    status: TransactionStatus
    device_id: Optional[str]
    fraud_score: Optional[float]
    shap_reasons: Optional[list]
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]