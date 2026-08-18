# Visa-aware Financial Agent 기능명세서 v0.2

> 문서 목적: 2026 금융 AI Challenge MVP 개발을 위한 구현 기준서  
> 핵심 방향: **공개 금융정보 기반 외국인 금융자격 사전진단 + 미확인 조건 탐지 + 다국어 설명**  
> 버전: v0.2  
> 기준일: 2026-08-18

---

## 목차

1. 프로젝트 정의  
2. MVP 목표와 범위  
3. 핵심 설계 원칙  
4. 전체 시스템 아키텍처  
5. 권장 기술 스택  
6. Repository 구조  
7. 개발환경 구축 기능명세  
8. 데이터 수집 및 Rule 검수 파이프라인  
9. 사용자 프로필 기능  
10. 금융상품 관리  
11. Rule 모델  
12. Eligibility Pre-check Engine  
13. 상품 추천 및 정렬  
14. RAG 시스템  
15. AI 설명 및 다국어 기능  
16. 필요서류 및 신청절차  
17. Frontend 기능명세  
18. Backend API 초안  
19. DB 설계 초안  
20. 관리자 기능  
21. AI 안전장치  
22. 테스트 기능명세  
23. MVP 개발 우선순위  
24. MVP에서 제외하는 기능  
25. MVP Demo Scenario  
26. 향후 확장 방향  
27. 개발 착수 전 최종 체크리스트  
28. MVP 구현 가능성 자체 검증  
29. 최종 시스템 철학

---

## 0. 문서 개정 요약

v0.2는 기존 v0.1의 `Rule Engine = 판단 / RAG = 근거 / LLM = 설명` 구조를 유지하되, 실제 금융상품의 비자·체류·소득 조건이 상품별로 완전하게 공개되지 않는 현실을 반영해 다음을 수정한다.

1. `가입 가능/불가` 확정 표현을 제거하고 **공개조건 충족 / 공개조건 미충족 / 은행 확인 필요 / 정보 부족**의 사전자격 진단 상태로 변경한다.
2. 공식 문서에서 Rule을 바로 사용하지 않고 **Source 수집 → AI Rule 후보 추출 → Human Verification → Approved Rule DB** 파이프라인을 추가한다.
3. 모든 Rule에 **출처, 적용일, 검수상태, 검수일**을 연결한다.
4. 공개되지 않은 조건을 서비스 결함으로 숨기지 않고 **Unknown Condition**으로 사용자에게 보여준다.
5. Unknown Condition이 있을 때 **은행 문의 문장 자동생성** 기능을 제공한다.
6. `적합도 92%`와 같은 가짜 정밀도 표현을 제거하고 **확인된 조건 수 / 미확인 조건 수 / 명시적 미충족 조건**으로 설명한다.
7. MVP 범위를 **외국인 대출·주거금융 중심 + 예적금 일부**로 제한한다.
8. 일반 AI Chat은 핵심 기능보다 낮은 우선순위로 배치한다.

---

# 1. 프로젝트 정의

## 1.1 프로젝트명

**Visa-aware Financial Agent**

## 1.2 한 줄 정의

국내 체류 외국인의 비자 유형, 체류기간, 직업, 소득 등 금융 접근 조건을 분석하여 **공개된 공식 금융정보 기준으로 금융상품의 사전자격을 진단하고**, 판단 가능한 조건과 추가 확인이 필요한 조건을 구분해 필요서류·신청절차·은행 문의사항을 사용자의 모국어로 안내하는 AI 금융 정착 웹서비스.

## 1.3 해결하려는 문제

외국인 고객이 국내 금융상품을 탐색할 때 겪는 핵심 문제는 단순 번역 부족이 아니다.

- 상품별 외국인 가입 조건이 서로 다른 위치에 흩어져 있다.
- 비자 유형, 체류기간, 소득, 근속기간 등 자격조건의 공개 수준이 상품마다 다르다.
- 일부 상품은 세부 비자 목록을 공개하지만 일부 상품은 “비자에 따라 제한될 수 있음” 정도만 안내한다.
- 공식 페이지, 상품설명서, FAQ 등 서로 다른 문서에서 조건을 확인해야 한다.
- 공개 정보만으로 최종 가입 여부를 확정할 수 없는 경우가 많다.
- 외국인 사용자는 무엇이 충족됐고 무엇을 추가로 은행에 확인해야 하는지 판단하기 어렵다.

따라서 본 서비스는 단순히 “가입 가능합니다”라고 답하는 것이 아니라 다음을 제공한다.

**사용자 조건 수집 → 검수된 Rule 기반 사전자격 진단 → 공식 근거 제공 → 미확인 조건 탐지 → AI 다국어 설명 → 필요서류 및 은행 문의사항 안내**

## 1.4 서비스 핵심 메시지

> 외국인에게 필요한 것은 금융정보의 단순 번역이 아니라, **공개된 정보로 어디까지 판단할 수 있고 무엇을 추가로 확인해야 하는지** 알려주는 것이다.

---

# 2. MVP 목표와 범위

## 2.1 MVP 핵심 경험

사용자가 자신의 체류·소득·직업 정보를 입력하면 시스템이 선택 가능한 금융상품을 대상으로 공개조건을 비교하고 다음 4가지 상태 중 하나로 사전진단한다.

- **`PUBLIC_CONDITIONS_MET` — 공개조건 충족**: 공개된 필수조건은 모두 충족했지만 최종 심사는 별도다.
- **`NEED_BANK_CONFIRMATION` — 은행 확인 필요**: 공개조건 일부가 비공개·외부심사·은행 내부심사에 의존한다.
- **`PUBLIC_CONDITIONS_NOT_MET` — 공개조건 미충족**: 명시된 필수조건 중 하나 이상을 충족하지 못했다.
- **`INSUFFICIENT_INFORMATION` — 정보 부족**: 사용자 입력 또는 공식 문서가 부족해 사전진단할 수 없다.

