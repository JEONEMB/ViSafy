# AI Service

Python 3.11 이상이 필요합니다.

```bash
python -m venv .venv
pip install -e ".[dev]"
uvicorn app.main:app --reload
pytest
```

현재는 `GET /health`만 노출합니다. 이후 ingestion, extraction, RAG, 설명, 번역, guardrail을 분리 구현하며 LLM이 직접 자격을 판정하지 않도록 유지합니다.

