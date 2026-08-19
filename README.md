# Visa-aware Financial Agent

공식 금융 Source와 사람이 검수한 Rule을 기반으로 외국인 사용자의 금융상품 사전자격을 안내하기 위한 MVP 모노레포입니다.

현재 구현 범위:

- ENV-001~005 개발환경 및 Docker 통합환경
- DATA-001 공식 Source 등록과 공식 도메인 allowlist
- DATA-002 원문 Snapshot 및 SHA-256 hash 저장
- DATA-003 Rule Candidate 저장 화면(현재 수동 입력, 자동 AI 추출은 후속 단계)
- DATA-004 Source 및 Rule Human Verification
- DATA-005 공식 자료 간 Rule conflict 감지
- DATA-006 유효기간, 최근 검증일, Source 링크 및 상태 표시
- FR-101 한국어·영어·베트남어 언어 선택과 브라우저 저장
- FR-102 24시간 임시 금융 프로필
- FR-103 지원 비자 선택(D-2, D-4, E-7, E-9, F-2, F-5, F-6)
- FR-201 승인된 공식 Source 기반 금융상품 등록
- FR-202 금융 목적·유형·은행·외국인 대상·진단 상태별 상품 조회
- FR-203 상품 요약·조건·서류·신청방법·공식 출처 상세 조회
- 승인된 Rule Candidate의 `PRODUCT_RULE` 동기화와 진단 준비 상태 관리

## 프로젝트 구성

- `frontend`: Next.js, TypeScript, Tailwind CSS, TanStack Query
- `backend`: Java 21, Spring Boot, JPA, Flyway, MySQL, OpenAPI
- `ai-service`: Python 3.11, FastAPI, Pydantic, ChromaDB client
- `data-pipeline`: Source registry, Snapshot, 검수 작업 공간
- `infra`: Docker Compose 통합환경
- `docs`: API, 아키텍처, 데이터 정책, 테스트 계획

## 빠른 시작 — Windows PowerShell

필수 프로그램은 Git과 Docker Desktop입니다. Docker Desktop은 실행 상태여야 합니다.

```powershell
Copy-Item .env.example .env
docker compose up --build
```

처음 실행할 때는 Docker image와 의존성을 내려받으므로 시간이 걸릴 수 있습니다. 모든 서비스가 실행되면 Chrome에서 아래 주소를 엽니다.

- 메인: http://localhost:3000
- 임시 프로필: http://localhost:3000/profile
- 금융상품 조회: http://localhost:3000/products
- 금융상품 관리: http://localhost:3000/admin/products
- Source · Rule 검수: http://localhost:3000/admin/sources
- 관리자 로그인: http://localhost:3000/admin/login
- 시스템 상태: http://localhost:3000/health
- Backend OpenAPI: http://localhost:8080/swagger-ui.html

백그라운드로 실행하려면:

```powershell
docker compose up --build --detach --wait
```

로그 확인과 종료:

```powershell
docker compose logs --follow
docker compose down
```

`docker compose down`은 컨테이너만 종료하며 MySQL 데이터는 Docker volume에 남습니다. `down --volumes`는 저장 데이터를 삭제하므로 테스트 데이터를 정말 초기화할 때만 사용하세요.

## How To Use

### 1. 언어 선택

1. 메인 화면 http://localhost:3000 에 접속합니다.
2. `🇰🇷 대한민국`, `🇺🇸 United States`, `🇻🇳 Việt Nam` 중 사용할 언어를 선택합니다.
3. 선택하면 임시 프로필 화면으로 이동하며 공통 메뉴, 필드명, 선택지, 비자명, 예시와 안내문이 해당 언어로 바뀝니다.
4. 선택한 언어는 브라우저에 저장되어 페이지를 다시 열어도 유지됩니다. 프로필 화면 상단의 언어 버튼으로 언제든 변경할 수 있습니다.

### 2. 시스템 상태 확인

1. http://localhost:3000/health 에 접속합니다.
2. Backend와 AI Service가 모두 `UP`인지 확인합니다.

### 3. 임시 사용자 프로필 입력

