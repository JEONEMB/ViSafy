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
2. `한국어`, `English`, `Tiếng Việt` 중 표시 언어를 선택합니다. 국기는 언어 선택을 돕는 시각 요소이며 국적을 확정하지 않습니다.
3. 선택하면 임시 프로필 화면으로 이동하며 공통 메뉴, 필드명, 선택지, 비자명, 예시와 안내문이 해당 언어로 바뀝니다.
4. 선택한 언어는 브라우저에 저장되어 페이지를 다시 열어도 유지됩니다. 프로필 화면 상단의 언어 버튼으로 언제든 변경할 수 있습니다.

### 2. 시스템 상태 확인

1. http://localhost:3000/health 에 접속합니다.
2. Backend와 AI Service가 모두 `UP`인지 확인합니다.

### 3. 임시 사용자 프로필 입력

1. 상단 메뉴에서 **프로필**을 선택합니다.
2. 한국어, English 또는 Tiếng Việt 중 사용할 언어가 맞는지 확인합니다.
3. Profile 첫 단계에서 실제 국적을 표시 언어와 별도로 선택합니다. 이후 생년월일, 지원 비자, 체류기간, 직업, 소득과 금융 목적을 입력합니다. 언어를 변경해도 국적은 변경되지 않습니다.
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

- `NOT_READY`: 상품 존재는 확인됐지만 평가할 승인 HARD Rule이 없어 공식 가입조건 Source가 부족함
- `PARTIAL`: 승인 Rule은 있지만 필수 `EXTERNAL_CHECK`/`UNKNOWN` Rule이 포함되거나 HARD Rule이 부족함
- `READY`: 상품에 적용되는 승인 HARD Rule이 하나 이상 있고 필수 불확실 Rule이 없음

`READY`는 시스템이 검수된 조건으로 사전 진단할 준비가 됐다는 뜻이며 실제 가입 승인이나 가입 가능 확률을 의미하지 않습니다.
모든 상품에 `VISA_TYPE`을 강제하지 않으며, 각 상품의 유효한 Rule에서 `requiredFields`를 동적으로 계산합니다.
공통 Profile에는 언어·국적·생년월일·체류·직업·소득·금융목적을 저장하고, `hasExistingProductAccount`, `desiredMonthlyAmount`처럼 특정 상품에만 필요한 값은 상품 상세에서 실제 `requiredFields`에 포함될 때만 추가로 요청합니다. Boolean 항목은 미응답(`null`)과 아니요(`false`)를 구분하므로 미입력을 충족으로 잘못 판정하지 않습니다.

#### Rule 모델

- `HARD`: 공식자료에 명시되어 사용자 입력과 직접 비교할 수 있는 조건
- `EXTERNAL_CHECK`: 보증보험, 은행 내부 신용평가처럼 외부 심사가 필요한 조건
- `UNKNOWN`: 조건의 존재는 확인했지만 공개된 세부 기준이 없는 조건
- Operator: `EQ`, `NE`, `GT`, `GTE`, `LT`, `LTE`, `IN`, `NOT_IN`, `EXISTS`
- Rule 성격: `HARD_ELIGIBILITY`, `UNKNOWN_ELIGIBILITY`, `EXTERNAL_CHECK`, `REQUIRED_DOCUMENT`, `IDENTIFICATION_METHOD`, `CHANNEL_REQUIREMENT`, `BENEFIT_CONDITION`, `INFORMATION`

Runtime `PRODUCT_RULE`은 `product_id`, `rule_key`, `operator`, `rule_value`, `rule_level`, `rule_nature`, `mandatory`, `source_document_id`, `source_locator`, `page_number`, `section_name`, `valid_from`, `valid_to`, `review_status`, `verified_at`, `description`을 보관합니다. 승인된 후보 중 가입자격·Unknown 가입조건·외부심사 성격만 Runtime에 활성화하며, 필요서류·본인확인·채널·혜택·일반정보 문장을 가입 가능/불가 판정에 사용하지 않습니다.

#### Phase 0 공식 데이터 현황

다음 데이터는 `V9__verified_official_product_dataset.sql`에서 공식 URL과 Snapshot을 함께 등록합니다.

