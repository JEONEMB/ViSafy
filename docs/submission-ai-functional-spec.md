# SSAFIN 기능 명세서 — AI 기능 중심 (작성안)

2026 금융 AI Challenge MVP 산출물 제출용. 제공된 기능명세서 양식의 항목 구조에 맞춰 옮긴다.

- 공개 URL: <https://34-64-228-103.sslip.io>
- 저장소 전체 기능 명세(FR·DATA ID 체계): [ViSafy 기능명세서 Season 3.md](../ViSafy%20기능명세서%20Season%203.md)

이 문서는 **생성형 AI가 무엇을 하고, 무엇을 하지 못하게 막았는지**를 기능 단위로 기술한다.

---

## 0. AI 권한 경계 (모든 기능의 전제)

```
공식 Source 수집 (도메인 allowlist · SHA-256 Snapshot)
   ↓
[AI-1] 생성형 AI 조건 후보 제안
   ↓
[AI-2] 결정론적 원문 대조 검증        ← AI 출력을 기계가 검사
   ↓
      사람 검수 승인 (Human Verification)
   ↓
      Rule Engine 결정론적 판정        ← AI 개입 불가 구간
   ↓
[AI-3] RAG 공식 근거 검색
   ↓
[AI-4] 쉬운 설명 · 번역 · 다음 행동
   ↓
[AI-5] 창구 준비 패킷 대사
```

| 구분 | 생성형 AI | 권한 |
| --- | --- | --- |
| 조건 후보 제안 | ○ | 제안만 가능. 검증·승인 없이 저장되지 않음 |
| 가입 자격 판정 | **✕** | Rule Engine 전용. AI는 결과를 읽기만 함 |
| 이용 채널 판정 | **✕** | Access Evidence 전용 |
| 설명·번역 | ○ | 판정 결과를 바꿀 수 없음 |
| 창구 대사 | △ | 골격은 고정 템플릿, AI는 번역·다듬기만 |

---

## AI-1. 공식 문서 조건 후보 제안

| 항목 | 내용 |
| --- | --- |
| **기능 ID** | AI-1 |
| **입력** | 승인된 공식 Source의 원문 Snapshot (페이지 단위) |
| **출력** | Rule 후보 목록 (`ruleKey`, `operator`, `value`, `sourceExcerpt`, `pageNumber`, `confidence`) |
| **모델** | OpenAI Responses API · JSON Schema strict · `store=false` · `max_retries=0` |
| **저장 위치** | `rule_candidate` 테이블, `reviewStatus=NEED_REVIEW`, `extractor=LLM_VERIFIED` |

### 처리 규칙

- 제안 가능한 `ruleKey`는 **허용 목록으로 제한**한다 (`AGE`, `VISA_TYPE`, `VISA_REMAINING_MONTH`, `RESIDENCY_MONTH`, `DOMESTIC_INCOME_MONTH`, `MONTHLY_INCOME`, `RESIDENT_STATUS`, `HAS_EXISTING_PRODUCT_ACCOUNT`, `DESIRED_MONTHLY_AMOUNT` 등)
- `FOREIGNER_ALLOWED`, `IS_FOREIGNER`는 **차단 목록**이다. 국적·외국인 여부를 근거로 한 자동 배제를 AI가 생성하지 못하게 한다
- 규칙 기반 추출기(`ConservativeRuleCandidateExtractor`)를 **항상 함께 실행**하고, AI 제안은 그 위에 더해진다. AI가 실패해도 추출은 계속된다
- 모든 예외는 포착되어 **빈 목록**을 반환한다. AI 장애가 파이프라인을 중단시키지 않는다

### 화면

- `/admin/sources` — Source 등록, 후보 추출 실행, 후보 목록 검토
- 후보마다 원문 인용문·페이지·섹션·신뢰도와 **"AI 문서 분석 · 원문 대조 완료 · 검수 전"** 표시

---

## AI-2. 제안 후보의 원문 대조 검증

| 항목 | 내용 |
| --- | --- |
| **기능 ID** | AI-2 |
| **성격** | **결정론적 검증기.** 생성형 AI를 사용하지 않는다 |
| **목적** | AI 제안이 사용자 판정에 도달하기 전에 기계적으로 차단 |

