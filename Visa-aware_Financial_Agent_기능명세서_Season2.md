# Visa-aware Financial Agent 기능명세서 Season 2

> 문서 버전: Season 2 v1.0
> 작성 기준일: 2026-08-20
> 서비스명: ViSafy
> 제출 목표: 2026 금융 AI Challenge MVP
> 선행 문서: `Visa-aware_Financial_Agent_기능명세서_v0.2.md`

---

## 목차

1. 문서 목적과 개정 방향
2. 프로젝트 정의
3. Season 2 핵심 목표
4. 현재 구현 기준선
5. 핵심 설계 원칙
6. MVP 범위와 완료 Gate
7. 사용자·언어·국적 모델
8. 공식 금융상품 데이터 구축
9. Source·Snapshot·Evidence 관리
10. Rule 모델과 동적 Profile Field
11. Eligibility Pre-check Engine
12. 추천·정렬·결과 설명
13. RAG 및 AI 기능
14. Frontend 사용자 경험
15. 관리자 기능
16. API 변경 명세
17. DB 변경 명세
18. 개인정보·보안·AI 안전장치
19. 테스트 및 품질지표
20. 배포·운영 요구사항
21. 대회 제출용 Demo Scenario
22. 제출 산출물 일치 기준
23. 개발 우선순위
24. 제출 전 최종 체크리스트
25. 향후 확장 방향
26. 최종 완료조건

---

# 1. 문서 목적과 개정 방향

## 1.1 목적

Season 2는 기존 v0.2의 기능을 대규모로 늘리는 문서가 아니다. 현재 구현된 ViSafy를 다음 조건을 만족하는 **대회 제출 가능 MVP**로 완성하기 위한 명세다.

- 공식 근거가 있는 금융상품만 사전자격 진단
- 공식 근거가 부족하면 시스템이 명확하게 모른다고 응답
- 언어 선택과 국적 정보를 분리해 잘못된 금융 판정을 방지
- AI가 판정을 만들지 않고 근거 검색·쉬운 설명·번역을 담당
- 심사위원이 짧은 시간 안에 핵심 가치를 확인할 수 있는 Demo 제공
- 지정된 심사 기간 동안 실제 접속 가능한 웹서비스 운영

## 1.2 v0.2 대비 핵심 변경

| 구분 | v0.2 | Season 2 |
| --- | --- | --- |
| 언어·국적 | 국가 카드 선택값을 함께 사용할 수 있음 | 언어와 국적을 반드시 분리 |
| 데이터 목표 | 상품 10~15개 수집 | READY 상품 5개 우선 완성 |
| Rule 입력 | 공통 Profile 중심 | 상품 Rule에서 `requiredFields` 동적 계산 |
| Visa | 주요 공통 입력 | 상품에 Rule이 있을 때만 판정에 사용 |
| 자료 부족 | 정보 부족으로 표현 | `SOURCE_INSUFFICIENT` 사유를 구조화 |
| AI 강조 | 설명·RAG | 판정 불변성, 근거성, 수치 무결성을 검증지표로 제시 |
| 언어 확장 | 다국어 확대 | 한국어·영어·베트남어 완성 후 중국어 선택 확장 |
| 제출 준비 | 기능 구현 중심 | 배포 안정성·고정 Demo·산출물 일치까지 포함 |

---

# 2. 프로젝트 정의

## 2.1 한 줄 정의

> ViSafy는 국내 체류 외국인의 정보와 검수된 공식 금융상품 조건을 비교하여, 공개조건 충족 범위·추가 확인사항·공식 근거를 설명하는 금융 사전자격 진단 AI Agent다.

## 2.2 해결하려는 문제

국내 체류 외국인은 금융상품을 탐색할 때 다음 문제를 겪는다.

- 상품 설명과 약관이 한국어 중심이다.
- 비자·거주·국적 조건이 상품마다 다르다.
- 공개조건과 은행 내부 심사 조건을 구분하기 어렵다.
- 상담 전에 본인이 확인할 수 있는 범위를 알기 어렵다.
- 번역만으로는 실제로 어떤 조건을 충족했는지 판단할 수 없다.

## 2.3 핵심 가치

```text
단순 번역
    ↓
공식 Source 기반 조건 구조화
    ↓
검수된 Rule과 사용자 Profile 비교
    ↓
판정 근거·추가 확인·다음 행동 제공
```

## 2.4 대회 제출용 핵심 메시지

> ViSafy는 가입 가능성을 만들어내는 챗봇이 아니라, 공개된 조건과 공개되지 않은 조건을 분리하고 사용자가 금융기관에 확인할 다음 행동까지 제공하는 설명 가능한 금융 AI Agent다.

---

# 3. Season 2 핵심 목표

## S2-GOAL-001 공식 데이터 실현 가능성

- 실제 금융상품 최소 5개를 `READY` 상태로 구성한다.
- 모든 활성 HARD Rule에 공식 Source Evidence를 연결한다.
- 상품 존재만 확인되고 세부 가입조건이 부족한 상품은 `NOT_READY`로 유지한다.

## S2-GOAL-002 정확한 사용자 입력

- 표시 언어와 국적을 별도 필드로 관리한다.
- 국기 또는 언어 선택만으로 국적을 확정하지 않는다.
- 민감한 식별번호 없이 판정에 필요한 최소 정보만 입력받는다.