| 상품 | 상태 | 실행 Rule |
| --- | --- | --- |
| 하나은행 하나더이지 적금 | `READY` | 외국인, 비거주자 제외, 동일 상품 1인 1계좌, 월 1만~30만원 |
| KB증권 외국인 해외주식 거래 | `READY` | 거주 외국인, 미국·캐나다 국적 제외 |
| 신한은행 SOL글로벌 적금 | `READY` | 외국인, 비거주자 제외, 동일 상품 1인 1계좌, 월 1천~300만원 |
| 하나은행 Easy-One Pack 통장 | `READY` | 외국인 개인 또는 외국인 개인사업자 |
| 하나은행 Easy-One Pack 적금 | `READY` | 외국인, 동일 상품 1인 1계좌, 월 1만~1천만원 |
| 하나은행 하나 외국인 EZ Loan | `PARTIAL` | E-7·E-9, 거주·급여소득 3개월 비교 가능; 거래외국환 지정·E-9 최초 입국 은행 확인 |
| 신한은행 SOL글로벌 전세대출 | `NOT_READY` | 상품 존재 보조근거만 있어 Rule을 생성하지 않음 |

기존 `DEMO-*`, `ADM-DEMO-*` 상품은 삭제하지 않고 비활성화합니다. Season 2 READY 상품별 Source·Snapshot·Rule·검수 기록·대표 Profile 패키지는 [`docs/season2-ready-product-packages.md`](docs/season2-ready-product-packages.md)에 기록합니다.

#### Season 2 P0 Gate 현황

| Gate | 현재 상태 | 남은 작업 |
| --- | --- | --- |
| READY 상품 5개 이상 | `5/5` | 하나·신한·KB증권, 적금·계좌·투자 유형 |
| Source·Snapshot·Evidence·검수일 | 적용 | 추가 상품도 동일 기준으로 등록 |
| 한국어·영어·베트남어 사용자 흐름 | 적용 | 제출 전 전체 문구 최종 검수 |
| 언어와 국적 분리 | 적용 | 언어 변경 후 국적 불변 E2E 포함 |
| Profile → 추천 → 근거 → 서류 → 절차 → 문의문 | 적용 | 고정 Demo 데이터 최종 확정 |
| SOURCE_INSUFFICIENT Demo | 적용 | EZ Loan·SOL글로벌 전세대출 |
| EXTERNAL_CHECK/UNKNOWN 실제 Demo | 미충족 | 직접 공식 문서가 있는 조건 확보 필요 |
| 관리자/일반 사용자 접근 분리 | 적용 | 운영 관리자 비밀번호 교체 |
| HTTPS 배포 URL | 미충족 | 제출용 Hosting과 Monitoring 구성 |

공식 Source가 필요한 미충족 Gate는 테스트용 가상 Rule로 채우지 않습니다.

P1 운영 보완으로 관리자 Source 화면에서 `ACTIVE`, `NEED_REVIEW`, `SUPERSEDED`, `UNKNOWN`, `EXPIRED`, `REJECTED` 상태를 직접 관리할 수 있습니다. 같은 화면의 RAG 품질 Dashboard는 진단 가능 상품 수, 유효 Source, 색인 대상 Source, 근거가 완성된 Rule과 Evidence 연결률을 표시합니다. 지표 API는 `GET /api/admin/rag/quality`입니다.

중국어 UI와 READY 8개 확대는 중요 Gate인 READY 5개·Demo 4개·배포 URL 안정성을 먼저 충족한 뒤 진행합니다. 일본어·태국어, 자동 Rule 추출, Source 변경 자동감지, AI Chat 고도화는 제출 이후 범위로 유지합니다.

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

지원 Rule Key는 `AGE`, `VISA_TYPE`, `VISA_REMAINING_MONTH`, `RESIDENCY_MONTH`, `RESIDENCE_MONTHS`, `DOMESTIC_INCOME_MONTH`, `EMPLOYMENT_DURATION_MONTHS`, `EMPLOYMENT_MONTHS`, `MONTHLY_INCOME`, `NATIONALITY`, `IS_FOREIGNER`, `RESIDENT_STATUS`, `HAS_EXISTING_PRODUCT_ACCOUNT`, `DESIRED_MONTHLY_AMOUNT`, `OCCUPATION`, `EMPLOYMENT_TYPE`, `FINANCIAL_PURPOSE`, `HAS_BANK_ACCOUNT`, `HOUSING_TYPE`, `DESIRED_AMOUNT`, `PREFERRED_BANK`입니다. `IN`과 `NOT_IN` 값은 반드시 `["F-2","F-5"]`처럼 JSON 배열로 입력합니다. 범위는 동일 Rule Key에 `GTE`와 `LTE`를 각각 등록합니다.

