# SSAFIN — 공식 출처 기반 외국인 금융정착 AI Agent

**공개 URL: <https://34-64-228-103.sslip.io>**

한국에 사는 외국인이 **"나는 이 금융상품에 가입할 수 있는가"** 를 공식 문서 근거와 함께 확인하고,
**은행 창구에서 실제로 거래를 끝낼 수 있도록** 준비물과 대화까지 손에 쥐여주는 AI Agent입니다.

2026 금융 AI Challenge 제출작이며, 6개 언어(한국어·영어·베트남어·중국어·일본어·태국어)로 동작합니다.

---

## 1. 어떤 문제를 푸는가

5대 은행의 외국인 고객은 688만 명, 예금은 25조 원 규모입니다. 은행들도 외국인 전용 상품과 플랫폼을
계속 늘리고 있습니다. 그런데도 외국인 사용자가 겪는 문제는 **상품이 없어서가 아니라, 거래가 끝나지
않아서** 생깁니다.

| 진짜 병목 | 기존 서비스가 멈추는 지점 |
| --- | --- |
| 내 체류자격으로 가입이 되는지 모른다 | 상품 정보를 번역해 보여주고 끝난다 |
| 조건이 은행마다 다르고 근거를 못 찾는다 | 출처 없이 "가능할 수 있다"고 답한다 |
| 창구에 가도 무엇을 말해야 할지 모른다 | **은행 홈페이지로 링크만 넘긴다** |

특히 마지막 항목이 핵심입니다. 실사용자 검증에서 **"결국 은행사로의 리다이렉팅"** 이라는 피드백을
받았고, SSAFIN은 그 지점을 넘어서는 것을 목표로 다시 설계됐습니다.

체류자격 판단은 틀리면 비용이 가장 큰 영역이기도 합니다. 그래서 SSAFIN은 **추측하지 않는 것**을
정확도만큼 중요한 설계 목표로 둡니다. 확인할 수 없으면 `UNKNOWN`으로 남기고 금융기관 확인이
필요하다고 말합니다.

## 2. 결과물 — 은행 방문 패킷

SSAFIN의 최종 산출물은 진단 결과 화면이 아니라 **창구에서 그대로 쓸 수 있는 한 장의 준비 문서**입니다.
상품 상세에서 바로 열리며, 인쇄하거나 휴대폰으로 띄워 창구에 보여줄 수 있습니다.

| 섹션 | 내용 |
| --- | --- |
| 1. 가져갈 서류 | 공식 근거가 있는 필수·조건부·확인필요 서류. **서류명은 한국어 원문을 함께 표기**해 창구에서 그대로 통한다 |
| 2. 창구에서 보여줄 문장 | "이 상품에 가입하고 싶습니다"를 한국어와 사용자 언어로 나란히 |
| 3. 은행원과의 대화 | 은행원이 실제로 물어볼 한국어 질문 + 번역 + **내가 고를 수 있는 답변** |
| 4. 공식 신청 절차 | 검수된 신청 단계. 확인된 공식 신청 URL이 없으면 링크를 지어내지 않는다 |
| 5. 공식 근거 | 출처 문서, 정보 기준일, 최근 검증일 |

3번 대화 카드에는 안전 규칙이 하나 걸려 있습니다. **어떤 선택지도 사용자가 조건을 충족한다고
주장하게 만들지 않습니다.** 사실을 말하거나 질문을 하게 할 뿐이며, 이 규칙은 테스트로 강제됩니다.

## 3. AI가 실제로 하는 일

AI는 5개 지점에서 동작하고, **판정 권한은 어디에도 없습니다.**

