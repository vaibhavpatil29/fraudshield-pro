import uuid
import enum
from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class RuleOperator(str, enum.Enum):
    greater_than    = "greater_than"
    less_than       = "less_than"
    equals          = "equals"
    not_equals      = "not_equals"

class RuleAction(str, enum.Enum):
    flag  = "flag"
    block = "block"

class Rule(Base):
    __tablename__ = "rules"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String, nullable=False)
    description = Column(String, nullable=True)
    field       = Column(String, nullable=False)   # e.g. "amount", "is_new_device"
    operator    = Column(SAEnum(RuleOperator), nullable=False)
    value       = Column(Float, nullable=False)
    action      = Column(SAEnum(RuleAction), nullable=False)
    priority    = Column(Float, default=1.0)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())