### 검증 항목 (모두 통과해야 저장)

| # | 검증 | 실패 시 |
| --- | --- | --- |
| 1 | `ruleKey`가 허용 목록에 있는가 | 폐기 |
| 2 | 차단 목록(`FOREIGNER_ALLOWED`, `IS_FOREIGNER`)에 해당하지 않는가 | 폐기 |
| 3 | `ruleLevel`·`operator`가 유효한 값인가 | 폐기 |
| 4 | **`sourceExcerpt`가 해당 페이지 원문에 문자 그대로 존재하는가** | 폐기 |
| 5 | **제안한 숫자가 인용문 안에 실제로 등장하는가** | 폐기 |
| 6 | **제안한 비자코드가 인용문 안에 실제로 등장하는가** | 폐기 |
| 7 | 값의 형식이 Rule Engine이 비교 가능한 형태인가 | 폐기 |

### 이 기능이 필요한 이유 (실제 사례)

개발 중 AI가 `RESIDENT_STATUS = "국내 거주자"`를 제안했다. Rule Engine은 이 항목을 `RESIDENT` / `NON_RESIDENT`로 비교하므로, 승인됐다면 **조용한 오판정**이 발생했을 것이다. 7번 검증이 이를 차단했다.

또한 값 정규화 과정에서 `["E-7", "E-9"]`와 `["E-7","E-9"]`의 공백 차이로 **동일한 조건이 Source 충돌로 잘못 감지되는 결함**을 발견해 양쪽(추출기·Backend)에서 정규화하도록 수정했다.

### 결과 지표

추출 실행 시 다음을 함께 반환한다.

```
proposedCandidates   AI가 제안한 수
savedCandidates      검증을 통과해 저장된 수
rejectedUngrounded   원문 대조 실패로 폐기된 수
skippedDuplicates    중복으로 건너뛴 수
```

---

## AI-3. 공식문서 RAG 질의응답

| 항목 | 내용 |
| --- | --- |
| **기능 ID** | AI-3 (FR-4xx 계열) |
| **입력** | 프로필 세션, 상품 ID, 조건 키, 자연어 질문, `topK` |
| **출력** | 근거 인용이 포함된 답변 + 검색된 공식 문서 목록(제목·본문·URL·확인일) |
| **임베딩** | FastEmbed `intfloat/multilingual-e5-small` (384차원 다국어) |
| **벡터 저장소** | ChromaDB |
| **API** | `POST /api/rag/answer` |

### 처리 규칙

- **승인된 공식 Source만** 색인한다. 검수 전 자료는 검색 대상에서 제외
- 상품·Rule 메타데이터로 검색 범위를 **필터링**해 다른 상품의 근거가 섞이지 않게 한다
- 검색 결과가 없으면 **답을 생성하지 않고** "현재 등록된 공식 자료만으로는 확인할 수 없다"고 답한다
- 답변에 **인용 번호**와 원문 링크·확인일을 함께 제시한다
- 프롬프트 인젝션(시스템 지침·판정 결과·신뢰 기준 변경 요구)은 차단하고 `PROMPT_INJECTION_BLOCKED`를 반환한다
- 인사말·의미 없는 질의는 RAG를 타지 않고 `NON_RAG_CONVERSATION_RESPONSE`로 처리한다
- Backend 기동 시 색인이 **자동 동기화**된다 (`RagIndexLifecycle`)

### 평가 결과

48케이스 · 6개 언어 · 답변불가 6건 포함 데이터셋 기준.

| 지표 | 개선 전 | 개선 후 |
| --- | --- | --- |
| 인용 정확도 | 0.44 | **0.95** |
| 정밀도 | 0.40 | **0.79** |

### 화면

- 상품 상세 → "공식 금융문서에 질문하기" 패널
- 빠른 질문 버튼 3종, 조건 선택, 자유 질문 입력
- 답변 아래에 검색된 공식 근거 카드(제목·본문 발췌·기관·확인일·원문 링크)

---

## AI-4. 판정 결과의 쉬운 설명 · 다음 행동 · 은행 문의문

