from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.rule import RuleOperator, RuleAction

class RuleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    field: str
    operator: RuleOperator
    value: float
    action: RuleAction
    priority: float = 1.0

class RuleResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    field: str
    operator: RuleOperator
    value: float
    action: RuleAction
    priority: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RuleUpdate(BaseModel):
    is_active: Optional[bool] = None
    priority: Optional[float] = None
    value: Optional[float] = None