import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.config import settings
from app.explain.builder import ExplanationBuilder
from app.explain.llm import OpenAIExplanationEnhancer
from app.explain.models import ExplanationRequest, ExplanationResponse

router = APIRouter(tags=["explanation"])


def require_internal_token(x_rag_internal_token: str = Header(default="")) -> None:
    if not settings.rag_internal_token or not secrets.compare_digest(
        x_rag_internal_token, settings.rag_internal_token
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid AI internal token"
        )


@router.post(
    "/internal/ai/explanation",
    response_model=ExplanationResponse,
    dependencies=[Depends(require_internal_token)],
)
def explain(request: ExplanationRequest) -> ExplanationResponse:
    fallback = ExplanationBuilder().build(request)
    return OpenAIExplanationEnhancer(settings).enhance(request, fallback)
