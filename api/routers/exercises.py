from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from api.database import get_db
from api.models import User, ExerciseAttempt
from api.schemas import ExerciseSubmit, ExerciseFeedback
from api.routers.auth import get_current_user
from api.services.llm import get_exercise_feedback, generate_research_log
from api.content.curriculum import get_lesson
from api.models import ResearchLog

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.post("/submit", response_model=ExerciseFeedback)
async def submit_exercise(
    body: ExerciseSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = get_lesson(body.module_slug, body.lesson_index)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    exercises = lesson.get("exercises", [])
    if body.exercise_index >= len(exercises):
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise = exercises[body.exercise_index]

    # Get LLM feedback
    feedback_data = await get_exercise_feedback(
        exercise_prompt=exercise["prompt"],
        user_code=body.user_code,
        execution_output=body.execution_output,
        module_context=f"{body.module_slug}: {lesson['title']}",
    )

    # Persist attempt
    attempt = ExerciseAttempt(
        user_id=current_user.id,
        module_slug=body.module_slug,
        lesson_index=body.lesson_index,
        exercise_index=body.exercise_index,
        user_code=body.user_code,
        llm_feedback=feedback_data["feedback"],
        score=feedback_data["score"],
        passed=feedback_data["passed"],
        execution_output=body.execution_output,
    )
    db.add(attempt)

    if feedback_data["passed"]:
        current_user.xp += 30

        # Auto-generate research log on pass
        try:
            log_data = await generate_research_log(
                module_slug=body.module_slug,
                lesson_title=lesson["title"],
                exercise_prompt=exercise["prompt"],
                user_code=body.user_code,
                execution_output=body.execution_output,
            )
            research_log = ResearchLog(
                user_id=current_user.id,
                module_slug=body.module_slug,
                title=log_data["title"],
                hypothesis=log_data["hypothesis"],
                method=log_data["method"],
                results=log_data["results"],
                key_insight=log_data["key_insight"],
                next_step=log_data["next_step"],
                tags=log_data.get("tags", []),
            )
            db.add(research_log)
        except Exception:
            pass  # Don't fail the submission if log generation fails

    await db.commit()
    return ExerciseFeedback(**feedback_data)