## 2.2 MVP 대상 금융상품

### P0 필수

- 외국인 신용대출
- 외국인 생활자금 대출
- 외국인 전세·주거금융

### P1 선택

- 외국인 예금
- 외국인 적금

### MVP 제외

- 보험
- 카드 심사
- 투자상품
- 실제 대출 실행
- 실제 계좌 개설
- 은행 내부 신용심사
- 개인신용정보 조회

## 2.3 MVP 지원 체류자격 권장 범위

- D-2
- D-4
- E-7
- E-9
- F-2
- F-5
- F-6

모든 체류자격을 지원하는 것을 목표로 하지 않는다. **공식 자료가 확보되고 Rule 검수가 완료된 체류자격만 진단 대상으로 활성화한다.**

## 2.4 MVP 지원 언어

### P0

- 한국어
- 영어
- 베트남어

### P1

- 중국어
- 태국어
- 인도네시아어

---

# 3. 핵심 설계 원칙

## 원칙 1. 공식 Source가 사실의 기준이다

AI의 기억이나 일반 상식으로 금융조건을 생성하지 않는다.

## 원칙 2. Human Verification을 거친 Rule만 판정에 사용한다

AI가 문서에서 추출한 조건은 `Rule Candidate`일 뿐이며, 관리자 검수 후 `APPROVED` 상태가 되어야 Runtime Rule Engine에 반영된다.

## 원칙 3. Rule Engine은 사전자격을 진단한다

최종 승인 여부를 판단하지 않는다.

## 원칙 4. RAG는 판정의 근거와 설명을 지원한다

RAG 검색 결과가 달라졌다고 사전자격 결과가 달라져서는 안 된다.

## 원칙 5. LLM은 설명·번역·문의문 생성을 담당한다

LLM이 Rule을 덮어쓰거나 가입 가능성을 독자적으로 변경할 수 없다.

## 원칙 6. 모르는 것은 UNKNOWN으로 남긴다

미공개·충돌·불충분 조건을 추론으로 채우지 않는다.

## 원칙 7. 모든 금융정보는 출처와 기준일을 가진다

사용자 화면에서 “정보 기준일”과 “공식 출처”를 확인할 수 있어야 한다.

---

# 4. 전체 시스템 아키텍처

```text
                     [OFFLINE DATA PIPELINE]

공식 은행/공공기관 문서
        ↓
Source Collector
        ↓
문서 Parsing / Cleaning
        ↓
AI Rule Candidate Extractor
        ↓
관리자 Human Verification
        ↓
Approved Product / Rule DB
        ↓
Vector DB Embedding

──────────────────────────────────────────────
                         [RUNTIME]

외국인 사용자
      ↓
Next.js Web
      ↓ REST/HTTPS
Spring Boot API
      ├──────────────→ MySQL
      │                 - 사용자 임시 프로필
      │                 - 상품
      │                 - 승인 Rule
      │                 - Source
      │                 - 진단 결과
      │
      ├──────────────→ Eligibility Engine
      │                    ↓
      │           Pre-check Result
      │
      └──────────────→ Python AI Service
                           ├─ RAG
                           ├─ 다국어 설명
                           ├─ Easy Language
                           ├─ Unknown Condition 설명
                           └─ 은행 문의문 생성
                                ↓
                           Vector DB
```

## 4.1 책임 분리

### Frontend

- 사용자 입력
- 진단 결과 시각화
- 판단 근거 노출
- 필요서류/신청절차
- 다국어 UI
- AI 설명 및 문의문 표시

### Spring Boot

- 사용자 세션/프로필 관리
- 상품 조회
- Rule Engine 실행
- 결과 저장
- AI Service 호출
- 관리자 CRUD 및 검수 워크플로

### Python AI Service

- 문서 전처리
- Rule Candidate 추출 지원
- Embedding/RAG
- 자연어 설명
- 다국어 번역
- 은행 문의문 생성

### MySQL

- 신뢰할 수 있는 정형 데이터의 Source of Truth

### Vector DB

- 공식 문서 검색과 근거 설명용
- 자격 판정의 Source of Truth가 아님

---

# 5. 권장 기술 스택

## 5.1 Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query(React Query)
- Fetch 또는 Axios
- next-intl 또는 i18next

## 5.2 Backend

- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Validation
- Spring Security: MVP에서는 관리자 인증에 우선 적용
- JPA 또는 MyBatis 중 팀 숙련도에 맞춰 1개 선택
- MySQL 8
- springdoc-openapi

## 5.3 AI Backend

- Python 3.11 권장
- FastAPI
- Pydantic
- LangChain 또는 얇은 Custom RAG Layer
- Embedding Model
- LLM API
- Vector DB Client

## 5.4 Vector DB

### MVP

- ChromaDB 또는 FAISS

### 향후 확장

- PostgreSQL + pgvector
- Qdrant
- Pinecone

## 5.5 Infra

- Frontend: Vercel
- Backend: AWS EC2 / Render / Railway 중 선택
- AI Service: AWS EC2 / Render
- DB: MySQL
- Docker Compose: 로컬 통합환경

---

# 6. Repository 구조

```text
visa-financial-agent/

├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── profile/
│   │   ├── products/
│   │   ├── precheck/
│   │   └── assistant/
│   ├── services/
│   ├── types/
│   └── locales/
│
├── backend/
│   └── src/main/java/.../
│       ├── profile/
│       ├── product/
│       ├── source/
│       ├── rule/
│       ├── eligibility/
│       ├── recommendation/
│       ├── admin/
│       └── common/
│
├── ai-service/
│   ├── app/
│   │   ├── api/
│   │   ├── ingestion/
│   │   ├── extraction/
│   │   ├── rag/
│   │   ├── explain/
│   │   ├── translation/
│   │   └── guardrail/
│   ├── tests/
│   └── scripts/
│
├── data-pipeline/
│   ├── source_registry/
│   ├── snapshots/
│   └── validation/
│
├── infra/
│   ├── docker/
│   └── docker-compose.yml
│
└── docs/
    ├── requirements.md
    ├── api-spec.md
    ├── architecture.md
    ├── data-policy.md
    └── test-plan.md
```