## S2-GOAL-003 설명 가능한 진단

- Rule별 PASS·FAIL·EXTERNAL_CHECK·UNKNOWN을 제공한다.
- 실제값, 기준값, Source URL, 근거 위치를 함께 제공한다.
- 모든 결과에 최종 가입승인이 아니라는 면책문구를 표시한다.

## S2-GOAL-004 검증 가능한 AI

- RAG는 승인된 공식 Source만 검색한다.
- Product Metadata Filtering으로 다른 상품 문서를 섞지 않는다.
- LLM은 Eligibility 결과를 변경할 수 없다.
- 숫자·금액·기간·비자코드는 구조화 데이터에서 UI에 주입한다.

## S2-GOAL-005 제출 안정성

- 새 브라우저에서도 사전 준비 없이 Demo를 실행할 수 있다.
- Backend 또는 AI 장애를 사용자에게 구조화해 안내한다.
- 심사 기간 동안 HTTPS 웹서비스 URL을 안정적으로 유지한다.

---

# 4. 현재 구현 기준선

## 4.1 구현 완료 기준선

- Next.js 기반 Landing·Profile Wizard·상품 목록·상품 상세
- Spring Boot Profile·Product·Pre-check·Recommendation·Admin API
- FastAPI RAG·설명·문의문·Guardrail
- MySQL + Flyway 데이터 구조
- Docker Compose 통합환경
- 관리자 상품·Source·Rule 검수
- 한국어·영어·베트남어 UI
- Rule Engine 및 사전자격 결과 Dashboard

## 4.2 현재 공식 데이터 상태

| 상품 | 현재 상태 | 비고 |
| --- | --- | --- |
| 하나은행 하나더이지 적금 | READY | 공식 상품페이지·특약 Rule 적용 |
| KB증권 외국인 해외주식 거래 | READY | 거주자·국적 Rule 적용 |
| 하나은행 하나 외국인 EZ Loan | NOT_READY | 상세 공식 가입조건 Source 부족 |
| 신한은행 SOL글로벌 전세대출 | NOT_READY | 직접 상품설명서 부족 |

## 4.3 Season 2 잔여 핵심 과제

- READY 상품 최소 3개 추가
- 언어와 국적 완전 분리
- 제출용 Demo 데이터와 시나리오 고정
- 외부 배포와 운영 점검
- 기획서·기능명세서·실제 UI 용어 통일

---

# 5. 핵심 설계 원칙

## 원칙 1. Official Source가 사실의 기준이다

블로그·커뮤니티·광고성 제3자 페이지는 Eligibility Rule의 근거로 사용하지 않는다.

## 원칙 2. Human Verification이 Rule을 확정한다

AI가 추출한 후보는 관리자 검수 전 Runtime 판정에 사용하지 않는다.

## 원칙 3. Rule Engine만 사전자격을 판정한다

LLM·RAG·번역 결과는 Rule Engine의 결과를 변경할 수 없다.

## 원칙 4. 모르는 것은 모른다고 표현한다

- 공식 조건 자체가 부족함: `SOURCE_INSUFFICIENT`
- 조건은 존재하나 세부 기준이 비공개: `UNKNOWN`
- 은행·보증기관 심사가 필요함: `EXTERNAL_CHECK`

세 상태를 서로 대체하지 않는다.

## 원칙 5. 언어는 국적이 아니다

- 한국어 사용자라고 대한민국 국적으로 처리하지 않는다.
- 영어 사용자라고 미국 국적으로 처리하지 않는다.
- 국기는 언어 선택의 시각 요소일 뿐 금융 판정 데이터가 아니다.

## 원칙 6. 금융상품마다 필요한 입력은 다르다

모든 상품에 Visa Rule을 강제하지 않는다. 유효한 상품 Rule에서 `requiredFields`를 계산한다.

## 원칙 7. 최종 승인처럼 표현하지 않는다

금지 표현:

```text
가입 가능합니다.
승인 확률은 92%입니다.
대출을 받을 수 있습니다.
```

권장 표현:

```text
입력하신 정보 기준으로 공개된 조건을 충족했습니다.
실제 가입 여부는 금융기관의 최종 심사에 따라 달라질 수 있습니다.
```

---

# 6. MVP 범위와 완료 Gate

## 6.1 P0 제출 필수

- READY 금융상품 5개 이상
- 공식 Source·Snapshot·Evidence·검수일 연결
- 한국어·영어·베트남어 사용자 흐름
- 언어와 국적 분리
- Profile → 추천 → Pre-check → 근거 → 서류 → 절차 → 문의문
- SOURCE_INSUFFICIENT Demo 상품 1개 이상
- EXTERNAL_CHECK 또는 UNKNOWN Demo 상품 1개 이상
- 관리자 인증과 일반 사용자 접근 분리
- HTTPS 배포 URL
- E2E·Rule·RAG·다국어 숫자 무결성 테스트

## 6.2 P1 선택

- 중국어 UI 전체 지원
- READY 상품 8개 이상
- 관리자 Source 상태관리 UI 개선
- 모바일 접근성 개선
- RAG 품질지표 Dashboard

## 6.3 제출 이후

- 일본어·태국어
- 상품 10~15개 확대
- AI Rule Candidate 자동 추출
- Source 변경 자동감지
- AI Chat 고도화

