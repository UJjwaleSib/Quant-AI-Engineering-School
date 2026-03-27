"""AIEngSchool FastAPI backend — quant + AI engineering learning platform."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import init_db, get_settings
from api.routers import auth, lessons, exercises, research_logs, progress, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="AIEngSchool API",
        description="Quant + AI Engineering learning platform backend",
        version="1.0.0",
        lifespan=lifespan,
    )
    origins = [o.strip() for o in settings.cors_origins.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router)
    app.include_router(lessons.router)
    app.include_router(exercises.router)
    app.include_router(research_logs.router)
    app.include_router(progress.router)
    app.include_router(chat.router)

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "aiengschool-api"}

    return app


app = create_app()