| 항목 | 내용 |
| --- | --- |
| **기능 ID** | AI-4 (AI-201~204 계열) |
| **입력** | Eligibility 판정 결과, Access 판정 결과, 조건 상세, 용어 키, RAG 컨텍스트 (**모두 구조화된 값**) |
| **출력** | 쉬운 설명, 다음 행동 목록, 면책 문구, 쉬운 용어 풀이, 은행 문의문, 적용 Guardrail 목록 |
| **API** | `POST /api/ai/explanation` |

### Guardrail (응답에 함께 반환)

기본 13종이 항상 적용되고, OpenAI 실호출이 성공하면 2종이 추가되어 **15종**이 된다.

| Guardrail | 의미 |
| --- | --- |
| `ELIGIBILITY_RESULT_IMMUTABLE` | 판정 결과를 변경할 수 없음 |
| `NO_APPROVAL_GUARANTEE` | 가입 승인을 보장하지 않음 |
| `STRUCTURED_NUMBERS_ONLY` | 숫자는 구조화 입력만 사용 |
| `STRUCTURED_VISA_CODE_ONLY` | 비자코드는 구조화 입력만 사용 |
| `UNKNOWN_REQUIRES_CONFIRMATION` | 불명 조건은 확인 필요로 표시 |
| `LLM_HAS_NO_ELIGIBILITY_DECISION_AUTHORITY` | **LLM에 자격 결정 권한 없음** |
| `NO_FOREIGNER_INELIGIBILITY_INFERENCE` | 외국인이라는 이유로 불가 추론 금지 |
| `NO_REAL_NAME_FOREIGNER_ACCESS_INFERENCE` | 실명확인 가능 여부 임의 추론 금지 |
| `NO_UNSOURCED_VISA_RULE` | 근거 없는 비자 조건 생성 금지 |
| `NO_UNSOURCED_CHANNEL_AVAILABILITY` | 근거 없는 채널 가능 여부 생성 금지 |
| `NO_APPROVAL_PROBABILITY` | 승인 확률 생성 금지 |
| `NO_CREDIT_SCORE_INFERENCE` | 신용점수 추론 금지 |
| `NO_INTERNAL_REVIEW_INFERENCE` | 은행 내부심사 결과 추론 금지 |
| `OPENAI_RESPONSES_API` | OpenAI Responses API 실호출 성공 |
| `OPENAI_STRUCTURED_OUTPUT` | JSON Schema strict 구조화 출력 적용 |

### 장애 대응 (Fallback)

AI Service 또는 OpenAI 호출이 실패하면 **결정론적 템플릿**으로 자동 전환된다. 이때도 다음이 유지된다.

- **Rule Engine 판정 결과는 그대로** — LLM과 무관하게 산출되기 때문
- 설명·다음 행동·용어 풀이·은행 문의문이 **6개 언어 템플릿**으로 제공된다
- 적용 Guardrail은 13종으로 반환되어, 실호출 여부를 응답만 보고 구분할 수 있다

### 은행 문의문

`EXTERNAL_CHECK` 또는 `UNKNOWN` 조건이 있을 때 생성된다.

- 한국어 원문 + 사용자 언어 번역을 **쌍으로** 반환
- 사용자가 **입력한 사실**(체류자격, 비자 잔여기간, 국내 체류기간)과 **확인 요청**만 포함
- 확인이 필요한 항목 목록(`confirmationItems`)을 함께 구조화

---

## AI-5. 창구 준비 패킷 — 대사 생성

| 항목 | 내용 |
| --- | --- |
| **기능 ID** | AI-5 |
| **화면** | `/products/{id}/packet` — 사이트 내비게이션이 제거된 전체화면, 인쇄 지원 |
| **AI 관여** | **제한적.** 문장 골격은 검수된 템플릿, AI는 번역과 쉬운 말 다듬기만 |

### 구성