## 6.4 중요 Gate

다음 조건 중 하나라도 충족하지 못하면 언어 또는 상품 수 확대보다 해당 항목을 우선한다.

- 공식 Rule 5개 상품
- 언어·국적 분리
- 대표 Demo 4개 정상 동작
- 배포 URL 안정성
- 공식 Source 링크 정상 접근

---

# 7. 사용자·언어·국적 모델

## S2-FR-101 표시 언어 선택

### 지원 언어

```text
P0: ko, en, vi
P1: zh
향후: ja, th
```

### 동작

- Landing에서 언어 카드를 누르면 현재 페이지 언어만 즉시 변경한다.
- 언어 선택만으로 다음 페이지로 이동하지 않는다.
- CTA를 눌러 Profile Wizard로 이동한다.
- 선택값은 `language`로 저장한다.

## S2-FR-102 국적 입력

### 원칙

- Profile Wizard에서 `nationality`를 별도로 선택한다.
- 언어 선택값으로 국적을 자동 확정하지 않는다.
- 이전 UI 선택값을 기본 제안하는 경우에도 사용자 확인을 받아야 한다.

### 예시

```text
language = en
nationality = VN
```

위 조합은 정상적인 입력이다.

## S2-FR-103 금융 Profile

### 공통 Profile Field

```text
language
nationality
birthDate
visaType
visaExpiry
residencyStartDate
residentStatus
occupation
employmentType
monthlyIncome
employmentDurationMonths
financialPurpose
```

### 상품별 선택 Field

```text
hasExistingProductAccount
desiredMonthlyAmount
hasBankAccount
housingType
desiredAmount
preferredBank
```

## S2-FR-104 동적 입력 요청

상품 상세 진단 시 Backend가 제공한 `requiredFields`를 사용한다.

예시:

```json
{
  "productCode": "KBSEC-FOREIGN-STOCK",
  "requiredFields": ["nationality", "residentStatus"]
}
```

```json
{
  "productCode": "HANA-EASY-SAVINGS-2025",
  "requiredFields": [
    "nationality",
    "residentStatus",
    "hasExistingProductAccount",
    "desiredMonthlyAmount"
  ]
}
```

## S2-FR-105 개인정보 최소화

수집 금지:

- 주민등록번호
- 외국인등록번호 원문
- 여권번호
- 신분증 번호
- 계좌번호
- 카드번호

필요한 경우 문서 원문이 아니라 유형 또는 보유 여부만 입력받는다.

---

# 8. 공식 금융상품 데이터 구축

## S2-DATA-101 READY 상품 선정

Season 2 제출 기준은 상품 수보다 공식 조건의 완전성을 우선한다.

### 완료조건

- READY 5개 이상
- 기관 2곳 이상
- 상품 유형 2종 이상
- 각 상품에 HARD Rule 1개 이상
- 각 Rule에 승인 Source Evidence 연결

## S2-DATA-102 상품별 데이터 패키지

상품 하나를 READY로 전환하려면 다음을 모두 준비한다.

```text
상품 기본정보
공식 상품페이지
상품설명서 또는 약관
Source Snapshot
정보 기준일
공개 HARD Rule
EXTERNAL_CHECK
UNKNOWN
필요서류
신청절차
관리자 검수 기록
대표 Profile 검증 결과
```

## S2-DATA-103 READY 금지 조건

다음 경우 상품을 READY로 표시하지 않는다.

- 상품 존재만 확인됨
- 세부 가입조건을 제3자 자료에서만 확인함
- 공식 Source URL이 접근 불가함
- Rule Evidence 위치를 제시할 수 없음
- 필수 Rule 후보가 검수되지 않음
- Source 간 조건이 충돌함

## S2-DATA-104 우선 수집 요청

1. 하나 외국인 EZ Loan 직접 상품설명서·약관
2. SOL글로벌 전세대출 직접 상품설명서·약관
3. 신한 생계비계좌의 신분증 문구 성격을 확인할 공식 원문
4. 외국인 대상 예·적금 또는 계좌 상품 공식 자료 1개 이상

---
## ######여기부터 다시
# 9. Source·Snapshot·Evidence 관리

## S2-DATA-201 Source 등록

필수 필드:

```text
institution
sourceType
title
sourceUrl
retrievedAt
informationBaseDate
validFrom
validTo
language
contentHash
snapshotText 또는 snapshotPath
reviewStatus
reviewedBy
lastVerifiedAt
```

## S2-DATA-202 Source 상태

```text
ACTIVE
SUPERSEDED
EXPIRED
UNKNOWN
NEED_REVIEW
```

Runtime 검색과 Rule 평가에는 승인되고 현재 유효한 Source만 사용한다.

## S2-DATA-203 Rule Evidence

필수 연결정보:

```text
ruleId
sourceDocumentId
sourceExcerpt
sourceLocator
pageNumber
sectionName
verifiedAt
reviewedBy
```

PDF는 가능하면 `pageNumber`, HTML은 `sectionName` 또는 화면 위치를 기록한다.

## S2-DATA-204 Source Conflict

동일 상품·동일 Rule Key에서 공식 Source 값이 충돌하면 자동 선택하지 않는다.

```text
Rule Status = NEED_REVIEW
Runtime = INSUFFICIENT_INFORMATION
Reason = SOURCE_CONFLICT
```