---

# 7. 개발환경 구축 기능명세

## ENV-001 Git Repository 생성

### 기능

Git 기반 협업 저장소를 구성한다.

### 완료조건

- `main`, `develop` 브랜치 정책 정의
- frontend/backend/ai-service/data-pipeline 디렉터리 생성
- `.gitignore`
- README
- PR Template
- Issue Template
- `.env.example`

---

## ENV-002 Frontend 개발환경

### 설정

- Next.js + TypeScript
- Tailwind CSS
- ESLint
- React Query Provider
- i18n
- 공통 Layout
- API Client
- Error Boundary

### 환경변수

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_DEFAULT_LANGUAGE
```

### 완료조건

`/health` 화면에서 Backend Health API 성공 여부를 확인할 수 있다.

---

## ENV-003 Spring Boot 개발환경

### 필수 설정

- Spring Web
- Validation
- MySQL Driver
- JPA/MyBatis
- OpenAPI
- 공통 예외처리
- Request/Response Logging
- CORS

### 환경변수

```text
DB_URL
DB_USERNAME
DB_PASSWORD
AI_SERVICE_URL
ADMIN_JWT_SECRET
```

### 완료조건

```http
GET /api/health
```

```json
{
  "status": "UP"
}
```

---

## ENV-004 AI Service 개발환경

### 필수 패키지

- FastAPI
- Uvicorn
- Pydantic
- LangChain 또는 Custom RAG
- Embedding Library
- Vector DB Client
- LLM Client

### 완료조건

```http
GET /health
```

```json
{
  "status": "UP"
}
```

---

## ENV-005 Docker 통합환경

다음 컨테이너를 로컬에서 실행할 수 있어야 한다.

```text
frontend
backend
ai-service
mysql
```

### 완료조건

```bash
docker compose up
```

명령 하나로 각 서비스가 정상 기동되고 Frontend에서 Backend 및 AI Health 상태를 확인할 수 있다.

---

# 8. 데이터 수집 및 Rule 검수 파이프라인

본 장은 v0.2에서 새로 추가된 핵심 기능이다.

## DATA-001 공식 Source 등록

### 대상

- 은행 공식 상품 페이지
- 상품설명서
- 약관
- 은행 FAQ
- 금융감독원·금융위원회 등 공공 가이드

### 저장 항목

```text
institution
source_type
title
source_url
retrieved_at
valid_from
valid_to
content_hash
review_status
```

### 원칙

블로그, 커뮤니티, 광고성 제3자 페이지는 판정 Rule의 Source로 사용하지 않는다.

---

## DATA-002 Source Snapshot 저장

외부 페이지 변경에 대비해 수집 당시의 텍스트 또는 문서 Snapshot을 보존한다.

### 목적

- Rule이 어떤 원문에서 만들어졌는지 재현
- 나중에 상품 조건이 변경됐을 때 비교
- 심사 시 판단 근거 증빙

---

## DATA-003 AI Rule Candidate 추출

AI는 문서에서 다음 형태의 후보를 추출한다.

```json
{
  "ruleKey": "VISA_TYPE",
  "operator": "IN",
  "value": ["F-2", "F-5"],
  "ruleLevel": "HARD",
  "sourceExcerpt": "...",
  "confidence": 0.93
}
```

### 중요

`confidence`는 **AI 추출 신뢰도**일 뿐 금융상품 가입 가능 확률이 아니다.

---

## DATA-004 Human Verification

관리자가 Rule Candidate를 검토한다.

### 액션

- 승인
- 값 수정 후 승인
- UNKNOWN으로 변경
- 거절

### Rule 상태

```text
PENDING
APPROVED
REJECTED
NEED_REVIEW
EXPIRED
```

`APPROVED` Rule만 Runtime Eligibility Engine에서 사용할 수 있다.

---

## DATA-005 Source Conflict 처리

동일 상품에 대해 공식 자료끼리 조건이 충돌하면 자동으로 하나를 선택하지 않는다.

### 처리

```text
Rule Status = NEED_REVIEW
Runtime Result = INSUFFICIENT_INFORMATION 또는 NEED_BANK_CONFIRMATION
```

관리자가 최신성·문서 우선순위를 검토한다.

---

## DATA-006 정보 최신성 관리

각 Source와 Rule에 마지막 검증일을 저장한다.

### 관리자 화면

- 최근 검증일
- 유효기간
- Source 링크
- 현재 Rule
- 검수 상태

---

# 9. 사용자 프로필 기능

## FR-101 언어 선택

사용자가 서비스 언어를 선택한다.

### 입력

```text
language
```

### 출력

- UI 언어 변경
- AI 설명 언어 변경
- 문의문 번역

---

## FR-102 금융 프로필 입력

### P0 입력항목

```text
국적
생년월일 또는 나이
비자 종류
비자 만료일
한국 체류 시작일
직업
고용형태
월 소득
근속기간
금융 목적
```

### P1 입력항목

```text
은행계좌 보유 여부
주거 형태
희망 금액
선호 은행
```

### 개인정보 원칙

MVP에서는 주민등록번호, 여권번호, 외국인등록번호 원문을 수집하지 않는다.

---

## FR-103 비자 선택

지원 가능한 체류자격만 선택 목록에 노출한다.

```text
D-2
D-4
E-7
E-9
F-2
F-5
F-6
```

각 비자 마스터 데이터는 다음을 가진다.

```text
visa_code
visa_name
visa_category
description
active
```

비자 자체의 일반적 취업 가능 여부를 금융상품 Rule로 자동 추론하지 않는다.

---

# 10. 금융상품 관리

## FR-201 금융상품 등록

### 주요 필드

```text
institution
product_name
product_type
description
target_summary
source_document_id
active
information_base_date
```

조건은 상품 테이블에 하드코딩하지 않고 `PRODUCT_RULE`에서 관리한다.

---

## FR-202 상품 조회

### 필터

- 금융 목적
- 상품 유형
- 은행
- 외국인 대상 여부
- 진단 가능 여부

### 진단 가능 여부

```text
READY
PARTIAL
NOT_READY
```

검수된 Rule이 부족한 상품을 일반 사용자에게 “정확한 진단 가능” 상품처럼 보여주지 않는다.

---

## FR-203 상품 상세조회

표시 항목:

- 상품 요약
- 공개조건
- 추가 확인 조건
- 필요서류
- 신청방법
- 공식 출처
- 정보 기준일

---

# 11. Rule 모델

## 11.1 Rule Level

### HARD

공식자료에 명시되어 있고 사용자 입력과 직접 비교 가능한 조건.

예:

```text
AGE >= 19
VISA_REMAINING_MONTH >= 3
VISA_TYPE IN F2,F5
DOMESTIC_INCOME_MONTH >= 3
```

### EXTERNAL_CHECK

사용자가 입력만으로 확정할 수 없고 외부 기관·은행 심사가 필요한 조건.

예:

```text
보증보험증권 발급 가능
은행 내부 신용평가
```

### UNKNOWN

조건 존재는 확인되지만 세부 기준이 공개되지 않은 경우.

예:

```text
"체류 VISA 유형에 따라 제한될 수 있음"
```

---

## 11.2 PRODUCT_RULE 스키마

```text
id
product_id
rule_key
operator
rule_value
rule_level
mandatory
source_document_id
source_locator
valid_from
valid_to
review_status
verified_at
description
```

---

# 12. Eligibility Pre-check Engine

## FR-301 사전자격 진단

### 입력

- User Profile
- Product
- Approved Rules

### 출력

```text
PUBLIC_CONDITIONS_MET
NEED_BANK_CONFIRMATION
PUBLIC_CONDITIONS_NOT_MET
INSUFFICIENT_INFORMATION
```

---

## FR-302 Rule Detail 생성

응답은 단순 Boolean이 아니라 각 조건의 상태를 반환한다.

```json
{
  "status": "NEED_BANK_CONFIRMATION",
  "passedRules": [
    {
      "key": "AGE",
      "message": "만 19세 이상 조건 충족"
    }
  ],
  "failedRules": [],
  "externalChecks": [
    {
      "key": "GUARANTEE",
      "message": "보증보험 발급 가능 여부 확인 필요"
    }
  ],
  "unknownRules": [
    {
      "key": "VISA_DETAIL",
      "message": "허용 비자 세부목록이 공개되어 있지 않음"
    }
  ]
}
```

---

## FR-303 상태 결정 규칙

### PUBLIC_CONDITIONS_NOT_MET

명시적 `HARD` Rule 중 하나 이상 FAIL.

### NEED_BANK_CONFIRMATION

HARD Rule FAIL은 없지만 `EXTERNAL_CHECK` 또는 중요한 `UNKNOWN`이 존재.

### PUBLIC_CONDITIONS_MET

- 모든 적용 가능한 HARD Rule PASS
- 명시적 FAIL 없음
- UNKNOWN 없음 또는 비핵심 UNKNOWN만 존재

단, 사용자에게 항상 “최종 가입승인이 아님”을 표시한다.

### INSUFFICIENT_INFORMATION

- 필수 사용자 입력 누락
- Source 충돌
- Rule 검수 미완료
- 진단에 필요한 Rule 자체가 부족

---

## FR-304 Unknown Condition Resolver

공개되지 않은 조건을 숨기지 않고 사용자에게 구조화해 보여준다.

### 예시

```text
추가 확인이 필요한 조건

