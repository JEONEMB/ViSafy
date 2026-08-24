import io

from pypdf import PdfWriter

from app.ingestion.document_extractor import DocumentExtractor


def test_html_extraction_removes_scripts_and_hash_change_is_detected() -> None:
    extractor = DocumentExtractor()
    result = extractor.html("<html><script>ignore()</script><main><h1>가입 대상</h1><p>실명의 개인</p></main></html>")

    assert "가입 대상" in result["text"]
    assert "실명의 개인" in result["text"]
    assert "ignore" not in result["text"]
    assert len(result["contentHash"]) == 64
    comparison = extractor.compare_hash("0" * 64, result["text"])
    assert comparison["changed"] is True
    assert comparison["reviewRequired"] is True
    assert comparison["recommendedStatus"] == "NEED_REVIEW"


def test_pdf_preserves_page_numbers_and_flags_scan_candidates() -> None:
    writer = PdfWriter()
    writer.add_blank_page(width=100, height=100)
    writer.add_blank_page(width=100, height=100)
    stream = io.BytesIO()
    writer.write(stream)

    result = DocumentExtractor().pdf(stream.getvalue())

    assert [page["pageNumber"] for page in result["pages"]] == [1, 2]
    assert result["ocrRequired"] is True
    assert result["ocrRequiredPages"] == [1, 2]
