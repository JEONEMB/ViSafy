from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.rag import router as rag_router
from app.config import settings


def create_app() -> FastAPI:
    application = FastAPI(
        title="ViSafy AI Service",
        description="RAG, explanation, translation, and guardrail service",
        version="0.1.0",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    application.include_router(health_router)
    application.include_router(rag_router)
    return application


app = create_app()
