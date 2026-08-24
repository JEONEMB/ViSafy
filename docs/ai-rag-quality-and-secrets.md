# AI·RAG 품질 및 운영 Secret 체크리스트

> 기준일: 2026-08-24  
> 범위: P1 검색 품질, Rule Candidate, 문서 처리, 운영 Secret

## 1. 현재 구현

- 기본 `EMBEDDING_PROVIDER=hash`: 외부 Key 없이 동작하는 384차원 기준선
- 선택 `EMBEDDING_PROVIDER=sentence_transformers`: 로컬 다국어 Semantic Embedding Adapter
- 선택 모델 기본값: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- 상품 ID·승인 상태·유효기간·공식 도메인 필터 유지
- 한국어·영어·베트남어 Top-K 비교 평가기
- Top-K 포함률, 인용 정확성, 핵심 수치 무결성, 무근거 답변 차단률, 타 상품 혼입률 측정
- PDF 페이지별 텍스트 추출과 페이지 번호 보존
- 텍스트가 부족한 PDF 페이지를 OCR 필요 대상으로 표시
- HTML의 script/style/nav/footer를 제외한 본문 텍스트 추출
- 정규화된 본문의 SHA-256 계산 및 이전 Hash 변경 감지
- 같은 Source URL의 승인 Snapshot 내용이 바뀌면 기존 Source를 `NEED_REVIEW`로 전환
- 명시된 Visa·기간·외부심사·비공개 조건만 보수적으로 Rule Candidate 추출
- 추출 후보는 항상 `PENDING`; Backend 관리자 승인 전 Runtime 미사용
- Backend의 승인·값 수정 후 승인·UNKNOWN·거절 이력 재사용

## 2. 실행

기본 Hash 기준선:

```bash
cd ai-service
python scripts/evaluate_rag.py --dataset evaluation/rag_eval_dataset.json
```

로컬 Semantic 모델은 선택 설치입니다. 기본 Docker Image에는 큰 ML Runtime과 모델을 포함하지 않습니다.

```bash
pip install ".[semantic]"
set EMBEDDING_PROVIDER=sentence_transformers
python scripts/evaluate_rag.py --dataset evaluation/rag_eval_dataset.json
```

동일 Dataset을 두 Provider로 실행해 다음을 비교합니다.

- `topKRecall`
- `meanTopKPrecision`
- `multilingualTopKOverlap`
- 응답시간과 메모리
- 다른 상품 Source 혼입률(목표 `0`)

합성 Dataset은 회귀 테스트용입니다. 제출 품질 평가는 상품별 최소 5개 질문과 실제 승인 Source ID로 별도 Dataset을 만들어야 합니다.

## 3. 내부 API

모든 API는 `X-RAG-Internal-Token`이 필요합니다.

```text
POST /internal/documents/extract/pdf
POST /internal/documents/extract/html
POST /internal/documents/compare-hash
POST /internal/extraction/rule-candidates
```

PDF API는 `contentBase64`, HTML API는 `html`을 받습니다. OCR이 필요한 페이지는 텍스트를 추측하지 않고 `ocrRequired=true`, `ocrRequiredPages`로 반환합니다.

Rule Candidate 응답의 `sourceExcerpt`, `sourceLocator`, `pageNumber`, `reviewStatus=PENDING`을 관리자 등록 요청에 사용합니다. AI 응답 자체는 승인 작업이 아닙니다.

## 4. 아직 사용자 결정 또는 데이터가 필요한 작업

- [ ] 실제 승인 Source 기준 상품별 질문 5개 이상 작성
- [ ] 각 질문의 기대 Source Document ID 지정
- [ ] Local Semantic 모델의 최초 모델 다운로드와 배포 메모리 허용 여부 결정
- [ ] 외부 Embedding API를 쓸 경우 Provider 선택
- [ ] 스캔 PDF가 실제로 존재할 경우 로컬 OCR 또는 OCR API 선택
- [ ] OpenAI·Gemini·Anthropic 중 실제 LLM Provider 선택
- [ ] 실제 LLM Adapter 구현 전에는 템플릿 설명을 유지
- [ ] AI 추출 후보를 관리자가 원문과 대조하고 승인·수정·거절

## 5. 운영 Secret

배포 전 반드시 교체:

- `RAG_INTERNAL_TOKEN`
- `ADMIN_PASSWORD`
- `DB_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- 실제 JWT 전환 시 `ADMIN_JWT_SECRET`

선택 Provider를 연결할 때만 설정:

- `OPENAI_API_KEY` + `OPENAI_MODEL`
- `GEMINI_API_KEY` + `GEMINI_MODEL`
- `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL`
- 외부 Embedding용 `EMBEDDING_API_KEY`
- 외부 OCR용 `OCR_API_KEY`
- 오류 모니터링용 `SENTRY_DSN`

은행 API, Open Banking, MyData Key는 현재 MVP에 필요하지 않습니다.

Secret은 `.env`를 Git에 추가하지 말고 배포 플랫폼 Secret Manager에 저장합니다. 저장소에는 변수명만 있는 `.env.example`만 유지합니다.

배포 전 검증:

```bash
cd ai-service
python scripts/validate_production_config.py
```

기본값·16자 미만 Secret·선택한 LLM Provider의 누락된 Key/Model이 있으면 종료코드 `1`로 실패합니다.

## 6. 384차원 Hash 기준선 측정

2026-08-24 합성 회귀 Dataset 11건 측정값:

| 지표 | 값 |
| --- | ---: |
| Top-K 포함률 | 1.0000 |
| Top-1 기대 Source 인용 정확성 | 1.0000 |
| Mean Top-K Precision | 0.5000 |
| 숫자·Visa 무결성 | 1.0000 |
| 무근거 답변 차단률 | 1.0000 |
| 타 상품 Source 혼입률 | 0.0000 |
| 언어별 Top-K 집합 일치율 | 1.0000 |

문서가 상품별 2개뿐인 합성 Dataset이므로 높은 Recall과 언어 일치율을 실제 품질로 과대해석하면 안 됩니다. `Mean Top-K Precision=0.5`는 관련 문서와 같은 상품의 비관련 문서가 함께 반환되는 현재 기준선의 한계를 드러냅니다. 실제 승인 Source Dataset과 Semantic Provider 비교 결과를 제출 지표로 사용합니다.