진단 결과 Snapshot은 임시 프로필 만료시각까지만 DB에 저장되며 `requiredFields`도 함께 보존됩니다. 모든 결과는 공개조건을 기반으로 한 사전 확인이며 최종 가입승인이 아닙니다.

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

### 11. 필요서류 체크리스트와 신청절차

1. http://localhost:3000/admin/products 의 **구조화 필요서류 등록**에서 상품과 승인 Source를 선택합니다.
2. 서류를 `OFFICIAL_REQUIRED`, `CONDITIONAL`, `BANK_CONFIRMATION` 중 하나로 분류하고 공식 근거 위치를 입력합니다.
3. 조건부 서류는 필요할 때 `EMPLOYMENT_TYPE`, `MONTHLY_INCOME` 같은 PRODUCT_RULE Key를 연결합니다.
4. 같은 화면의 **공식 신청절차 등록**에서 STEP 순서, 제목, 설명, 신청 채널과 공식 Source를 입력합니다.
5. 상품 상세에서 전체 체크리스트를 확인하고, 사전자격 진단 후 현재 프로필에 적용되는 조건부 서류만 남은 개인화 체크리스트를 확인합니다.

공식 필수서류와 은행 확인 서류는 개인화 과정에서 분류가 변경되지 않습니다. 조건부 서류만 연결 Rule이 현재 프로필에 적용되는지에 따라 필터링되며, 시스템이나 AI가 조건부·은행 확인 서류를 공식 필수서류로 승격하지 않습니다. Source와 항목 자체의 유효기간이 모두 현재 유효하고 Source가 `APPROVED`인 경우에만 사용자에게 표시됩니다.

신청절차는 저장된 순서대로 표시합니다. 별도 URL 입력 필드는 제공하지 않으며 모든 사용자 링크는 연결된 `SOURCE_DOCUMENT.source_url`에서만 반환합니다. 구조화된 서류나 절차가 없으면 임의 내용을 생성하지 않고 공식 Source 확인 안내를 표시합니다.

### 12. Frontend 사용자 흐름

1. http://localhost:3000 에서 표시 언어를 선택하고 **내 조건 확인하기**를 누른 뒤 Profile에서 실제 국적을 별도로 선택합니다.
2. 프로필은 `기본정보 → 체류정보 → 직업·소득 → 금융목적 → 사전진단` Wizard로 입력합니다. 각 `?` 도움말에서 입력 이유를 확인할 수 있습니다.
3. 날짜는 앞선 UX 결정에 따라 Picker 대신 키보드 `YYYY-MM-DD` 입력을 사용합니다. 월 소득은 원화 기준이며 세 자리 구분과 선택 언어의 금액 읽기를 함께 표시합니다.
4. 상품 화면은 추천 API가 실제 처리 중인 사용자 조건·검수 Rule 비교·추가 확인 탐지만 진행 상태로 표시합니다. 공식 근거 단계는 상품 상세에서 근거 요청이 시작된 경우에만 활성화됩니다.
5. 결과 Card에서 공개조건 충족 수, 추가 확인 수, 조건별 설명과 정보 기준일을 확인하고 판단 근거·필요서류·은행 문의 화면으로 이동합니다.
6. 상품 상세는 **사전진단 / 판단 근거 / 필요서류 / 신청 절차 / 공식 정보** 탭으로 구성됩니다. `requiredFields` 중 임시 프로필에 없는 값이 있으면 해당 상품에 필요한 추가 질문만 표시하며, 저장 후 진단을 자동으로 이어갑니다.
7. 상태는 초록·노랑·빨강·회색 계열로 구분하고 모든 진단에 최종 승인이 아니라는 문구를 표시합니다.
8. 판단 근거에는 Rule의 공식 Source, 근거 위치와 검증일을 표시합니다. 은행 문의문은 한국어와 선택 언어를 각각 복사할 수 있습니다.

