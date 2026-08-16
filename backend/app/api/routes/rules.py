from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.rule import Rule
from app.schemas.rule import RuleCreate, RuleResponse, RuleUpdate
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/rules", tags=["rules"])

@router.post("", response_model=RuleResponse, status_code=201)
async def create_rule(
    payload: RuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  # changed from require_admin
):
    rule = Rule(**payload.dict())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule

@router.get("", response_model=List[RuleResponse])
async def list_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Rule).order_by(Rule.priority.desc())
    )
    return result.scalars().all()

@router.patch("/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: str,
    payload: RuleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(select(Rule).where(Rule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    for field, value in payload.dict(exclude_none=True).items():
        setattr(rule, field, value)

    await db.commit()
    await db.refresh(rule)
    return rule

@router.delete("/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    result = await db.execute(select(Rule).where(Rule.id == rule_id))
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    await db.delete(rule)
    await db.commit()