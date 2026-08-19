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
POST /internal/ai/explanation
```

로컬 해시 임베딩은 외부 모델 다운로드 없이 개발환경을 재현하기 위한 MVP 구현입니다. 검색 품질 평가 후 다국어 임베딩 모델로 교체하더라도 Product Metadata Filtering과 Guardrail 계약은 유지합니다.

AI-201~204 설명 API는 한국어·영어·베트남어 자연어 설명, 쉬운 금융용어와 은행 문의문을 반환합니다. 비자코드, 비자 잔여 개월, 국내 체류 개월과 조건 수는 Backend의 구조화 입력만 사용합니다. `EXTERNAL_CHECK` 또는 `UNKNOWN` 조건이 있을 때만 은행 전달용 한국어 문의문과 선택 언어 번역을 생성하며 가입이나 승인을 보장하지 않습니다.