1. 상단 메뉴에서 **프로필**을 선택합니다.
2. 한국어, English 또는 Tiếng Việt 중 사용할 언어가 맞는지 확인합니다.
3. 메인에서 선택한 국가가 국적으로 자동 저장됩니다. 생년월일, 지원 비자, 체류기간, 직업, 소득과 금융 목적을 입력합니다.
4. 날짜는 선택한 언어에 맞는 `연도·월·일`, `Month·Day·Year`, `Ngày·Tháng·Năm` 순서와 표기로 입력합니다.
5. **저장 후 금융상품 보기**를 누릅니다.
6. 프로필이 저장되면 금융상품 목록으로 자동 이동합니다.

프로필은 24시간 후 만료됩니다. 주민등록번호, 여권번호, 외국인등록번호, 계좌번호는 입력하거나 저장하지 않습니다.

### 4. 공식 Source 등록

1. http://localhost:3000/admin/login 에서 서비스 관리자 계정으로 로그인합니다.
2. 상단 메뉴에서 **Source · Rule 검수**를 선택합니다.
3. 은행 또는 공공기관의 공식 페이지에서 원문을 확인합니다.
4. 기관, Source 유형, 제목, HTTPS URL, 수집 당시 원문 텍스트와 유효기간을 입력합니다.
5. **Source 저장**을 누릅니다.
6. 저장된 Snapshot, SHA-256 hash, 최근 검증일을 확인합니다.
7. 원문 링크와 Snapshot이 일치할 때만 **공식 Source 승인**을 누릅니다.

블로그, 커뮤니티, 광고성 제3자 페이지는 등록할 수 없습니다. 허용된 공식 도메인은 `.env`의 `SOURCE_ALLOWED_DOMAINS`에서 관리합니다. 새 기관을 추가할 때는 실제 공식 도메인임을 확인한 뒤 목록에 추가하고 컨테이너를 다시 시작하세요.

### 5. Rule Candidate 등록 및 검수

1. 등록된 Source를 근거로 후보를 작성합니다.
2. 상품 코드, Rule Key, operator, value, Rule level, 필수 여부, 설명, 원문 근거 문장, 근거 위치, 유효기간과 AI 추출 신뢰도를 입력합니다.
3. **PENDING 후보 저장**을 누릅니다.
4. Source가 먼저 `APPROVED`인지 확인합니다.
5. 후보를 검토하고 **승인**, **값 수정 후 승인**, **UNKNOWN**, **거절** 중 하나를 선택합니다.

`confidence`는 문서에서 값을 추출한 신뢰도이며 금융상품 가입 가능 확률이 아닙니다. Source가 `APPROVED`가 아니면 Rule을 승인할 수 없습니다.

같은 상품과 Rule Key에 서로 다른 공식 조건이 승인되면 시스템은 자동으로 하나를 선택하지 않고 관련 Rule을 모두 `NEED_REVIEW`로 변경합니다. 관리자가 문서 최신성과 우선순위를 확인해야 합니다.

### 6. 금융상품 등록 및 조회

1. 공식 Source를 등록하고 `APPROVED` 상태로 검수합니다.
2. http://localhost:3000/admin/products 에서 상품 코드, 은행, 상품 유형, 금융 목적, 설명, 공식 Source, 공개조건, 추가 확인 조건, 필요서류와 신청방법을 등록합니다.
3. http://localhost:3000/admin/sources 에서 등록 상품을 선택해 Rule Candidate를 작성하고 승인합니다.
4. 승인된 후보만 `PRODUCT_RULE`로 동기화됩니다. 후보가 충돌·거절·만료 상태가 되면 해당 Runtime Rule은 비활성화됩니다.
5. http://localhost:3000/products 에서 금융 목적, 상품 유형, 은행, 외국인 대상 여부, 진단 가능 여부로 상품을 조회합니다.
6. 상품 카드를 선택해 상품 요약, 조건, 필요서류, 신청방법, 공식 출처와 정보 기준일을 확인합니다.

진단 준비 상태는 다음 MVP 기준으로 계산합니다.