AI Chat은 P1 보조기능입니다. 현재 상품과 선택 Rule에 연결된 공식 RAG 문서만 질문할 수 있으며 Eligibility 결과를 변경하지 않습니다. 일반적인 투자·대출 추천 Chat으로 사용하지 않습니다.

### 13. TEST-101~111 자동화 검증

| ID | 자동화 내용 | 위치 |
| --- | --- | --- |
| TEST-101 | D-2 허용 PASS, F-5 전용 FAIL | `RuleEvaluatorTest` |
| TEST-102 | 기준일에서 완전히 경과한 달만 계산하여 2개월 30일 FAIL, 정확히 3개월 PASS | `RuleEvaluatorTest` |
| TEST-103 | Context와 Rule 결과에 없는 Visa·소득·기간을 답변에 생성하지 않음 | `test_specification_22.py` |
| TEST-104 | 한국어·영어·베트남어에서 상태·Visa·개월·금액·Source 이름 보존 | `test_specification_22.py` |
| TEST-105 | 기대 문서의 Top-K 포함과 다른 상품 Source 배제 | `test_document_store.py` |
| TEST-106 | 언어 선택부터 프로필·금융목적·진단·근거·서류·절차·문의문까지 Chromium E2E | `user-journey.spec.ts` |
| TEST-107 | E-9의 비공개 세부조건을 FAIL이 아닌 `NEED_BANK_CONFIRMATION`으로 처리 | `EligibilityServiceTest` |
| TEST-108 | 상품페이지 6개월/FAQ 12개월 충돌 시 자동 선택 없이 `SOURCE_CONFLICT` | `EligibilityServiceTest` |
| TEST-109 | 승인 VISA Source가 없으면 `SOURCE_MISSING` UNKNOWN과 `INSUFFICIENT_INFORMATION` 반환 | `EligibilityServiceTest` |
| TEST-110 | `3개월` 등 숫자 토큰이 번역 언어에 따라 변경되지 않음 | `test_specification_22.py` |
| TEST-111 | 만료 Rule을 PASS에서 제외하고 `INSUFFICIENT_INFORMATION` 처리 | `EligibilityServiceTest` |

Backend와 AI 테스트는 각각 다음 명령으로 실행합니다.

```powershell
docker run --rm -v "${PWD}\backend:/app" -w /app maven:3.9-eclipse-temurin-21 mvn test
docker run --rm -e PYTHONPATH=/app -v "${PWD}\ai-service\app:/app/app:ro" -v "${PWD}\ai-service\tests:/tests:ro" visafy-ai-service sh -c "pip install --quiet pytest && pytest -p no:cacheprovider /tests"
```

브라우저 E2E는 실행 중인 `frontend`를 대상으로 공식 Playwright 이미지에서 실행할 수 있습니다.

```powershell
docker compose up --build --detach --wait
docker run --rm --ipc=host -e E2E_BASE_URL=http://host.docker.internal:3000 -v "${PWD}\frontend:/source:ro" mcr.microsoft.com/playwright:v1.62.1-noble bash -lc "cp -R /source /work && cd /work && npm install --no-audit --no-fund && npm run test:e2e"
```

### 14. 현재 제한사항

- Season 2 공식 데이터는 현재 `READY` 5개입니다. 상품 수보다 공식 조건의 완전성을 우선하며, 각 상품은 승인 Source와 Rule Evidence 위치를 가집니다.
- 하나 외국인 EZ Loan은 공식 상세페이지를 확보해 `PARTIAL`로 전환했습니다. SOL글로벌 전세대출은 직접 상품설명서가 추가로 필요하며, 신한 생계비계좌는 신분증 문구의 성격을 확인할 공식 원문이 필요합니다. 확보 전에는 READY로 전환하지 않습니다.
- `거주자/비거주자`는 민감한 식별번호 없이 사용자가 구분값만 입력합니다. 본인의 법적 구분이 불확실하면 금융기관 확인이 필요합니다.
- 구조화 필요서류와 신청절차는 MVP에서 등록·조회 중심으로 지원합니다. 수정·비활성화 관리 UI와 변경 이력은 후속 보완 항목입니다.
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