| 섹션 | 내용 | 데이터 출처 |
| --- | --- | --- |
| 1. 챙겨갈 서류 | 공식필수 / 상황별 / 은행확인 3분류, 체크박스 | 공식 Source 기반 Guidance |
| 2. 창구에서 보여줄 문장 | 한국어 크게 + 모국어 번역, 전체화면 표시 버튼 | AI-4 은행 문의문 |
| 3. 은행원과 주고받을 대화 | 내가 확인 요청할 것 + **은행원 예상 질문과 답변 선택지** | 조건 키 기반 카탈로그 |
| 4. 공식 신청 절차 | STEP · 채널 | 공식 Source |
| 5. 공식 근거 | Source URL · 확인일 · 신청 페이지 | 공식 Source |

### 안전 제약 — 사용자를 대신해 주장하지 않는다

대사에 허용되는 문장은 두 종류뿐이다.

| 종류 | 허용 | 예시 |
| --- | --- | --- |
| 사실 진술 | ○ | "저는 E-9 비자이고 국내 체류 24개월입니다" (사용자가 입력한 값만) |
| 질문·요청 | ○ | "이 상품 신청에 필요한 서류를 알려주시겠어요?" |
| **자격 주장** | **✕** | ~~"조건을 충족합니다"~~ ~~"가입 가능합니다"~~ |

자격 판단은 금융기관의 권한이며, 시스템이 외국인 입으로 대신 주장하게 만드는 것은 위험하다. 이 제약은 **자동 테스트로 강제**되어, 금지 표현이 어떤 언어에든 들어가면 빌드가 실패한다.

### 서류명 표기 원칙

번역만 남기지 않고 **한국어를 병기**한다.

```
Residence card (외국인등록증)
Passport (여권)
```

관공서와 창구에서 **한국어 이름으로 요청하고 제출해야** 하기 때문이다.

### 대화 카탈로그 구성

| 종류 | 수 | 내용 |
| --- | --- | --- |
| 기본 질문 | 5 | 외국인등록증 · 여권 · 휴대전화 본인인증 · **거래목적** · 재직 여부 |
| 조건 연동 질문 | 6 | 상품이 해당 Rule을 가질 때만 노출 (`VISA_TYPE`, `RESIDENCY_MONTH` 등) |
| 확인 요청 문장 | 5 | `EXTERNAL_CHECK` / `UNKNOWN` 조건을 실제로 말할 수 있는 한국어 질문으로 변환 |

「어떤 용도로 사용하실 건가요?」는 조건에서 유도되지 않지만, 대포통장 방지 절차상 은행이 반드시 묻고 외국인이 가장 많이 막히는 지점이라 기본 질문에 포함했다.

---

## AI 관련 비기능 요구사항

| 항목 | 내용 |
| --- | --- |
| **다국어** | 6개 언어(ko/en/vi/zh/ja/th). 판정 메시지·서류명·신청절차·창구 대사 포함. 배포본 11개 상품 전수 검사에서 **미번역 문자열 0** |
| **개인정보** | 여권번호·외국인등록번호·계좌번호를 수집하지 않음. 프로필은 24시간 후 자동 만료. OpenAI 호출 시 `store=false` |
| **가용성** | AI Service 장애 시 결정론적 Fallback. Rule Engine 판정은 영향 없음 |
| **추적성** | 모든 판정에 원문 인용문·페이지·섹션·Source URL·확인일 연결 |
| **변경 감지** | 공식 원문의 SHA-256 해시 변경 시 재검수 대상으로 표시하고 사용자 화면에 고지 |
| **보안** | `/internal/**` 외부 차단(404), 관리자 익명 접근 401, HTTPS 보안 헤더 5종 |

## 검증 현황

| 항목 | 결과 |
| --- | --- |
| 자동 테스트 | Backend 87 · AI Service 61 · E2E 20 = **168건** |
| RAG 평가 | 48케이스 · 6개 언어 · 인용 정확도 0.95 · 정밀도 0.79 |
| 공개 URL 전수 검증 | 상품 11개 상세 전부 정상, 공식 링크 10개 전부 접근 가능 |
| Demo A~E 재현 | 5/5 통과 (자동 스크립트) |
| 다국어 답변 | 5개 언어 실호출 검증 통과 (한글 혼입 0) |
| 모바일 | 360px 가로 스크롤 0px |

상세 근거: [production-verification-2026-08-30.md](production-verification-2026-08-30.md)