- `NOT_READY`: 승인된 PRODUCT_RULE이 없음
- `PARTIAL`: 승인 Rule은 있지만 핵심 `VISA_TYPE` HARD Rule이 없거나 필수 `EXTERNAL_CHECK`/`UNKNOWN` Rule이 포함됨
- `READY`: `VISA_TYPE` HARD Rule이 있고 필수 불확실 Rule이 없음

`READY`는 시스템이 검수된 조건으로 사전 진단할 준비가 됐다는 뜻이며 실제 가입 승인이나 가입 가능 확률을 의미하지 않습니다.

#### Rule 모델

- `HARD`: 공식자료에 명시되어 사용자 입력과 직접 비교할 수 있는 조건
- `EXTERNAL_CHECK`: 보증보험, 은행 내부 신용평가처럼 외부 심사가 필요한 조건
- `UNKNOWN`: 조건의 존재는 확인했지만 공개된 세부 기준이 없는 조건
- Operator: `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE`, `IN`, `NOT_IN`, `EXISTS`

Runtime `PRODUCT_RULE`은 `product_id`, `rule_key`, `operator`, `rule_value`, `rule_level`, `mandatory`, `source_document_id`, `source_locator`, `valid_from`, `valid_to`, `review_status`, `verified_at`, `description`을 보관합니다. 승인된 후보만 동기화되며, 조회 시 `APPROVED` 상태이면서 현재 유효기간 안에 있는 Rule만 사용합니다. `source_excerpt`, 후보 연결값과 활성 상태는 추적·운영을 위한 내부 필드로 추가 보존합니다.

### 7. 사전자격 진단

1. 임시 금융 프로필을 저장합니다. 브라우저에는 예측하기 어려운 UUID 세션 값이 저장되며 프로필과 함께 24시간 후 만료됩니다.
2. http://localhost:3000/products 에서 상품을 선택합니다.
3. 상품 상세의 **내 프로필로 사전자격 확인**을 누릅니다.
4. 충족 조건, 미충족 조건, 은행 확인 조건, 공개되지 않은 조건과 정보부족 사유를 확인합니다.

최종 상태는 다음 순서로 결정합니다.

- `PUBLIC_CONDITIONS_NOT_MET`: 명시적인 HARD Rule FAIL이 하나 이상 있음
- `INSUFFICIENT_INFORMATION`: FAIL은 없지만 필수입력, 검수, Source 또는 필수 Rule이 부족함
- `NEED_BANK_CONFIRMATION`: FAIL과 정보부족은 없지만 EXTERNAL_CHECK 또는 필수 UNKNOWN이 있음
- `PUBLIC_CONDITIONS_MET`: 적용 가능한 HARD Rule이 모두 통과하고 중요한 불확실 조건이 없음

지원 Rule Key는 `AGE`, `VISA_TYPE`, `VISA_REMAINING_MONTH`, `RESIDENCY_MONTH`, `DOMESTIC_INCOME_MONTH`, `EMPLOYMENT_DURATION_MONTHS`, `MONTHLY_INCOME`, `NATIONALITY`, `OCCUPATION`, `EMPLOYMENT_TYPE`, `FINANCIAL_PURPOSE`, `HAS_BANK_ACCOUNT`, `HOUSING_TYPE`, `DESIRED_AMOUNT`, `PREFERRED_BANK`입니다. `IN`과 `NOT_IN` 값은 반드시 `["F-2","F-5"]`처럼 JSON 배열로 입력합니다. 숫자 비교 값은 `19`, 문자열 동등 비교 값은 `F-5`, 존재 여부는 `EXISTS`를 사용합니다.

진단 결과는 DB에 저장하지 않습니다. 모든 결과는 공개조건을 기반으로 한 사전 확인이며 최종 가입승인이 아닙니다.

### 8. 상품 추천 및 정렬

프로필 저장 후 http://localhost:3000/products 상단에서 개인화 추천을 확인할 수 있습니다.

