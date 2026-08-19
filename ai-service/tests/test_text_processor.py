from app.ingestion.text_processor import FinancialDocumentProcessor


def test_cleaning_and_chunking_preserve_content_with_overlap() -> None:
    processor = FinancialDocumentProcessor(chunk_size=220, overlap=40)
    source = (
        "가입 대상은 외국인 고객입니다.  비자 유형은 공식 조건을 확인하세요.\n\n" * 12
    ).strip()

    cleaned = processor.clean(source)
    chunks = processor.chunk(source)

    assert "  " not in cleaned
    assert len(chunks) > 1
    assert all(1 <= len(chunk) <= 220 for chunk in chunks)
    assert all("가입 대상" in chunk for chunk in chunks)
