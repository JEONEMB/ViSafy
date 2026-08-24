# ViSafy Season 3 공식 데이터 수집 프롬프트

> 작성 기준: 2026-08-24  
> 목적: ChatGPT, Gemini 등 브라우징 가능한 LLM을 조사 보조 도구로 사용해 Season 3 상품 후보와 공식 Evidence를 정리한다.  
> 중요: LLM의 결과는 Rule이 아니라 조사 후보이다. 관리자가 공식 원문을 직접 열어 확인하고 승인하기 전에는 Runtime 판정에 사용하지 않는다.

## 1. 공통 사용 원칙

1. 웹 검색 기능이 있는 LLM을 사용한다.
2. 검색 기준일과 공식 페이지 접근일을 결과에 기록한다.
3. 은행·증권사·금융위원회·금융감독원 등 공식 도메인만 Evidence로 인정한다.
4. 블로그, 카페, 커뮤니티, 뉴스, 비교 사이트, 광고성 제3자 페이지는 후보 탐색에도 참고 표시만 하고 Rule 근거로 제출하지 않는다.
5. 원문에 없는 국적·비자·거주·채널 조건을 상식으로 보완하지 않는다.
6. `가입대상: 실명의 개인`만으로 외국인 이용 가능을 확정하지 않는다.
7. PDF는 파일 URL, 문서명, 페이지 번호, 원문을 함께 기록한다. HTML은 URL, 화면 섹션명, 원문을 기록한다.
8. 찾지 못한 값은 빈칸 대신 `NOT_FOUND`로 쓴다.
9. 공식 문서가 충돌하면 하나를 선택하지 않고 `SOURCE_CONFLICT`로 쓴다.
10. LLM이 직접 접근할 수 없는 문서는 `ACCESS_FAILED`로 표시하고 사용자에게 다운로드를 요청한다.

## 2. Prompt A — 일반상품 5개 후보 선정

아래 프롬프트를 그대로 복사해 사용한다.

```text
당신은 한국 금융상품의 공식 근거만 조사하는 Research Assistant다.

목표:
- 국내 체류 외국인도 이용 가능성을 검토할 가치가 있는 현재 판매 중 일반 입출금계좌 2개와 일반 예·적금 3개를 찾는다.
- KB국민은행, 신한은행, 하나은행을 우선하고 최소 3개 기관을 포함한다.
- 외국인 전용상품이 아닌 일반상품만 선택한다.

허용 Source:
- 해당 금융기관 공식 홈페이지
- 해당 금융기관이 배포한 상품설명서, 약관, FAQ PDF/HTML
- 금융위원회·금융감독원 등 공식 공공기관 자료

금지:
- 블로그, 뉴스, 커뮤니티, 상품 비교 사이트를 근거로 사용하지 말 것
- '실명의 개인'이라는 문구만으로 외국인 가입 가능을 결론 내리지 말 것
- 공식 문서에 없는 비자, 국적, 비대면 가입 조건을 추론하지 말 것
- 찾지 못한 내용을 만들어내지 말 것

각 후보를 아래 JSON 배열로 반환하라.
[
  {
    "institution": "",
    "productName": "",
    "productCode": "확인되지 않으면 NOT_FOUND",
    "productAudience": "GENERAL",
    "productCategory": "DEMAND_DEPOSIT|SAVINGS|TIME_DEPOSIT",
    "financialPurposes": [],
    "currentlyAvailableEvidence": {
      "url": "직접 공식 URL",
      "accessedAt": "YYYY-MM-DD",
      "excerpt": "현재 판매 여부를 확인할 수 있는 짧은 원문",
      "locator": "페이지/섹션"
    },
    "productPageUrl": "",
    "termsOrDescriptionUrl": "",
    "foreignerIdentitySourceUrl": "NOT_FOUND 허용",
    "branchChannelSourceUrl": "NOT_FOUND 허용",
    "mobileChannelSourceUrl": "NOT_FOUND 허용",
    "requiredDocumentSourceUrl": "NOT_FOUND 허용",
    "applicationStepSourceUrl": "NOT_FOUND 허용",
    "missingEvidence": [],
    "candidateReadiness": "READY_CANDIDATE|PARTIAL|NOT_READY",
    "researchNotes": ""
  }
]

모든 URL은 검색 결과 URL이 아닌 실제 공식 페이지 또는 PDF URL이어야 한다.
각 URL을 직접 열어 접근 가능 여부를 확인하라.
```

## 3. Prompt B — 상품 1개 전체 Source 패키지

`[기관]`, `[상품명]`, `[공식 상품 URL]`을 바꿔 실행한다.