- `PUBLIC_CONDITIONS_MET`, `NEED_BANK_CONFIRMATION` 상품은 **추천 후보**에 표시됩니다.
- `INSUFFICIENT_INFORMATION` 상품은 **추가 정보 필요** 영역에 분리됩니다.
- `PUBLIC_CONDITIONS_NOT_MET` 상품은 추천 후보에서 제외되며, 제외된 상품 수만 안내합니다.
- 추천 후보는 HARD Rule 충족 수 내림차순, UNKNOWN 수 오름차순, 금융 목적 일치, 선호 은행 일치 순으로 정렬됩니다.
- `92%` 같은 가입 가능 확률은 계산하거나 표시하지 않습니다. 대신 `확인된 공개조건 4/4`, `추가 확인 2개`처럼 검증 가능한 개수를 보여줍니다.

추천 결과 역시 저장하지 않고 요청할 때 현재 승인 Rule과 임시 프로필로 다시 계산합니다. 희망 금액 등 상품에 대응 필드가 아직 없는 선호조건은 정렬에 사용하지 않으며, 현재 MVP의 선호조건 일치는 `preferredBank`와 기관명 비교를 의미합니다.

### 9. 공식 금융문서 RAG

RAG 색인과 답변은 `APPROVED` 상태이며 현재 유효한 공식 Source만 사용합니다. 블로그·커뮤니티·광고성 제3자 URL은 AI Service의 도메인 허용 목록에서 거부됩니다.

1. http://localhost:3000/admin/sources 에서 Source Snapshot과 문서 언어를 등록하고 승인합니다.
2. 승인 Source를 금융상품 또는 PRODUCT_RULE에 연결합니다.
3. 관리자 화면의 **RAG 전체 재색인**을 누릅니다.
4. 임시 프로필을 저장한 뒤 상품 상세 화면의 **공식 금융문서에 질문하기**에서 Rule과 질문을 선택합니다.
5. Eligibility 결과, 구조화된 Rule 결과, 공식 근거 문단과 Source 링크를 각각 확인합니다.

전처리 순서는 `Snapshot → NFKC 정규화 및 Cleaning → 문단 기반 Chunking → Metadata → Embedding → ChromaDB`입니다. Metadata에는 `document_id`, `institution`, `document_name`, `source_type`, `source_url`, `retrieved_at`, `valid_from`, `valid_to`, `product_id`, `language`, `content_hash`, `rule_keys`를 저장합니다. 검색에는 질문과 Rule Key를 함께 사용하고 ChromaDB의 `product_id` 필터를 항상 적용하므로 다른 상품의 조건이 섞이지 않습니다.

현재 MVP는 외부 API Key와 모델 다운로드 없이 재현 가능한 384차원 로컬 해시 임베딩을 사용합니다. 답변도 LLM의 자유 생성을 사용하지 않고 검색 문단과 Eligibility Engine의 확정 결과를 조합하는 추출형 방식입니다. 따라서 실행 환경과 관계없이 다음 가드레일을 지킵니다.

- 공식 Source에 없는 조건을 생성하지 않음
- Eligibility Engine 결과를 변경하지 않음
- 공개되지 않은 조건은 은행 확인이 필요하다고 표시
- 가입이나 승인을 보장하지 않음
- 구조화 Rule 결과와 Source 근거를 분리
- 검색 문서 안의 문장을 명령이 아니라 근거 데이터로만 처리

관리자 재색인 API는 `POST /api/admin/rag/reindex`, 사용자 근거 질문 API는 `POST /api/rag/answer`입니다. Backend와 AI Service 사이의 `/internal/rag/**` API는 `RAG_INTERNAL_TOKEN`으로 보호되며 외부에 직접 공개하지 않습니다. 공식 도메인을 추가할 때는 `.env`의 `SOURCE_ALLOWED_DOMAINS`에 쉼표로 구분해 등록한 후 AI Service를 재시작하세요.

### 10. AI 설명·쉬운 용어·은행 문의문

상품 상세에서 사전자격 진단을 실행하면 `POST /api/ai/explanation`이 현재 임시 프로필과 상품으로 Eligibility Engine을 다시 실행합니다. Frontend가 상태나 숫자를 임의로 전달하지 않으며, Backend가 확정한 구조화 값만 AI Service에 전달합니다.