## 관리자 상품·Source·Rule 운영

관리자 로그인 후 http://localhost:3000/admin/products 에서 상품을 등록하고 기존 상품의 전체 공개정보를 수정하거나 비활성화할 수 있습니다. 상품 코드는 생성 후 식별자로 유지되며, 비활성 상품은 일반 사용자 API와 추천에서 제외됩니다.

http://localhost:3000/admin/sources 에서는 다음 작업을 수행합니다.

- 공식 문서 URL과 Snapshot 등록
- Source 기관·제목·공식 URL·언어·유효기간 수정
- 최근 검증일, 수집일, 유효기간과 공식 Source 링크 확인
- Source 상태를 `ACTIVE`, `SUPERSEDED`, `EXPIRED`, `UNKNOWN`, `NEED_REVIEW`로 관리
- AI Rule Candidate의 승인, 값 수정 후 승인, UNKNOWN 변경, 거절
- Rule별 operator·value·level·status의 변경 전후 값, 검수자와 검수시각 조회

Runtime의 기존 `APPROVED` Source는 관리자 수명주기에서 `ACTIVE`로 표시합니다. 유효 종료일이 지난 Source는 자동 `EXPIRED` 처리되며 다시 활성화할 수 없습니다. 모든 `/api/admin/**` API는 관리자 인증이 필요합니다. MVP에서는 Source Snapshot을 관리자가 등록하며 자동 실시간 Crawling은 수행하지 않습니다.

## Backend API와 DB 결과 이력

- `GET/PUT /api/profiles/{id}`는 숫자 ID만으로 접근할 수 없으며 생성 응답의 UUID를 `X-Profile-Session-Id` 헤더로 함께 보내야 합니다.
- `POST /api/prechecks`는 `profileId` 대신 `profileSessionId`와 `productId`를 받습니다. 결과는 UUID `id`와 함께 반환되고 프로필 만료시각까지만 조회할 수 있습니다.
- `GET /api/prechecks/{id}`도 `X-Profile-Session-Id` 헤더가 필요합니다. 다른 세션에는 존재 여부를 노출하지 않고 `404`를 반환합니다.
- `POST /api/recommendations`의 기존 응답 본문은 유지합니다. 조회용 UUID는 `X-Recommendation-Id`와 `Location` 응답 헤더에서 확인합니다.
- `GET /api/recommendations/{id}`는 동일한 Profile Session 헤더가 있을 때만 저장된 추천 Snapshot을 반환합니다.
- `/api/ai/explain`은 기존 `/api/ai/explanation`의 정식 별칭이며, `/api/ai/inquiry-message`는 문의문만 구조화해 반환합니다.
- `/api/ai/chat`은 P1 공식 문서 질문 전용입니다. 현재 상품·Rule에 대한 RAG Guardrail을 통과한 답변만 `CONSULTATION`에 프로필 만료시각까지 저장합니다.

DB 초안과 현재 구현의 대응 관계는 다음과 같습니다.

