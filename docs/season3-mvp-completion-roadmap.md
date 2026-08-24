# ViSafy Season 3 MVP 완료 로드맵

> 작성 기준: 2026-08-24  
> 목적: Season 3 최종 완료조건 15개를 모두 충족하고 2026 금융 AI Challenge 제출 가능한 상태로 만들기

## 1. 현재 상태

```text
완료: 8개
부분 충족: 5개
미충족: 2개
```

실행 데이터 기준:

```text
전체 상품: 7개
기관: 3곳
GENERAL: 0개
FOREIGNER_SPECIALIZED: 7개
Season 3 READY: 0개
Season 3 PARTIAL: 6개
완성된 Season 3 Source 패키지: 0개
```

현재 가장 큰 문제는 기능 부족보다 실제 일반상품과 Access Evidence 부족이다.

---

## 2. P0 — 제출 전 필수 작업

### P0-1. 일반 금융상품 데이터 구축

담당: 사용자 자료 수집 + 관리자 검수

- [x] 일반 입출금계좌 2개 조사 후보 선정
- [x] 일반 예·적금 3개 조사 후보 선정
- [x] 신한·하나·KB 3개 금융기관 후보 확보
- [ ] 각 상품을 `productAudience=GENERAL`로 등록
- [ ] 상품 Category 등록
- [ ] 상품 금융목적 연결
- [ ] 일반상품과 외국인 특화상품이 상품 목록에 함께 표시되는지 확인

상품별 필수 자료:

```text
공식 상품페이지 URL
상품설명서 또는 약관
상품 가입대상 원문
외국인 실명확인 안내
영업점 가입 안내
모바일·비대면 가입 안내
필요서류
신청절차
정보 기준일
```

완료조건:

- `GENERAL` 상품이 실제 API에서 5개 이상 조회된다.
- 일반상품과 외국인 특화상품을 같은 화면에서 비교할 수 있다.
- 일반상품에 Visa Rule이 없다면 Visa 질문이 나타나지 않는다.

### P0-2. Season 3 READY 패키지 완성

담당: 사용자 자료 수집 + 관리자 승인

- [ ] 상품페이지 Evidence 등록
- [ ] 상품설명서·약관 Evidence 등록
- [ ] 승인 HARD Rule Evidence 연결
- [ ] 외국인 신분확인 Evidence 연결
- [ ] Channel Evidence 연결
- [ ] 필요서류 Evidence 연결
- [ ] 신청절차 Evidence 연결
- [ ] 정보 기준일과 최근 검증일 입력
- [ ] Source Snapshot과 `contentHash` 확인
- [ ] Source와 Rule을 관리자 화면에서 승인

목표:

| 분야 | 최소 READY 수 |
|---|---:|
| 입출금계좌 | 2 |
| 일반 예·적금 | 3 |
| 외국인 특화상품 | 2 |
| 해외송금 | 1 |
| 대출 | 1 |
| 전체 | 8개 이상 |

하나의 상품이 외국인 특화상품과 예·적금 등 여러 목표에 동시에 포함될 수 있다.

### P0-3. Access Evidence 보완

담당: 사용자 자료 수집 + Codex 데이터 반영 지원

현재 누락:

```text
외국인 신분확인 Evidence: 7개 상품
Channel Evidence: 7개 상품
필요서류 Evidence: 6개 상품
```

- [ ] 외국인등록증·여권·국내거소신고증 등 사용 가능한 신분증 확인
- [ ] 신분증 안내가 가입조건인지 단순 신분확인 방법인지 분류
- [ ] 영업점 이용 가능 여부 확인
- [ ] 모바일 앱 이용 가능 여부 확인
- [ ] 비대면 이용 여부가 없으면 `UNKNOWN` 유지
- [ ] 공식적으로 확인되지 않은 채널을 `AVAILABLE`로 등록하지 않기

완료조건:

```text
Eligibility와 Access 결과가 별도 표시됨
Identity / Branch / Mobile 상태가 각각 표시됨
근거가 없으면 ACCESS_UNKNOWN
영업점만 확인되면 ACCESS_READY_BRANCH_ONLY
```

