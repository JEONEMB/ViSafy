# SSAFIN 기능명세서 Season 3

## 핵심 전환

**Season 2**

> 내 비자와 체류기간으로 가입 가능한 외국인 금융상품은 무엇인가?

**Season 3**

> **나는 한국에서 어떤 금융서비스를 이용할 수 있고, 이용하려면 무엇을 준비해야 하는가?**

SSAFIN은 더 이상 외국인 전용 금융상품만 찾아주는 서비스가 아니다.

**일반 금융상품 + 외국인 특화 금융상품**을 함께 탐색하고 다음을 판단한다.

- 공개된 가입조건
- 신분확인 방법
- 거주자 여부
- 비자·체류기간
- 국적 제한
- 직업·재직·소득
- 비대면/영업점 이용 가능 여부
- 필요서류
- 은행 추가확인사항
- 사용자가 취해야 할 다음 행동

### Season 3 한 줄 정의

> **SSAFIN은 한국에 거주하는 외국인이 일반 금융상품과 외국인 특화 금융상품을 포함해 어떤 금융서비스를 이용할 수 있는지, 어떤 신분확인·체류·소득·채널 조건이 필요한지 공식 자료를 근거로 설명하는 AI 금융 정착 Agent다.**

---

## 1. Season 2 구현 자산 유지

Season 3에서는 다음 Season 2 기능을 다시 개발하지 않는다.

- `HARD`
- `EXTERNAL_CHECK`
- `UNKNOWN`
- Rule Nature
- Rule Operator
- Source / Snapshot / Evidence
- Human Verification
- `requiredFields` 동적 계산
- Eligibility Pre-check Engine
- 관리자 Rule 검수
- RAG와 Rule Engine 판정 분리
- 언어와 국적 분리

기존 구조는 유지하고 다음만 확장한다.

**Profile Field → Rule Key → Access Model → 일반상품 Dataset → Financial Journey**

---

## 2. 새로운 핵심 Profile

기존:

`국적 / 비자 / 체류기간 / 거주자 / 직업 / 재직기간 / 월소득`

Season 3 추가:

```text
hasResidenceCard
hasPassport
hasDomesticPhone
canDomesticPhoneVerify
hasKoreanBankAccount
hasKoreanCreditHistory
```

중요한 것은 **이 정보를 전부 처음부터 요구하지 않는 것**이다.

기존 `requiredFields` 기능을 이용해 상품별로 필요한 정보만 동적으로 요청한다.

예를 들어 일반 적금에 Visa Rule이 없다면:

```text
visaType
visaExpiry
```

를 묻지 않는다.

반대로 외국인 대출에 비자·재직·소득 조건이 있다면:

```text
visaType
visaExpiry
employmentDurationMonths
monthlyIncome
```

가 자동으로 추가된다.

---

## 3. 일반상품과 외국인 특화상품 통합

Product에 다음 속성을 추가한다.

```text
productAudience

GENERAL
FOREIGNER_SPECIALIZED
POLICY
```

그리고 상품 Category:

```text
DEMAND_DEPOSIT
SAVINGS
TIME_DEPOSIT
DEBIT_CARD
CREDIT_CARD
PERSONAL_LOAN
HOUSING_LOAN
REMITTANCE
SECURITIES
POLICY_FINANCE
```

핵심 원칙:

```text
FOREIGNER_SPECIALIZED
≠
외국인이 이용 가능한 모든 상품
```

외국인 특화상품은 하나의 카테고리일 뿐이다.

---

## 4. Season 3 신규 Rule Key

기존 Rule Engine을 그대로 사용하면서 다음 Key를 추가한다.

```text
HAS_RESIDENCE_CARD
HAS_PASSPORT

HAS_DOMESTIC_PHONE
CAN_DOMESTIC_PHONE_VERIFY

HAS_KOREAN_BANK_ACCOUNT
HAS_KOREAN_CREDIT_HISTORY

RESIDENT_STATUS
NATIONALITY

VISA_TYPE
VISA_REMAINING_MONTHS

OCCUPATION
EMPLOYMENT_TYPE
EMPLOYMENT_DURATION_MONTHS
MONTHLY_INCOME

PREFERRED_CHANNEL
REMITTANCE_COUNTRY
```

