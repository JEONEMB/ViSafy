# SSAFIN Season 3 MVP 남은 작업

> 갱신일: 2026-08-28
>
> 기준 커밋: `c8088d6`
>
> 목표: 2026 금융 AI Challenge 공개 심사 전에 실제로 남은 작업만 관리한다.

## 1. 현재 완료 기준선

다음 항목은 구현과 데이터 반영이 끝났으므로 남은 작업에서 제외한다.

- 일반상품 5개 및 외국인 특화상품 통합 조회
- Season 3 READY 8개와 3개 금융기관 데이터
- 특화상품 3개의 확인 가능한 Access Evidence 반영
- 근거가 불충분한 항목을 `UNKNOWN` 또는 `INSUFFICIENT_INFORMATION`으로 유지하는 Guardrail
- Demo A~E 실제 Product Code·대표 Profile·기대 결과 고정
- 3분 시연 순서와 핵심 메시지 작성
- 다국어 Semantic Embedding 적용
- OpenAI Responses API와 안전한 템플릿 Fallback 연결
- LLM Rule Candidate 제안과 원문 대조 검증
- `contentHash` 변경 감지 및 사용자용 변경 안내 배지
- Backend 회귀 테스트 85건 통과

`SHINHAN-SOL-GLOBAL-JEONSE`의 근거 부족은 미완성 데이터가 아니라 Demo E에서 보여줄 의도된 안전 결과다. 직접 상품설명서가 추가 확보되기 전에는 시스템이 가입 가능 여부를 추정하지 않는다.

---

## 2. P0 — 공개 제출 전 필수

### P0-1. 공개 HTTPS 배포와 운영 Secret 교체

현재 유일한 외부 공개 블로커다.

- [ ] 공개 Linux 서버 또는 배포 플랫폼 준비
- [ ] 도메인과 DNS 연결
- [ ] Caddy를 통한 HTTPS 인증서 발급 확인
- [ ] Frontend·Backend·AI Service·MySQL 운영 구성 기동
- [ ] `RAG_INTERNAL_TOKEN`을 긴 무작위 값으로 교체
- [ ] `ADMIN_PASSWORD` 교체 및 기본 관리자 비밀번호 제거
- [ ] `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD` 교체
- [ ] OpenAI Key를 저장소가 아닌 운영 Secret으로 설정
- [ ] `.env`가 Git 추적 대상이 아닌지 재확인
- [ ] 운영 CORS를 제출 도메인으로 제한
- [ ] `/internal/**` 및 AI Service 직접 외부 접근 차단
- [ ] 관리자 HTTP Basic이 HTTPS 밖으로 노출되지 않는지 확인
- [ ] 운영 DB와 RAG 색인 백업 경로 설정
- [ ] Health Check와 장애 모니터링 구성
- [ ] 2026-09-07 11:00부터 2026-09-11 23:59까지 URL 유지

배포 절차는 [`production-deployment.md`](production-deployment.md)를 따른다.

### P0-2. 공개 환경 실호출 및 E2E 검증

- [ ] 공개 URL에서 OpenAI Responses API 성공 호출 1회 재검증
- [ ] 성공 응답과 Guardrail 정보를 캡처해 제출 증빙으로 보관
- [ ] 새 브라우저에서 언어 선택 → Profile → 추천 → 상품 상세 전체 흐름 확인
- [ ] Demo A~E를 공개 URL에서 각각 재현
- [ ] Demo 화면 캡처 보관
- [ ] 모든 Demo의 공식 Source 링크가 실제로 열리는지 확인
- [ ] Demo 결과와 공식 원문을 사람이 최종 대조
- [ ] 모바일 화면에서 가로 스크롤과 핵심 CTA 가림 여부 확인
- [ ] 심사 기간 가용성 점검 방법과 담당자 기록

### P0-3. 최종 회귀 테스트

- [x] Backend 전체 테스트 85건 통과
- [x] AI Service 전체 테스트 51건 통과
- [x] Next.js production build 통과
- [x] Playwright E2E 10건 통과
- [x] 한국어·영어·베트남어·중국어·일본어·태국어 핵심 흐름 확인
- [x] Source Conflict 자동 선택 금지 확인
- [x] 만료 Rule 평가 제외 확인
- [x] 다른 상품 Source의 RAG 혼입 금지 확인
- [x] LLM이 Eligibility·Access 상태를 변경하지 않는지 확인
- [x] Prompt Injection과 가입 보장 표현 차단 확인

