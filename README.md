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
- Source · Rule 검수: http://localhost:3000/admin/sources
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
3. 국적, 생년월일, 지원 비자, 체류기간, 직업, 소득과 금융 목적을 입력합니다.
4. **프로필 저장**을 누릅니다.
5. 발급된 Profile ID와 Session ID를 확인합니다.

프로필은 24시간 후 만료됩니다. 주민등록번호, 여권번호, 외국인등록번호, 계좌번호는 입력하거나 저장하지 않습니다.

### 4. 공식 Source 등록

1. 상단 메뉴에서 **Source · Rule 검수**를 선택합니다.
2. 은행 또는 공공기관의 공식 페이지에서 원문을 확인합니다.
3. 기관, Source 유형, 제목, HTTPS URL, 수집 당시 원문 텍스트와 유효기간을 입력합니다.
4. **Source 저장**을 누릅니다.
5. 저장된 Snapshot, SHA-256 hash, 최근 검증일을 확인합니다.
6. 원문 링크와 Snapshot이 일치할 때만 **공식 Source 승인**을 누릅니다.

블로그, 커뮤니티, 광고성 제3자 페이지는 등록할 수 없습니다. 허용된 공식 도메인은 `.env`의 `SOURCE_ALLOWED_DOMAINS`에서 관리합니다. 새 기관을 추가할 때는 실제 공식 도메인임을 확인한 뒤 목록에 추가하고 컨테이너를 다시 시작하세요.

### 5. Rule Candidate 등록 및 검수

1. 등록된 Source를 근거로 후보를 작성합니다.
2. 상품 코드, Rule Key, operator, value, Rule level, 원문 근거 문장과 AI 추출 신뢰도를 입력합니다.
3. **PENDING 후보 저장**을 누릅니다.
4. Source가 먼저 `APPROVED`인지 확인합니다.
5. 후보를 검토하고 **승인**, **값 수정 후 승인**, **UNKNOWN**, **거절** 중 하나를 선택합니다.

`confidence`는 문서에서 값을 추출한 신뢰도이며 금융상품 가입 가능 확률이 아닙니다. Source가 `APPROVED`가 아니면 Rule을 승인할 수 없습니다.

같은 상품과 Rule Key에 서로 다른 공식 조건이 승인되면 시스템은 자동으로 하나를 선택하지 않고 관련 Rule을 모두 `NEED_REVIEW`로 변경합니다. 관리자가 문서 최신성과 우선순위를 확인해야 합니다.

### 6. 현재 제한사항

- DATA-003의 LLM 자동 추출은 아직 연결하지 않았습니다. 현재는 관리자 화면에서 후보 구조를 직접 입력합니다.
- Runtime Eligibility Engine은 다음 개발 단계입니다. 따라서 지금 승인한 Rule로 사용자 가입 가능 여부를 판정하지 않습니다.
- 로컬 관리자 화면은 사용 편의를 위해 기본적으로 인증이 꺼져 있습니다. 외부 배포 전에 `ADMIN_SECURITY_ENABLED=true`와 안전한 관리자 자격증명을 설정하고 Frontend 인증 연동을 완료해야 합니다.

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
```

## 브랜치 정책

- `main`: 배포 가능한 안정 버전
- `develop`: 다음 릴리스 통합 브랜치
- `feature/<issue>-<summary>`: 기능 개발
- `fix/<issue>-<summary>`: 버그 수정

변경은 Pull Request로 `develop`에 병합하고 릴리스 시 `main`으로 승격합니다.

## 안전 원칙

Official Source가 사실의 기준이며, Human Verification을 거쳐 `APPROVED`인 Source와 Rule만 Runtime에서 사용할 수 있습니다. Rule Engine만 사전자격을 진단하고 RAG와 LLM은 근거 설명·번역·문의문 생성을 담당합니다. 확인할 수 없는 조건은 추측하지 않고 `UNKNOWN`으로 유지합니다.
