# SSAFIN Season 3 고정 Demo A~E

> 고정 기준일: 2026-08-28
>
> 실행 기준: Flyway V1~V24가 적용된 빈 DB
>
> 원칙: Product ID는 DB 삽입 순서에 따라 달라질 수 있으므로 `productCode`를 고정 식별자로 사용한다.

## 공통 대표 Profile

```text
language=ko
nationality=VN
residentStatus=RESIDENT
hasResidenceCard=true
hasPassport=true
hasDomesticPhone=true
canDomesticPhoneVerify=true
hasKoreanBankAccount=true
financialPurpose=SAVE_MONEY
```

대출 Demo에서는 다음 값을 추가한다.

```text
visaType=E-9
visaExpiry=실행일 기준 14개월 이후
residencyStartDate=실행일 기준 24개월 이전
employmentDurationMonths=10
monthlyIncome=2800000
```

## Demo A — Visa를 묻지 않는 일반상품

- 상품: `KB-MY-SAVINGS` (현재 빈 DB 기준 ID 12)
- 기대: `requiredFields`에 `visaType`, `visaExpiry`가 없다.
- 확인: 일반상품은 승인된 상품 Rule에 필요한 Profile Field만 요청한다.
- 핵심 문장: 외국인이라고 외국인 전용상품만 이용하는 것은 아닙니다.

## Demo B — 일반상품과 외국인 특화상품 비교

- 일반상품: `KB-MY-SAVINGS`
- 특화상품: `HANA-EASY-SAVINGS-2025` (현재 빈 DB 기준 ID 3)
- 금융 목적: `SAVE_MONEY`
- 기대: 같은 추천 화면에서 두 Audience가 함께 표시되고, 확률이 아닌 충족 Rule·추가 확인·목적 일치로 설명된다.

## Demo C — 상품 채널과 외국인 모바일 채널 분리

- 상품: `HANA-SALARY-COMPOUND-SAVINGS` (현재 빈 DB 기준 ID 13)
- 기대: 영업점은 공식 근거로 `AVAILABLE`, 외국인 모바일 신규는 직접 근거가 없어 `UNKNOWN`이다.
- 확인: 상품 수준의 모바일 문구만으로 외국인 모바일 이용 가능을 확정하지 않는다.

## Demo D — 실제 Rule이 있을 때만 Visa 질문

- 상품: `HANA-EZ-LOAN` (현재 빈 DB 기준 ID 5)
- 기대 동적 입력: `visaType`, `residencyStartDate`, `employmentDurationMonths` 등 승인된 HARD Rule에 필요한 값
- 기대 Access: 외국인등록증, 영업점 전용 채널, 공식 필요서류가 Source와 함께 표시된다.
- 추가 확인: 거래외국환 지정은행 등록과 E-9 최초 1회차 입국 여부는 은행 확인사항이다.

## Demo E — 공식 자료 부족을 숨기지 않음

- 상품: `SHINHAN-SOL-GLOBAL-JEONSE` (현재 빈 DB 기준 ID 6)
- 확보 근거: SOL글로벌 적금 설명서에 외국인 패키지 상품으로 상품명만 명시
- 부족 근거: 직접 상품설명서·약관, 가입조건, 신분확인, 채널, 필요서류
- 기대: `diagnosisStatus=NOT_READY`, `accessStatus=ACCESS_UNKNOWN`
- 사용자 안내: 현재 등록된 공식 자료만으로 정확한 조건을 확인할 수 없으므로 신한은행에 추가 확인이 필요합니다.

## 3분 시연 순서

| 시간 | 화면 | 보여줄 핵심 |
| --- | --- | --- |
| 0:00~0:25 | Landing | 언어와 금융 목적 선택, 서비스 문제 정의 |
| 0:25~0:50 | Profile | 국적과 언어 분리, 민감정보 미수집 |
| 0:50~1:15 | Demo A·B | 일반상품과 특화상품 통합 추천, Visa 없는 상품의 최소 입력 |
| 1:15~1:40 | Financial Journey | 현재 단계와 다음 한 가지 행동 |
| 1:40~2:15 | Demo D | 동적 Visa 질문, Rule 진단, 신분증·영업점·필요서류 |
| 2:15~2:40 | 공식문서 Agent | 질문에 직접 답하고 Source 인용, 신청 URL 구분 |
| 2:40~2:55 | Demo E | 공식 자료 부족 시 추측하지 않는 결과 |
| 2:55~3:00 | 마무리 | 가입 예측이 아닌 공식 조건과 이용 경로 안내 |

## 실행 전 검증

```text
GET  /api/products
GET  /api/products/{id}
POST /api/eligibility/pre-check
GET  /api/products/{id}/guidance
POST /api/rag/answer
```

- [ ] 각 `productCode`의 실제 ID 재확인
- [ ] 대표 Profile Session 새로 생성
- [ ] 기대 상태와 실제 API 결과 대조
- [ ] 모든 공식 Source 링크 접근 확인
- [ ] 한국어와 영어 Agent 질문 각 1회 성공
- [ ] Demo 화면 캡처와 3분 예비 녹화 보관