| AI 기능 | 하는 일 | 안전 경계 |
| --- | --- | --- |
| 조건 후보 추출 | OpenAI가 공식 Snapshot을 읽어 가입조건 후보를 제안 | 인용문이 원문에 없거나, 원문에 없는 숫자·비자코드를 쓰거나, Rule Engine 비교 형식과 다르면 **저장 자체를 하지 않음**. 장애 시 규칙 기반 추출로 복귀 |
| 공식 Source RAG | 해당 상품의 승인·유효 Source만 6개 언어 의미 검색 | 다른 상품, 미승인·만료 Source, 비공식 도메인 배제 |
| 설명 생성 | Responses API로 쉬운 설명·다음 행동·은행 문의문 생성 | 구조화된 판정과 숫자를 **읽기 전용**으로만 사용, 실패 시 검증된 템플릿으로 복귀 |
| 상품 한정 대화 | 상품별 공식문서에 후속 질문 | 일반 투자·대출 추천 Chat으로 확장하지 않음 |
| Agent Workspace | 추천 이유와 지금 준비할 한 가지를 먼저 제시하고, 부족한 정보를 한 번에 하나씩 질문 | 답변 후 추천·Journey를 다시 계산하되 최종 승인을 보장하지 않음 |

### 판정은 AI가 하지 않는다

```text
공식 Source → LLM 조건 후보 제안 → 규칙 기반 원문 대조 검증
           → 사람의 Human Verification → Rule Engine 판정 → RAG → LLM 설명
```

**Rule Engine만 사전자격을 판정합니다.** LLM 출력 스키마에는 상태 필드가 아예 없고, Backend가
계산한 Eligibility·Access 판정은 응답 조립 단계에서 고정됩니다. OpenAI가 죽어도 진단·근거 검색·
다국어 설명은 그대로 동작합니다.

가입 확률을 계산하거나 최종 승인을 보장하지 않습니다.

## 4. 판정을 둘로 나눈 이유

가입조건을 만족하는 것과 실제로 거래할 수 있는 것은 다릅니다. SSAFIN은 이 둘을 분리해 판정합니다.

- **Eligibility** — 공개된 가입조건과 프로필의 결정론적 비교
- **Access** — 신분확인 방법, 필요서류, 영업점·모바일 채널 이용 가능성

조건은 맞는데 비대면 채널을 못 쓰는 경우, 서류가 하나 모자란 경우를 각각 다르게 안내하기 위해서입니다.
채널 근거가 하나 있다고 영업점과 모바일 둘 다 가능하다고 추론하지 않습니다.

여기에 **Financial Journey** 9단계를 얹어, 지금 상품보다 먼저 해야 할 일이 있으면 그것을 먼저
안내합니다. 국내 계좌가 없는 사용자에게 적금을 권하지 않고 입출금계좌 개설을 먼저 안내하는 식입니다.

## 5. 데이터 현황

상품 수보다 **공식 근거의 완전성**을 우선했습니다. 근거가 모자라면 의도적으로 `PARTIAL`,
`NOT_READY`로 남기고 임의의 Demo 근거로 숫자를 채우지 않습니다.

| 항목 | 값 |
| --- | ---: |
| 활성 상품 | 11개 |
| 금융기관 | 4곳 (KB국민은행·신한은행·하나은행·KB증권) |
| 일반 / 외국인 특화 | 5개 / 6개 |
| `READY` / `PARTIAL` / `NOT_READY` | 8개 / 2개 / 1개 |
| 승인·유효 공식 Source | 26개 |
| Evidence 연결률 | 100% |

`READY` 판정 기준은 상품페이지만으로 충족되지 않습니다.

```text
상품 기본정보 + 공식 상품페이지 + 상품설명서/약관
+ 승인 HARD Rule Evidence + 외국인 신분확인 Evidence
+ 가입채널 Evidence + 필요서류 Evidence + 신청절차 Evidence + 정보 기준일
```

고정 시연 시나리오 Demo A~E는 [`docs/season3-demo-manifest.md`](docs/season3-demo-manifest.md)에
상품 ID·입력·기대결과까지 고정해 두었고, 합격 기준은
[`docs/season3-demo-scenarios.md`](docs/season3-demo-scenarios.md)에 있습니다.

## 6. 기술 구성

