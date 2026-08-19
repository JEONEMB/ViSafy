# AI Service

Python 3.11 이상이 필요합니다.

```bash
python -m venv .venv
pip install -e ".[dev]"
uvicorn app.main:app --reload
pytest
```

공식 Source Snapshot을 정제·청킹하고 로컬 해시 임베딩과 ChromaDB로 검색합니다. Backend가 내부 토큰으로 호출하는 동기화·검색·답변 API만 제공하며, Eligibility 결과는 입력받은 그대로 유지합니다.

```text
POST /internal/rag/documents/sync
POST /internal/rag/retrieve
POST /internal/rag/answer
```

로컬 해시 임베딩은 외부 모델 다운로드 없이 개발환경을 재현하기 위한 MVP 구현입니다. 검색 품질 평가 후 다국어 임베딩 모델로 교체하더라도 Product Metadata Filtering과 Guardrail 계약은 유지합니다.