### 중요한 변경

`HARD_ELIGIBILITY`만 실제 공개 가입조건 PASS/FAIL에 사용한다.

다음 항목은 별도로 처리한다.

```text
IDENTIFICATION_METHOD
CHANNEL_REQUIREMENT
REQUIRED_DOCUMENT
```

예를 들어:

> 외국인등록증으로 신분확인 가능

은 가입조건이 아니라

```text
IDENTIFICATION_METHOD
```

이다.

반면

> 외국인등록증 소지자에 한해 가입 가능

이라고 공식적으로 적혀 있다면

```text
HARD_ELIGIBILITY
```

후보가 된다.

---

## 5. Eligibility와 Access 분리

Season 3의 핵심 구조다.

기존 Eligibility Status:

```text
PUBLIC_CONDITIONS_MET
NEED_BANK_CONFIRMATION
PUBLIC_CONDITIONS_NOT_MET
INSUFFICIENT_INFORMATION
```

를 그대로 유지한다.

대신 새로운 `accessStatus`를 추가한다.

```text
ACCESS_READY
ACCESS_READY_BRANCH_ONLY
ACCESS_READY_ONLINE
ACCESS_ADDITIONAL_DOCUMENTS
ACCESS_NEED_CONFIRMATION
ACCESS_UNKNOWN
```

따라서 이런 결과가 가능해진다.

```text
공개된 가입조건
✅ 충족

신분확인
✅ 외국인등록증 사용 가능

영업점
✅ 이용 가능

모바일 앱
❓ 공식 자료 확인 필요
```

즉,

> **법적으로 또는 공개조건상 이용 가능**

과

> **앱에서 바로 가입 가능**

을 완전히 분리한다.

---

## 6. "실명의 개인" 처리 Guardrail

Season 3에서 매우 중요하다.

상품 설명서가:

```text
가입대상: 실명의 개인
```

이라고 되어 있다고 해서 시스템이 자동으로

```text
FOREIGNER_ALLOWED = TRUE
```

를 생성하면 안 된다.

관리자는 추가로 다음을 확인한다.

- 외국인 배제 규정 존재 여부
- 해당 금융기관 외국인 실명확인 정책
- 이용 가능한 신분증
- 영업점 이용 가능 여부
- 비대면 채널 가능 여부

확실하지 않으면:

```text
NEED_BANK_CONFIRMATION
```

또는

```text
ACCESS_UNKNOWN
```

으로 유지한다.

---

## 7. Financial Purpose 개편

사용자가 처음부터 금융상품 종류를 알아야 할 필요가 없다.

```text
OPEN_ACCOUNT
RECEIVE_SALARY
SAVE_MONEY
SEND_MONEY_HOME
GET_DEBIT_CARD
GET_CREDIT_CARD
GET_LOAN
RENT_HOUSING
INVEST
BUILD_CREDIT
```

Landing에서는 다음처럼 묻는다.

> **한국에서 지금 가장 필요한 금융서비스는 무엇인가요?**

- 급여를 받을 계좌가 필요해요
- 돈을 저축하고 싶어요
- 해외로 송금하고 싶어요
- 카드를 만들고 싶어요
- 대출이 필요해요
- 무엇부터 해야 할지 모르겠어요

---

## 8. Financial Journey

Season 3의 대표 기능이다.

```text
1. 신분확인 준비
↓
2. 입출금계좌
↓
3. 급여수령
↓
4. 체크카드
↓
5. 예·적금
↓
6. 해외송금
↓
7. 신용이력 형성
↓
8. 대출 / 주거금융
↓
9. 투자
```

사용자의 현재 Profile을 이용해 현재 단계를 판단한다.

예:

```text
hasKoreanBankAccount = false
financialPurpose = SAVE_MONEY
```

이라면:

> 적금을 알아보기 전에 자동이체 등에 사용할 국내 계좌가 필요한지 확인해보세요.

이렇게 **상품 추천 → 금융생활 안내**로 확장한다.

---

## 9. MVP 상품 데이터

Season 3 목표:

| 분야 | 최소 수 |
|---|---:|
| 입출금계좌 | 2 |
| 일반 예·적금 | 3 |
| 외국인 특화상품 | 2 |
| 해외송금 | 1 |
| 대출 | 1 |
| 전체 READY | **8개 이상** |

은행은 최소 3곳. (2026-08-29 실측: READY 8개, 금융기관 4곳으로 충족)

우선:

```text
KB국민은행
신한은행
하나은행
```

을 집중적으로 조사하고 이후:

```text
우리은행
NH농협은행
```

을 확장한다.

중요한 건 상품 수가 아니라 각 상품에 다음 패키지가 존재하는 것이다.

```text
상품 설명
+
공식 상품페이지
+
상품설명서/약관
+
외국인 실명확인 Source
+
Channel Source
+
필요서류
+
Rule
+
Evidence
+
정보 기준일
```

---

## 10. Frontend 핵심 변경

Landing Copy:

> **한국에서 처음 시작하는 금융생활,  
> 무엇부터 해야 할지 SSAFIN이 알려드립니다.**
>
> 계좌 · 적금 · 송금 · 대출까지  
> 내 조건으로 이용할 수 있는 금융서비스와  
> 필요한 준비를 공식 정보로 확인하세요.

CTA:

> **내 금융생활 시작하기**

기존 Wizard:

```text
언어
→ 국적
→ 비자
→ 체류
→ 직업
→ 소득
→ 상품
```

Season 3:

```text
STEP 1 언어
↓
STEP 2 국적 + 금융 목적
↓
STEP 3 현재 한국 금융 준비상태
↓
STEP 4 상품별 필요한 정보만 동적 입력
↓
STEP 5 이용 가능한 금융서비스
```

---

## 11. 상품 Card

예:

```text
KB ○○ 적금
[일반상품]

공개조건
✅ 입력정보 기준 명시적 제한 없음

신분확인
✅ 외국인 신분증 관련 공식 안내 확인

가입방법
🏦 영업점: 확인됨
📱 모바일: 확인 필요

준비사항
• 외국인등록증
• 추가 서류는 영업점 확인

[왜 이렇게 판단했나요?]
[공식 근거]
[은행에 물어보기]
```

---

## 12. AI 역할

```text
Official Source
        ↓
Human Verification
        ↓
Rule Engine
        ↓
Eligibility

Access Rule
        ↓
Identity / Channel / Document

RAG
        ↓
공식 근거 검색

LLM
        ↓
쉬운 설명
번역
다음 행동
은행 문의문
```

AI가 해서는 안 되는 것:

- 외국인이라는 이유만으로 가입 불가 추정
- `실명의 개인`만 보고 가입 가능 확정
- Visa Rule 없는 상품에 Visa 제한 생성
- Source 없는 비대면 가입 가능 여부 생성
- 대출 승인확률 생성
- 신용등급 추정
- 은행 내부심사 조건 추정

---

## 13. 대표 Demo

### Demo A — 일반 금융상품

```text
국적: VN
거주자: RESIDENT
외국인등록증: 있음
국내 휴대폰: 있음
목적: SAVE_MONEY
```

일반 적금:

```text
productAudience = GENERAL
Visa Rule 없음
```

기대:

```text
Visa 질문 없음
→ 공개조건 평가
→ 신분확인 방식
→ 영업점/모바일 Channel
→ 준비서류
```

핵심 메시지:

> **외국인이라고 외국인 전용상품만 이용하는 것은 아닙니다.**

### Demo B — 외국인 특화상품

일반 적금과 외국인 특화 적금을 같은 화면에서 비교한다.

