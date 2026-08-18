# Visa-aware Financial Agent

외국인 사용자가 공개된 금융상품 조건을 이해하고 사전자격을 점검할 수 있도록 돕는 MVP 모노레포입니다.

현재 범위는 기능명세서 v0.2의 **Phase 1 — Skeleton**입니다. Frontend, Backend, AI Service와 MySQL을 기동하고 각 서비스의 상태를 확인할 수 있습니다. 금융상품, Rule Engine, RAG 등의 비즈니스 기능은 패키지 경계만 마련되어 있습니다.

## 구성

- `frontend`: Next.js, TypeScript, Tailwind CSS, TanStack Query
- `backend`: Java 21, Spring Boot, JPA, Validation, Security, OpenAPI
- `ai-service`: Python 3.11, FastAPI, Pydantic
- `data-pipeline`: 공식 출처 등록, 스냅샷, 검증 작업 공간
- `infra`: Docker Compose 통합환경
- `docs`: API, 아키텍처, 데이터 정책, 테스트 계획

## 빠른 시작

1. `.env.example`을 `.env`로 복사하고 값을 확인합니다.
2. Docker Desktop을 실행합니다.
3. 저장소 루트에서 다음 명령을 실행합니다.

```bash
docker compose up --build
```

서비스 주소:

- Frontend: http://localhost:3000
- Frontend health: http://localhost:3000/health
- Backend health: http://localhost:8080/api/health
- Backend OpenAPI: http://localhost:8080/swagger-ui.html
- AI Service health: http://localhost:8000/health

종료하려면 `docker compose down`을 실행합니다. 데이터까지 제거하려면 삭제 범위를 확인한 뒤 별도로 볼륨을 정리하세요.

## 로컬 개발

각 서비스의 세부 명령은 해당 디렉터리의 README를 참고하세요. 기본 환경변수 계약은 [.env.example](.env.example)에 정의되어 있습니다.

## 브랜치 정책

- `main`: 배포 가능한 안정 버전
- `develop`: 다음 릴리스 통합 브랜치
- 기능 브랜치: `feature/<issue>-<summary>`
- 수정 브랜치: `fix/<issue>-<summary>`

변경은 Pull Request로 `develop`에 병합하고, 릴리스 시 `develop`에서 `main`으로 승격합니다. 최소 1인의 리뷰와 관련 테스트 통과를 권장합니다.

## 안전 원칙

공식 Source는 사실의 기준이며, Human Verification을 거쳐 `APPROVED` 상태인 Rule만 판정에 사용합니다. Rule Engine이 사전자격을 진단하고, RAG와 LLM은 근거 설명·번역·문의문 생성을 담당합니다. 확인할 수 없는 조건은 추측하지 않고 `UNKNOWN`으로 유지합니다.

