# Season 3 일반상품 공식 Source 조사 결과

> 조사일: 2026-08-24  
> 범위: 사용자가 제공한 PDF 4개와 금융기관 공식 웹사이트  
> 상태: Source Candidate. Human Verification 전에는 Runtime에 사용하지 않는다.

## 1. 첨부 PDF 식별 및 해시

| 첨부 파일 | 확인된 문서 | SHA-256 | 최신성 판정 |
| --- | --- | --- | --- |
| `Shinhan.pdf` | 신한 생계비계좌 상품설명서, 심의필 제2026-12107-1호 | `8CCFC9DAF87798A33E2B9D1E8D6237EAEAC7B45AFFE4711180B6A25AF1EB9DF3` | 공식 최신 PDF와 심의번호·기간 일치 |
| `Hana.pdf` | 하나은행 저축예금 상품설명서, 2025.09.01 기준 | `C22130E63746942F2E37324ECC57A3C8F10F976202B06D7DAFF0B57FE0BF2AF2` | 현재 공식 공시 PDF와 일치 |
| `Hana2.pdf` | 급여하나 월복리 적금 상품설명서, 2022.01.18 기준 | `0937242CB0FB749A1E7FC54368AF7F9C28A4E12CA76560D3FD850133417FC600` | `SUPERSEDED` 후보. 2026.07.31 문서 사용 필요 |
| `KB.pdf` | KB Star 정기예금 특약, 부칙 2022.12.15 포함 | `1E02DCB86D631C532FF41775C8D933AD555A45AF072148B7DC5F95BD2EE5C238` | 보조 약관으로 사용 가능. 현재 상품정보는 공식 페이지로 별도 확인 |

첨부 파일은 PDFium으로 다시 출력된 파일이므로 원본 파일명이나 Source URL 메타데이터는 남아 있지 않다. 해시는 첨부 Snapshot 자체의 무결성 확인값이다.

## 2. 공식 Source URL

### 신한은행 — 신한 생계비계좌