### P0-4. Demo A~E 실제 상품 고정

담당: 공동

- [ ] Demo A에 사용할 실제 일반 예·적금 선정
- [ ] Demo B에 사용할 일반상품·외국인 특화상품 쌍 선정
- [ ] Demo C에 사용할 영업점 가능·모바일 미확인 상품 선정
- [ ] Demo D에 사용할 Visa·재직·소득 Rule 대출상품 선정
- [ ] Demo E에 사용할 공식 Access 자료 부족 상품 선정
- [ ] 각 Demo의 상품 ID와 대표 Profile 고정
- [ ] Demo 결과 화면 캡처
- [ ] 공식 Source 링크가 시연 중 열리는지 확인
- [ ] Demo 결과와 공식 원문을 사람 검수

기준 문서: [`season3-demo-scenarios.md`](season3-demo-scenarios.md)

### P0-5. 3분 시연 시나리오 작성

담당: 공동

- [ ] 0:00~0:30 문제 정의와 Landing
- [ ] 0:30~1:00 언어·금융목적·준비상태 입력
- [ ] 1:00~1:30 Financial Journey와 일반·특화상품 비교
- [ ] 1:30~2:10 상품별 동적 질문과 Eligibility 결과
- [ ] 2:10~2:35 Identity·Branch·Mobile Access 결과
- [ ] 2:35~2:50 RAG 공식 근거와 Source 링크
- [ ] 2:50~3:00 은행 문의문과 최종 메시지

반드시 보여줄 메시지:

> 외국인이라고 외국인 전용상품만 이용하는 것은 아닙니다.

> ViSafy는 가입 승인을 예측하지 않고, 공개조건과 이용 경로를 공식 근거로 설명합니다.

### P0-6. 실제 AI 연결 또는 표현 조정

담당: Codex 구현 + 사용자 Provider 선택

선택지 A — 실제 LLM 연결:

- [ ] OpenAI, Gemini, Anthropic 중 하나 선택
- [ ] Provider Adapter 구현
- [ ] 검색된 공식 Context만 LLM에 전달
- [ ] Eligibility와 Access 상태는 읽기 전용으로 전달
- [ ] 구조화 숫자·금액·Visa Code 보존
- [ ] 근거가 없으면 고정 Fallback 반환
- [ ] 템플릿 설명을 장애 시 Fallback으로 유지

선택지 B — 현재 구조 유지:

- [ ] 제출 문구를 `LLM Agent`가 아닌 `공식 Source 기반 AI 금융 정착 Agent MVP`로 통일
- [ ] 현재 설명·번역·문의문이 검증 가능한 템플릿이라는 점을 명시
- [ ] RAG 검색과 Rule Engine 결합을 AI 역할의 핵심으로 설명

권장: 대회 AI 필연성을 강화하려면 선택지 A를 적용한다.

### P0-7. UI 오류 보완

담당: Codex

- [x] Visa 정보가 없는 일반상품에서 `null months`를 숨김
- [x] 비자와 무관한 UNKNOWN Rule 메시지에서 Visa 문구를 제거
- [x] 일반상품 AI 설명에서 값이 없는 Visa 카드가 나타나지 않도록 처리
- [x] `GENERAL`, `FOREIGNER_SPECIALIZED`, `POLICY` 배지 번역 적용
- [x] Access 상태값을 사용자용 쉬운 문구로 변환

### P0-8. README와 실제 상태 일치

담당: Codex

- [x] Season 2 READY 5개와 Season 3 READY 수를 별도 표기
- [x] 현재 실행 데이터 수를 다시 측정
- [x] Demo A~E 실행법 추가
- [x] 실제 LLM 사용 여부를 정확히 표기
- [ ] 공개 HTTPS 제출 URL 확정 후 실제 주소와 운영 담당자 추가

---

## 3. P1 — AI와 검색 품질 보강

### P1-1. 다국어 Semantic Embedding