```text
당신은 ViSafy 관리자에게 전달할 공식 금융상품 Evidence 패키지를 작성한다.

조사 대상:
- 기관: [기관]
- 상품: [상품명]
- 시작 공식 URL: [공식 상품 URL]
- 조사 기준일: 2026-08-24

공식 도메인 자료만 사용하고 아래 항목을 조사하라.
1. 공식 상품페이지
2. 상품설명서 또는 약관
3. 명시적인 가입대상과 공개 가입조건
4. 외국인이 사용할 수 있는 신분확인 수단
5. 영업점 가입 가능 여부
6. 모바일·온라인 가입 가능 여부
7. 공식 필요서류
8. 공식 신청절차
9. 정보 기준일과 문서 시행일/유효기간

엄격한 판정 규칙:
- '실명의 개인'만 있으면 FOREIGNER_ALLOWED로 해석하지 않는다.
- 신분증 안내와 가입자격을 구분한다.
- 영업점 가능이 확인돼도 모바일 가능으로 확장하지 않는다.
- 모바일 가능이 확인돼도 외국인 모바일 가능으로 확장하지 않는다.
- Visa Rule이 없으면 Visa 제한을 만들지 않는다.
- 공식 원문이 없으면 NOT_FOUND다.
- 공식 Source 간 값이 다르면 SOURCE_CONFLICT다.

결과를 아래 구조로 반환하라.
{
  "product": {
    "institution": "",
    "productName": "",
    "productAudience": "GENERAL|FOREIGNER_SPECIALIZED|POLICY",
    "productCategory": "",
    "description": "원문 기반 요약",
    "informationBaseDate": "YYYY-MM-DD"
  },
  "sources": [
    {
      "sourceType": "PRODUCT_PAGE|PRODUCT_DESCRIPTION|TERMS|FAQ|IDENTITY_GUIDE|CHANNEL_GUIDE|PUBLIC_GUIDE",
      "title": "",
      "sourceUrl": "직접 공식 URL",
      "retrievedAt": "YYYY-MM-DDTHH:mm:ss+09:00",
      "validFrom": "NOT_FOUND 허용",
      "validTo": "NOT_FOUND 허용",
      "language": "ko|en|vi",
      "sourceExcerpt": "판단에 필요한 최소 원문",
      "sourceLocator": "PDF p.N 또는 HTML 섹션명",
      "pageNumber": "숫자 또는 null",
      "sectionName": "문자열 또는 null",
      "accessStatus": "ACCESSIBLE|ACCESS_FAILED"
    }
  ],
  "eligibilityEvidence": [],
  "identityEvidence": [],
  "channelEvidence": {
    "branch": [],
    "mobileOrOnline": []
  },
  "requiredDocumentEvidence": [],
  "applicationStepEvidence": [],
  "conflicts": [],
  "notFound": [],
  "humanReviewQuestions": []
}

원문을 의역한 문장을 sourceExcerpt에 쓰지 말고, 짧은 실제 원문을 사용하라.
```

## 4. Prompt C — Access Evidence 분류

```text
아래 공식 원문과 URL을 ViSafy Access Model 기준으로 분류하라.

[여기에 공식 원문, 문서명, URL, 페이지/섹션을 붙여 넣기]

분류값:
- HARD_ELIGIBILITY: 공개 가입조건이며 사용자 값과 직접 PASS/FAIL 비교 가능
- IDENTIFICATION_METHOD: 사용할 수 있는 신분확인 수단
- CHANNEL_REQUIREMENT: 영업점·모바일·온라인 채널 조건
- REQUIRED_DOCUMENT: 공식 필요서류
- INFORMATION: 판정에 쓰지 않는 일반 안내
- UNKNOWN_ELIGIBILITY: 조건 존재는 확인되지만 기준이 공개되지 않음
- EXTERNAL_CHECK: 은행/보증기관 등의 추가 심사가 필요

주의:
- 신분증을 제시할 수 있다는 안내를 가입자격으로 승격하지 말 것.
- '실명의 개인'을 외국인 허용으로 해석하지 말 것.
- 채널이나 외국인 여부가 명시되지 않으면 UNKNOWN으로 둘 것.

표 형식으로 반환:
| 원문 | 분류 | 판정 사용 여부 | 대상 채널 | 근거 URL | Locator | 확실성 사유 | 사람 확인사항 |
```

## 5. Prompt D — Rule Candidate 추출