⚠ 공식 상품정보에는 “체류 VISA 유형에 따라 제한될 수 있음”이 명시되어 있으나
허용되는 VISA 목록은 공개되어 있지 않습니다.

현재 E-9 비자에 대한 최종 판단은 은행 확인이 필요합니다.
```

---

# 13. 상품 추천 및 정렬

## FR-401 추천 후보 필터링

### 제외

- `PUBLIC_CONDITIONS_NOT_MET`

### 포함

- `PUBLIC_CONDITIONS_MET`
- `NEED_BANK_CONFIRMATION`

`INSUFFICIENT_INFORMATION`은 별도 “추가 정보 필요” 섹션으로 보여준다.

---

## FR-402 추천 정렬

MVP에서는 `92%` 같은 확률형 점수를 사용하지 않는다.

### 권장 정렬 기준

1. 명시적 FAIL 없음
2. HARD Rule 충족 수가 많음
3. UNKNOWN 수가 적음
4. 사용자 금융 목적 일치
5. 사용자가 입력한 선호조건 일치

### 사용자 화면

```text
확인된 공개조건 4/4
추가 확인 2개
```

과 같이 설명 가능한 정보로 표현한다.

---

# 14. RAG 시스템

## AI-101 금융문서 수집

RAG 대상은 공식 Source로 제한한다.

- 금융상품 페이지
- 상품설명서
- 약관
- 공식 FAQ
- 공공 금융 가이드

---

## AI-102 문서 전처리

```text
Document
   ↓
Text Extraction
   ↓
Cleaning
   ↓
Chunking
   ↓
Metadata
   ↓