---

# 10. Rule 모델과 동적 Profile Field

## S2-RULE-101 Rule Level

```text
HARD
EXTERNAL_CHECK
UNKNOWN
```

## S2-RULE-102 Rule Nature

```text
HARD_ELIGIBILITY
UNKNOWN_ELIGIBILITY
EXTERNAL_CHECK
REQUIRED_DOCUMENT
IDENTIFICATION_METHOD
CHANNEL_REQUIREMENT
BENEFIT_CONDITION
INFORMATION
```

`REQUIRED_DOCUMENT`, `IDENTIFICATION_METHOD`, `CHANNEL_REQUIREMENT`, `BENEFIT_CONDITION`, `INFORMATION`은 HARD 가입 판정에 사용하지 않는다.

## S2-RULE-103 지원 Operator

```text
EQ
NE
IN
NOT_IN
GT
GTE
LT
LTE
EXISTS
```

범위는 동일 Rule Key에 `GTE`와 `LTE`를 각각 등록한다.

## S2-RULE-104 requiredFields 계산

```text
Product 조회
→ 현재 유효한 승인 Rule 조회
→ 평가 가능한 Rule Key 수집
→ Rule Key를 Profile Field로 매핑
→ 중복 제거
→ requiredFields 반환
```

`IS_FOREIGNER`는 `nationality`로부터 계산하므로 별도 국적 여부 Boolean을 수집하지 않는다.

## S2-RULE-105 Rule 활성화 조건

Rule은 다음 조건을 모두 만족해야 Runtime에서 사용한다.

- Rule Review Status가 APPROVED
- Rule 유효기간 내
- Source Review Status가 APPROVED
- Source 유효기간 내
- Rule Nature가 Eligibility 평가 대상
- 상품이 활성 상태

---

# 11. Eligibility Pre-check Engine

## S2-FR-301 입력

```json
{
  "profileSessionId": "uuid",
  "productId": 10
}
```

## S2-FR-302 결과 상태

기존 API 상태명을 유지한다.

```text
PUBLIC_CONDITIONS_MET
NEED_BANK_CONFIRMATION
PUBLIC_CONDITIONS_NOT_MET
INSUFFICIENT_INFORMATION
```

구조화 사유로 다음을 구분한다.

```text
SOURCE_INSUFFICIENT
SOURCE_CONFLICT
RULE_REVIEW_INCOMPLETE
MISSING_REQUIRED_PROFILE_FIELD
UNSUPPORTED_RULE_KEY
INVALID_RULE_VALUE
EXPIRED_RULE
```

## S2-FR-303 상태 우선순위

1. HARD FAIL 존재 → `PUBLIC_CONDITIONS_NOT_MET`
2. Source 부족·충돌·필수입력 누락·미검수 Rule → `INSUFFICIENT_INFORMATION`
3. EXTERNAL_CHECK 또는 필수 UNKNOWN → `NEED_BANK_CONFIRMATION`
4. 적용 가능한 모든 HARD Rule PASS → `PUBLIC_CONDITIONS_MET`

## S2-FR-304 Rule Detail

```json
{
  "key": "NATIONALITY",
  "messageCode": "RULE_PASSED",
  "message": "국적 공개조건을 충족했습니다.",
  "actualValue": "VN",
  "expectedValue": "[\"US\",\"CA\"]",
  "mandatory": true,
  "sourceExcerpt": "미국/캐나다 국적 불가능",
  "sourceLocator": "STEP 01 계좌개설",
  "sourceUrl": "https://official.example"
}
```

## S2-FR-305 공통 면책문구

> 본 결과는 입력된 정보와 공개된 공식 금융정보를 기반으로 한 사전자격 안내이며 실제 가입 여부와 한도·금리는 금융기관의 최종 심사 결과에 따라 달라질 수 있습니다.

결과 상단과 하단에 항상 표시한다.

---

# 12. 추천·정렬·결과 설명

## S2-FR-401 추천 분류

- 추천 후보: `PUBLIC_CONDITIONS_MET`, `NEED_BANK_CONFIRMATION`
- 별도 섹션: `INSUFFICIENT_INFORMATION`
- 추천 제외: `PUBLIC_CONDITIONS_NOT_MET`

## S2-FR-402 정렬

1. 명시적 FAIL 없음
2. HARD Rule 충족 수가 많음
3. UNKNOWN 수가 적음
4. 금융 목적 일치
5. 선호 은행·금액 조건 일치

가입 확률은 사용하지 않는다.

## S2-FR-403 설명 가능한 요약

```text
확인된 공개조건 5/5
추가 확인 1개
공식 근거 2건
정보 기준일 2026.08.20
```

---

# 13. RAG 및 AI 기능

## S2-AI-101 공식 Source Retrieval

검색 입력:

```text
productId
ruleKey
query
topK
```

Product Metadata Filtering으로 다른 상품 문서를 반환하지 않는다.

## S2-AI-102 AI 설명

LLM 입력은 다음 데이터로 제한한다.

- Eligibility 상태
- Rule Detail
- 구조화된 실제값·기준값
- 검색된 공식 Source Context
- 사용자 선택 언어

## S2-AI-103 은행 문의문

UNKNOWN 또는 EXTERNAL_CHECK가 있을 때만 생성한다.