- `TEMP_PROFILE.employment_duration`은 단위를 명확히 한 `employment_duration_months`로 저장합니다.
- `FINANCIAL_PRODUCT.official_url`은 중복 저장하지 않고 연결된 승인 `SOURCE_DOCUMENT.source_url`에서 반환합니다.
- `diagnosis_readiness`는 `APPROVED`이고 현재 유효한 Rule 상태로 계산하므로 상품 테이블에 고정값으로 저장하지 않습니다.
- `SOURCE_DOCUMENT.snapshot_text`에 MVP Snapshot 원문을 보존하고, 외부 Object Storage 도입을 위한 nullable `snapshot_path`도 제공합니다. Source와 상품은 상품·Rule 연결을 통해 다대일/다대다 사용을 허용합니다.
- 초안의 `REQUIRED_DOCUMENT`는 기존 `product_document_requirement`로 구현합니다. `OFFICIAL_REQUIRED=REQUIRED`, `CONDITIONAL=CONDITIONAL`, `BANK_CONFIRMATION=NEED_CONFIRMATION`이며 `verified_at`을 보존합니다.
- `PRECHECK_RESULT`에는 세션 원문 대신 SHA-256 해시, profile/product, 상태, 정보 기준일과 만료시각을 저장합니다. 조건별 결과는 `PRECHECK_RULE_RESULT`에 `PASS`, `FAIL`, `EXTERNAL_CHECK`, `UNKNOWN`, `NOT_APPLICABLE`로 정규화합니다.
- 추천 Snapshot만 JSON으로 24시간 이내 보관하며, 프로필 원문은 복제하지 않습니다.

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
PUT  /api/admin/rules/{id}/approve
PUT  /api/admin/rules/{id}/reject
POST /api/profiles
GET  /api/profiles/{id}
PUT  /api/profiles/{id}
GET  /api/visas
GET  /api/admin/auth/check
POST /api/admin/products
GET  /api/admin/products
PUT  /api/admin/products/{id}
PUT  /api/admin/products/{id}/deactivate
GET  /api/products
GET  /api/products/{id}
POST /api/eligibility/pre-check
POST /api/prechecks
GET  /api/prechecks/{id}
POST /api/recommendations
GET  /api/recommendations/{id}
POST /api/admin/rag/reindex
POST /api/rag/answer
POST /api/ai/explanation
POST /api/ai/explain
POST /api/ai/inquiry-message
POST /api/ai/chat
GET  /api/products/{id}/guidance
POST /api/products/{id}/guidance
GET  /api/admin/products/{id}/guidance
POST /api/admin/products/{id}/documents
POST /api/admin/products/{id}/steps
PUT  /api/admin/sources/{id}
PUT  /api/admin/sources/{id}/status
GET  /api/admin/rules/{id}/history
```

## 브랜치 정책

- `main`: 배포 가능한 안정 버전
- `develop`: 다음 릴리스 통합 브랜치
- `feature/<issue>-<summary>`: 기능 개발
- `fix/<issue>-<summary>`: 버그 수정

변경은 Pull Request로 `develop`에 병합하고 릴리스 시 `main`으로 승격합니다.

## 안전 원칙

Official Source가 사실의 기준이며, Human Verification을 거쳐 `APPROVED`인 Source와 Rule만 Runtime에서 사용할 수 있습니다. Rule Engine만 사전자격을 진단하고 RAG와 LLM은 근거 설명·번역·문의문 생성을 담당합니다. 확인할 수 없는 조건은 추측하지 않고 `UNKNOWN`으로 유지합니다.

### AI 안전장치

- `Official Source → Human Verification → Rule Engine → RAG → 설명`의 권한 경계를 유지합니다. AI 응답은 Backend가 계산한 Eligibility 상태와 Rule 결과를 변경할 수 없습니다.
- RAG 검색 결과가 없으면 조건을 추측하지 않고 “현재 등록된 공식 자료만으로는 해당 조건을 정확히 확인할 수 없습니다. 금융기관에 추가 확인이 필요합니다.”라는 고정 안내를 반환합니다.
- 모든 사전자격 설명에는 실제 가입 여부와 한도·금리가 금융기관의 최종 심사에 따라 달라진다는 공통 면책문구를 한국어·영어·베트남어로 제공합니다.
- 사용자 질문은 신뢰할 수 없는 검색 입력으로만 취급합니다. System Prompt 공개, 기존 지침 무시, Eligibility/Rule/Source 정책 변경을 요구하는 대표적인 Prompt Injection은 검색 전에 차단하며 내부 AI API는 `RAG_INTERNAL_TOKEN`으로 보호합니다.
- Vector DB 검색은 `product_id`, `review_status=APPROVED`, 현재 유효기간을 동시에 필터링합니다. 반환 직전에도 Source URL이 `SOURCE_ALLOWED_DOMAINS`의 공식 도메인인지 다시 확인합니다.
- 임시 프로필에는 주민등록번호, 외국인등록번호, 여권번호, 계좌번호, 카드번호 필드가 없습니다. 자유입력 필드에 해당 형식의 값을 붙여 넣어도 Backend가 `400 Bad Request`로 거부합니다.

운영 환경에서는 `SOURCE_ALLOWED_DOMAINS`를 실제 금융기관·공공기관 공식 도메인만으로 구성하고, Source 상태나 유효기간을 변경한 뒤 `POST /api/admin/rag/reindex`를 실행하세요.
