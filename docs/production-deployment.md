# SSAFIN 공개 배포 준비 및 운영 절차

SSAFIN은 공개 기간 전까지 로컬에서 개발하고, 공개 시점에 Linux 서버에서 동일한 Docker Compose 구성을 실행한다. 서버에서 실행되므로 개발 PC와 Docker Desktop을 꺼도 서비스는 계속 제공된다.

> 서버 선정부터 콘솔 조작까지 순서대로 따라 하는 실행 절차는 [first-deployment-runbook.md](first-deployment-runbook.md)에 있다. 이 문서는 배포 구성과 운영 정책을 정의한다.

## 권장 구성

```text
Internet
  → DNS A/AAAA Record
  → Caddy (80/443, HTTPS 자동 발급)
  → Frontend / Backend
  → AI Service / MySQL (외부 포트 미공개)
```

- Ubuntu 24.04 LTS 서버 1대
- 최소 4 vCPU, RAM 8 GB, SSD 40 GB 권장
- Docker Engine + Compose plugin
- 고정 공인 IP와 도메인
- 방화벽 공개 포트: 22, 80/TCP, 443/TCP, 443/UDP
- `mysql`, `backend`, `ai-service` 포트는 인터넷에 공개하지 않는다.

단기간 심사 운영이라도 개발 PC 기반 Tunnel보다 공개 Linux 서버를 권장한다. PC 전원, Windows 업데이트, Docker Desktop 상태에 서비스가 종속되지 않기 때문이다.

## 지금 준비할 항목

- [x] 운영 Compose override
- [x] Caddy HTTPS reverse proxy
- [x] 운영 Secret 생성 스크립트
- [x] 컨테이너 재부팅 자동 복구 정책
- [x] 배포 후 공개 Health 검증 스크립트
- [ ] Linux 서버 계정과 고정 IP 확보
- [ ] 도메인 DNS A/AAAA 레코드 연결
- [ ] 운영용 OpenAI Key 발급 또는 기존 Key 교체
- [ ] 공개 URL 브라우저 E2E

## 공개일 전 서버 준비

서버에 Git과 Docker Engine, Compose plugin을 설치하고 저장소를 복제한다.

```bash
git clone https://github.com/JEONEMB/ViSafy.git ssafin
cd ssafin
git checkout main
chmod +x infra/scripts/*.sh
```

DNS의 A 레코드는 서버의 IPv4 주소를 가리키게 한다. IPv6를 실제로 사용할 때만 AAAA 레코드를 추가한다. DNS 전파 전에는 Caddy 인증서 발급이 성공하지 않는다.

## 운영 Secret 생성

API Key를 명령행 인자로 전달하지 않는다. 아래 스크립트가 Key를 숨김 입력으로 받고 나머지 Secret을 무작위로 생성한다.

```bash
./infra/scripts/new-production-env.sh ssafin.example.com gpt-5.6-terra
```

생성되는 `.env.production`은 권한 `600`이며 Git에서 제외된다. 실제 Key나 Secret을 문서, 커밋, Docker 이미지에 넣지 않는다.

Windows에서 미리 생성할 때는 다음을 사용한다.

```powershell
.\infra\scripts\new-production-env.ps1 `
  -Domain 'ssafin.example.com' `
  -OpenAiModel 'gpt-5.6-terra'
```

API Key는 명령행 인자로 받지 않고 화면에 표시되지 않는 보안 입력으로 받는다. 생성된 관리자 아이디와 비밀번호는 모두 무작위 값이며 `.env.production`에서 확인해 비밀 관리 도구에 옮긴다.

## 서버 확보 전 로컬 Production 리허설

운영 Compose 병합, Secret 검증, 비공개 포트와 이미지 Build는 도메인 없이 미리 확인할 수 있다.

```powershell
# Secret·Compose·비공개 포트 검사
.\infra\scripts\preflight-production.ps1

# Production 이미지까지 Build
.\infra\scripts\preflight-production.ps1 -BuildImages

# 격리된 Volume과 https://localhost:8443을 사용하는 전체 기동 리허설
.\infra\scripts\preflight-production.ps1 -RunServices
```

리허설은 프로젝트 이름 `ssafin-preflight`와 별도 Volume을 사용한다. 종료 시 해당 격리 Volume만 제거하며 개발·운영 DB에는 접근하지 않는다.

## 공개 시작

DNS가 서버를 가리키는 것을 확인한 뒤 한 명령으로 빌드·실행·Health 확인을 수행한다.

```bash
./infra/scripts/deploy-production.sh
```