### Demo C — 대면 가능 / 비대면 미확인

```text
PUBLIC_CONDITIONS_MET

BRANCH = AVAILABLE
MOBILE_APP = UNKNOWN
```

### Demo D — Visa가 실제 필요한 상품

외국인 대출:

```text
VISA_TYPE
VISA_REMAINING_MONTHS
EMPLOYMENT_DURATION_MONTHS
MONTHLY_INCOME
```

이 경우에만 `requiredFields`에 Visa가 등장한다.

이 Demo가 **Season 2에서 구현한 동적 Profile Field의 필요성을 가장 잘 보여준다.**

### Demo E — 공식 자료 부족

```text
ACCESS_UNKNOWN
```

AI가 임의로 비대면 가능 여부를 만들어내지 않는다.

---

## 14. 개발 순서

### Phase S3-0
Season 2 구현 Regression Test

### Phase S3-1
신규 Profile Field 추가

### Phase S3-2
`GENERAL / FOREIGNER_SPECIALIZED` Product 모델 추가

### Phase S3-3
Identification / Channel / Access Model 구현

### Phase S3-4
일반 금융상품 공식 데이터 수집

### Phase S3-5
Financial Purpose + Journey UI

### Phase S3-6
AI 금융 정착 Q&A

### Phase S3-7
Demo A~E 고정 및 제출

---

## 15. 하지 않을 것

MVP에서는 다음을 제외한다.

- 모든 은행 상품 크롤링
- 실시간 금리 비교
- 대출 승인확률 예측
- 신용점수 예측
- 실제 계좌개설
- 실제 대출신청
- MyData 본연동
- Open Banking 본연동
- 은행 내부심사 자동화
- 모든 Visa × 상품 조합 구축

Season 3 MVP의 핵심은 이것이다.

> **일반상품까지 포함한다.**  
> **외국인의 접근 조건을 구조화한다.**  
> **필요한 조건만 동적으로 묻는다.**  
> **공식 근거를 보여준다.**  
> **실제 다음 행동을 알려준다.**

---

## 16. 최종 완료조건

다음 질문에 모두 `예`라고 답하면 Season 3 MVP 완료다.

1. 외국인 전용상품이 아닌 일반상품을 추천할 수 있는가?
2. Visa 조건이 없는 상품에서는 Visa를 묻지 않는가?
3. Visa가 실제 조건일 때만 `requiredFields`에 등장하는가?
4. 국적 Rule이 없는 상품을 국적으로 제한하지 않는가?
5. 외국인등록증 등 신분확인 방법을 별도로 보여주는가?
6. 상품 가입 가능성과 비대면 가능성을 분리하는가?
7. 영업점과 모바일의 이용 가능 상태를 각각 보여주는가?
8. 공개되지 않은 정보는 은행 확인사항으로 남기는가?
9. 일반상품과 외국인 특화상품을 함께 검색할 수 있는가?
10. 사용자의 금융 목적에서 다음 행동까지 연결하는가?
11. LLM이 Rule Engine 판정을 바꾸지 않는가?
12. 핵심 판정마다 공식 Source가 연결되는가?
13. `실명의 개인` 문구만으로 외국인 가입 가능을 자동 확정하지 않는가?
14. 3분 Demo에서 Season 3의 변화를 설명할 수 있는가?
15. SSAFIN이 **외국인 상품 추천기보다 금융 정착 Agent로 보이는가?**

---

## 최종 시스템 철학

> **Official Source = 사실**

> **Human Verification = Rule 확정**

> **Rule Engine = 공개조건 사전자격 진단**

> **Access Model = 신분확인·채널·서류 접근성**

> **RAG = 공식 근거 검색**

> **LLM = 쉬운 설명·번역·문의문·다음 행동**

### Season 3의 핵심 문장

> **외국인에게 필요한 것은 외국인 전용 금융상품 목록이 아니라, 한국에서 자신이 실제로 이용할 수 있는 금융서비스와 그 이용 경로를 이해하는 것이다.**
