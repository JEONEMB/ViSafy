from pydantic import BaseModel, Field


class PdfExtractionRequest(BaseModel):
    content_base64: str = Field(alias="contentBase64", min_length=4)


class HtmlExtractionRequest(BaseModel):
    html: str = Field(min_length=1)


class HashComparisonRequest(BaseModel):
    previous_hash: str | None = Field(default=None, alias="previousHash")
    text: str


class ExtractedPage(BaseModel):
    page_number: int = Field(alias="pageNumber")
    text: str

    model_config = {"populate_by_name": True}


class ExtractionResponse(BaseModel):
    document_type: str = Field(alias="documentType")
    text: str
    pages: list[ExtractedPage]
    content_hash: str = Field(alias="contentHash")
    ocr_required: bool = Field(alias="ocrRequired")
    ocr_required_pages: list[int] = Field(alias="ocrRequiredPages")

    model_config = {"populate_by_name": True}


class HashComparisonResponse(BaseModel):
    content_hash: str = Field(alias="contentHash")
    changed: bool
    review_required: bool = Field(alias="reviewRequired")
    recommended_status: str = Field(alias="recommendedStatus")

    model_config = {"populate_by_name": True}
