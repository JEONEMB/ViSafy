# Season 3 일반상품 후보 접수 기록

> 접수일: 2026-08-24  
> 상태: 공식 URL·Snapshot 보완 대기  
> 원칙: 이 문서는 조사 후보 기록이다. 관리자 승인 Source 또는 Runtime Rule이 아니다.

첨부 PDF 식별, 공식 URL, 최신성 및 상품별 Access 판정은 [`season3-official-source-research-2026-08-24.md`](season3-official-source-research-2026-08-24.md)에 기록한다.

## 1. 접수 결과

| 기관 | 상품 | 정규화 상품 목적 | Category | 후보 판정 | 현재 등록 가능 여부 |
| --- | --- | --- | --- | --- | --- |
| 신한은행 | 신한 생계비계좌 | `ACCOUNT` | `DEMAND_DEPOSIT` | 우선 조사 | 불가 |
| 하나은행 | 저축예금 | `ACCOUNT` | `DEMAND_DEPOSIT` | 우선 조사 | 불가 |
| KB국민은행 | KB나만의 적금 | `SAVINGS` | `SAVINGS` | 우선 조사 | 불가 |
| 하나은행 | 급여하나 월복리 적금 | `SAVINGS` | `SAVINGS` | 우선 조사 | 불가 |
| KB국민은행 | KB Star 정기예금 | `SAVINGS` | `TIME_DEPOSIT` | 보완 후 재검토 | 불가 |

현재 5개 상품 모두 `productAudience=GENERAL` 후보로 적합하다. 다만 SSAFIN의 Source 필수값인 직접 공식 URL, Snapshot, `contentHash`, Source 상태와 유효기간이 없어 아직 DB에 등록하지 않는다.

`READY_CANDIDATE`는 조사 우선순위일 뿐 SSAFIN의 `READY` 상태가 아니다. 특히 `실명의 개인` 원문만으로 외국인의 가입 가능성을 확정하지 않는다.

## 2. 입력값 정규화

현재 상품 모델의 `financialPurpose`는 Journey 목적 여러 개가 아니라 아래의 단일 상품 분류를 저장한다.

```text
ACCOUNT
SAVINGS
LOAN
CARD
INVESTMENT
```

따라서 접수값은 다음처럼 정규화한다.

- `OPEN_ACCOUNT`, `MANAGE_MONEY`, `RECEIVE_SALARY` 계좌상품 → `ACCOUNT`
- `SAVE_MONEY`, `RECEIVE_SALARY` 예·적금상품 → `SAVINGS`
- `MANAGE_MONEY`는 현재 지원되는 Journey 목적 코드가 아니므로 Runtime 입력에 사용하지 않는다.
- 복수의 사용자 Journey 목적은 이번 등록에서 조사 메모로 보존하고, 별도 상품-목적 다대다 모델이 도입되기 전에는 상품 DB 값으로 저장하지 않는다.

## 3. 상품별 보완 요청

### 신한은행 — 신한 생계비계좌

접수된 구조화 자료는 [`data-pipeline/source_registry/shinhan-livelihood-account.candidate.json`](../data-pipeline/source_registry/shinhan-livelihood-account.candidate.json)에 `NEED_REVIEW`, `runtimeEligible=false`로 보존한다. 외국인 모바일 상태는 상품 수준 `AVAILABLE`과 분리하여 Runtime 기준 `UNKNOWN`으로 유지한다.

필수:

- 공식 상품페이지 직접 URL
- 인용한 상품설명서 PDF 직접 URL 또는 원본 PDF
- 외국인등록증·국내거소신고증·영주증 문구의 원문, 페이지, 공식 URL
- 영업점 신규 가능 원문
- 외국인 모바일 신규 가능 또는 불가 원문
- 필요서류와 신청절차 원문

주의:

- `실명의 개인 및 개인사업자`는 외국인 허용 HARD Rule이 아니다.
- 외국인 실명확인증표가 명시돼도 우선 `IDENTIFICATION_METHOD`로 분류한다.

### 하나은행 — 저축예금

필수:

- 공식 상품페이지 직접 URL
- `2025.09.01 상품설명서` PDF 직접 URL 또는 원본 PDF
- 외국인의 공식 실명확인증표 원문과 Source
- `신규는 영업점` 원문과 Source
- `외국인 비대면 실명확인 제한` 원문과 Source
- 거래목적별 추가서류의 공식 원문

주의:

- 영업점 신규가 확인돼도 모바일 가입을 가능으로 추론하지 않는다.

### KB국민은행 — KB나만의 적금

필수:

- 공식 상품페이지 직접 URL
- 상품설명서·약관 PDF 직접 URL 또는 원본 PDF
- 영업점 가입 경로의 원문과 Source
- 외국인 CDD·신분증 원문과 Source
- KB스타뱅킹에서 외국인이 이 상품을 신규할 수 있는지 확인하는 상품별 공식 원문
- 공식 필요서류와 신청절차

주의:

- 일반 고객의 KB스타뱅킹 가입 가능 문구를 외국인에게 자동 적용하지 않는다.

### 하나은행 — 급여하나 월복리 적금

필수:

- 공식 상품페이지 직접 URL
- 상품설명서·약관 PDF 직접 URL 또는 원본 PDF
- 영업점·모바일 채널 각각의 원문
- 외국인 비대면 제한 정책의 원문과 Source
- 외국인 추가서류가 있다면 공식 원문
- 급여 조건이 가입자격인지 우대금리 조건인지 구분 가능한 원문

주의:

- 급여 조건이 우대금리 조건이면 `HARD_ELIGIBILITY`가 아니라 `BENEFIT_CONDITION`이다.

### KB국민은행 — KB Star 정기예금

필수:

- 공식 상품페이지 직접 URL
- 상품설명서·약관 PDF 직접 URL 또는 원본 PDF
- 현재 판매 중임을 확인할 수 있는 공식 기준일
- 상품의 온라인 전용 채널 원문
- 외국인이 KB스타뱅킹·인터넷뱅킹에서 신규 가능한지 확인하는 상품별 공식 원문
- 외국인 대상 신규 절차와 필요서류

판정:

- 온라인 전용인데 외국인의 온라인 접근 근거가 없으므로 현재는 `PARTIAL` 후보가 타당하다.
- Eligibility가 충족돼도 채널 근거가 없으면 `ACCESS_UNKNOWN`을 유지한다.

## 4. 보완 조사용 복사 프롬프트

아래 프롬프트를 상품별로 한 번씩 실행한다.

```text
SSAFIN에 등록할 [기관]의 [상품명] 공식 Source를 보완 조사하라.

현재 확보한 정보:
[현재 JSON 전체를 붙여 넣기]

반드시 금융기관 또는 금융당국 공식 도메인만 사용하라. 검색결과 URL이 아니라 실제 HTML/PDF 직접 URL을 반환하고 각 URL을 직접 열어 접근 가능 여부를 확인하라.

다음 항목을 빠짐없이 반환하라.
1. 공식 상품페이지 직접 URL
2. 상품설명서 또는 약관 PDF 직접 URL
3. 상품 가입대상 실제 원문, 페이지/섹션
4. 외국인 실명확인 수단 실제 원문, 페이지/섹션
5. 영업점 가입 가능 여부 실제 원문, 페이지/섹션
6. 외국인 모바일·온라인 가입 가능/불가 실제 원문, 페이지/섹션
7. 필요서류 실제 원문, 페이지/섹션
8. 신청절차 실제 원문, 페이지/섹션
9. 문서 시행일, 정보 기준일, 유효기간

엄격한 규칙:
- '실명의 개인'만으로 외국인 가입 가능을 확정하지 말 것.
- 일반 고객 모바일 가입 안내를 외국인에게 자동 적용하지 말 것.
- 찾지 못하면 NOT_FOUND로 쓸 것.
- 접근하지 못한 URL은 ACCESS_FAILED로 쓸 것.
- 공식 Source끼리 충돌하면 SOURCE_CONFLICT로 쓸 것.
- 원문을 만들어내거나 의역해서 인용하지 말 것.

반환 표:
| evidenceType | title | officialUrl | accessedAt | exactExcerpt | locator | pageNumber | validFrom | validTo | result |

evidenceType은 PRODUCT_PAGE, TERMS, ELIGIBILITY, IDENTITY_METHOD, BRANCH_CHANNEL, MOBILE_CHANNEL, REQUIRED_DOCUMENT, APPLICATION_STEP 중 하나로 작성하라.
```

## 5. DB 반영 Gate

각 상품은 다음을 충족한 뒤에만 관리자 등록 또는 Migration 후보가 된다.

- [ ] 고유 `productCode` 결정
- [ ] 공식 상품페이지 URL 확인
- [ ] 상품설명서 또는 약관 원본 확보
- [ ] Snapshot과 SHA-256 `contentHash` 생성
- [ ] 정보 기준일과 유효기간 기록
- [ ] 외국인 신분확인 Evidence 분류
- [ ] 영업점·모바일 Channel Evidence 각각 분류
- [ ] 필요서류·신청절차 Evidence 분류
- [ ] Source 충돌 여부 확인
- [ ] 관리자 Human Verification 완료

Gate를 통과하기 전에는 `active=true`, `reviewStatus=APPROVED`, Season 3 `READY`로 만들지 않는다.
