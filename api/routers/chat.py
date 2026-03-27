from fastapi import APIRouter, Depends
from api.models import User
from api.schemas import ChatRequest, ChatResponse
from api.routers.auth import get_current_user
from api.services.llm import chat_with_tutor

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    reply = await chat_with_tutor(
        messages=messages,
        module_slug=body.module_slug,
        lesson_title=body.lesson_title,
        user_code=body.user_code,
    )
    return ChatResponse(reply=reply)
