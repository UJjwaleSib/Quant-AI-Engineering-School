from fastapi import APIRouter, Depends, HTTPException
from api.content.curriculum import CURRICULUM, get_lesson, get_module
from api.models import User
from api.routers.auth import get_current_user

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/curriculum")
async def get_curriculum(current_user: User = Depends(get_current_user)):
    """Return full curriculum structure (without full lesson content)."""
    tracks = []
    for track in CURRICULUM["tracks"]:
        modules = []
        for module in track["modules"]:
            lessons_summary = [
                {"index": i, "title": l["title"], "duration_min": l.get("duration_min", 15)}
                for i, l in enumerate(module["lessons"])
            ]
            modules.append({
                "slug": module["slug"],
                "title": module["title"],
                "description": module["description"],
                "lessons": lessons_summary,
                "lesson_count": len(module["lessons"]),
            })
        tracks.append({"name": track["name"], "modules": modules})
    return {"tracks": tracks}


@router.get("/{module_slug}")
async def get_module_detail(
    module_slug: str,
    current_user: User = Depends(get_current_user),
):
    module = get_module(module_slug)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.get("/{module_slug}/{lesson_index}")
async def get_lesson_detail(
    module_slug: str,
    lesson_index: int,
    current_user: User = Depends(get_current_user),
):
    lesson = get_lesson(module_slug, lesson_index)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
