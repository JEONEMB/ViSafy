import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.config import settings
from app.explain.builder import ExplanationBuilder
from app.explain.llm import OpenAIExplanationEnhancer
from app.explain.models import ExplanationRequest, ExplanationResponse, RagContextInput
from app.rag.dependencies import get_document_store
from app.rag.store import OfficialDocumentStore

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
def explain(
    request: ExplanationRequest,
) -> ExplanationResponse:
    enhancer = OpenAIExplanationEnhancer(settings)
    if enhancer.enabled:
        request = request.model_copy(
            update={"rag_context": _retrieve_context(request, get_document_store())}
        )
    fallback = ExplanationBuilder().build(request)
    return enhancer.enhance(request, fallback)


def _retrieve_context(
    request: ExplanationRequest, store: OfficialDocumentStore
) -> list[RagContextInput]:
    """Best-effort retrieval: an empty index must never block the Rule Engine result."""
    documents = {}
    try:
        keys = list(dict.fromkeys(detail.key for detail in request.rule_details))[:5]
        for key in keys:
            query = f"{request.institution} {request.product_name} {key} official condition"
            for document in store.retrieve(request.product_id, key, query, 2):
                documents[document.document_id] = document
    except Exception:  # noqa: BLE001 - retrieval failure must not block deterministic results
        return []
    return [
        RagContextInput.model_validate(document.model_dump(by_alias=True))
        for document in list(documents.values())[:8]
    ]
