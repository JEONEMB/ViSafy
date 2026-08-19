import secrets

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.config import settings
from app.guardrail.answer_builder import GUARDRAILS, GroundedAnswerBuilder
from app.ingestion.models import SyncDocumentsRequest, SyncDocumentsResponse
from app.rag.dependencies import get_document_store
from app.rag.models import RagAnswerRequest, RagAnswerResponse, RetrievalRequest, RetrievalResponse
from app.rag.store import OfficialDocumentStore

router = APIRouter(tags=["rag"])


def require_internal_token(x_rag_internal_token: str = Header(default="")) -> None:
    if not settings.rag_internal_token or not secrets.compare_digest(
        x_rag_internal_token, settings.rag_internal_token
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid RAG internal token"
        )


@router.post(
    "/internal/rag/documents/sync",
    response_model=SyncDocumentsResponse,
    dependencies=[Depends(require_internal_token)],
)
def sync_documents(
    request: SyncDocumentsRequest,
    store: OfficialDocumentStore = Depends(get_document_store),
) -> SyncDocumentsResponse:
    try:
        documents, chunks = store.sync(request.documents)
        return SyncDocumentsResponse(indexedDocuments=documents, indexedChunks=chunks)
    except ValueError as exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exception)
        ) from exception


@router.post(
    "/internal/rag/retrieve",
    response_model=RetrievalResponse,
    dependencies=[Depends(require_internal_token)],
)
def retrieve(
    request: RetrievalRequest,
    store: OfficialDocumentStore = Depends(get_document_store),
) -> RetrievalResponse:
    return RetrievalResponse(
        documents=store.retrieve(request.product_id, request.rule_key, request.query, request.top_k)
    )


@router.post(
    "/internal/rag/answer",
    response_model=RagAnswerResponse,
    dependencies=[Depends(require_internal_token)],
)
def answer(
    request: RagAnswerRequest,
    store: OfficialDocumentStore = Depends(get_document_store),
) -> RagAnswerResponse:
    documents = store.retrieve(request.product_id, request.rule_key, request.query, request.top_k)
    grounded_answer = GroundedAnswerBuilder().build(request, documents)
    return RagAnswerResponse(
        answer=grounded_answer,
        eligibilityStatus=request.eligibility_status,
        ruleResult=request.rule_result,
        documents=documents,
        guardrailsApplied=GUARDRAILS,
    )