출력:

- 한국어 문의문
- 사용자 선택 언어 번역
- 공식적으로 확인할 항목
- 복사 버튼

## S2-AI-104 근거 없는 답변

> 현재 등록된 공식 자료만으로는 해당 조건을 정확히 확인할 수 없습니다. 금융기관에 추가 확인이 필요합니다.

## S2-AI-105 AI 필연성 증명

대회 제출 화면과 기획서에서 AI의 역할을 다음과 같이 구분한다.

```text
Rule Engine = 결정론적 판정
RAG = 공식 근거 검색
LLM = 쉬운 설명·번역·문의문
```

단순 번역 기능만으로 AI 가치를 설명하지 않는다.

---

# 14. Frontend 사용자 경험

## S2-FE-101 Landing

- 상단의 기능 없는 언어 Navigation을 두지 않는다.
- 언어 카드는 현재 페이지 번역 기능을 수행한다.
- CTA가 Profile Wizard 이동을 담당한다.
- 첫 화면에서 대상 사용자와 해결 문제를 즉시 보여준다.

핵심 Copy:

```text
한국 금융,
번역보다 중요한 것은
'내 조건으로 어디까지 가능한가'입니다.

검수된 공식 금융정보 기반 외국인 금융자격 사전진단
```

## S2-FE-102 Profile Wizard

```text
STEP 1 언어·국적
STEP 2 기본·체류정보
STEP 3 직업·소득
STEP 4 금융목적·상품별 추가정보
STEP 5 상품 비교
```

요구사항:

- 날짜는 직접 입력 가능한 Date Input 사용
- 금액은 세 자리 쉼표 표시
- 금액을 선택 언어로 읽어주는 보조문구 제공
- 입력 이유 Tooltip 제공
- 국적과 언어를 별도 항목으로 표시

## S2-FE-103 상품 Card

표시:

- 진단 상태
- 공개조건 충족 수
- 추가 확인 수
- 공식 근거 수
- 정보 기준일
- 최종 승인 아님 문구

## S2-FE-104 상품 상세 Tab

```text
[사전진단]
[판단 근거]
[필요서류]
[신청 절차]
[공식 정보]
```

## S2-FE-105 SOURCE_INSUFFICIENT 화면

```text
상품의 존재는 공식 자료에서 확인했습니다.
하지만 자동 진단에 필요한 세부 가입조건 자료가 충분하지 않습니다.
현재 상태에서 비자·소득·체류기간 조건을 임의로 판단하지 않습니다.
```

## S2-FE-106 관리자 노출 분리

- 일반 Navigation에서 관리자 수정 기능을 노출하지 않는다.
- `/admin/**`는 인증 후 접근한다.
- Demo 심사자는 관리자 기능 없이 사용자 Flow를 완료할 수 있어야 한다.

---

# 15. 관리자 기능

## S2-ADM-101 상품 관리

- 등록
- 수정
- 비활성화
- READY/PARTIAL/NOT_READY 사유 확인
- 상품별 `requiredFields` 확인

## S2-ADM-102 Source 관리

- 공식 URL과 Snapshot 등록
- 기준일·유효기간·검증일 관리
- ACTIVE·SUPERSEDED·EXPIRED·UNKNOWN·NEED_REVIEW 관리
- 검수자 기록

## S2-ADM-103 Rule Candidate 검수

- 승인
- 값 수정 후 승인
- UNKNOWN 변경
- 거절
- Rule Nature 지정
- 근거 Page·Section 기록

## S2-ADM-104 판정 오용 방지

다음 Rule Nature는 Eligibility 활성화를 차단한다.

- REQUIRED_DOCUMENT
- IDENTIFICATION_METHOD
- CHANNEL_REQUIREMENT
- BENEFIT_CONDITION
- INFORMATION

---

# 16. API 변경 명세

## 16.1 Profile

```http
POST /api/profiles
GET  /api/profiles/{id}
PUT  /api/profiles/{id}
```

Season 2 필수 변경:

- `language`와 `nationality` 독립 저장
- `residentStatus` 지원
- `hasExistingProductAccount` 지원
- `desiredMonthlyAmount` 지원

## 16.2 Products

```http
GET /api/products
GET /api/products/{id}
```

추가 응답:

```json
{
  "diagnosisStatus": "READY",
  "diagnosisReasonCode": "APPROVED_HARD_RULES_AVAILABLE",
  "requiredFields": ["nationality", "residentStatus"]
}
```

## 16.3 Pre-check

```http
POST /api/eligibility/pre-check
```

응답:

- `status`
- `passedRules`
- `failedRules`
- `externalChecks`
- `unknownRules`
- `insufficientReasons`
- `requiredFields`
- `disclaimer`

## 16.4 RAG

```http
POST /api/rag/answer
POST /api/admin/rag/reindex
```

## 16.5 Admin

```http
POST /api/admin/products
POST /api/admin/sources
POST /api/admin/rule-candidates
PUT  /api/admin/rules/{id}/approve
PUT  /api/admin/rules/{id}/reject
PUT  /api/admin/rules/{id}/review
```

---

# 17. DB 변경 명세

## 17.1 TEMP_PROFILE

Season 2 필드:

```text
language
nationality
resident_status
has_existing_product_account
desired_monthly_amount
```

## 17.2 PRODUCT_RULE

