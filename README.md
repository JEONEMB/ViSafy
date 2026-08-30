# SSAFIN — Official-source Financial Settlement Agent

공식 금융 Source와 사람이 검수한 Rule을 기반으로 외국인 사용자의 금융상품 사전자격을 안내하기 위한 MVP 모노레포입니다.

**공개 URL: <https://34-64-228-103.sslip.io>**

배포 상태와 검증 결과는 [`docs/production-verification-2026-08-30.md`](docs/production-verification-2026-08-30.md)에 있고, 공개 URL에서 촬영한 Demo 캡처는 [`docs/evidence/`](docs/evidence/)에 보관합니다.

현재 구현 범위:

- ENV-001~005 개발환경 및 Docker 통합환경
- DATA-001 공식 Source 등록과 공식 도메인 allowlist
- DATA-002 원문 Snapshot 및 SHA-256 hash 저장
- DATA-003 공식 Snapshot에서 LLM 조건 후보 제안·원문 대조 검증과 수동 Rule Candidate 등록
- DATA-004 Source 및 Rule Human Verification
- DATA-005 공식 자료 간 Rule conflict 감지
- DATA-006 유효기간, 최근 검증일, Source 링크 및 상태 표시
- FR-101 한국어·영어·베트남어·중국어·일본어·태국어 선택과 브라우저 저장
- 화면 문구, Rule Engine 판정 메시지, 접근성 안내, 필요서류 안내를 6개 언어로 모두 제공(영어 대체 없음)
- FR-102 24시간 임시 금융 프로필
- FR-103 지원 비자 선택(D-2, D-4, E-7, E-9, F-2, F-5, F-6)
- FR-201 승인된 공식 Source 기반 금융상품 등록
- FR-202 금융 목적·유형·은행·외국인 대상·진단 상태별 상품 조회
- FR-203 상품 요약·조건·서류·신청방법·공식 출처 상세 조회
- 승인된 Rule Candidate의 `PRODUCT_RULE` 동기화와 진단 준비 상태 관리

## 핵심 AI Agent 기능

SSAFIN은 은행 상품을 번역하는 화면에 그치지 않고, 사용자의 현재 준비상태에서 다음 금융 행동까지 연결합니다. 판정 권한과 AI의 역할은 명확히 분리되어 있습니다.

| 구성요소 | 실제 역할 | 안전 경계 |
| --- | --- | --- |
| 조건 후보 추출 | OpenAI가 공식 Snapshot을 읽어 가입조건 후보를 제안하고 규칙 기반 검증기가 원문과 대조 | 인용문이 원문에 없거나, 원문에 없는 숫자·비자코드를 쓰거나, Rule Engine 비교 형식과 다르면 저장하지 않음. LLM 장애 시 규칙 기반 추출로 자동 복귀 |
| 공식정보 변경 감지 | 같은 공식 URL의 Snapshot `contentHash`가 달라지면 이전 승인본을 재검수 대기로 전환 | 사용자에게 변경 사실과 확인일을 알리고, 진단 결과가 이전 검수본 기준임을 명시 |
| Rule Engine | 검수된 공개조건과 프로필을 결정론적으로 비교 | LLM이 판정값을 생성하거나 변경할 수 없음 |
| Access Model | 신분확인·필요서류·영업점·모바일 이용 가능성을 별도 판단 | 가입조건과 채널 접근성을 혼동하지 않음 |
| 공식 Source RAG | 해당 상품의 승인·유효 Source만 다국어 의미 검색 | 다른 상품, 미승인·만료 Source, 비공식 도메인을 배제 |
| OpenAI 설명 | Responses API로 쉬운 설명·다음 행동·필요 시 은행 문의문 생성 | 구조화된 판정과 숫자를 읽기 전용으로 사용하며 실패 시 템플릿으로 복귀 |
| 상품 한정 대화 | 상품별 최근 질문 흐름을 유지하며 공식문서에 후속 질문 | 일반 투자·대출 추천 Chat으로 확장하지 않음 |
| Agent Workspace | 추천 이유와 준비할 한 가지를 먼저 제시하고 부족한 정보를 한 번에 하나씩 질문 | 답변 후 추천·Journey를 다시 계산하며 최종 승인을 보장하지 않음 |

사용자는 `프로필 → 다음 행동 → 동적 추가 질문 → 상품 추천 → 공개조건 진단 → 신분·채널 접근성 → 공식 근거 → 신청 화면`의 연속된 흐름을 이용할 수 있습니다. Source 검수일과 Evidence 연결률도 표시하며, 공식 신청 URL이 확인되지 않으면 임의 링크를 만들지 않습니다.

### MVP 완료 상태

로컬 핵심 기능 MVP는 완료되었습니다. Profile, Recommendation, Eligibility, Access Model, Financial Journey, 공식 Source RAG, 상품 한정 대화, OpenAI 장애 Fallback과 관리자 검수 흐름이 통합환경에서 동작하며 자동화 테스트를 통과합니다.

다만 **대회 제출·운영 MVP는 아직 완료 선언 전**입니다. 다음 작업이 남아 있으므로 이번 커밋에는 `MVP complete`라는 표현을 사용하지 않습니다.