- [ ] 현재 384차원 해시 Embedding을 기준선으로 측정
- [ ] 한국어·영어·베트남어 다국어 Embedding 모델 선정
- [ ] 로컬 모델 또는 외부 Embedding API 선택
- [ ] 같은 질문의 언어별 Top-K 문서 일치율 비교
- [ ] 다른 상품 Source 혼입 여부 측정

### P1-2. RAG 평가 데이터셋

- [ ] 상품별 대표 질문 5개 이상 작성
- [ ] 질문별 기대 Source 문서 지정
- [ ] Top-K 포함률 측정
- [ ] Source 인용 정확성 측정
- [ ] 숫자·Visa·금액 무결성 측정
- [ ] 근거 없는 답변 차단률 측정

### P1-3. AI Rule Candidate 추출

- [ ] 공식 문서에서 Rule Candidate 추출
- [ ] `ruleKey`, `operator`, `value`, `ruleLevel`, `ruleNature` 구조화
- [ ] Source Excerpt와 Locator 필수 반환
- [ ] 관리자 승인 전 Runtime 사용 금지
- [ ] 승인·수정·거절 이력 저장

### P1-4. 문서 처리

- [ ] PDF Text Extraction
- [ ] PDF 페이지 번호 보존
- [ ] 스캔 PDF OCR 검토
- [ ] HTML 본문 추출기 구현
- [ ] `contentHash` 변경 감지
- [ ] 변경 Source 재검수 알림

---

## 4. 운영 Secret 및 API Key

### 현재 로컬 실행

외부 API Key 없이 실행 가능하다.

### 운영 배포 전 필수 Secret

- [ ] `RAG_INTERNAL_TOKEN`을 긴 무작위 값으로 교체
- [ ] `ADMIN_PASSWORD` 교체
- [ ] `DB_PASSWORD` 교체
- [ ] `MYSQL_ROOT_PASSWORD` 교체
- [ ] Secret을 Git이 아닌 배포환경 Secret Manager에서 관리
- [ ] `.env`가 Git 추적 대상이 아닌지 확인

### 실제 LLM 연결 시

다음 중 하나만 선택한다.

```text
OPENAI_API_KEY + OPENAI_MODEL + OPENAI_REASONING_EFFORT
GEMINI_API_KEY + GEMINI_MODEL
ANTHROPIC_API_KEY + ANTHROPIC_MODEL
```

현재 범용 설정인 `LLM_API_KEY`, `LLM_MODEL`을 사용할 경우 Provider Adapter가 필요하다.

### 선택 항목

- [ ] 외부 Embedding API Key
- [ ] OCR API Key
- [ ] 오류 모니터링용 Sentry DSN
- [ ] 배포 플랫폼 Token 또는 Service Account

은행 API, Open Banking, MyData API Key는 현재 MVP에 필요하지 않다.

---

## 5. 배포와 보안

- [ ] Frontend 공개 HTTPS URL 배포
- [ ] Backend 공개 또는 내부 HTTPS URL 구성
- [ ] MySQL 운영 DB 구성
- [ ] AI Service와 Backend 내부 통신 제한
- [ ] `/internal/rag/**` 외부 접근 차단
- [ ] 운영 CORS Domain 설정
- [ ] 기본 관리자 계정 제거
- [ ] HTTP Basic을 HTTPS로 보호
- [ ] 가능하면 HttpOnly Cookie 기반 관리자 인증으로 교체
- [ ] 운영 DB와 ChromaDB 백업 설정
- [ ] Health Check와 장애 모니터링 구성
- [ ] 심사 기간 동안 URL 유지

`ADMIN_JWT_SECRET`은 현재 설정만 존재하고 실제 JWT 인증에는 사용되지 않는다. JWT를 구현하지 않는다면 혼동되지 않도록 제거하거나 README에 미사용 상태를 명시한다.

---

## 6. 최종 회귀 테스트

