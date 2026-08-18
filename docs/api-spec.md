# API Specification

Base URL: `http://localhost:8080`

## Health

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/health` | Backend 상태 |
| GET | `/api/health/ai` | AI Service 상태 프록시 |

## Source Pipeline

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/admin/sources` | 공식 Source와 Snapshot 등록 |
| GET | `/api/admin/sources` | Source, hash, 유효기간, 검수 상태 조회 |
| PUT | `/api/admin/sources/{id}/review` | Source 승인·거절·재검토 |
| POST | `/api/admin/rule-candidates` | Rule Candidate 등록 |
| GET | `/api/admin/rule-candidates` | 후보와 검수 상태 조회 |
| PUT | `/api/admin/rules/{id}/review` | 승인·수정승인·UNKNOWN·거절 |

Source review body:

```json
{ "reviewStatus": "APPROVED" }
```

Rule review body:

```json
{ "action": "APPROVE" }
```

허용 action은 `APPROVE`, `APPROVE_WITH_CHANGES`, `MARK_UNKNOWN`, `REJECT`입니다. Source가 먼저 `APPROVED`여야 Rule 승인 계열 action을 실행할 수 있습니다.

## Profile

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/profiles` | 24시간 임시 프로필 생성 |
| GET | `/api/profiles/{id}` | 임시 프로필 조회 |
| PUT | `/api/profiles/{id}` | 임시 프로필 수정·만료 연장 |
| GET | `/api/visas` | 지원 비자 마스터 조회 |

## 예정 API

- Products: `GET /api/products`, `GET /api/products/{id}`
- Pre-check: `POST /api/prechecks`, `GET /api/prechecks/{id}`
- Recommendations: `POST /api/recommendations`, `GET /api/recommendations/{id}`
- AI: `POST /api/ai/explain`, `POST /api/ai/inquiry-message`

추천 응답에는 가입 확률을 포함하지 않습니다.