2026-08-28 로컬 Release Candidate 기준 결과다. 공개 배포 후에는 같은 회귀 세트와 Demo A~E를 공개 URL에서 한 번 더 실행한다.

### P0-4. 제출 문서 최종 동기화

- [ ] README에 실제 공개 HTTPS URL 추가
- [ ] 관리자 운영 방법과 비상 복구 절차 추가
- [ ] 기능명세서·README·UI의 상품 수와 READY 상태 일치 확인
- [ ] 실제 OpenAI 호출 캡처와 Demo 캡처의 보관 위치 기록
- [ ] 기획서에서 Rule Engine·Access Model·RAG·LLM 역할을 실제 구현과 동일하게 표현

---

## 3. P1 — 제출 매력도와 운영 품질

P0를 지연시키지 않는 범위에서 수행한다.

### P1-1. 승인 Source 기반 RAG 품질 리포트

- [ ] 고정 Demo 상품별 대표 질문 5개를 최종 검수
- [ ] 질문별 기대 승인 Source ID 지정
- [ ] 언어별 Top-K Source 포함률 측정
- [ ] 다른 상품 Source 혼입률 측정
- [ ] Source 인용 정확성과 숫자·Visa·금액 무결성 측정
- [ ] 근거 없는 질문의 안전 차단률 측정
- [ ] 결과를 발표자료용 한 장 표로 정리

### P1-2. 문서 수집 자동화

- [ ] 은행별 HTML 본문 추출기
- [ ] PDF Text Extraction과 페이지 번호 보존
- [ ] 스캔 PDF OCR 및 품질 검수
- [ ] Source 정기 수집 스케줄러
- [ ] 변경 Source 관리자 알림과 재검수 Workflow
- [ ] 증분 재색인과 삭제 문서 반영

### P1-3. 운영 관측성

- [ ] 관리자 화면에 색인 실행 이력·실패 문서·Chunk 수 표시
- [ ] 검색·LLM 지연시간과 오류율 수집
- [ ] 개인정보를 제외한 감사 로그 보존
- [ ] 선택적으로 Sentry 등 오류 모니터링 연결

### 완료된 배포 사전 준비

- [x] 운영 Secret placeholder·길이·DB 비밀번호 일치 검증
- [x] 무작위 관리자 아이디와 숨김 OpenAI Key 입력
- [x] Caddy에서 `/internal/**`·Swagger·OpenAPI 비공개
- [x] 익명 관리자 요청 401 자동검사
- [x] MySQL·RAG 동시 백업 및 checksum manifest
- [x] 명시적 확인과 복구 전 안전 백업을 요구하는 복구 스크립트
- [x] 격리된 `ssafin-preflight` Production 이미지 Build·HTTPS 기동 리허설

---

## 4. 지금 필요한 사용자 준비

Codex가 저장소 안에서 대신 만들 수 없는 항목이다.

1. 공개 서버 또는 배포 플랫폼 계정과 접속 권한
2. 사용할 도메인과 DNS 변경 권한
3. 운영용 Secret을 보관할 안전한 장소
4. 심사 기간 장애를 확인할 담당자와 연락 수단

서버와 도메인이 준비되면 배포, Secret 적용, 공개 URL 검증은 [`production-deployment.md`](production-deployment.md) 순서로 즉시 진행한다.

---

## 5. MVP 완료 Gate

아래 항목이 모두 충족되면 `MVP complete` 커밋을 사용할 수 있다.

- [x] 일반상품과 외국인 특화상품 통합 추천
- [x] Visa Rule이 없는 상품에서 Visa 입력을 강제하지 않음
- [x] Eligibility와 Access를 분리해 표시
- [x] Identity·Branch·Mobile·필요서류 Evidence 구조
- [x] 공식 근거가 없을 때 추정하지 않음
- [x] Demo A~E 상품과 기대 결과 고정
- [x] RAG와 LLM이 Rule Engine 판정을 변경하지 않음
- [x] 다국어 Semantic Retrieval과 OpenAI Fallback
- [ ] 공개 HTTPS URL 정상 동작
- [ ] 운영 Secret 교체 완료
- [ ] 공개 URL에서 Demo A~E와 OpenAI 실호출 검증
- [x] 로컬 최종 전체 회귀 테스트 통과
- [ ] 심사 기간 가용성 유지 준비 완료

현재 상태는 **기능·데이터 구현 완료, 공개 운영 검증 대기**다. 따라서 공개 배포 검증 전에는 `MVP complete`보다 `release candidate`가 정확한 표현이다.
