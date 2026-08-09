import uuid
import enum
from sqlalchemy import Column, String, Float, DateTime, Enum as SAEnum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class TransactionStatus(str, enum.Enum):
    pending   = "pending"
    approved  = "approved"
    flagged   = "flagged"
    blocked   = "blocked"

class Transaction(Base):
    __tablename__ = "transactions"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(String, nullable=False, index=True)
    amount          = Column(Float, nullable=False)
    currency        = Column(String, default="INR")
    merchant        = Column(String, nullable=False)
    merchant_category = Column(String, nullable=True)
    status          = Column(SAEnum(TransactionStatus), default=TransactionStatus.pending)
    device_id       = Column(String, nullable=True)
    ip_address      = Column(String, nullable=True)
    latitude        = Column(Float, nullable=True)
    longitude       = Column(Float, nullable=True)
    fraud_score     = Column(Float, nullable=True)
    shap_reasons    = Column(JSON, nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    fraud_score    = Column(Float, nullable=False)
    shap_reasons   = Column(JSON, nullable=True)
    status         = Column(String, default="pending")  # pending/true_positive/false_positive
    reviewed_by    = Column(UUID(as_uuid=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at    = Column(DateTime(timezone=True), nullable=True)