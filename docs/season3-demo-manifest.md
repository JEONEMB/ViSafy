# ViSafy Season 3 고정 Demo A~E

> 고정 기준일: 2026-08-24  
> 전제: 빈 DB에서 Flyway V1~V19 적용  
> 주의: Pre-check 결과는 저장하지 않으며, Profile Session UUID는 시연 때 새로 생성한다.

## Demo A — Visa를 묻지 않는 일반상품

- 상품: `KB나만의 적금` (`productId=12`, `KB-MY-SAVINGS`)
- Profile: `language=ko`, `nationality=VN`, `residentStatus=RESIDENT`, `hasResidenceCard=true`, `desiredMonthlyAmount=300000`
- 고정 기대값: `requiredFields=[desiredMonthlyAmount]`, Visa 입력 없음, `diagnosisStatus=READY`
- 핵심 문장: 외국인이라고 외국인 전용상품만 이용하는 것은 아닙니다.

## Demo B — 일반상품과 외국인 특화상품 비교

- 일반상품: `KB나만의 적금` (`productId=12`)
- 외국인 특화상품: `하나더이지 적금` (`productId=3`)
- 금융 목적: `SAVE_MONEY`
- 고정 기대값: 두 Audience가 같은 목록에 표시되고, 확률이 아니라 충족 Rule 수·추가 확인 수로 정렬된다.

## Demo C — 상품 채널과 외국인 채널을 분리

- 상품: `급여하나 월복리 적금` (`productId=13`)
- 고정 근거: 영업점·인터넷뱅킹·스마트폰뱅킹은 상품 수준에서 확인됨.
- 고정 기대값: `branch=AVAILABLE`, 외국인 모바일 신규는 `online=UNKNOWN`.
- 주의: 공식 신분증·추가서류 Evidence가 있으므로 종합 Access 상태는 `ACCESS_ADDITIONAL_DOCUMENTS`일 수 있다. 이는 모바일 가능 확정이 아니다.

## Demo D — 실제 Rule이 있을 때만 Visa 질문

- 상품: `하나 외국인 EZ Loan` (`productId=5`, `HANA-EZ-LOAN`)
- Profile: `nationality=VN`, `visaType=E-9`, `visaExpiry`는 시연일 기준 14개월 후, `employmentDurationMonths=10`, `monthlyIncome=2800000`
- 고정 기대값: 이 상품에서만 Visa·체류·재직·소득 관련 `requiredFields`가 나타난다.

## Demo E — 공식 자료 부족을 숨기지 않음

- 상품: `SOL글로벌 전세대출(서울보증_외국인)` (`productId=6`)
- 고정 기대값: `diagnosisStatus=NOT_READY`, `ACCESS_UNKNOWN`, 사전자격 PASS로 간주하지 않음.
- 사용자 안내: 현재 등록된 공식 자료만으로는 해당 조건을 정확히 확인할 수 없습니다. 금융기관에 추가 확인이 필요합니다.

## 3분 진행 순서

1. Landing에서 언어와 금융목적 선택
2. Profile에서 필요한 최소 정보 저장
3. Demo A로 일반상품의 동적 입력 확인
4. Demo B에서 일반/특화상품 비교
5. Demo C에서 Eligibility와 Branch/Mobile Access 분리 확인
6. Demo D에서 상품 Rule이 있을 때만 Visa 질문 확인
7. Demo E에서 근거 부족 Guardrail 확인
8. 판단 근거 Source 링크와 은행 문의문으로 종료

## 고정 검증 SQL/API

```text
GET /api/products
GET /api/products/12
POST /api/eligibility/pre-check
POST /api/ai/explain
```

Flyway ID는 기존 데이터를 유지한 로컬 DB에서도 10~14로 동일하지만, 운영 DB에 수동 데이터가 선행 삽입됐다면 `productCode`를 기준으로 다시 확인한다.
