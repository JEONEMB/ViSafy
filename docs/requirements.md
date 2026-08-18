# MVP Requirements

기능명세서 v0.2를 구현 작업 단위로 추적하기 위한 문서입니다. 상세 요구사항의 단일 기준은 루트 기능명세서입니다.

## Phase 1 — Skeleton

- [x] ENV-001 Git 협업 구조와 공통 설정
- [x] ENV-002 Next.js 개발환경 및 `/health` 화면
- [x] ENV-003 Spring Boot 개발환경 및 `GET /api/health`
- [x] ENV-004 FastAPI 개발환경 및 `GET /health`
- [x] ENV-005 Frontend, Backend, AI Service, MySQL 통합 Compose

## 후속 구현 순서

1. Phase 0 데이터 실현 가능성 검증
2. DB 및 관리자 Source/Rule 최소기능
3. 승인된 Rule만 사용하는 Eligibility Engine
4. 사용자 프로필과 결과 Dashboard
5. Source 기반 RAG, 설명, 번역, Unknown Resolver

## DATA-001~006 / FR-101~103 진행 상태

- [x] 공식 도메인 allowlist 기반 Source 등록
- [x] Snapshot 및 content hash 보존
- [x] Rule Candidate 저장 계약과 관리자 입력 화면
- [ ] LLM 기반 Rule Candidate 자동 추출
- [x] Source 및 Rule Human Verification
- [x] 충돌 Rule의 `NEED_REVIEW` 전환
- [x] 최근 검증일·유효기간·상태 표시
- [x] 24시간 임시 금융 프로필과 지원 비자 목록
- [x] P0 언어(한국어·영어·베트남어) 선택, 유지 및 프로필 전체 번역

가입 가능성을 보장하거나 확률로 표현하지 않으며, 불명확한 조건은 `UNKNOWN`으로 유지합니다.
