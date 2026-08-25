from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: Literal["UP"]
    embeddingProvider: str
    embeddingModel: str
    llmProvider: str
    llmConfigured: bool


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="UP",
        embeddingProvider=settings.embedding_provider,
        embeddingModel=settings.embedding_model,
        llmProvider=settings.llm_provider,
        llmConfigured=bool(settings.openai_api_key or settings.llm_api_key),
    )