- OpenAI Project의 결제·모델 권한을 활성화한 뒤 Responses API 실제 성공 응답 검증
- 공개 서버에 배포하고 도메인·DNS·HTTPS 연결
- 운영 DB 비밀번호, 관리자 비밀번호와 내부 토큰을 운영 Secret으로 교체
- 공개 URL에서 전체 E2E, 공식 Source 링크와 심사 기간 가용성 최종 확인

OpenAI 호출이 준비되지 않아도 Rule Engine, Access Model, RAG 검색과 검증된 템플릿 설명은 계속 동작합니다.

## 프로젝트 구성

- `frontend`: Next.js, TypeScript, Tailwind CSS, TanStack Query
- `backend`: Java 21, Spring Boot, JPA, Flyway, MySQL, OpenAPI
- `ai-service`: Python 3.11, FastAPI, Pydantic, FastEmbed, SQLite 기반 로컬 벡터 색인
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

### 가장 빠른 실행 순서

#### 1. 서비스를 실행합니다

프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
Copy-Item .env.example .env
docker compose up --build --detach --wait
```

OpenAI 설명 기능을 사용하려면 Git에 포함되지 않는 `.env`에 다음 값을 설정한 뒤 `docker compose up -d --force-recreate ai-service`를 실행합니다.

```text
LLM_PROVIDER=openai
OPENAI_API_KEY=발급받은_Project_API_Key
OPENAI_MODEL=사용 가능한 Responses_API_모델_ID
OPENAI_REASONING_EFFORT=medium
```

API Key가 없거나 OpenAI 호출이 실패해도 사전자격 진단과 공식 근거 검색은 계속 작동하며, 쉬운 설명과 문의문은 검증된 다국어 템플릿으로 자동 전환됩니다.

#### 2. 언어와 금융 목적을 선택합니다

1. http://localhost:3000 을 엽니다.
2. `한국어`, `English`, `Tiếng Việt`, `中文`, `日本語`, `ไทย` 중 사용할 언어를 선택합니다.
3. 지금 필요한 금융서비스를 선택합니다. 같은 항목을 한 번 더 누르면 선택이 해제됩니다.
4. **내 금융생활 시작하기**를 누릅니다.

언어 카드는 화면 언어만 변경하며 국적을 자동으로 결정하지 않습니다.

#### 3. 임시 금융 프로필을 저장합니다

1. 실제 국적과 현재 금융 준비상태를 입력합니다.
2. 외국인등록증·여권·휴대전화·국내계좌는 번호가 아니라 보유 여부만 입력합니다.
3. **내게 필요한 금융서비스 보기**를 누릅니다.

프로필은 UUID 세션과 연결되어 24시간만 보관됩니다. 주민등록번호, 외국인등록번호 원문, 여권번호, 계좌번호와 카드번호는 수집하지 않습니다. 비자·체류·소득·재직 정보는 해당 상품의 공식 조건에 필요할 때만 추가로 요청합니다.

#### 4. 추천과 금융생활 경로를 확인합니다

http://localhost:3000/products 에서 다음 내용을 확인합니다.

- 현재 준비상태에 따른 Financial Journey와 다음 행동
- 일반상품과 외국인 특화상품을 함께 포함한 추천 후보
- 확인된 공개조건 수와 금융기관에 추가 확인할 항목
- 공식 정보가 부족하여 별도로 분류된 상품

추천 카드의 **금융생활 여정에서 준비하기**를 누르면 해당 상품 유형의 Journey 단계로 자동 이동합니다. 입출금계좌·체크카드·예적금·송금·대출·투자 등 각 단계를 직접 선택할 수도 있습니다. 선택한 단계에서는 입력한 국적과 현재 신분·휴대전화·계좌 준비상태, 관련 공식 상품, 검수된 준비서류와 신청방법을 확인한 뒤 금융기관 공식 페이지를 열 수 있습니다.

상품 페이지 상단의 **SSAFIN이 제안하는 다음 행동**에서는 추천 이유와 지금 준비할 한 가지를 먼저 보여줍니다. 상품 Rule에 필요한 프로필 값이 비어 있으면 한 번에 하나씩 질문하고, 답변 저장 후 추천과 Journey를 다시 계산합니다. Journey 단계의 완료 여부는 임시 프로필 만료 시각까지 저장됩니다. 같은 화면에서 상품별 공식문서 질문을 이어서 할 수 있으며 최근 대화는 상품 범위 안에서 검색 맥락으로 사용됩니다. 공식 정보 URL과 공식 신청 URL은 별도 관리하고, 확인된 신청 URL이 없으면 임의의 신청 링크를 만들지 않습니다. 최근 Source 검수일과 Evidence 연결률도 사용자에게 함께 표시합니다.

SSAFIN은 가입확률을 계산하거나 최종 승인을 보장하지 않습니다.

#### 5. 상품 사전자격을 확인합니다

1. 상품 카드를 선택합니다.
2. 상품에 추가 정보가 필요하면 표시된 항목만 입력합니다.
3. **내 프로필로 사전자격 확인**을 누릅니다.
4. 공개조건 충족 여부, 금융기관 확인사항, 신분확인 방법, 영업점·모바일 이용방법을 확인합니다.
5. **판단 근거 / 필요서류 / 신청 절차 / 공식 정보** 탭에서 원문과 정보 기준일을 확인합니다.

공개 화면에는 내부 Rule Key, Operator와 원시 상태코드를 표시하지 않습니다. 관리용 원본 값과 검수 이력은 인증된 관리자 화면에서만 확인할 수 있습니다.

#### 6. 공식 금융문서 AI를 사용합니다

상품 상세의 **공식 금융문서에 질문하기**에서 검수된 조건과 질문을 선택합니다.

- 승인되고 현재 유효한 해당 상품의 공식 Source만 검색합니다.
- 다국어 Semantic Embedding으로 한국어·영어·베트남어·중국어·일본어·태국어 질문을 의미 기반 검색합니다.
- OpenAI Responses API는 쉬운 설명, 번역, 다음 행동과 필요한 경우 은행 문의문을 생성합니다.
- AI는 Backend의 사전자격·접근성 결과를 변경할 수 없습니다.
- 근거가 없으면 임의의 답을 만들지 않고 금융기관 확인이 필요하다고 안내합니다.

#### 7. 관리자 기능을 사용합니다

1. http://localhost:3000/admin/login 에서 로그인합니다.
2. `/admin/products`에서 상품을 등록·수정·비활성화합니다.
3. `/admin/sources`에서 공식 Source·Snapshot을 등록하고 Rule Candidate를 검수합니다.
   Source 카드의 **이 문서에서 조건 후보 추출**을 누르면 저장된 원문에서 조건 후보를 뽑아 `PENDING`으로 저장합니다.
   원문에 그대로 존재하지 않는 문장과 이미 등록된 동일 조건은 저장하지 않으며, 저장된 후보는 승인 전까지 진단에 사용되지 않습니다.
4. Source 또는 Rule을 승인·수정·만료하면 트랜잭션 완료 후 RAG가 자동 재색인됩니다.
5. 필요할 때만 관리자 화면의 **RAG 전체 재색인**을 사용합니다.

서비스와 AI 상태는 http://localhost:3000/health 에서 확인할 수 있습니다. 정상 상태에서는 Backend와 AI Service가 모두 `UP`으로 표시됩니다.

---

### 1. 언어 선택

1. 메인 화면 http://localhost:3000 에 접속합니다.
2. `한국어`, `English`, `Tiếng Việt`, `中文`, `日本語`, `ไทย` 중 표시 언어를 선택합니다. 국기는 언어 선택을 돕는 시각 요소이며 국적을 확정하지 않습니다.
3. 같은 화면에서 현재 가장 필요한 금융서비스를 선택한 뒤 **내 금융생활 시작하기**를 누릅니다.
4. 선택한 언어와 금융목적은 브라우저에 저장되어 Profile Wizard로 이어집니다. `/profile`에서는 언어를 다시 묻지 않고 `국적 + 금융 목적` 단계부터 시작합니다.

### 2. 시스템 상태 확인

1. http://localhost:3000/health 에 접속합니다.
2. Backend와 AI Service가 모두 `UP`인지 확인합니다.

### 3. 임시 사용자 프로필 입력

1. 상단 메뉴에서 **프로필**을 선택합니다.
2. Landing에서 선택한 언어와 금융목적이 유지되는지 확인하고 실제 국적을 별도로 선택합니다.
3. 체류카드·여권·국내 휴대전화·본인인증·국내 입출금계좌·신용이력은 번호가 아니라 보유 여부만 선택합니다.
4. **내게 필요한 금융서비스 보기**를 누르면 금융상품 목록과 9단계 Financial Journey로 이동합니다.
5. 비자·체류·직업·소득은 모든 사용자에게 처음부터 묻지 않습니다. 상품 상세에서 승인 Eligibility Rule의 `requiredFields`에 포함된 항목만 추가로 요청합니다.

프로필은 24시간 후 만료됩니다. 주민등록번호, 여권번호, 외국인등록번호, 계좌번호는 입력하거나 저장하지 않습니다.

### 4. 공식 Source 등록

1. http://localhost:3000/admin/login 에서 서비스 관리자 계정으로 로그인합니다.
2. 상단 메뉴에서 **Source · Rule 검수**를 선택합니다.
3. 은행 또는 공공기관의 공식 페이지에서 원문을 확인합니다.
4. 기관, Source 유형, 제목, HTTPS URL, 정보 기준일, 언어와 유효기간을 입력합니다.
5. Snapshot 원문 텍스트를 붙여 넣거나, 보관 파일 경로와 해당 파일의 SHA-256 hash를 입력합니다. 둘 중 하나는 반드시 필요합니다.
6. **Source 저장**을 누릅니다.
7. 저장된 Snapshot, SHA-256 hash, 정보 기준일과 최근 검증일을 확인합니다.
8. 원문 링크와 Snapshot이 일치할 때만 **공식 Source 승인**을 누릅니다.

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
| 한국어·영어·베트남어·중국어·일본어·태국어 사용자 흐름 | 적용 | 제출 전 전체 문구 최종 검수 |
| 언어와 국적 분리 | 적용 | 언어 변경 후 국적 불변 E2E 포함 |
| Profile → 추천 → 근거 → 서류 → 절차 → 문의문 | 적용 | 고정 Demo 데이터 최종 확정 |
| SOURCE_INSUFFICIENT Demo | 적용 | EZ Loan·SOL글로벌 전세대출 |
| EXTERNAL_CHECK/UNKNOWN 실제 Demo | 충족 | KB증권 강화된 고객확인 `EXTERNAL_CHECK`, Easy-One Pack 통장 온라인 신규 `UNKNOWN` |
| 관리자/일반 사용자 접근 분리 | 적용 | 운영 관리자 비밀번호 교체 |
| HTTPS 배포 URL | 미충족 | 제출용 Hosting과 Monitoring 구성 (현재 유일한 미충족 Gate) |

공식 Source가 필요한 미충족 Gate는 테스트용 가상 Rule로 채우지 않습니다.

P1 운영 보완으로 관리자 Source 화면에서 `ACTIVE`, `NEED_REVIEW`, `SUPERSEDED`, `UNKNOWN`, `EXPIRED`, `REJECTED` 상태를 직접 관리할 수 있습니다. 같은 화면의 RAG 품질 Dashboard는 진단 가능 상품 수, 유효 Source, 색인 대상 Source, 근거가 완성된 Rule과 Evidence 연결률을 표시합니다. 지표 API는 `GET /api/admin/rag/quality`입니다.

READY 8개 확대, 한국어·영어·베트남어·중국어·일본어·태국어 UI, AI Rule Candidate 추출, `contentHash` 기반 Source 변경 감지는 모두 적용을 마쳤습니다. 남은 미충족 Gate는 HTTPS 배포 URL 하나이며, AI Chat 고도화와 문서 수집 자동화는 제출 이후 범위로 유지합니다.

### 7. 사전자격 진단

1. 임시 금융 프로필을 저장합니다. 브라우저에는 예측하기 어려운 UUID 세션 값이 저장되며 프로필과 함께 24시간 후 만료됩니다.
2. http://localhost:3000/products 에서 상품을 선택합니다.
3. 상품 상세의 **내 프로필로 사전자격 확인**을 누릅니다.
4. 충족 조건, 미충족 조건, 은행 확인 조건, 공개되지 않은 조건과 정보부족 사유를 확인합니다.

최종 상태는 다음 순서로 결정합니다.

- `PUBLIC_CONDITIONS_NOT_MET`: 명시적인 HARD Rule FAIL이 하나 이상 있음
- `INSUFFICIENT_INFORMATION`: FAIL은 없지만 필수입력, 검수, Source 또는 필수 Rule이 부족함

정보 부족 사유는 `SOURCE_INSUFFICIENT`, `SOURCE_CONFLICT`, `RULE_REVIEW_INCOMPLETE`, `MISSING_REQUIRED_PROFILE_FIELD`, `UNSUPPORTED_RULE_KEY`, `INVALID_RULE_VALUE`, `EXPIRED_RULE`로 구조화해 반환합니다. 명시적인 HARD FAIL이 있으면 다른 정보 부족 사유보다 `PUBLIC_CONDITIONS_NOT_MET`을 우선합니다.
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

사용자 화면에서는 `Rule Engine = 결정론적 판정`, `RAG = 공식 근거 검색`, `AI = 쉬운 설명·번역·은행 문의문`의 역할을 분리해 표시합니다. AI 설명에는 Eligibility 상태와 구조화 Rule Detail 및 연결된 공식 Evidence만 전달하며, UNKNOWN 또는 EXTERNAL_CHECK가 있을 때만 확인 항목과 한국어·선택 언어 문의문을 생성합니다.

AI와 RAG는 외국인이라는 이유만으로 미가입을 추정하거나, `실명의 개인` 문구만으로 외국인 이용 가능을 확정하지 않습니다. 공식 Rule이 없는 Visa 제한과 비대면 채널, 승인확률, 신용등급, 은행 내부심사 기준도 생성하지 않습니다. 일반상품에 Visa Rule이 없으면 AI 요청·쉬운 용어·문의문에도 Visa 값을 주입하지 않습니다.

1. http://localhost:3000/admin/sources 에서 Source Snapshot과 문서 언어를 등록하고 승인합니다.
2. 승인 Source를 금융상품 또는 PRODUCT_RULE에 연결합니다.
3. Source 또는 Rule 승인 후 자동 재색인 결과를 확인합니다. 수동 복구가 필요할 때만 관리자 화면의 **RAG 전체 재색인**을 누릅니다.
4. 임시 프로필을 저장한 뒤 상품 상세 화면의 **공식 금융문서에 질문하기**에서 Rule과 질문을 선택합니다.
5. Eligibility 결과, 구조화된 Rule 결과, 공식 근거 문단과 Source 링크를 각각 확인합니다.

전처리 순서는 `Snapshot → NFKC 정규화 및 Cleaning → 문단 기반 Chunking → Metadata → Embedding → SQLite 벡터 색인`입니다. Metadata에는 `document_id`, `institution`, `document_name`, `source_type`, `source_url`, `retrieved_at`, `valid_from`, `valid_to`, `product_id`, `language`, `content_hash`, `rule_keys`를 저장합니다. 검색에는 질문과 Rule Key를 함께 사용하며 SQL Metadata Filtering과 반환 직전 검증을 함께 적용하므로 다른 상품의 조건이 섞이지 않습니다. 검색 순위는 FastEmbed 벡터의 cosine similarity로 계산합니다.

현재 Docker 환경은 ONNX 기반 FastEmbed와 `intfloat/multilingual-e5-small`을 기본으로 사용해 다국어 질의를 의미 기반으로 검색합니다. 384차원 로컬 해시 임베딩은 회귀 테스트와 오프라인 기준선 용도로만 남겨두었습니다. 답변은 OpenAI 연결 여부와 관계없이 Eligibility Engine의 확정 결과를 변경할 수 없으며, API 장애 시 검증 가능한 템플릿으로 복귀합니다.

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
- AI-202: 프로필 언어에 따라 한국어·영어·베트남어·중국어·일본어·태국어로 설명하고 비자코드·기간·조건 수는 구조화 필드로 별도 반환
- AI-203: `체류자격 (Status of Stay)`, `소득증빙 (Proof of Income)`, `보증보험증권`과 은행 내부 신용평가를 쉬운 말로 설명
- AI-204: EXTERNAL_CHECK 또는 UNKNOWN이 있을 때 한국어 은행 문의문과 선택 언어 번역을 함께 생성하며 화면에서 복사 가능

문의문에 사용되는 비자코드, 비자 잔여 개월, 국내 체류 개월은 Backend가 날짜로 계산한 값만 사용합니다. AI 설명이 일시적으로 실패해도 Eligibility Engine 결과는 그대로 유지되며 최종 가입이나 승인을 보장하지 않습니다. `LLM_PROVIDER=openai`이면 OpenAI Responses API를 사용하고, Key 누락·호출 실패·구조화 출력 또는 숫자 무결성 검증 실패 시 검증 가능한 다국어 템플릿으로 자동 복귀합니다.

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
| TEST-104 | 한국어·영어·베트남어·중국어·일본어·태국어에서 상태·Visa·개월·금액·Source 이름 보존 | `test_specification_22.py` |
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
- DATA-003은 OpenAI가 공식 Snapshot에서 Rule Candidate를 제안하고 규칙 기반 검증기가 인용문·숫자·비자코드·Rule 형식을 원문과 대조합니다. 검증을 통과해도 관리자 승인 전에는 Runtime 판정에 사용하지 않으며, OpenAI 장애 시 규칙 기반 추출로 복귀합니다.
- `/api/admin/**`, 상품 관리, Source·Rule 검수 화면은 기본적으로 관리자 인증이 필요합니다. 로그인 정보는 브라우저 탭의 `sessionStorage`에만 유지되며 탭을 닫으면 삭제됩니다.
- 현재 MVP 관리자 인증은 HTTP Basic 방식입니다. 반드시 HTTPS 환경에서 사용하고, 실제 외부 배포 전에는 JWT의 HttpOnly 쿠키 또는 조직 SSO로 교체해야 합니다.

#### MVP 이후 RAG 보완 백로그

현재 RAG는 관리자가 등록한 공식 Source Snapshot을 대상으로 안전한 검색과 근거 설명을 제공하는 MVP입니다. 아래 항목은 MVP 화면과 핵심 사용자 흐름이 안정된 뒤, 최종 제출 전 우선순위에 따라 보완합니다.

**P0 · 제출 전 필수 점검**

- [ ] `RAG_INTERNAL_TOKEN`, 관리자 비밀번호 등 저장소 기본값을 충분히 긴 운영용 비밀값으로 교체하고 배포 환경의 Secret으로 관리
- [ ] 등록된 Source URL, Snapshot, 상품 연결, 언어, 유효기간 및 검수 상태를 실제 공식 문서 기준으로 재검증
- [ ] Source 만료·Rule 충돌·색인 누락 시 사용자에게 `확인 필요`가 표시되는 통합 시나리오 재검증
- [ ] RAG 답변이 Eligibility Engine 결과를 변경하거나 가입을 보장하지 않는지 한국어·영어·베트남어·중국어·일본어·태국어 회귀 테스트
- [ ] 운영 배포에서 `/internal/rag/**`가 외부 네트워크에 직접 노출되지 않는지 확인
- [x] 로컬 Production Compose·Secret·비공개 포트·HTTPS 보안 Smoke 리허설 스크립트 구축
- [x] MySQL·RAG 동시 백업과 checksum 기반 명시적 복구 스크립트 구축

**P1 · 문서 수집과 전처리 자동화**

- [ ] 공식 금융상품 웹페이지 수집기와 도메인별 HTML 본문 추출기 구현
- [ ] PDF 상품설명서·약관 Text Extraction 구현 및 페이지 번호를 `source_locator`에 보존
- [ ] 스캔 PDF·이미지를 위한 OCR 도입과 추출 품질 검수 절차 마련
- [ ] HWP/HWPX 문서 지원 필요성을 조사하고 제출 대상 문서에 맞는 추출기 선택
- [x] `content_hash` 변경 감지와 사용자용 변경 안내 배지
- [ ] 정기 수집 스케줄러, 증분 재색인 및 삭제 문서 반영
- [ ] robots.txt, 이용약관, 요청 속도 제한 및 수집 실패 재시도 정책 문서화

**P1 · 검색 품질 고도화**

- [x] 다국어 Semantic Embedding을 기본 검색 Provider로 적용하고 384차원 해시 모델은 비교 기준선으로 유지
- [ ] 상품 ID 필터에 Rule Key, 문서 언어, 유효기간 필터를 추가 적용할지 평가
- [ ] Chunk 크기·Overlap·Top-K를 실제 질의 세트로 튜닝
- [ ] 정답 Source 포함 여부, 다른 상품 혼입 여부, 검색 순위 등을 측정하는 Retrieval 평가 데이터셋 구축
- [ ] 대량 문서 환경에서 SQLite 벡터 색인의 백업·복구·동시성·성능을 검증하고 필요하면 운영 Vector DB 검토

**P2 · LLM 답변 및 운영 기능**

- [x] OpenAI Responses API를 선택형으로 연결하고 검증 가능한 템플릿을 안전한 Fallback으로 유지
- [x] LLM 입력을 검색된 공식 문서, 구조화 조건과 사전자격·접근성 결과로 제한하고 숫자·비자코드 보존 검증 적용
- [x] 한국어 Prompt Injection과 내부 상태코드 노출을 차단하는 Guardrail 회귀 테스트 구축
- [ ] 관리자 화면에 색인 실행 이력, 성공·실패 문서, Chunk 수, 마지막 색인 시각 및 재시도 기능 추가
- [ ] 색인·검색·답변의 지연시간, 오류율과 감사 로그를 개인정보 없이 관측할 수 있도록 구성

OpenAI 없이도 핵심 Rule Engine·Access Model·RAG와 템플릿 설명은 실행할 수 있습니다. OpenAI 설명을 사용할 때만 `OPENAI_API_KEY`와 사용 가능한 모델 ID가 필요합니다. `RAG_INTERNAL_TOKEN`은 외부 API Key가 아니라 Backend와 AI Service 사이의 내부 인증용 비밀값입니다.

2026-08-28 Release Candidate 회귀 결과는 Backend 85건, AI Service 51건, Playwright 10건(6개 언어 Landing 포함) 통과이며 Frontend typecheck·lint·production build와 격리 Production HTTPS 리허설도 통과했습니다. 공개 배포 후 같은 흐름을 공개 URL에서 재검증합니다.

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
- Source 기관·제목·공식 URL·언어·정보 기준일·유효기간 수정
- 최근 검증일, 수집일, 정보 기준일, 유효기간과 공식 Source 링크 확인
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
- `SOURCE_DOCUMENT`는 정보 기준일을 별도 보존합니다. Snapshot은 `snapshot_text` 또는 `snapshot_path` 중 하나로 등록하며, 파일 경로 방식은 실제 파일의 SHA-256 `content_hash`가 필수입니다.
- Rule Evidence는 상품 Rule 응답의 `evidence`에 `ruleId`, `sourceDocumentId`, 원문 발췌, 위치, PDF 페이지/HTML 섹션, 검증시각과 검수자를 함께 반환합니다.
- 초안의 `REQUIRED_DOCUMENT`는 기존 `product_document_requirement`로 구현합니다. `OFFICIAL_REQUIRED=REQUIRED`, `CONDITIONAL=CONDITIONAL`, `BANK_CONFIRMATION=NEED_CONFIRMATION`이며 `verified_at`을 보존합니다.
- `PRECHECK_RESULT`에는 세션 원문 대신 SHA-256 해시, profile/product, 상태, 정보 기준일과 만료시각을 저장합니다. 조건별 결과는 `PRECHECK_RULE_RESULT`에 `PASS`, `FAIL`, `EXTERNAL_CHECK`, `UNKNOWN`, `NOT_APPLICABLE`로 정규화합니다.
- 추천 Snapshot만 JSON으로 24시간 이내 보관하며, 프로필 원문은 복제하지 않습니다.

## Season 3: Eligibility, Access, Financial Journey

- 기존 `EligibilityStatus`는 공개 가입조건 판정에만 사용합니다.
- `accessAssessment.status`는 신분확인·영업점·모바일 이용 가능성을 별도로 표시합니다. 가능한 값은 `ACCESS_READY`, `ACCESS_READY_BRANCH_ONLY`, `ACCESS_READY_ONLINE`, `ACCESS_ADDITIONAL_DOCUMENTS`, `ACCESS_NEED_CONFIRMATION`, `ACCESS_UNKNOWN`입니다.
- 상품 설명의 `실명의 개인` 문구만으로 `FOREIGNER_ALLOWED=true`를 승인하지 않습니다. 외국인 이용 근거나 신분확인·채널 근거가 없으면 `ACCESS_UNKNOWN`으로 유지합니다.
- 금융목적은 `OPEN_ACCOUNT`, `RECEIVE_SALARY`, `SAVE_MONEY`, `SEND_MONEY_HOME`, `GET_DEBIT_CARD`, `GET_CREDIT_CARD`, `GET_LOAN`, `RENT_HOUSING`, `INVEST`, `BUILD_CREDIT`을 지원합니다. 기존 목적 코드는 호환 변환합니다.
- 프로필에는 신분증 번호를 저장하지 않고 체류카드·여권·국내 휴대전화·본인인증·국내계좌·신용이력의 보유 여부만 선택적으로 저장합니다.
- 상품 목록의 Financial Journey는 신분확인부터 투자까지 9단계를 표시합니다. 예를 들어 국내계좌가 없는 `SAVE_MONEY` 사용자는 적금보다 국내 입출금계좌 확인을 먼저 안내받습니다.
- Landing과 Profile Wizard는 `언어 → 국적·금융목적 → 한국 금융 준비상태 → 상품별 동적입력 → 이용 가능한 금융서비스`의 5단계 흐름을 사용합니다. 언어와 금융목적은 Landing에서 한 번만 선택하며 Profile에서는 중복 언어 선택 없이 STEP 2부터 시작합니다. 초기 프로필에서는 모든 비자·소득 정보를 강제하지 않고, 선택한 상품의 승인 Rule에서 계산된 `requiredFields`만 상세 화면에서 추가로 요청합니다.
- 상품은 `productAudience`(`GENERAL`, `FOREIGNER_SPECIALIZED`, `POLICY`)와 `productCategory`로 구분합니다. 상품 카드에는 공개조건 준비 상태와 함께 신분확인·가입채널·준비서류의 공식 근거 보유 여부를 별도로 표시합니다. 채널 근거가 하나 있다고 영업점과 모바일을 모두 가능하다고 추론하지 않습니다.

### Season 3 READY 데이터 Gate

Season 3의 `READY`는 상품 페이지와 약관만 존재한다고 충족되지 않습니다. 다음 패키지가 모두 확인되어야 합니다.

```text
상품 기본정보 + 공식 상품페이지 + 상품설명서/약관
+ 승인 HARD Rule Evidence + 외국인 신분확인 Evidence
+ 가입채널 Evidence + 필요서류 Evidence + 신청절차 Evidence
+ 정보 기준일
```

현재 저장된 기존 상품은 이 강화된 Gate로 다시 계산합니다. 부족한 공식 자료가 있는 상품은 의도적으로 `PARTIAL` 또는 `NOT_READY`로 표시하며, 임의의 Demo 근거로 `READY` 수를 채우지 않습니다. Season 3 목표인 READY 8개(입출금 2, 일반 예·적금 3, 외국인 특화 2, 해외송금 1, 대출 1 중 중복 허용)와 은행 3곳 이상을 달성하려면 각 상품의 공식 Source 패키지를 관리자 화면에서 등록·승인해야 합니다.

고정 Demo A~E의 실제 상품 ID·입력·기대결과는 [`docs/season3-demo-manifest.md`](docs/season3-demo-manifest.md)에 기록하며, 설계 배경과 회귀 테스트는 [`docs/season3-demo-scenarios.md`](docs/season3-demo-scenarios.md)에 기록합니다.

### Season 2와 Season 3 데이터 상태

두 시즌의 `READY`는 기준이 다릅니다. Season 2의 `READY 5개`는 승인된 Eligibility Rule과 공식 Source를 이용해 공개조건을 평가할 수 있다는 뜻입니다. Season 3의 `READY`는 여기에 외국인 신분확인, 영업점·모바일 채널, 필요서류, 신청절차 Evidence까지 모두 갖춘 상품만 의미합니다.

2026-08-29 실행 데이터 측정값은 다음과 같습니다.

| 항목 | 현재 값 |
| --- | ---: |
| 활성 상품 | 11개 |
| 금융기관 | 4곳 (KB국민은행·신한은행·하나은행·KB증권) |
| `GENERAL` | 5개 |
| `FOREIGNER_SPECIALIZED` | 6개 |
| Season 3 `READY` | 8개 |
| Season 3 `PARTIAL` | 2개 (`HANA-EZ-LOAN`, `SHINHAN-SOL-GLOBAL-SAVINGS-2025`) |
| Season 3 `NOT_READY` | 1개 (`SHINHAN-SOL-GLOBAL-JEONSE`, Demo E) |
| 승인·유효 공식 Source | 26개 |
| Evidence 연결률 | 100% |

따라서 Season 2 Rule Engine의 동작 여부와 Season 3 제출 데이터의 완성도를 혼동해서는 안 됩니다. 일반상품과 Access Evidence는 [`docs/season3-data-collection-prompts.md`](docs/season3-data-collection-prompts.md)의 프롬프트로 조사한 뒤 반드시 사람이 공식 원문을 다시 확인하고 관리자 화면에서 승인해야 합니다.

### Demo A~E 실행

1. `docker compose up --build --detach --wait`로 네 서비스를 실행합니다.
2. `http://localhost:3000`에서 언어와 금융목적을 선택하고 Profile을 저장합니다.
3. [`docs/season3-demo-scenarios.md`](docs/season3-demo-scenarios.md)에 기록된 Demo별 Profile과 상품 ID를 사용합니다.
4. 상품 상세에서 Eligibility와 Identity·Branch·Mobile Access를 각각 확인합니다.
5. 판단 근거 탭에서 공식 Source 원문과 확인일을 대조합니다.
6. Demo A~E의 고정 Product Code·대표 Profile·기대 결과는 [`docs/season3-demo-manifest.md`](docs/season3-demo-manifest.md)를 따릅니다. 공개 배포 후 같은 시나리오를 재현하고 화면과 공식 Source 링크를 최종 검수합니다.

### 현재 AI 구성

OpenAI Responses API Adapter가 선택형으로 연결되어 있습니다. `LLM_PROVIDER=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.6-terra`, `OPENAI_REASONING_EFFORT=medium`을 배포환경 Secret으로 설정하면 승인된 공식 RAG Context, Eligibility Result, Access Result, Rule Detail을 이용해 쉬운 설명·다음 행동·필요 시 은행 문의문을 생성합니다. Key 누락·API 장애·구조화 출력 오류·숫자 또는 Visa 코드 무결성 위반 시 검증 가능한 템플릿으로 자동 복귀합니다. LLM 출력 스키마에는 상태 필드가 없으며 Backend가 계산한 Eligibility와 Access 판정은 응답 조립 단계에서 고정됩니다. RAG는 ONNX 기반 다국어 FastEmbed와 SQLite 영속 색인을 사용하며 Product Metadata Filtering과 승인·유효기간 필터를 항상 적용합니다.

현재 개발환경에서 OpenAI Responses API 실호출, 장애 시 Fallback과 판정 불변성을 검증했습니다. 제출 전에는 운영 Secret으로 교체한 공개 배포 환경에서 동일 호출을 한 번 더 검증하고 응답 캡처를 보관합니다.

PDF/HTML 추출, 페이지 번호 보존, OCR 필요 페이지 표시, `contentHash` 변경 감지, PENDING Rule Candidate 추출과 RAG 평가 실행법은 [`docs/ai-rag-quality-and-secrets.md`](docs/ai-rag-quality-and-secrets.md)에 정리되어 있습니다. RAG Dataset은 실제 승인 Source ID를 사용하며, 고정 Demo A~E 상품 기준 6개 언어 48 Case 평가 결과는 [`docs/season3-demo-rag-evaluation-2026-08-29.md`](docs/season3-demo-rag-evaluation-2026-08-29.md)에 있습니다.

운영 LLM은 OpenAI를 선택했습니다. 실제 호출을 활성화하려면 OpenAI Project API Key와 계정에서 사용 가능한 모델 ID를 배포환경 Secret으로 설정해야 합니다. 공식 OpenAI 문서의 Responses API 방식으로 호출하며 Key는 저장소나 문서에 기록하지 않습니다.

### 제출 배포 상태

Caddy 자동 TLS와 운영 Compose 사용법은 [`docs/production-deployment.md`](docs/production-deployment.md)에 정리되어 있습니다. 서버 선정부터 공개 URL 확인까지 순서대로 따라 하는 실행 절차는 [`docs/first-deployment-runbook.md`](docs/first-deployment-runbook.md)에 있습니다. 공개 기간의 점검·장애 대응·비상 복구는 [`docs/operations-runbook.md`](docs/operations-runbook.md)에 있습니다. 저장소에는 운영 Secret을 포함하지 않으며 `.env.production`은 생성 스크립트로 만들고 Git에서 제외합니다.

현재 문서의 URL은 로컬 개발 주소입니다. 공개 HTTPS 제출 URL은 아직 확정되지 않았으며, 배포 후 아래 항목을 실제 값으로 갱신해야 합니다.

- 제출 URL 및 Health 확인 주소
- 운영 관리자 계정 생성·비밀번호 교체 절차
- `RAG_INTERNAL_TOKEN`, DB 비밀번호 등 운영 Secret 설정 여부
- 심사 기간 모니터링 및 장애 대응 담당자

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
GET  /api/financial-journey?profileSessionId={uuid}
PUT  /api/financial-journey/progress/{stepCode}
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
GET  /api/ai/chat/history
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
- 모든 사전자격 설명에는 실제 가입 여부와 한도·금리가 금융기관의 최종 심사에 따라 달라진다는 공통 면책문구를 한국어·영어·베트남어·중국어·일본어·태국어로 제공합니다.
- 사용자 질문은 신뢰할 수 없는 검색 입력으로만 취급합니다. System Prompt 공개, 기존 지침 무시, Eligibility/Rule/Source 정책 변경을 요구하는 대표적인 Prompt Injection은 검색 전에 차단하며 내부 AI API는 `RAG_INTERNAL_TOKEN`으로 보호합니다.
- 벡터 검색은 `product_id`, `review_status=APPROVED`, 현재 유효기간을 동시에 필터링합니다. 반환 직전에도 Source URL이 `SOURCE_ALLOWED_DOMAINS`의 공식 도메인인지 다시 확인합니다.
- 임시 프로필에는 주민등록번호, 외국인등록번호, 여권번호, 계좌번호, 카드번호 필드가 없습니다. 자유입력 필드에 해당 형식의 값을 붙여 넣어도 Backend가 `400 Bad Request`로 거부합니다.

운영 환경에서는 `SOURCE_ALLOWED_DOMAINS`를 실제 금융기관·공공기관 공식 도메인만으로 구성하고, Source 상태나 유효기간을 변경한 뒤 `POST /api/admin/rag/reindex`를 실행하세요.