- AI-201: `PUBLIC_CONDITIONS_MET`, `NEED_BANK_CONFIRMATION`, `PUBLIC_CONDITIONS_NOT_MET`, `INSUFFICIENT_INFORMATION` 상태를 가입 보장 표현 없이 자연어로 설명
- AI-202: 프로필 언어에 따라 한국어·영어·베트남어로 설명하고 비자코드·기간·조건 수는 구조화 필드로 별도 반환
- AI-203: `체류자격 (Status of Stay)`, `소득증빙 (Proof of Income)`, `보증보험증권`과 은행 내부 신용평가를 쉬운 말로 설명
- AI-204: EXTERNAL_CHECK 또는 UNKNOWN이 있을 때 한국어 은행 문의문과 선택 언어 번역을 함께 생성하며 화면에서 복사 가능

문의문에 사용되는 비자코드, 비자 잔여 개월, 국내 체류 개월은 Backend가 날짜로 계산한 값만 사용합니다. AI 설명이 일시적으로 실패해도 Eligibility Engine 결과는 그대로 유지되며 최종 가입이나 승인을 보장하지 않습니다. 현재 설명과 문의문은 외부 LLM 없이 검증 가능한 다국어 템플릿으로 생성합니다.

### 11. 현재 제한사항

- DATA-003의 LLM 자동 추출은 아직 연결하지 않았습니다. 현재는 관리자 화면에서 후보 구조를 직접 입력합니다.
- `/api/admin/**`, 상품 관리, Source·Rule 검수 화면은 기본적으로 관리자 인증이 필요합니다. 로그인 정보는 브라우저 탭의 `sessionStorage`에만 유지되며 탭을 닫으면 삭제됩니다.
- 현재 MVP 관리자 인증은 HTTP Basic 방식입니다. 반드시 HTTPS 환경에서 사용하고, 실제 외부 배포 전에는 JWT의 HttpOnly 쿠키 또는 조직 SSO로 교체해야 합니다.

#### MVP 이후 RAG 보완 백로그

현재 RAG는 관리자가 등록한 공식 Source Snapshot을 대상으로 안전한 검색과 근거 설명을 제공하는 MVP입니다. 아래 항목은 MVP 화면과 핵심 사용자 흐름이 안정된 뒤, 최종 제출 전 우선순위에 따라 보완합니다.

**P0 · 제출 전 필수 점검**

- [ ] `RAG_INTERNAL_TOKEN`, 관리자 비밀번호 등 저장소 기본값을 충분히 긴 운영용 비밀값으로 교체하고 배포 환경의 Secret으로 관리
- [ ] 등록된 Source URL, Snapshot, 상품 연결, 언어, 유효기간 및 검수 상태를 실제 공식 문서 기준으로 재검증
- [ ] Source 만료·Rule 충돌·색인 누락 시 사용자에게 `확인 필요`가 표시되는 통합 시나리오 재검증
- [ ] RAG 답변이 Eligibility Engine 결과를 변경하거나 가입을 보장하지 않는지 한국어·영어·베트남어 회귀 테스트
- [ ] 운영 배포에서 `/internal/rag/**`가 외부 네트워크에 직접 노출되지 않는지 확인

**P1 · 문서 수집과 전처리 자동화**

- [ ] 공식 금융상품 웹페이지 수집기와 도메인별 HTML 본문 추출기 구현
- [ ] PDF 상품설명서·약관 Text Extraction 구현 및 페이지 번호를 `source_locator`에 보존
- [ ] 스캔 PDF·이미지를 위한 OCR 도입과 추출 품질 검수 절차 마련
- [ ] HWP/HWPX 문서 지원 필요성을 조사하고 제출 대상 문서에 맞는 추출기 선택
- [ ] `content_hash` 변경 감지, 정기 수집 스케줄러, 증분 재색인 및 삭제 문서 반영
- [ ] robots.txt, 이용약관, 요청 속도 제한 및 수집 실패 재시도 정책 문서화

**P1 · 검색 품질 고도화**