Season 2 필드:

```text
rule_nature
page_number
section_name
```

## 17.3 SOURCE_DOCUMENT

Season 2 필드:

```text
reviewed_by
last_verified_at
snapshot_text
snapshot_path
content_hash
```

## 17.4 PRECHECK_RESULT

추가 보관:

```text
required_fields
expires_at 또는 Profile 만료 연계
```

진단 Snapshot은 임시 Profile 만료 범위 안에서만 유지한다.

---

# 18. 개인정보·보안·AI 안전장치

## S2-SAFE-001 판정권한 분리

```text
Official Source = 사실
Human Verification = Rule 확정
Rule Engine = 사전자격 진단
RAG = 근거
LLM = 설명과 번역
```

## S2-SAFE-002 Prompt Injection

사용자 메시지와 Source 문서 내용이 다음을 변경할 수 없다.

- System Guardrail
- Source 신뢰정책
- Eligibility 결과
- Product Metadata Filter

## S2-SAFE-003 Source Allowlist

Runtime RAG는 관리자 승인 Source와 허용된 공식 도메인만 사용한다.

우선 공식 도메인:

```text
kebhana.com
hanabank.com
shinhan.com
kbsec.com
```

## S2-SAFE-004 관리자 보안

- 기본 관리자 비밀번호를 배포환경에서 사용하지 않는다.
- 관리자 인증정보를 Repository에 저장하지 않는다.
- 관리자 API는 인증 없이 접근할 수 없다.
- CORS를 실제 배포 도메인으로 제한한다.

## S2-SAFE-005 로그

- 민감한 Profile 원문을 운영 로그에 기록하지 않는다.
- 세션 UUID 전체 노출을 최소화한다.
- AI Prompt에 불필요한 Profile Field를 전달하지 않는다.

---

# 19. 테스트 및 품질지표

## S2-TEST-101 Rule Engine

- 모든 Operator PASS/FAIL
- 나이·개월 수 경계
- HARD FAIL 우선순위
- UNKNOWN·EXTERNAL_CHECK
- Source Conflict·Missing·Expired
- 비자 Rule 없는 상품 진단

## S2-TEST-102 언어·국적 분리

필수 Case:

```text
language=en, nationality=VN → VN으로 판정
language=ko, nationality=US → US로 판정
language=vi, nationality=CA → CA로 판정
```

UI 언어가 바뀌어도 `nationality` 값이 변경되지 않아야 한다.

## S2-TEST-103 Multilingual Integrity

한국어·영어·베트남어에서 다음 값이 동일해야 한다.

- 상태
- 비자코드
- 국적코드
- 개월 수
- 금액
- Rule 기준값
- Source 이름과 URL

## S2-TEST-104 RAG

- 기대 문서 Top-K 포함
- 다른 상품 문서 0건
- 승인되지 않은 Source 0건
- Source 없는 조건 생성 0건
- Prompt Injection 차단

## S2-TEST-105 E2E

```text
접속
→ 언어 선택
→ CTA
→ 국적 별도 선택
→ Profile 입력
→ 상품 비교
→ Pre-check
→ 판단 근거
→ 필요서류
→ 신청절차
→ 은행 문의문
```

## S2-TEST-106 제출 품질지표

목표:

| 지표 | 목표 |
| --- | --- |
| 승인 Runtime Rule의 Source 연결률 | 100% |
| RAG 타 상품 문서 혼입 | 0건 |
| Source 없는 조건 생성 | 0건 |
| 다국어 핵심 숫자 일치율 | 100% |
| READY 상품 | 5개 이상 |
| 고정 Demo 성공률 | 100% |
| Backend·AI Health | 정상 |

---

# 20. 배포·운영 요구사항

## S2-OPS-001 외부 URL

- HTTPS 사용
- 로그인 없이 사용자 Demo 가능
- 새 브라우저에서 초기 데이터 제공
- 심사 기간 상시 접근 가능
- PC·모바일 기본 화면 정상 표시

## S2-OPS-002 환경변수

운영 Secret은 배포환경에서 관리하고 Git에 포함하지 않는다.

```text
DB_URL
DB_USERNAME
DB_PASSWORD
AI_SERVICE_URL
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_JWT_SECRET
RAG_INTERNAL_TOKEN
LLM_API_KEY
```

## S2-OPS-003 장애 처리

- Backend 장애: 서비스 점검 안내
- AI 장애: Rule Engine 결과는 유지하고 AI 설명만 제한
- Source 링크 장애: Snapshot 근거와 수집일 표시
- RAG 결과 없음: 금융기관 확인 안내

## S2-OPS-004 제출 전 운영 점검

- 배포 URL 외부망 접속
- HTTPS 인증서
- Health Check
- DB Backup
- Seed Data 복구
- 관리자 비밀번호 변경
- 브라우저 Cache 없이 E2E
- 제출 기간 Monitoring

---

# 21. 대회 제출용 Demo Scenario

## Demo A — 공개조건 충족

```text
언어: 베트남어
국적: VN
거주자 구분: RESIDENT
동일 하나더이지 적금 계좌: 없음
희망 월 납입액: 200,000원
```

기대:

```text
하나더이지 적금
→ PUBLIC_CONDITIONS_MET
→ 공개조건 5/5
→ 공식 특약 Page·Section 표시
→ 최종 승인 아님 표시
```