```text
Next.js Frontend
        |
        v
Spring Boot API ---- MySQL (Source of Truth)
        |  \
        |   +---- Eligibility Engine (승인된 결정론적 Rule)
        v
FastAPI AI Service ---- 벡터 색인 (검색용, 판정 기준 아님)
```

| 영역 | 스택 |
| --- | --- |
| `frontend` | Next.js, TypeScript, Tailwind CSS, TanStack Query |
| `backend` | Java 21, Spring Boot, JPA, Flyway(V1~V24), MySQL 8.4 |
| `ai-service` | Python 3.11, FastAPI, FastEmbed(`multilingual-e5-small`), SQLite 벡터 색인 |
| `infra` | Docker Compose, Caddy 자동 HTTPS |

Flyway 마이그레이션이 상품·Source·Rule 시드를 모두 포함하므로 **빈 DB에서 시작해도 카탈로그 전체가
재현됩니다.** 백엔드 기동 시 RAG 색인도 자동 동기화됩니다.

## 7. 실행

필요한 것은 Git과 Docker Desktop뿐입니다.

```powershell
Copy-Item .env.example .env
docker compose up --build --detach --wait
```

- 메인 <http://localhost:3000>
- 시스템 상태 <http://localhost:3000/health>
- 관리자 <http://localhost:3000/admin/login>

OpenAI 설명 기능까지 쓰려면 Git에 포함되지 않는 `.env`에 아래를 넣고
`docker compose up -d --force-recreate ai-service`를 실행합니다.

```text
LLM_PROVIDER=openai
OPENAI_API_KEY=발급받은_Project_API_Key
OPENAI_MODEL=사용_가능한_Responses_API_모델_ID
OPENAI_REASONING_EFFORT=medium
```

**Key가 없어도 사전자격 진단과 공식 근거 검색은 그대로 동작하며**, 설명과 문의문은 검증된 6개 언어
템플릿으로 자동 전환됩니다.

`docker compose down`은 컨테이너만 내립니다. `down --volumes`는 저장 데이터를 삭제하므로 운영에서는
절대 사용하지 않습니다.

## 8. 검증

GitHub Actions가 푸시마다 Frontend(lint·typecheck·build), Frontend E2E, Backend, AI Service,
Compose 유효성, 전체 통합 기동을 실행합니다.

핵심 안전 요구사항은 개별 테스트로 고정돼 있습니다.

| 검증 항목 | 위치 |
| --- | --- |
| 비자 허용·거절, 체류기간 경계값 | `RuleEvaluatorTest` |
| 비공개 조건을 FAIL이 아닌 `NEED_BANK_CONFIRMATION`으로 | `EligibilityServiceTest` |
| Source 충돌 시 자동 선택 없이 `SOURCE_CONFLICT` | `EligibilityServiceTest` |
| 근거 없는 Visa·소득·기간을 답변에 생성하지 않음 | `test_specification_22.py` |
| 6개 언어에서 숫자·Visa 코드·상태 보존 | `test_specification_22.py` |
| 다른 상품 Source 혼입 배제 | `test_document_store.py` |
| 대화 선택지가 조건 충족을 주장하지 않음 | `teller-questions.spec.ts` |
| 언어 선택부터 패킷까지 전체 흐름 | `user-journey.spec.ts`, `bank-visit-packet.spec.ts` |

배포된 공개 URL에 대해서는 두 스크립트로 재현 검증합니다.

```bash
./infra/scripts/verify-production.sh 34-64-228-103.sslip.io   # 엔드포인트·차단 경로·보안 헤더
python3 docs/evidence/demo-verification.py                    # Demo A~E와 6개 언어 실제 응답
```

Demo A~E 상품 기준 6개 언어 48 케이스 RAG 평가 결과는
[`docs/season3-demo-rag-evaluation-2026-08-29.md`](docs/season3-demo-rag-evaluation-2026-08-29.md)에
있습니다.

## 9. 안전 원칙