Embedding
   ↓
Vector DB
```

### Metadata

```text
document_id
institution
document_name
source_type
source_url
retrieved_at
valid_from
valid_to
product_id
language
```

---

## AI-103 Retrieval

질문과 현재 상품 ID, Rule Key를 조합하여 검색한다.

예:

```text
product_id=10
rule=VISA_TYPE
query="E-9 외국인 체류자격 제한"
```

다른 상품의 조건이 섞이지 않도록 Product Metadata Filtering을 사용한다.

---

## AI-104 근거 Context 반환

```json
{
  "documents": [
    {
      "documentId": 12,
      "title": "상품설명서",
      "content": "...",
      "sourceUrl": "...",
      "retrievedAt": "2026-08-18",
      "score": 0.91
    }
  ]
}
```

---

## AI-105 RAG Answer Guardrail

System Prompt 핵심:

```text
1. 제공된 공식 문서에 없는 금융조건을 생성하지 않는다.
2. Eligibility Engine 결과를 변경하지 않는다.
3. 공개되지 않은 조건은 "확인 필요"라고 명시한다.
4. 금융상품 가입을 보장한다고 표현하지 않는다.
5. Rule 결과와 근거 Source를 구분해 설명한다.
6. 숫자·비자코드·금액은 구조화 데이터에 있는 값만 사용한다.
```

---

# 15. AI 설명 및 다국어 기능

## AI-201 사전자격 결과 설명

Rule Engine 결과를 자연어로 설명한다.

### 금지

> 이 상품에 가입할 수 있습니다.

### 권장

> 입력하신 정보 기준으로 공개된 필수조건은 충족했습니다. 다만 실제 신청 시 은행 내부심사와 추가 확인 절차에 따라 결과가 달라질 수 있습니다.

---

## AI-202 다국어 설명

사용자 선택 언어로 결과를 제공한다.

### 중요 용어

한국어 원문을 병기할 수 있다.

```text
체류자격 (Status of Stay)
소득증빙 (Proof of Income)
```

### 숫자 안전성

기간, 금액, 비자코드 등의 핵심 값은 LLM 번역 문장 속에서 새로 생성하지 않고 Backend의 구조화 데이터에서 UI에 주입한다.

---

## AI-203 Easy Language

복잡한 금융용어를 쉬운 표현으로 설명한다.

예:

```text
보증보험증권
→ 대출금을 갚지 못하는 상황에 대비해 보증기관이 일정한 보증을 제공하는 절차입니다.
```

---

## AI-204 은행 문의문 생성

Unknown 또는 External Check가 존재할 때 사용자가 금융기관에 무엇을 물어야 하는지 생성한다.

### 입력

```text
비자: E-9
비자 잔여기간: 14개월
체류기간: 2년
상품: A 외국인 전세대출
Unknown: 허용 비자 세부목록 비공개
```

### 출력

한국어:

> 안녕하세요. 현재 E-9 체류자격으로 국내에서 근무 중이며 체류기간이 14개월 남아 있습니다. 해당 체류자격으로 이 상품을 신청할 수 있는지와 추가로 필요한 서류가 있는지 확인 부탁드립니다.

사용자의 모국어 번역도 함께 제공한다.

---

# 16. 필요서류 및 신청절차

## FR-501 Document Checklist

### 구분

- 공식적으로 명시된 필수서류
- 상황에 따라 필요한 서류
- 은행 확인이 필요한 서류

### 예시

```text
[공식 필수]
✓ 여권
✓ 외국인등록증

[조건부]
○ 재직증명서
○ 소득증빙서류

[은행 확인 필요]
⚠ 추가 신용심사 서류
```

---

## FR-502 Personalized Checklist

사용자의 직업·상품 Rule에 따라 필요한 서류를 필터링한다.

문서 요구사항이 공식 Source에서 확인되지 않은 경우 AI가 임의로 “필수”로 승격시키지 않는다.

---

## FR-601 신청절차 안내

공식 Source에 명시된 절차를 기준으로 단계형으로 표시한다.

```text
STEP 1 필요서류 확인
STEP 2 신청채널 확인
STEP 3 영업점 또는 공식 채널 신청
STEP 4 은행 추가심사
```

---

## FR-602 공식 링크 연결

AI가 URL을 생성하지 않는다.

`SOURCE_DOCUMENT.source_url` 또는 `FINANCIAL_PRODUCT.official_url`에 저장된 공식 URL만 사용한다.

---

# 17. Frontend 기능명세

## FE-101 Landing Page

### 핵심 Copy

```text
한국 금융,
번역보다 중요한 것은
'내 조건으로 어디까지 가능한가'입니다.

공식 금융정보 기반 외국인 금융자격 사전진단
```

CTA:

```text
[내 조건 확인하기]
```

---

## FE-102 사용자 정보 Wizard

```text
STEP 1 기본정보
STEP 2 체류정보
STEP 3 직업·소득
STEP 4 금융목적
STEP 5 사전진단
```

### UX 원칙

- 필수항목 최소화
- 비자 만료일을 날짜 Picker로 입력
- 소득은 원화 기준
- 입력정보가 왜 필요한지 ToolTip 제공

---

## FE-103 Analysis Loading

실제 Backend 처리 상태와 일치하는 항목만 표시한다.

```text
✓ 사용자 조건 확인
✓ 검수된 상품조건 비교
✓ 추가 확인 조건 탐지
○ 공식 근거 불러오는 중
```

---

## FE-104 결과 Dashboard

상품 Card 예시:

```text
A 외국인 주거대출

🟢 공개조건 충족

공개조건
✓ 나이 조건
✓ 체류기간
✓ 비자 잔여기간
✓ 소득증빙기간

추가 확인
⚠ 보증보험 발급 여부
⚠ 은행 내부 신용심사

