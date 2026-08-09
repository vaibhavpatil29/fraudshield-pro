from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.dependencies import get_current_user
from app.models.user import User
from app.ml.inference import score_transaction

router = APIRouter(prefix="/ml", tags=["ml"])

class ScoreRequest(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    merchant: Optional[str] = None
    device_id: Optional[str] = None

class ScoreResponse(BaseModel):
    transaction_id: str
    fraud_score: float
    xgb_score: float
    iso_score: float
    is_fraud: bool
    shap_reasons: list

@router.post("/score", response_model=ScoreResponse)
async def score(
    payload: ScoreRequest,
    current_user: User = Depends(get_current_user)
):
    result = score_transaction(payload.dict())
    return ScoreResponse(
        transaction_id=payload.transaction_id,
        **result
    )