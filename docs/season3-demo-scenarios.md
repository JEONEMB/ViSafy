# ViSafy Season 3 고정 Demo 시나리오

이 문서는 대회 시연에서 동일한 입력과 기대 결과를 재현하기 위한 기준이다. 아래 상품명은 실제 승인 Source 패키지가 등록된 상품으로 교체하며, 공식 근거가 없는 임시 상품을 `READY`로 만들지 않는다.

## 공통 역할 경계

```text
Official Source → Human Verification → Rule Engine → Eligibility
Access Rule → Identity / Channel / Document
RAG → 승인된 공식 근거 검색
LLM → 쉬운 설명 / 번역 / 다음 행동 / 은행 문의문
```

LLM은 Eligibility 또는 Access 상태를 변경하지 않으며, 가입 가능성·승인확률·신용등급·은행 내부심사 기준을 추정하지 않는다.

## Demo A — 일반상품과 최소 입력

- Profile: `nationality=VN`, `residentStatus=RESIDENT`, `hasResidenceCard=true`, `hasDomesticPhone=true`, `financialPurpose=SAVE_MONEY`
- Product: `productAudience=GENERAL`, 승인 Visa Rule 없음
- 기대: `requiredFields`에 `visaType`, `visaExpiry`가 없고 신분확인·채널·서류는 각각 공식 Access 근거로 표시
- 자동검증: `RequiredProfileFieldsTest.generalProductWithoutVisaRuleDoesNotAskVisaQuestions`, `AiExplanationServiceTest.generalProductWithoutVisaRuleDoesNotRequireOrInventVisaFacts`

## Demo B — 일반상품과 외국인 특화상품 비교

- 상품 목록에서 `GENERAL`과 `FOREIGNER_SPECIALIZED` 배지를 같은 화면에 표시
- 정렬이나 추천은 외국인 특화 여부가 아니라 Eligibility 결과, 충족 HARD Rule 수, UNKNOWN 수, 금융목적 일치 순서 사용
- 핵심 문구: 외국인이라고 외국인 전용상품만 이용하는 것은 아니다.

## Demo C — 영업점 가능·모바일 미확인

- 공식 Channel Evidence: 영업점 이용만 확인
- 기대: `eligibilityStatus=PUBLIC_CONDITIONS_MET`, `branch=AVAILABLE`, `online=UNKNOWN`, `accessStatus=ACCESS_READY_BRANCH_ONLY`
- 자동검증: `AccessAssessmentServiceTest.branchEvidenceNeverInventsMobileAvailability`

## Demo D — Visa가 실제 필요한 외국인 대출

- 승인 HARD Rule: `VISA_TYPE`, `VISA_REMAINING_MONTH`, `EMPLOYMENT_DURATION_MONTHS`, `MONTHLY_INCOME`
- 기대: 해당 상품 상세에서만 `visaType`, `visaExpiry`, `employmentDurationMonths`, `monthlyIncome`을 동적으로 요청
- 자동검증: `RequiredProfileFieldsTest.foreignerLoanAsksVisaOnlyWhenApprovedHardRulesRequireIt`, Playwright `user-journey.spec.ts`

## Demo E — 공식 Access 자료 부족

- 신분확인·영업점·모바일 Channel Evidence 없음
- 기대: `ACCESS_UNKNOWN`; RAG 근거가 없으면 금융기관 추가 확인 고정 안내
- 자동검증: `AccessAssessmentServiceTest.noOfficialAccessEvidenceRemainsUnknown`, `test_no_evidence_uses_fixed_safe_fallback_and_full_disclaimer`

## 제출 데이터 Gate

Demo A~E를 실제 상품으로 고정하려면 각 상품에 공식 상품페이지, 상품설명서/약관, 외국인 실명확인, 채널, 필요서류, 신청절차, Rule Evidence와 정보 기준일이 필요하다. Source 간 충돌 또는 미검수 후보가 있으면 Demo 결과를 강제로 고정하지 않고 `INSUFFICIENT_INFORMATION` 또는 `ACCESS_UNKNOWN`으로 유지한다.
