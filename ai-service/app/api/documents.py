import base64
import binascii

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.rag import require_internal_token
from app.ingestion.document_extractor import DocumentExtractor
from app.ingestion.extraction_models import (
    ExtractionResponse,
    HashComparisonRequest,
    HashComparisonResponse,
    HtmlExtractionRequest,
    PdfExtractionRequest,
)

router = APIRouter(prefix="/internal/documents", tags=["documents"], dependencies=[Depends(require_internal_token)])
extractor = DocumentExtractor()


@router.post("/extract/pdf", response_model=ExtractionResponse)
def extract_pdf(request: PdfExtractionRequest) -> ExtractionResponse:
    try:
        content = base64.b64decode(request.content_base64, validate=True)
        return ExtractionResponse.model_validate(extractor.pdf(content))
    except (binascii.Error, ValueError) as exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF payload") from exception


@router.post("/extract/html", response_model=ExtractionResponse)
def extract_html(request: HtmlExtractionRequest) -> ExtractionResponse:
    return ExtractionResponse.model_validate(extractor.html(request.html))


@router.post("/compare-hash", response_model=HashComparisonResponse)
def compare_hash(request: HashComparisonRequest) -> HashComparisonResponse:
    return HashComparisonResponse.model_validate(extractor.compare_hash(request.previous_hash, request.text))