확인된 공개조건 4/4
추가 확인 2개

정보 기준일 2026.08.18

[판단 근거] [필요서류] [은행에 물어보기]
```

---

## FE-105 상태별 UI

### 공개조건 충족

초록 계열 상태 + “최종 승인 아님” 문구.

### 은행 확인 필요

노랑 계열 상태 + 무엇을 확인해야 하는지 우선 노출.

### 공개조건 미충족

빨강 계열 상태 + 실패 Rule을 명확히 표시.

### 정보 부족

회색 계열 상태 + 필요한 사용자 입력 또는 문서 부족 이유를 표시.

---

## FE-106 상품 상세

Tab:

```text
[사전진단]
[판단 근거]
[필요서류]
[신청 절차]
[공식 정보]
```

---

## FE-107 출처 표시

각 핵심 Rule에 출처를 연결한다.

```text
비자 잔여기간 3개월 이상
출처: A은행 상품설명서
확인일: 2026.08.18
```

---

## FE-108 은행 문의문 UI

```text
은행에 이렇게 물어보세요

[한국어 문장]
[베트남어 번역]

[복사]
```

---

## FE-109 AI Chat — P1

핵심 결과 화면 이후의 보조기능으로 제공한다.

질문 예:

- 왜 이 조건은 은행 확인이 필요한가요?
- 어떤 서류를 준비해야 하나요?
- 이 용어가 무슨 뜻인가요?

일반적인 투자·대출 추천 Chat으로 확대하지 않는다.

---

# 18. Backend API 초안

## 18.1 Profile

```http
POST /api/profiles
GET  /api/profiles/{id}
PUT  /api/profiles/{id}
```

MVP에서는 로그인 없이 임시 `sessionId`와 연결할 수 있다.

---

## 18.2 Products

```http
GET /api/products
GET /api/products/{id}
```

---

## 18.3 Pre-check

```http
POST /api/prechecks
GET  /api/prechecks/{id}
```

Request:

```json
{
  "profileId": 1,
  "productId": 10
}
```

Response:

```json
{
  "status": "NEED_BANK_CONFIRMATION",
  "passedRules": [],
  "failedRules": [],
  "externalChecks": [],
  "unknownRules": [],
  "informationBaseDate": "2026-08-18"
}
```

---

## 18.4 Recommendations

```http
POST /api/recommendations
GET  /api/recommendations/{id}
```

Response에는 가입확률을 포함하지 않는다.

---

## 18.5 AI

```http
POST /api/ai/explain
POST /api/ai/inquiry-message
POST /api/ai/chat
```

`/api/ai/chat`은 P1.

---

## 18.6 Admin Source/Rule

```http
POST /api/admin/sources
GET  /api/admin/sources
POST /api/admin/rule-candidates
PUT  /api/admin/rules/{id}/approve
PUT  /api/admin/rules/{id}/reject
PUT  /api/admin/rules/{id}/review
```

---

# 19. DB 설계 초안

## TEMP_PROFILE

```text
id
session_id
nationality
birth_date
visa_type
visa_expiry
residency_start_date
occupation
employment_type
monthly_income
employment_duration
language
created_at
expires_at
```

MVP에서는 영구 사용자 계정 없이 임시 프로필을 사용할 수 있다.

---

## FINANCIAL_PRODUCT

```text
id
institution
product_name
product_type
description
official_url
active
diagnosis_readiness
information_base_date
created_at
updated_at
```

---

## SOURCE_DOCUMENT

```text
id
institution
product_id
source_type
title
source_url
snapshot_path
content_hash
retrieved_at
valid_from
valid_to
review_status
created_at
updated_at
```

---

## PRODUCT_RULE

```text
id
product_id
rule_key
operator
rule_value
rule_level
mandatory
source_document_id
source_locator
valid_from
valid_to
review_status
verified_at
description
created_at
updated_at
```

---

## REQUIRED_DOCUMENT

```text
id
product_id
document_name
requirement_level
condition
source_document_id
verified_at
```

`requirement_level`:

```text
REQUIRED
CONDITIONAL
NEED_CONFIRMATION
```

---

## PRECHECK_RESULT

```text
id
session_id
profile_id
product_id
status
information_base_date
created_at
```

---

## PRECHECK_RULE_RESULT

```text
id
precheck_result_id
product_rule_id
result
message
```

`result`:

```text
PASS
FAIL
EXTERNAL_CHECK
UNKNOWN
NOT_APPLICABLE
```

---

## CONSULTATION — P1

```text
id
session_id
product_id
question
answer
language
created_at
```

---

# 20. 관리자 기능

## ADM-101 금융상품 CRUD

상품 등록/수정/비활성화.

## ADM-102 Source 등록 및 조회

공식 문서와 URL 등록.

## ADM-103 Rule Candidate 확인

AI가 추출한 후보를 검토.

## ADM-104 Rule 검수

- 승인
- 수정 후 승인
- UNKNOWN 변경
- 거절

## ADM-105 Source 상태관리

```text
ACTIVE
EXPIRED
NEED_REVIEW
```

## ADM-106 정보 기준일 관리

- 마지막 검증일
- 유효기간
- Source

## ADM-107 Rule 변경 이력

Rule 변경 전/후 값과 검수일을 보관한다.

MVP에서는 자동 실시간 Crawling까지 구현하지 않는다.

---

# 21. AI 안전장치

## SAFE-001 LLM 판정권한 차단

```text
Official Source = 사실
Human Verification = Rule 확정
Rule Engine = 사전진단
RAG = 근거
LLM = 설명
```

---

## SAFE-002 근거 없는 답변 차단

RAG 관련 근거가 없으면 다음과 같이 응답한다.

> 현재 등록된 공식 자료만으로는 해당 조건을 정확히 확인할 수 없습니다. 금융기관에 추가 확인이 필요합니다.

---

## SAFE-003 가입 보장 표현 금지

공통 문구:

> 본 결과는 입력된 정보와 공개된 공식 금융정보를 기반으로 한 사전자격 안내이며 실제 가입 여부와 한도·금리는 금융기관의 최종 심사 결과에 따라 달라질 수 있습니다.

---

## SAFE-004 Prompt Injection 방지

사용자의 메시지가 System Prompt, Rule 결과, Source 신뢰정책을 변경할 수 없도록 한다.

---

## SAFE-005 Source Domain Allowlist

Runtime RAG 데이터는 관리자 승인 Source만 검색한다.

---

## SAFE-006 개인정보 최소수집

MVP에서 다음을 수집하지 않는다.

- 주민등록번호
- 외국인등록번호 원문
- 여권번호
- 계좌번호
- 카드번호

---

# 22. 테스트 기능명세

## TEST-101 Rule Unit Test

```text
D-2 허용 Rule + D-2 사용자 → PASS
F-5 전용 Rule + D-2 사용자 → FAIL
```

---

## TEST-102 Boundary Test

```text
최소 비자 잔여기간 = 3개월
2개월 30일 → FAIL
3개월 → PASS
```

날짜 계산 기준을 테스트 코드에 명시한다.

---

## TEST-103 AI Hallucination Test

Context에 없는 Visa/소득/기간 조건을 AI가 생성하지 않는지 확인한다.

---

## TEST-104 Multilingual Consistency Test

한국어/영어/베트남어 결과의 핵심 값이 동일해야 한다.

검증 대상:

- 비자코드
- 개월 수
- 금액
- 상태
- Source 이름

---

## TEST-105 RAG Retrieval Test

질문별 기대 문서를 정의하고 Top-K 내 포함 여부를 평가한다.

Product Metadata Filtering이 다른 상품 Source를 섞지 않는지 검증한다.

---

## TEST-106 E2E Test

```text
접속
↓
언어 선택
↓
프로필 입력
↓
금융목적 선택
↓
상품 사전진단
↓
결과 Dashboard
↓
판단 근거
↓
필요서류
↓
은행 문의문
```

---

## TEST-107 Unknown Condition Test

공식 문서:

```text
"체류 VISA 유형에 따라 제한될 수 있음"
```

기대:

```text
E-9 → PUBLIC_CONDITIONS_NOT_MET ❌
E-9 → NEED_BANK_CONFIRMATION ✅
```

---

## TEST-108 Source Conflict Test

```text
상품페이지: 체류기간 6개월
FAQ: 체류기간 12개월
```

기대:

```text
자동으로 하나 선택하지 않음
Rule = NEED_REVIEW
Result = INSUFFICIENT_INFORMATION 또는 NEED_BANK_CONFIRMATION
```

---

## TEST-109 Source Missing Test

Visa 조건 Source가 없는 경우:

```text
UNKNOWN
```

이어야 하며 PASS로 간주하지 않는다.

---

## TEST-110 Translation Numeric Integrity Test

한국어 Source에 `3개월`이 있다면 다른 언어 결과에서 숫자가 변경되지 않아야 한다.

---

## TEST-111 Expired Rule Test

`valid_to`가 지난 Rule은 Runtime 판정에서 제외하고 관리자가 검수할 때까지 `INSUFFICIENT_INFORMATION` 처리한다.

---

# 23. MVP 개발 우선순위

## Phase 0 — 데이터 실현 가능성 검증

가장 먼저 수행한다.

### 목표

실제 상품 10~15개를 선정하고 각 상품에 대해:

```text
공개된 HARD Rule
EXTERNAL_CHECK
UNKNOWN
공식 Source
정보 기준일
```

을 수동으로 정리한다.

### 완료조건

최소 5개 상품에 대해 사용자의 프로필을 넣었을 때 Rule Engine으로 의미 있는 사전자격 비교가 가능해야 한다.

---

## Phase 1 — Skeleton

- ENV-001~005
- Frontend ↔ Backend ↔ AI Service Health 통신

---

## Phase 2 — DB 및 관리자 최소기능

- FINANCIAL_PRODUCT
- SOURCE_DOCUMENT
- PRODUCT_RULE
- 관리자 Source/Rule 등록

---

## Phase 3 — Rule Engine

- FR-301~304
- TEST-101/102/107/108/109

**AI보다 먼저 완성한다.**

---

## Phase 4 — 사용자 Flow

- FE-101/102
- Profile API
- 임시 Session

---

## Phase 5 — 결과 Dashboard

- FE-103~108
- 사전자격 API

### 중요 Gate

여기까지 완료하면 **AI 없이도 핵심 서비스가 동작해야 한다.**

---

## Phase 6 — RAG

- AI-101~105
- 공식 Source Embedding
- Metadata Filtering

---

## Phase 7 — LLM 설명 및 다국어

- AI-201~203
- TEST-103/104/110

---

## Phase 8 — Unknown Resolver + 문의문

- AI-204
- FE-108

---

## Phase 9 — AI Chat(P1)

시간이 남을 경우 구현.

---

## Phase 10 — 통합검증

- E2E
- Source 최신성
- Rule 만료
- RAG 정확도
- Hallucination

---

# 24. MVP에서 제외하는 기능

초기 공모전 개발에서는 다음 기능을 제외한다.

- 실제 대출 실행
- 실제 계좌 개설
- Open Banking
- MyData
- 개인 신용정보 조회
- 은행 내부 신용평가 재현
- 모든 체류자격
- 모든 국내 금융상품
- 실시간 자동 Crawling
- 자체 LLM Fine-tuning
- OCR
- 음성상담
- 모바일 App
- 복잡한 Multi-Agent
- 가입 승인 확률 예측
- 금융상품 “92% 가입 가능” 형태의 확률 점수

---

# 25. MVP Demo Scenario

## 사용자

- 국적: 베트남
- 언어: 베트남어
- 체류자격: E-9
- 한국 체류기간: 2년
- 비자 잔여기간: 14개월
- 직업: 제조업 근로자
- 월소득: 280만원
- 금융목적: 주거자금

## 상품 A — 공개조건 충족

- PASS: 연령 조건 충족
- PASS: 비자 조건 충족
- PASS: 비자 잔여기간 충족
- PASS: 국내 소득증빙 조건 충족
- 추가 확인: 보증보험 발급 가능 여부
- 추가 확인: 은행 내부 신용심사

**안내:** 본 결과는 공개조건 기반 사전진단이며 최종 가입승인이 아니다.

## 상품 B — 은행 확인 필요

- PASS: 연령 조건 충족
- PASS: 소득증빙 조건 충족
- UNKNOWN: 공식 페이지에는 “체류 VISA 유형에 따라 제한될 수 있음”이 명시되어 있으나 허용되는 VISA 목록은 공개되어 있지 않음

## 은행 문의문

> 안녕하세요. 현재 E-9 체류자격으로 국내에서 근무 중이며 체류기간이 14개월 남아 있습니다. 해당 체류자격으로 이 상품을 신청할 수 있는지와 추가로 필요한 서류가 있는지 확인 부탁드립니다.

## 상품 C — 공개조건 미충족

- FAIL: 최소 비자 잔여기간 조건 미충족
- 현재: 2개월
- 필요조건: 3개월 이상

발표에서는 **세 상태를 한 번에 보여주는 데모**가 가장 효과적이다.

---

# 26. 향후 확장 방향

## Phase 2

- 더 많은 체류자격
- 더 많은 금융기관
- Source 자동 변경감지

## Phase 3

- OCR 기반 외국인등록증/재직증명서 입력 자동화
- 단, 민감정보 마스킹 및 저장 정책 선행

## Phase 4

- MyData/Open Banking 기반 사용자 입력 자동화

## Phase 5

- 금융기관 API와 실제 상담 연결

## Phase 6

- 계좌, 대출, 예적금, 송금, 신용관리까지 확장한 외국인 금융 Operating Agent

---

# 27. 개발 착수 전 최종 체크리스트

## 데이터

- [ ] 실제 금융상품 10~15개 Source 확보
- [ ] 최소 5개 상품 Rule 수동 검수 완료
- [ ] Source마다 기준일 기록
- [ ] Unknown/External Check 분류 가능

## Backend

- [ ] Source와 Rule을 분리 저장
- [ ] APPROVED Rule만 Runtime에 사용
- [ ] 4가지 Pre-check 상태 구현
- [ ] Rule Detail 응답 구현

## Frontend

- [ ] `가입 가능` 대신 사전진단 표현 사용
- [ ] 출처와 기준일 노출
- [ ] Unknown Condition을 명시
- [ ] 가입확률처럼 보이는 점수 제거

## AI

- [ ] RAG가 판정을 변경할 수 없음
- [ ] 근거가 없으면 모른다고 답함
- [ ] 핵심 숫자를 구조화 데이터에서 사용
- [ ] 문의문 생성이 Rule/Unknown 데이터만 사용

## Test

- [ ] Rule 경계값
- [ ] Unknown
- [ ] Source 충돌
- [ ] Source 누락
- [ ] 번역 숫자 일관성
- [ ] Rule 만료
- [ ] E2E

---

# 28. MVP 구현 가능성 자체 검증

## 28.1 구현 가능성

**충분히 구현 가능하다.** 단, 성공 조건은 “모든 금융상품 지원”이 아니라 **검수된 소수 상품에서 사전자격 진단 흐름을 완성하는 것**이다.

가장 중요한 구현 순서는 다음과 같다.

```text
실제 Source 확보
→ 수동 Rule 확정
→ Rule Engine
→ 사용자 Flow
→ 결과 Dashboard
→ RAG
→ 다국어 설명
→ Unknown Resolver
```

처음부터 LangChain/LLM에 집중하지 않는다.

## 28.2 향후 디벨롭 가능성

현재 구조는 다음 요소가 분리되어 있어 확장에 유리하다.

- Source 관리
- Rule 검수
- Rule Engine
- RAG
- LLM 설명
- Frontend

따라서 향후 LLM 모델, Vector DB, 금융기관, 체류자격 범위가 바뀌어도 전체 시스템을 재작성할 필요가 없다.

## 28.3 가장 큰 리스크

1. 실제 상품별 공개조건 부족
2. 공식 Source의 잦은 변경
3. 금융조건을 잘못 “확정”해 보여줄 위험
4. 번역 과정에서 숫자·조건 왜곡 가능성

본 v0.2는 이 리스크를 각각 다음으로 완화한다.

```text
조건 부족 → UNKNOWN / 은행 확인 필요
Source 변경 → Source Snapshot / 기준일 / Rule 검수
확정 표현 위험 → 사전자격 진단 4단계
번역 오류 → 구조화 숫자/코드 UI 주입
```

## 28.4 최종 개발 판단

**GO**

다만 개발팀은 Phase 0의 실제 금융상품 데이터 검증을 반드시 통과한 뒤 기능 범위를 확정한다.

---

# 29. 최종 시스템 철학

> **Official Source = 사실**  
> **Human Verification = Rule 확정**  
> **Rule Engine = 사전자격 진단**  
> **RAG = 근거**  
> **LLM = 설명과 번역**

본 서비스는 AI가 모르는 금융조건을 만들어내는 시스템이 아니라, **공개된 것과 공개되지 않은 것을 구분하고 외국인이 다음 행동을 할 수 있게 돕는 금융 AI Agent**를 목표로 한다.