Caddy가 HTTPS 인증서를 자동 발급하며 다음 주소가 열려야 한다.

```text
https://YOUR_DOMAIN/
https://YOUR_DOMAIN/api/health
https://YOUR_DOMAIN/api/health/ai
```

## 업데이트

```bash
git pull --ff-only origin main
./infra/scripts/deploy-production.sh
```

MySQL 데이터와 RAG 색인은 Docker named volume에 보존된다. 운영 업데이트 전에는 DB 백업을 별도로 생성한다.

## 백업과 복구

운영 업데이트 전 MySQL과 RAG 색인을 같은 시점의 백업 묶음으로 저장한다.

```bash
./infra/scripts/backup-production.sh
```

백업은 `backups/YYYYMMDDTHHMMSSZ` 아래에 저장되며 Git에서 제외된다. SQL, RAG 압축파일, Git commit과 SHA-256 manifest가 포함된다. MySQL 백업은 애플리케이션 계정에 `PROCESS` 권한을 추가하지 않고 `--no-tablespaces`로 수행하며, RAG 압축파일은 Docker 컨테이너의 표준출력을 호스트 셸이 저장하므로 스크립트를 실행한 로그인 사용자 소유로 생성된다. 백업 파일은 해당 사용자만 읽고 쓸 수 있는 `0600`, 백업 디렉터리는 `0700`을 사용한다. 서버 Snapshot이나 별도 암호화 저장소로 한 번 더 복제한다.

복구는 현재 데이터를 교체하므로 정확한 백업 경로와 명시적 확인 문자열이 필요하다. 스크립트가 먼저 현재 상태의 안전 백업을 만든 뒤 checksum을 검증하고 복구한다.

```bash
./infra/scripts/restore-production.sh \
  backups/20260828T120000Z \
  --confirm-data-replacement
```

애플리케이션 코드 롤백은 데이터 백업 후 마지막 정상 commit을 checkout하고 동일한 배포 스크립트를 실행한다.

```bash
./infra/scripts/backup-production.sh
git fetch origin
git checkout --detach LAST_KNOWN_GOOD_COMMIT
./infra/scripts/deploy-production.sh
```

정상화 후에는 `main`으로 돌아와 fast-forward 상태를 확인한다. DB Migration이 적용된 이후의 코드 롤백은 스키마 호환성을 먼저 확인하며 Flyway 파일을 임의로 삭제하거나 되돌리지 않는다.

## 공개 URL 점검

```bash
./infra/scripts/verify-production.sh YOUR_DOMAIN
```

이 스크립트는 Frontend, Backend, AI 프록시, 상품 API, HTTPS 보안 헤더를 확인한다. 이후 실제 브라우저에서 다음 흐름을 수동 검증한다.

추가로 익명 관리자 접근 차단, `/internal/**`·Swagger/OpenAPI 비공개, OpenAI Provider 설정도 자동 확인한다.

```text
언어 선택 → 금융 목적 → Profile 저장 → 추천 → Financial Journey
→ 상품 진단 → 공식문서 질문 → 공식 Source/신청 URL 이동
```

한국어와 영어 질문에서 OpenAI 답변이 질문에 직접 응답하는지 확인하고, AI Service 장애 시에도 Rule Engine 결과가 유지되는지 확인한다.

## 운영 확인과 장애 대응

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production ps

docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production logs --tail 200 caddy backend ai-service
```

서버 재부팅 후 Docker가 자동 시작되도록 설정한다.

```bash
sudo systemctl enable --now docker
sudo reboot
```

재접속 후 `docker compose ... ps`와 공개 Health URL을 다시 확인한다. 모든 서비스에 `restart: unless-stopped`가 적용되어 Docker 시작 후 자동 복구된다.

## 공개 종료

심사 종료 후 먼저 서버 Snapshot 또는 DB 백업을 만든다. 서비스를 내릴 때 데이터 볼륨을 삭제하지 않는다.

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production down
```

`down -v`는 운영 DB와 RAG 데이터를 제거하므로 사용하지 않는다.

## MVP 완료 Gate

다음 항목을 모두 확인한 뒤에만 공개 배포 완료로 판정한다.

- 공개 HTTPS URL에서 신규 사용자 전체 흐름 성공
- 개발 PC와 Docker Desktop을 종료해도 접속 가능
- 서버 재부팅 후 자동 복구
- 운영 Secret 기본값 제거 및 Git 미추적 확인
- OpenAI Responses API 실호출과 Fallback 양쪽 검증
- PC와 모바일에서 대표 Demo A~E 확인
- 심사 기간 모니터링 담당자와 장애 대응 절차 확정