## Demo B — 명시적 미충족

```text
언어: 영어
국적: US
거주자 구분: RESIDENT
```

기대:

```text
KB증권 외국인 해외주식 거래
→ PUBLIC_CONDITIONS_NOT_MET
→ 미국·캐나다 국적 제외 Rule FAIL
→ KB증권 공식 Source 표시
```

## Demo C — 은행 확인 필요

EXTERNAL_CHECK 또는 필수 UNKNOWN을 가진 검수 상품을 사용한다.

기대:

```text
→ NEED_BANK_CONFIRMATION
→ 확인 대상 우선 노출
→ 한국어 + 사용자 언어 문의문
→ 가입 가능/불가 단정 금지
```

## Demo D — 공식 자료 부족

```text
상품: 하나 외국인 EZ Loan
```

기대:

```text
상품 존재 확인
→ INSUFFICIENT_INFORMATION
→ SOURCE_INSUFFICIENT
→ 비자·소득·체류기간 Rule을 임의 생성하지 않음
```

## Demo 시간 목표

- 첫 화면에서 문제 이해: 20초 이내
- Profile 입력: 90초 이내
- 결과와 근거 확인: 60초 이내
- 전체 핵심 Demo: 3분 이내

---

# 22. 제출 산출물 일치 기준

기획서·기능명세서·배포 URL은 다음 내용을 동일하게 표현해야 한다.

| 항목 | 기획서 | 기능명세서 | 웹서비스 |
| --- | --- | --- | --- |
| 대상 사용자 | 국내 체류 외국인 | 동일 | Landing에 표시 |
| 핵심 문제 | 번역만으로 조건 판단 불가 | 동일 | 핵심 Copy에 표시 |
| AI 역할 | 근거·설명·번역 | 동일 | 근거/문의문 기능으로 증명 |
| 판정 주체 | Rule Engine | 동일 | 결과 화면에서 구분 |
| 공식 Source | 사실 기준 | 동일 | Rule별 링크 표시 |
| 한계 | 최종 승인 아님 | 동일 | 상·하단 표시 |
| 자료 부족 | 모른다고 응답 | 동일 | SOURCE_INSUFFICIENT Demo |

기능명세서에만 있고 웹서비스에서 확인할 수 없는 P0 기능을 남기지 않는다.

---

# 23. 개발 우선순위

## Phase S2-0 — 판정 정확성 수정

1. 언어와 국적 분리
2. 기존 Profile 마이그레이션·호환 처리
3. 언어 변경 시 국적 불변 테스트
4. Landing·Wizard E2E 수정

## Phase S2-1 — 공식 데이터 Gate

1. READY 후보 상품 3개 선정
2. 공식 문서 수집
3. Snapshot·Evidence 등록
4. Human Verification
5. 대표 Profile 검증

## Phase S2-2 — Demo 고정

1. 네 가지 상태 Demo 준비
2. Source 링크·기준일 확인
3. Demo Seed Data 고정
4. 3분 사용자 흐름 점검

## Phase S2-3 — 제출 품질

1. 다국어 전체 흐름 검수
2. AI/RAG 평가 결과 정리
3. 모바일·접근성·오류 화면
4. 관리자 보안

## Phase S2-4 — 배포

1. HTTPS 외부 배포
2. Health·Monitoring
3. Backup·복구 점검
4. 외부망 E2E

## Phase S2-5 — 선택 확장

시간이 남는 경우에만 수행한다.

1. 중국어 전체 흐름
2. READY 상품 6~8개
3. 관리자 UX 개선

일본어·태국어는 제출 이후 확장 항목으로 둔다.

---

# 24. 제출 전 최종 체크리스트

## 24.1 데이터

- [ ] READY 상품이 최소 5개다.
- [ ] 모든 Runtime Rule에 공식 Source가 연결돼 있다.
- [ ] 모든 Source에 수집일·기준일·검증일이 있다.
- [ ] PDF Page 또는 HTML Section 근거가 기록돼 있다.
- [ ] Source가 부족한 상품에 임의 Rule이 없다.
- [ ] EXTERNAL_CHECK와 SOURCE_INSUFFICIENT가 구분된다.
- [ ] 기존 Demo·가상 상품이 일반 사용자 목록에 노출되지 않는다.

## 24.2 사용자 Profile

- [ ] 언어와 국적이 별도 필드다.
- [ ] 언어 변경이 국적을 변경하지 않는다.
- [ ] 영어 사용자를 미국 국적으로 자동 확정하지 않는다.
- [ ] 한국어 사용자를 대한민국 국적으로 자동 확정하지 않는다.
- [ ] 민감한 식별번호를 수집하지 않는다.
- [ ] 상품별 `requiredFields`가 정확하다.

## 24.3 Backend

- [ ] 승인되고 유효한 Rule만 평가한다.
- [ ] Visa Rule 없는 상품도 정상 평가한다.
- [ ] HARD FAIL이 최우선이다.
- [ ] Source Conflict를 자동 해결하지 않는다.
- [ ] SOURCE_INSUFFICIENT 사유가 응답에 포함된다.
- [ ] Rule Detail에 실제값·기준값·Source가 있다.

## 24.4 Frontend