**공식 Source가 사실의 유일한 기준이며, Human Verification을 거쳐 `APPROVED`인 것만 Runtime에서
사용합니다.**

- RAG 검색 결과가 없으면 조건을 추측하지 않고 금융기관 확인이 필요하다는 고정 안내를 반환합니다.
- 모든 진단에 최종 승인이 아니라는 면책문구를 6개 언어로 제공합니다(영어 대체 없음).
- 사용자 질문은 신뢰할 수 없는 입력으로만 취급합니다. System Prompt 공개나 지침 무시를 요구하는
  Prompt Injection은 검색 전에 차단하고, 내부 AI API는 `RAG_INTERNAL_TOKEN`으로 보호합니다.
- 벡터 검색은 `product_id` · `review_status=APPROVED` · 유효기간을 동시에 필터링하고, 반환 직전에
  공식 도메인 allowlist를 다시 확인합니다.
- 임시 프로필에는 주민등록번호·외국인등록번호·여권번호·계좌번호·카드번호 **필드 자체가 없습니다.**
  해당 형식의 값을 붙여 넣어도 Backend가 `400`으로 거부합니다.
- 프로필은 로그인 없이 UUID 세션에 묶여 **24시간 후 만료**됩니다.
- 공개 화면에는 내부 Rule Key·Operator·원시 상태코드를 노출하지 않습니다.

## 10. 현재 제한사항

- Source Snapshot은 관리자가 등록합니다. 실시간 자동 Crawling은 하지 않습니다.
- 필요서류·신청절차는 등록·조회 중심이며 수정 UI와 변경 이력은 후속 항목입니다.
- 관리자 인증은 MVP 기준 HTTP Basic입니다. 반드시 HTTPS에서 사용하며, 실서비스 전환 시 JWT
  HttpOnly 쿠키 또는 조직 SSO로 교체해야 합니다.
- `SHINHAN-SOL-GLOBAL-JEONSE`는 공식 자료가 부족해 의도적으로 `NOT_READY`입니다. Demo E가 바로
  이 "정보가 부족하면 부족하다고 말하는" 동작을 보여주는 시나리오입니다.
- 색인 이력·지연시간·오류율 관측은 제출 범위 밖입니다.

## 11. 문서

| 문서 | 용도 |
| --- | --- |
| [`submission-checklist.md`](docs/submission-checklist.md) | 제출물과 URL 가용성 준비 |
| [`submission-proposal-draft.md`](docs/submission-proposal-draft.md) | 공모전 기획서 작성안 |
| [`submission-ai-functional-spec.md`](docs/submission-ai-functional-spec.md) | AI 중심 기능명세서 작성안 |
| [`season3-demo-manifest.md`](docs/season3-demo-manifest.md) | 고정 Demo A~E 정의 |
| [`season3-demo-scenarios.md`](docs/season3-demo-scenarios.md) | Demo 합격 기준 |
| [`season3-demo-script-3min.md`](docs/season3-demo-script-3min.md) | 3분 시연 대본 |
| [`season3-demo-rag-evaluation-2026-08-29.md`](docs/season3-demo-rag-evaluation-2026-08-29.md) | RAG 품질 측정 결과 |
| [`first-deployment-runbook.md`](docs/first-deployment-runbook.md) | 첫 배포 실행 절차 |
| [`production-deployment.md`](docs/production-deployment.md) | 배포 구성과 운영 정책 |
| [`operations-runbook.md`](docs/operations-runbook.md) | 공개 기간 점검·장애 대응·복구 |
| [`production-verification-2026-08-30.md`](docs/production-verification-2026-08-30.md) | 공개 URL 검증 결과 |
| [`architecture.md`](docs/architecture.md) · [`data-policy.md`](docs/data-policy.md) | 아키텍처와 데이터 정책 |
| [`evidence/`](docs/evidence/) | 공개 URL 화면 캡처와 재현 스크립트 |

운영 Secret은 저장소에 포함하지 않습니다. `.env.production`은 생성 스크립트로 만들고 Git에서
제외합니다.
