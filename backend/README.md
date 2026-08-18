# Backend

Java 21과 Maven이 필요합니다.

```bash
mvn spring-boot:run
mvn test
```

`GET /api/health`는 Backend 상태를, `GET /api/health/ai`는 AI Service 상태를 프록시합니다. 기능 패키지는 명세의 bounded context를 기준으로 미리 분리했습니다.