- [ ] Landing에서 사용자와 문제가 즉시 이해된다.
- [ ] 언어 카드는 현재 화면을 번역한다.
- [ ] CTA가 Profile 이동을 담당한다.
- [ ] 네 가지 결과 상태가 색상뿐 아니라 텍스트로 구분된다.
- [ ] Source와 정보 기준일이 표시된다.
- [ ] 최종 승인 아님 문구가 상·하단에 있다.
- [ ] 관리자 기능이 일반 사용자에게 노출되지 않는다.

## 24.5 AI·RAG

- [ ] RAG가 Eligibility 결과를 변경하지 않는다.
- [ ] 다른 상품 Source를 섞지 않는다.
- [ ] 승인 Source만 검색한다.
- [ ] 근거가 없으면 모른다고 답한다.
- [ ] 핵심 숫자는 구조화 데이터에서 사용한다.
- [ ] Prompt Injection 테스트를 통과한다.
- [ ] 문의문은 Unknown·External Check만 사용한다.

## 24.6 Test

- [ ] Backend 전체 테스트 통과
- [ ] AI 전체 테스트 통과
- [ ] Frontend Production Build 통과
- [ ] Docker Compose Health 통과
- [ ] 사용자 E2E 통과
- [ ] 언어·국적 분리 E2E 통과
- [ ] 다국어 숫자 무결성 통과
- [ ] RAG Product Filter 통과
- [ ] 고정 Demo 4개 통과

## 24.7 배포

- [ ] HTTPS URL이 외부망에서 열린다.
- [ ] 새 브라우저에서 Demo가 동작한다.
- [ ] 관리자 기본 비밀번호를 변경했다.
- [ ] Secret이 Git에 없다.
- [ ] 장애 안내 화면이 있다.
- [ ] DB Backup과 Seed 복구가 가능하다.
- [ ] 제출 심사 기간 Monitoring 담당자가 정해져 있다.

## 24.8 산출물

- [ ] 기획서와 실제 서비스의 문제 정의가 같다.
- [ ] 기능명세서 P0 기능이 웹에서 모두 확인된다.
- [ ] 실제 화면 캡처가 최신 상태다.
- [ ] Demo Profile과 예상 결과가 문서와 일치한다.
- [ ] 한계와 후속계획을 과장 없이 기록했다.
- [ ] 모든 외부 자료의 출처를 표시했다.

---

# 25. 향후 확장 방향

## Phase 2 — 다국어·상품 확대

- 중국어 정식 지원
- 일본어·태국어 지원
- 금융상품 10~15개 확대
- 더 많은 국적·체류자격 조합 검증

언어 추가는 단순 Landing 번역이 아니라 Profile·결과·오류·면책·문의문·숫자 무결성 테스트를 모두 포함한다.

## Phase 3 — 데이터 자동화

- 공식 Source 변경감지
- HTML/PDF 자동 Snapshot
- OCR·Text Extraction
- AI Rule Candidate 추출
- 변경 전후 Diff와 관리자 재검수

자동 추출 결과는 계속 Human Verification을 거친다.

## Phase 4 — 금융기관 상담 연결

- 공식 상담 채널 연결
- 문의문 전달
- 상담 예약
- 확인 결과를 Rule Candidate로 재등록하는 운영 Flow

금융기관의 승인 결과를 ViSafy가 대신 결정하지 않는다.

## Phase 5 — 사용자 입력 자동화

- 사용자 동의 기반 MyData/Open Banking 연계 검토
- 재직·소득증빙 제출 편의 개선
- 민감정보 마스킹·암호화·파기정책 선행

## Phase 6 — 외국인 금융 Operating Agent

- 계좌
- 예·적금
- 대출
- 송금
- 투자
- 신용관리
- 금융사기 예방

모든 영역에서 공식 Source·검수 Rule·결정론적 판정 원칙을 유지한다.

---

# 26. 최종 완료조건

Season 2 MVP는 다음 질문에 모두 `예`라고 답할 수 있을 때 완료한다.

1. 심사위원이 첫 화면에서 대상 사용자와 금융 문제를 이해할 수 있는가?
2. 언어 선택 때문에 국적이 잘못 저장되지 않는가?
3. 최소 5개 실제 상품을 공식 Rule로 비교할 수 있는가?
4. 각 판정이 공식 원문의 어느 부분에서 나왔는지 확인할 수 있는가?
5. Source가 없을 때 시스템이 임의 조건을 만들지 않는가?
6. 은행 내부심사와 자료 부족을 명확히 구분하는가?
7. AI가 판정을 변경하지 않고 근거와 설명만 제공하는가?
8. 한국어·영어·베트남어의 숫자와 상태가 동일한가?
9. 3분 안에 네 가지 핵심 Demo 중 하나를 완료할 수 있는가?
10. 제출된 URL이 심사 기간 동안 안정적으로 동작하는가?

최종 시스템 철학:

> **Official Source = 사실**
> **Human Verification = Rule 확정**
> **Rule Engine = 사전자격 진단**
> **RAG = 공식 근거**
> **LLM = 쉬운 설명·번역·문의문**

ViSafy Season 2는 많은 상품과 언어를 형식적으로 제공하는 서비스보다, **근거가 있는 조건만 실행하고 근거가 없을 때 정확하게 모른다고 답하는 실제 작동 가능한 금융 AI 서비스**를 목표로 한다.
