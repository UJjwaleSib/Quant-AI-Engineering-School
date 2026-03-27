from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from api.database import get_db
from api.models import User, LessonProgress
from api.schemas import ProgressUpdate, ProgressOut
from api.routers.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

XP_PER_LESSON = 50
XP_PER_EXERCISE = 30


@router.post("/complete-lesson", response_model=ProgressOut)
async def complete_lesson(
    body: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.module_slug == body.module_slug,
            LessonProgress.lesson_index == body.lesson_index,
        )
    )
    progress = result.scalar_one_or_none()

    if progress is None:
        progress = LessonProgress(
            user_id=current_user.id,
            module_slug=body.module_slug,
            lesson_index=body.lesson_index,
        )
        db.add(progress)

    if not progress.completed:
        progress.completed = True
        progress.completed_at = datetime.now(timezone.utc)
        current_user.xp += XP_PER_LESSON

    progress.time_spent_seconds += body.time_spent_seconds
    current_user.current_module = body.module_slug
    current_user.current_lesson = body.lesson_index
    current_user.last_active = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(progress)
    return progress


@router.get("/summary")
async def progress_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,
        )
    )
    completed = result.scalars().all()

    # Group by module
    by_module: dict[str, int] = {}
    for p in completed:
        by_module[p.module_slug] = by_module.get(p.module_slug, 0) + 1

    return {
        "total_lessons_completed": len(completed),
        "by_module": by_module,
        "xp": current_user.xp,
        "streak_days": current_user.streak_days,
        "current_module": current_user.current_module,
        "current_lesson": current_user.current_lesson,
    }


@router.get("/", response_model=list[ProgressOut])
async def get_all_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LessonProgress).where(LessonProgress.user_id == current_user.id)
    )
    return result.scalars().all()
