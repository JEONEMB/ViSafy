# ViSafy HTTPS 운영 배포

## 결정사항

- TLS 종료와 자동 인증서 갱신: Caddy
- 외부 공개 포트: 80, 443만 사용
- Backend, AI Service, MySQL: Docker 내부 네트워크만 사용
- 실제 LLM: OpenAI Responses API 선택, 장애 또는 무결성 위반 시 템플릿 Fallback
- Secret: `.env.production`에 생성하며 Git에서 제외

## 필요한 외부 준비

1. 공개 Linux 서버와 고정 공인 IP
2. 서버 IP를 가리키는 DNS A/AAAA 레코드
3. OpenAI Project API Key와 사용할 수 있는 모델 ID
4. 서버 방화벽에서 80/TCP, 443/TCP, 443/UDP 허용

## Secret 생성

Windows PowerShell에서 저장소 루트를 기준으로 실행한다.

```powershell
.\infra\scripts\new-production-env.ps1 `
  -Domain 'visafy.example.com' `
  -OpenAiApiKey 'YOUR_PROJECT_API_KEY' `
  -OpenAiModel 'YOUR_AVAILABLE_MODEL_ID'
```

기존 `.env.production`이 있으면 스크립트는 덮어쓰지 않고 중단한다.

## 사전 검증

```powershell
Get-Content .env.production | ForEach-Object {
  if ($_ -match '^([^#][^=]*)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') }
}
python ai-service/scripts/validate_production_config.py
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file .env.production config
```

## 배포

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production up -d --build
```

DNS가 서버를 가리킨 뒤 Caddy가 인증서를 자동 발급한다. 다음 URL을 확인한다.

```text
https://YOUR_DOMAIN/
https://YOUR_DOMAIN/api/health
```

## 아직 자동으로 완료할 수 없는 항목

- 서버 생성 및 과금 승인
- DNS 레코드 변경
- OpenAI API Key 발급과 모델 접근권한 확인
- 실제 공인 URL에서 E2E 실행

이 네 항목은 저장소 권한만으로 수행할 수 없으므로 서비스 계정 또는 사용자의 직접 설정이 필요하다.