- [ ] Backend 전체 테스트 통과
- [ ] AI Service 전체 테스트 통과
- [ ] Next.js production build 통과
- [ ] Playwright E2E 통과
- [ ] Demo A 일반상품에서 Visa 질문 없음
- [ ] Demo B 일반·특화상품 동시 표시
- [ ] Demo C Branch AVAILABLE / Mobile UNKNOWN
- [ ] Demo D Visa Rule에 따른 동적 입력
- [ ] Demo E ACCESS_UNKNOWN과 은행 확인 안내
- [ ] 한국어·영어·베트남어 핵심 값 동일
- [ ] Source Conflict 자동 선택 금지
- [ ] 만료 Rule 진단 제외
- [ ] RAG 다른 상품 Source 혼입 금지
- [ ] LLM이 Eligibility·Access 상태를 변경하지 않음
- [ ] 모바일 화면 가로 스크롤 없음

---

## 7. 역할별 다음 업무

### 사용자가 먼저 준비할 것

1. 일반 입출금계좌 2개와 일반 예·적금 3개 선정
2. 상품별 공식 페이지·상품설명서·약관 URL 수집
3. 외국인 실명확인 공식 안내 수집
4. 영업점·모바일 Channel 공식 안내 수집
5. 필요서류·신청절차 공식 원문 수집
6. LLM Provider 선택 및 API Key 발급 여부 결정
7. 배포 플랫폼 결정

자료를 전달할 때 상품마다 다음 표를 작성한다.

| 항목 | 내용 |
|---|---|
| 기관 |  |
| 상품명 |  |
| Product Audience | GENERAL / FOREIGNER_SPECIALIZED / POLICY |
| Product Category |  |
| 공식 상품페이지 |  |
| 상품설명서·약관 |  |
| 가입대상 원문 |  |
| 신분확인 원문 |  |
| 영업점 안내 |  |
| 모바일 안내 |  |
| 필요서류 |  |
| 신청절차 |  |
| 정보 기준일 |  |

### Codex가 처리할 것

1. 전달받은 공식 자료의 Source·Snapshot·Rule·Evidence 반영
2. 일반상품 Dataset과 Demo A~E 고정
3. `null months`와 비자 무관 UNKNOWN 메시지 수정
4. 선택한 LLM Provider Adapter 구현
5. 다국어 Embedding 또는 Retrieval 평가 구현
6. README와 제출 Demo 문서 갱신
7. 전체 테스트·배포 검증

---

## 8. 최종 완료 Gate

다음 조건을 모두 만족해야 Season 3 MVP를 완료로 선언한다.

- [ ] 일반상품이 실제 추천 결과에 포함됨
- [ ] GENERAL과 FOREIGNER_SPECIALIZED를 함께 비교 가능
- [ ] Season 3 READY 8개 이상
- [ ] 완성된 Source 패키지 8개 이상
- [ ] Demo A~E가 실제 공식 상품으로 재현됨
- [ ] Identity·Branch·Mobile Evidence 표시
- [ ] Visa Rule이 없는 상품에서 Visa 입력·설명 없음
- [ ] 금융목적에서 다음 행동까지 연결
- [ ] Eligibility·Access·RAG·설명의 역할이 분리됨
- [ ] AI가 판정·확률·신용등급을 생성하지 않음
- [ ] 3분 시연 완료
- [ ] 공개 HTTPS URL 정상 동작
- [ ] 운영 Secret 교체 완료
- [ ] 기능명세서·README·UI·실제 API 상태 일치

## 9. 제출용 최종 표현

실제 LLM 또는 검증된 AI Retrieval이 연결된 뒤 다음 문구를 사용한다.

> ViSafy는 공식 금융정보와 사람이 검수한 Rule을 기반으로 국내 체류 외국인이 이용할 수 있는 일반·외국인 특화 금융서비스와 신분확인·채널·필요서류·다음 행동을 설명하는 AI 금융 정착 Agent다.

그전에는 다음 표현이 더 정확하다.

> ViSafy는 공식 Source 기반 Rule Engine과 RAG 구조를 갖춘 외국인 금융 정착 Agent MVP다.
