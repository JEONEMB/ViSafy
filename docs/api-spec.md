# API Specification

Base URL: `http://localhost:8080`

## 구현됨

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/health` | Backend 상태 |
| GET | `/api/health/ai` | Backend를 통한 AI Service 상태 |

Health 응답:

```json
{ "status": "UP" }
```

## 명세상 예정 API

- Profile: `POST /api/profiles`, `GET/PUT /api/profiles/{id}`
- Products: `GET /api/products`, `GET /api/products/{id}`
- Pre-check: `POST /api/prechecks`, `GET /api/prechecks/{id}`
- Recommendations: `POST /api/recommendations`, `GET /api/recommendations/{id}`
- AI: `POST /api/ai/explain`, `POST /api/ai/inquiry-message`
- Admin: Source 등록·조회 및 Rule approve/reject/review

`POST /api/ai/chat`은 P1입니다. 추천 응답에 가입확률을 포함하지 않습니다.

