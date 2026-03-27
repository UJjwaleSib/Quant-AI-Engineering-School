from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


# ── Auth ─────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str = "Learner"

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    current_module: str
    current_lesson: int
    xp: int
    streak_days: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Progress ──────────────────────────────────────────────────────────────────
class ProgressUpdate(BaseModel):
    module_slug: str
    lesson_index: int
    time_spent_seconds: int = 0


class ProgressOut(BaseModel):
    module_slug: str
    lesson_index: int
    completed: bool
    time_spent_seconds: int
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Exercises ─────────────────────────────────────────────────────────────────
class ExerciseSubmit(BaseModel):
    module_slug: str
    lesson_index: int
    exercise_index: int
    user_code: str
    execution_output: str = ""


class ExerciseFeedback(BaseModel):
    feedback: str
    score: int
    passed: bool
    hint: str
    improvement: str


# ── Research Logs ─────────────────────────────────────────────────────────────
class ResearchLogCreate(BaseModel):
    module_slug: str
    title: str
    hypothesis: str = ""
    method: str = ""
    results: str = ""
    key_insight: str = ""
    next_step: str = ""
    tags: list[str] = []


class ResearchLogOut(BaseModel):
    id: int
    module_slug: str
    title: str
    hypothesis: str
    method: str
    results: str
    key_insight: str
    next_step: str
    tags: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    module_slug: str = ""
    lesson_title: str = ""
    user_code: str = ""


class ChatResponse(BaseModel):
    reply: str
