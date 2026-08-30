# 공개 배포 검증 결과 (2026-08-30)

공개 URL: <https://34-64-228-103.sslip.io>

서버: Google Cloud Compute Engine · Ubuntu 24.04 LTS x86_64 · asia-northeast3
도메인: sslip.io 무료 서브도메인 · Caddy 자동 HTTPS (Let's Encrypt)

이 문서는 공개 URL에 대해 실제로 수행한 검증의 결과다. 재현 방법은 각 절에 적었다.

## 1. 공개 엔드포인트

```bash
./infra/scripts/verify-production.sh 34-64-228-103.sslip.io
```

| 항목 | 결과 |
| --- | --- |
| `GET /` | 200 |
| `GET /api/health` | 200 |
| `GET /api/health/ai` | 200 |
| `GET /api/products` | 200 (상품 11개) |
| `GET /api/admin/auth/check` 익명 | **401** 차단 |
| `GET /internal/rag/retrieve` | **404** 은닉 |
| `GET /v3/api-docs` | **404** 은닉 |
| `GET /swagger-ui/index.html` | **404** 은닉 |

HTTPS 보안 헤더 4종이 모두 응답에 존재한다.

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ... connect-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

> 검증 중 발견한 결함 하나를 고쳤다. `HealthResponse`가 `status`와 `message`만 담는 record라 Backend가 AI Service의 `llmProvider`·`llmConfigured`·임베딩 필드를 버렸다. `verify-production.sh`는 프록시된 응답에서 OpenAI Provider를 찾으므로 그 검사는 통과할 수 없는 상태였다. 필드를 전달하도록 수정했다.

## 2. 브라우저 자동 검증

```bash
E2E_BASE_URL=https://34-64-228-103.sslip.io npx playwright test e2e/live-check.spec.ts
```

| 검사 | 결과 |
| --- | --- |
| Landing에서 6개 언어 버튼 노출 | PASS |
| 상품 목록이 라이브 카탈로그를 렌더링 | PASS (11개) |
| **11개 상품 상세가 모두 열리고 패킷 진입점 노출** | PASS |
| **공식 Source·신청 URL 10개가 모두 실제로 열림** | PASS (4xx/5xx 없음) |
| 모바일 360px에서 가로 스크롤 | **0px** (Landing·목록·프로필·상세·패킷) |
| 브라우저 콘솔 오류 | 없음 |

## 3. Demo A~E 재현

```bash
python docs/evidence/demo-verification.py
```

| Demo | 확인 내용 | 실제 결과 |
| --- | --- | --- |
| A | 일반상품은 Visa Field를 요구하지 않는다 | `requiredFields=['desiredMonthlyAmount']` — `visaType`·`visaExpiry` 없음 |
| B | 일반상품과 외국인 특화상품이 함께 추천된다 | `GENERAL` + `FOREIGNER_SPECIALIZED`, 추천 5건 |
| C | 영업점과 외국인 모바일 채널을 분리한다 | `branch=AVAILABLE` / `online=UNKNOWN` |
| D | 은행 확인 조건을 숨기지 않는다 | `NEED_BANK_CONFIRMATION`, `FX_BANK_AND_E9_ENTRY_CHECK` |
| E | 공식 자료 부족을 숨기지 않는다 | `diagnosisStatus=NOT_READY`, `accessStatus=ACCESS_UNKNOWN` |

## 4. OpenAI 실호출

`POST /api/ai/explanation` (Demo D · `HANA-EZ-LOAN` · E-9 프로필)

결정론적 Fallback 문구가 아닌 생성 문장이 반환되었고, Guardrail 15개가 적용되었다.

```text
입력된 정보상 국내 거주기간, 현 직장 급여소득 기간, 체류자격 조건은 확인되었습니다.
다만 하나은행 거래외국환 지정은행 등록 여부와 E-9 최초 1회차 입국 여부는
은행 확인이 필요합니다. 영업점에서 필요서류를 지참해 확인하세요.
```

`POST /api/rag/answer` — 검색된 공식 문서를 인용해 답변한다.

```text
네. E-9 비자는 신청 대상 체류자격에 포함됩니다. 다만 E-9는 최초 1회차 입국자여야 하며,
외국인등록증 보유, 국내 거주 3개월 이상 ... 조건도 충족해야 합니다. [1]

[1] 하나 외국인 EZ Loan 공식 상세페이지 · https://www.hanabank.com/...
```

## 5. 다국어 답변

프로필 언어별로 `POST /api/ai/explanation`을 호출해 한글이 섞이지 않는지 확인했다.

| 언어 | 결과 |
| --- | --- |
| en | PASS — "You meet the confirmed requirements for visa type, length of residence..." |
| vi | PASS — "Bạn đã đáp ứng các điều kiện đã được đối chiếu..." |
| zh | PASS — "已确认的信息显示：您的居留资格、在韩居住时间..." |
| ja | PASS — "確認できた条件は満たしています。なお、ハナ銀行を取引外国為替指定銀行として..." |
| th | PASS — "คุณผ่านเงื่อนไขที่ตรวจสอบได้เกี่ยวกับระยะเวลาทำงาน..." |

## 6. 캡처 보관 위치

`docs/evidence/` 에 공개 URL에서 직접 촬영한 화면을 보관한다.

| 파일 | 내용 |
| --- | --- |
| `01-landing.png` | 언어 선택 |
| `02-products.png` | 추천·상품 목록 |
| `03-demo-a-general-product.png` | Demo A 일반상품 |
| `04-demo-c-channel-separation.png` | Demo C 채널 분리 |
| `05-demo-d-loan.png` | Demo D 대출 진단 |
| `06-demo-e-insufficient-source.png` | Demo E 자료 부족 |
| `07-bank-visit-packet.png` | 창구 준비 패킷 (전체) |
| `08-packet-mobile.png` | 패킷 모바일 390px |
| `09-teller-view-mobile.png` | 은행원에게 보여주기 화면 |

재촬영 방법:

```bash
E2E_BASE_URL=https://34-64-228-103.sslip.io npx playwright test e2e/live-capture.spec.ts
```

## 7. 아직 사람이 해야 하는 것

- [ ] Demo 결과와 공식 원문을 사람이 최종 대조 (자동화 불가)
- [ ] 실기기(휴대폰)에서 터치 조작 확인 — 자동 검증은 뷰포트 기준이다
- [ ] 심사 기간 가용성 점검 담당자와 연락 수단 확정
- [ ] 심사 기간(2026-09-07 11:00 ~ 09-11 23:59) URL 유지
- [ ] 서버에서 `backup-production.sh`를 1회 실행해 백업 묶음이 실제로 생성되는지 확인