```text
아래 공식 금융문서에서 ViSafy Rule Candidate만 추출하라.

[공식 문서 원문과 URL, 페이지/섹션 입력]

지원 ruleKey:
HAS_RESIDENCE_CARD, HAS_PASSPORT, HAS_DOMESTIC_PHONE,
CAN_DOMESTIC_PHONE_VERIFY, HAS_KOREAN_BANK_ACCOUNT,
HAS_KOREAN_CREDIT_HISTORY, RESIDENT_STATUS, NATIONALITY,
VISA_TYPE, VISA_REMAINING_MONTHS, OCCUPATION, EMPLOYMENT_TYPE,
EMPLOYMENT_DURATION_MONTHS, MONTHLY_INCOME, PREFERRED_CHANNEL,
REMITTANCE_COUNTRY

지원 operator:
EQ, NE, IN, NOT_IN, GT, GTE, LT, LTE, EXISTS

ruleLevel:
HARD, EXTERNAL_CHECK, UNKNOWN

ruleNature:
HARD_ELIGIBILITY, UNKNOWN_ELIGIBILITY, EXTERNAL_CHECK,
REQUIRED_DOCUMENT, IDENTIFICATION_METHOD, CHANNEL_REQUIREMENT,
BENEFIT_CONDITION, INFORMATION

규칙:
- 공식 원문에 명시된 값만 추출한다.
- IN/NOT_IN의 ruleValue는 JSON 배열 문자열로 작성한다.
- 기간, 금액, 국적, Visa Code를 보정하거나 생성하지 않는다.
- 판정 가능한 값이 없으면 UNKNOWN 후보로 남긴다.
- AI confidence는 추출 신뢰도이지 가입 가능 확률이 아니다.
- Runtime 승인 여부는 항상 PENDING이다.

JSON 배열로 반환:
[
  {
    "ruleKey": "",
    "operator": "",
    "ruleValue": "",
    "ruleLevel": "",
    "ruleNature": "",
    "mandatory": true,
    "sourceExcerpt": "",
    "sourceLocator": "",
    "pageNumber": null,
    "sectionName": null,
    "sourceUrl": "",
    "confidence": 0.0,
    "reviewStatus": "PENDING",
    "reasoning": "원문에서 이 구조로 옮긴 이유",
    "humanReviewRequired": true
  }
]
```

## 6. Prompt E — 최신성·충돌 검수

```text
동일 상품에 관한 아래 공식 Source 목록을 최신성과 충돌 관점에서 비교하라.

[Source 제목, URL, 게시/시행일, retrievedAt, 원문을 붙여 넣기]

자동으로 승자를 선택하지 말고 다음을 반환하라.
- 동일 ruleKey로 볼 수 있는 항목
- 값이 동일한지 여부
- 값이 충돌하는 경우 각 원문과 날짜
- 문서 우선순위를 사람이 판단할 때 볼 항목
- 만료 또는 개정 가능성이 있는 Source
- 권장 상태: APPROVED_CANDIDATE | NEED_REVIEW | EXPIRED | SUPERSEDED

충돌하면 반드시:
Rule Status = NEED_REVIEW
Runtime Reason = SOURCE_CONFLICT
로 표시하라.
```

## 7. Prompt F — Demo A~E 후보 배치

```text
아래는 사람이 검수한 ViSafy 상품 패키지 목록이다.

[검수된 상품별 Eligibility Rule, Access Evidence, 필요서류, 채널 상태를 붙여 넣기]

Demo A~E에 가장 적합한 상품을 배치하라.
- Demo A: 일반상품, Visa Rule 없음
- Demo B: 일반상품과 외국인 특화상품 비교
- Demo C: 영업점 AVAILABLE, 모바일 UNKNOWN
- Demo D: Visa·재직·소득 Rule이 실제로 존재하는 상품
- Demo E: 공식 Access 자료 부족으로 ACCESS_UNKNOWN

각 Demo마다 반환:
- 실제 상품명과 상품 ID 후보
- 대표 Profile 입력값
- requiredFields 기대값
- Eligibility 기대상태
- Access 기대상태
- 반드시 열어볼 공식 Source URL
- 20초 설명 문장
- 사람이 재확인할 위험요소

공식 Evidence가 조건을 충족하지 않으면 억지로 배치하지 말고 NO_VALID_PRODUCT라고 표시하라.
```

## 8. 조사 결과를 Codex에 전달하는 형식

API Key나 관리자 비밀번호는 보내지 않는다. 아래 네 묶음으로 전달한다.

```text
1. 공식 파일
- 원본 PDF 또는 저장한 HTML/PDF Snapshot

2. Source 목록
| institution | productName | sourceType | title | sourceUrl | retrievedAt | validFrom | validTo | language |

3. Evidence 목록
| productName | nature | ruleKey | operator | value | mandatory | excerpt | locator | page | sourceUrl |

4. 사람 검수 결과
| productName | item | APPROVE/REJECT/NEED_REVIEW | reviewer | reviewedAt | note |
```

파일명은 가능하면 다음 규칙을 사용한다.

```text
기관_상품명_문서종류_시행일.pdf
예: 하나은행_상품명_상품설명서_20260801.pdf
```

## 9. 사용자가 반드시 직접 확인할 항목

- 공식 URL과 PDF가 실제로 열리는지
- 조사한 상품이 현재 신규 가입 가능한지
- 원문·페이지·섹션이 LLM 결과와 정확히 같은지
- 신분확인 안내와 가입자격이 혼동되지 않았는지
- 영업점 가능과 모바일 가능이 따로 확인됐는지
- Source끼리 조건이나 시행일이 충돌하지 않는지
- 개인정보나 고객 식별번호가 Snapshot에 포함되지 않았는지
- 관리자 승인 전에 Candidate가 Runtime에 사용되지 않는지

LLM은 자료 정리를 빠르게 할 수 있지만 금융조건의 최종 검수자나 승인자가 될 수 없다.