- 최신 공식 상품설명서: [신한 생계비계좌 PDF](https://img.shinhan.com/sbank2016/seol/20260120000000320003LC000030.PDF?1779118005667=)
- 유효기간: 2026-05-18 ~ 2027-05-12
- 상품페이지: `NOT_FOUND`

확인된 원문:

```text
가입대상: 실명의 개인 및 개인사업자 (전 금융기관 1인 1계좌)
- 단, 외국인의 실명확인증표는 외국인등록증
  (외국인등록증, 국내거소신고증, 영주증)을 보유한 경우로 한정

가입방법: 영업점, 신한은행 모바일앱
```

분류:

- `전 금융기관 1인 1계좌` → `HARD_ELIGIBILITY` 후보
- 세 신분증 → `IDENTIFICATION_METHOD`, `REQUIRED_DOCUMENT`
- 영업점 → 상품 채널 `AVAILABLE`
- 모바일앱 → 상품 수준 `AVAILABLE`, 외국인 모바일 `UNKNOWN`
- `FOREIGNER_ALLOWED` Rule 생성 금지

### 하나은행 — 저축예금

- 공식 상품설명서: [저축예금 PDF](https://image.kebhana.com/cont/download/documents/manual/0100020160501_20250901_m.pdf)
- 공식 상품공시 목록: [입출금이 자유로운 예금 공시](https://www.kebhana.com/cont/mall/mall09/mall0902/mall090203/index%2C1%2Clist%2C4.jsp)
- 기준일: 2025-09-01
- 별도 상세 상품페이지: `NOT_FOUND`

확인된 원문:

```text
가입대상: 실명의 개인 (개인사업자 포함)
신규: 영업점
해지: 영업점, 인터넷뱅킹, 스마트폰뱅킹
```

분류:

- `실명의 개인` → `INFORMATION`; 외국인 가입 가능 Rule로 사용 금지
- 신규 영업점 → 상품 채널 `AVAILABLE`
- 외국인 신분확인·추가서류 → `NOT_FOUND`
- 신규 모바일 → 공식 문서상 지원하지 않음. 해지 채널을 신규 채널로 사용 금지
- 최종 Access → 외국인 가입근거 추가 확인 전 `ACCESS_UNKNOWN`

### 하나은행 — 급여하나 월복리 적금

- 공식 상품페이지: [급여하나 월복리 적금](https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1455929_115157.jsp)
- 최신 공식 상품설명서: [2026-07-31 상품설명서](https://image.kebhana.com/cont/download/documents/manual/0100272000101_20260731_m.pdf)
- 공식 상품공시 목록: [하나은행 적금 공시](https://www.kebhana.com/cont/mall/mall09/mall0902/mall090201/index.jsp)
- 첨부 `Hana2.pdf`는 2022년 문서이므로 현재 Rule Evidence로 승인하지 않는다.

확인된 원문:

```text
가입대상: 실명의 개인 또는 개인사업자 (1인 1계좌)
신규: 영업점, 인터넷뱅킹, 스마트폰뱅킹
해지: 영업점, 인터넷뱅킹, 스마트폰뱅킹
```

분류:

- `실명의 개인` → `INFORMATION`; 외국인 허용으로 추론 금지
- `1인 1계좌`와 상호 중복가입 제한 → `HARD_ELIGIBILITY` 후보이지만 현재 Boolean Profile만으로 정확한 평가가 가능한지 검토 필요
- 영업점·인터넷·스마트폰 → 상품 수준 채널 Evidence
- 외국인 인터넷·스마트폰 신규 → `UNKNOWN`
- 급여입금·온라인 가입 조건은 가입자격이 아니라 우대금리 `BENEFIT_CONDITION`
- 외국인 신분확인·추가서류 → `NOT_FOUND`

### KB국민은행 — KB나만의 적금

- 공식 상품페이지: [KB나만의 적금](https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP01001632)
- 상품설명서 PDF 직접 URL: `NOT_FOUND`

확인된 원문:

```text
가입대상: 실명의 개인(1인 2계좌 제한)
가입방법: KB스타뱅킹, 영업점
```

분류:

- `실명의 개인` → `INFORMATION`; 외국인 허용으로 추론 금지
- `1인 2계좌` → `HARD_ELIGIBILITY` 후보. 현재 `hasExistingProductAccount` Boolean만으로 0·1·2계좌를 구분할 수 없어 Runtime 평가 보류
- 영업점 → 상품 수준 `AVAILABLE`
- KB스타뱅킹 → 상품 수준 `AVAILABLE`, 외국인 모바일 `UNKNOWN`
- 외국인 신분확인·상품별 필요서류 → `NOT_FOUND`

보조 Source:

- [KB 고객확인제도](https://obank1.kbstar.com/quics?page=C029250): 외국인등록증·여권 등을 금융실명법상 실명확인증표 예시로 안내한다.
- 위 Source는 은행 공통 신분확인 Evidence이며 KB나만의 적금의 외국인 가입 또는 모바일 신규를 확정하지 않는다.

### KB국민은행 — KB Star 정기예금

- 공식 상품페이지: [KB Star 정기예금](https://obank.kbstar.com/quics?cc=b061496%3Ab061645&isNew=Y&page=C016613&prcode=DP01000938)
- 공식 모바일 소개: [KB Star 정기예금](https://ombr.kbstar.com/quics?QViewPC=N&TmpltID=TP02001&page=ombr&pageCd=QT0104)
- 공식 특약: [KB Star 정기예금 특약](https://img2.kbstar.com/obj/ocommon/221114_kbstar_terms2.pdf)

확인된 원문:

```text
가입가능경로: 인터넷, 스타뱅킹
가입대상: 개인 및 개인사업자
신규금액: 1백만원 이상
```

분류:

- 최소 가입금액 → `HARD_ELIGIBILITY` 후보
- 인터넷·스타뱅킹 → 상품 수준 `AVAILABLE`
- 영업점 신규 → 상품설명상 `NOT_AVAILABLE`
- 외국인의 인터넷·스타뱅킹 신규 → `UNKNOWN`
- 외국인 모바일 근거가 없으므로 전체 Access는 `ACCESS_UNKNOWN`

보조 Source:

- [KB국민인증서 발급 안내](https://img2.kbstar.com/obj/ocommon/kb_cert_faq_2024.pdf): 외국인 고객의 인증서 발급 방법을 안내하지만 특정 예금의 비대면 신규 가능을 보장하지 않는다.

## 3. 추가로 확인된 외국인 채널 정책

- [하나은행 비대면 계좌개설 안심차단 안내](https://www.kebhana.com/cont/customer/customer04/customer0402/1507171_114300.jsp)는 기존 외국인 고객을 서비스 신청 대상에 포함하고 비대면 원화 요구불계좌 개설을 언급한다.
- [하나은행 외국인 비대면 서비스 사례](https://kebhana.com/cont/customer/customer04/customer0405/index%2C1%2Clist%2C10.jsp)는 국내 거주 외국인 대상 비대면 계좌개설 서비스 시행 사실을 안내한다.
- 위 자료는 개별 저축예금·적금 상품에서 외국인의 모바일 신규 가능 여부를 직접 보장하지 않으므로 상품별 `foreignResidentStatus`는 계속 `UNKNOWN`이다.
- [하나은행 HAI Smart Self Zone](https://www.kebhana.com/cont/info/info03/info030d/index.jsp)은 외국인·외국국적동포·재외국민을 이용대상에서 제외한다고 명시한다. 이 제한은 STM 채널에만 적용하며 영업점 전체 제한으로 확장하지 않는다.

## 4. 남은 NOT_FOUND

| 상품 | 남은 항목 |
| --- | --- |
| 신한 생계비계좌 | 별도 상품약관, 외국인 모바일 신규 직접 문구, 기타 추가서류, 상세 단계형 절차 |
| 하나 저축예금 | 외국인 가입·신분확인 직접 근거, 외국인 추가서류, 단계형 영업점 절차 |
| 급여하나 월복리 적금 | 외국인 가입·신분확인 직접 근거, 외국인 온라인 신규 직접 근거, 외국인 추가서류 |
| KB나만의 적금 | 상품설명서 직접 PDF, 외국인 가입 직접 근거, 외국인 스타뱅킹 신규 직접 근거, 추가서류 |
| KB Star 정기예금 | 외국인 온라인 신규 직접 근거, 외국인 추가서류·신청절차 |

`NOT_FOUND` 항목은 상담 또는 추가 공식 Source 확보 전까지 채우지 않는다.

## 5. 현재 반영 결론

- 신한 생계비계좌는 가장 완성도가 높은 Candidate다.
- 하나 저축예금은 영업점 전용 일반상품 Demo 후보지만 외국인 접근 근거가 부족하다.
- 급여하나 월복리 적금은 최신 2026 문서로 교체한 뒤 사용한다.
- KB나만의 적금은 `1인 2계좌` 평가를 위한 계좌 수 Profile 모델이 필요하다.
- KB Star 정기예금은 외국인 비대면 근거가 없으므로 Demo E (`ACCESS_UNKNOWN`) 후보로 적합하다.
- 어느 상품에도 `실명의 개인`만으로 `FOREIGNER_ALLOWED` Rule을 생성하지 않는다.
