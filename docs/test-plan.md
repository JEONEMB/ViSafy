# Test Plan

## Skeleton

- Frontend typecheck 및 production build
- Backend `GET /api/health`와 AI health proxy controller test
- AI Service `GET /health` test
- `docker compose config` 유효성 및 서비스 dependency 확인

## 후속 핵심 시나리오

- TEST-101 Rule unit test
- TEST-102 경계값 test
- TEST-103 hallucination 차단
- TEST-104 다국어 의미 일관성
- TEST-105 metadata-filtered RAG retrieval
- TEST-107 Unknown condition
- TEST-108 Source conflict
- TEST-109 Source missing
- TEST-110 번역 숫자 보존
- TEST-111 만료 Rule 제외

E2E는 언어 선택 → 프로필 → 상품 진단 → 근거 Dashboard → 문의문 생성 흐름을 검증합니다.
