from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from api.database import get_db
from api.models import User, ResearchLog
from api.schemas import ResearchLogCreate, ResearchLogOut
from api.routers.auth import get_current_user

router = APIRouter(prefix="/research-logs", tags=["research-logs"])


@router.get("/", response_model=list[ResearchLogOut])
async def list_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ResearchLog)
        .where(ResearchLog.user_id == current_user.id)
        .order_by(ResearchLog.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=ResearchLogOut)
async def create_log(
    body: ResearchLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = ResearchLog(user_id=current_user.id, **body.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


@router.get("/{log_id}", response_model=ResearchLogOut)
async def get_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ResearchLog).where(
            ResearchLog.id == log_id,
            ResearchLog.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.delete("/{log_id}")
async def delete_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ResearchLog).where(
            ResearchLog.id == log_id,
            ResearchLog.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    await db.delete(log)
    await db.commit()
    return {"ok": True}