- [ ] 현재 384차원 로컬 해시 임베딩을 한국어·영어·베트남어 금융문서용 다국어 Embedding 모델과 비교 평가
- [ ] 상품 ID 필터에 Rule Key, 문서 언어, 유효기간 필터를 추가 적용할지 평가
- [ ] Chunk 크기·Overlap·Top-K를 실제 질의 세트로 튜닝
- [ ] 정답 Source 포함 여부, 다른 상품 혼입 여부, 검색 순위 등을 측정하는 Retrieval 평가 데이터셋 구축
- [ ] 대량 문서 환경에서 ChromaDB 백업·복구·동시성·성능을 검증하고 필요하면 운영 Vector DB 검토

**P2 · LLM 답변 및 운영 기능**

- [ ] LLM 기반 자연어 답변을 연결할 경우 `LLM_API_KEY`, `LLM_MODEL`을 Secret으로 설정하고 현재 추출형 답변을 안전한 Fallback으로 유지
- [ ] LLM 입력에는 검색된 공식 문서, 구조화 Rule 결과, Eligibility 상태만 전달하고 숫자·비자코드·금액 보존 테스트 추가
- [ ] Prompt Injection, 근거 없는 조건 생성, Source 인용 오류를 검증하는 Guardrail/Evaluation 세트 구축
- [ ] 관리자 화면에 색인 실행 이력, 성공·실패 문서, Chunk 수, 마지막 색인 시각 및 재시도 기능 추가
- [ ] 색인·검색·답변의 지연시간, 오류율과 감사 로그를 개인정보 없이 관측할 수 있도록 구성

외부 LLM이나 유료 Embedding 서비스를 연결하기 전까지 `LLM_API_KEY`와 `LLM_MODEL`은 비워 두어도 됩니다. 현재 MVP 실행에 필요한 별도 외부 API Key는 없으며, `RAG_INTERNAL_TOKEN`은 외부 API Key가 아니라 Backend와 AI Service 사이의 내부 인증용 비밀값입니다.

## 관리자 계정 설정

`.env`에 다음 값을 설정하고 Backend 컨테이너를 다시 시작합니다.

```text
ADMIN_SECURITY_ENABLED=true
ADMIN_USERNAME=원하는_관리자_아이디
ADMIN_PASSWORD=충분히_긴_임의의_비밀번호
```

```powershell
docker compose up --build --detach --wait backend frontend
```

관리자 인증을 끄는 설정은 로컬 디버깅 이외에는 사용하지 마세요. 저장소의 예시 비밀번호를 외부 배포 환경에서 그대로 사용해서는 안 됩니다.

## 주요 API

```text
GET  /api/health
GET  /api/health/ai
POST /api/admin/sources
GET  /api/admin/sources
PUT  /api/admin/sources/{id}/review
POST /api/admin/rule-candidates
GET  /api/admin/rule-candidates
PUT  /api/admin/rules/{id}/review
POST /api/profiles
GET  /api/profiles/{id}
PUT  /api/profiles/{id}
GET  /api/visas
GET  /api/admin/auth/check
POST /api/admin/products
GET  /api/admin/products
GET  /api/products
GET  /api/products/{id}
POST /api/eligibility/pre-check
POST /api/recommendations
POST /api/admin/rag/reindex
POST /api/rag/answer
POST /api/ai/explanation
```

## 브랜치 정책

- `main`: 배포 가능한 안정 버전
- `develop`: 다음 릴리스 통합 브랜치
- `feature/<issue>-<summary>`: 기능 개발
- `fix/<issue>-<summary>`: 버그 수정

변경은 Pull Request로 `develop`에 병합하고 릴리스 시 `main`으로 승격합니다.

## 안전 원칙

Official Source가 사실의 기준이며, Human Verification을 거쳐 `APPROVED`인 Source와 Rule만 Runtime에서 사용할 수 있습니다. Rule Engine만 사전자격을 진단하고 RAG와 LLM은 근거 설명·번역·문의문 생성을 담당합니다. 확인할 수 없는 조건은 추측하지 않고 `UNKNOWN`으로 유지합니다.
