# SSAFIN 운영·비상 복구 절차

심사 공개 기간(2026-09-07 11:00 ~ 2026-09-11 23:59) 동안 서비스를 유지하고, 장애가 났을 때 되돌리기 위한 절차다.

배포를 처음 수행하는 절차는 [first-deployment-runbook.md](first-deployment-runbook.md), 배포 구성 정의는 [production-deployment.md](production-deployment.md)에 있다.

공개 URL: <https://34-64-228-103.sslip.io>

## 자주 쓰는 명령

모든 명령은 서버의 `~/ssafin`에서 실행한다. Compose 명령이 길어서 별칭을 만들어 두면 편하다.

```bash
cd ~/ssafin
alias dc='docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file .env.production'
```

| 목적 | 명령 |
| --- | --- |
| 컨테이너 상태 | `dc ps` |
| 최근 로그 | `dc logs --tail 200 caddy backend ai-service` |
| 특정 서비스 재시작 | `dc restart backend ai-service` |
| 공개 점검 | `./infra/scripts/verify-production.sh 34-64-228-103.sslip.io` |
| Demo 재현 | `python docs/evidence/demo-verification.py` |

## 자동 복구 (watchdog)

`infra/scripts/watchdog.sh`가 공개 Health를 확인하고, 문제가 있는 서비스만 골라 재시작한다.

판정 방식은 서비스마다 다르다. `mysql`·`ai-service`·`backend`는 Compose에 healthcheck가 있어 health 상태로, healthcheck가 없는 `frontend`·`caddy`는 실행 상태로만 판정한다.

| 상황 | 조치 |
| --- | --- |
| 공개 URL 정상 + 전 서비스 정상 | `OK` 한 줄만 기록 |
| 공개 URL 정상 + 일부 서비스 비정상 | **그 서비스만** 재시작. 규칙 엔진은 계속 응답한다 |
| 공개 URL 실패 + 비정상 서비스 있음 | 해당 서비스만 재시작 후 최대 4분 회복 대기 |
| 공개 URL 실패 + 전 서비스 정상 | 서빙 경로(`caddy`, `frontend`)만 재시작 |
| 컨테이너 자체가 없음 | `up -d --no-deps --no-build`로 기동 (재빌드 없음) |
| Docker 데몬 정지 | 무암호 sudo가 가능하면 기동 시도, 아니면 조치 방법을 기록하고 종료 |

`down`, `rm`, `prune`, `-v`를 쓰지 않으므로 DB와 RAG 볼륨에 영향이 없다. 회복이 5분을 넘길 수 있어 `flock`으로 중복 실행을 막고, 로그가 5MB를 넘으면 최근 2000줄만 남긴다.

```bash
cd ~/ssafin
chmod +x infra/scripts/watchdog.sh
./infra/scripts/watchdog.sh                       # 1회 수동 실행해 OK 확인

( crontab -l 2>/dev/null;   echo "*/5 * * * * $HOME/ssafin/infra/scripts/watchdog.sh >> $HOME/ssafin/watchdog.log 2>&1" ) | crontab -
crontab -l
tail -20 ~/ssafin/watchdog.log
```

종료 코드는 정상·회복 `0`, 회복 실패 `1`, 실행 불가 `2`다.

Watchdog은 서버가 살아 있을 때만 동작한다. VM 자체가 죽는 경우를 잡으려면 GCP Monitoring의 Uptime check를 함께 건다. 설정은 [submission-checklist.md](submission-checklist.md)에 있다.

## 하루 1회 점검

```bash
cd ~/ssafin
./infra/scripts/verify-production.sh 34-64-228-103.sslip.io
python docs/evidence/demo-verification.py
```

앞의 스크립트는 공개 엔드포인트·차단 경로·보안 헤더를, 뒤의 스크립트는 Demo A~E와 6개 언어 답변을 확인한다. 둘 다 실패 시 0이 아닌 코드로 종료하므로 cron에 걸어도 된다.

## 관리자 화면

관리자 계정은 `.env.production`의 `ADMIN_USERNAME`·`ADMIN_PASSWORD`에 있고, 배포 시 무작위로 생성된 값이다. 저장소나 문서에 적지 않는다.

```bash
grep -E '^(ADMIN_USERNAME|ADMIN_PASSWORD)=' ~/ssafin/.env.production
```

| 경로 | 용도 |
| --- | --- |
| `/admin/login` | 관리자 로그인 |
| `/admin/sources` | 공식 Source 등록·검수, Rule Candidate 승인 |
| `/admin/products` | 상품 등록·수정·비활성화 |

익명 접근은 401로 차단되며 HTTPS 밖에서는 노출되지 않는다. 심사 중에는 Rule 승인·상품 변경을 하지 않는다. 승인은 `PRODUCT_RULE` 동기화와 진단 결과를 즉시 바꾸기 때문이다.

## 증상별 1차 조치

| 증상 | 원인 | 조치 |
| --- | --- | --- |
| 화면은 열리는데 데이터가 안 나옴 (`/api/*` 502) | Backend 기동 중이거나 죽음 | 2~3분 대기 후 `dc ps`. 재시작 반복이면 `dc logs backend` |
| 전체 접속 불가 (80·443 TCP 실패) | VM 중지 또는 방화벽 | GCP 콘솔에서 인스턴스 상태 → **VPC 네트워크 → 방화벽**의 `default-allow-http`·`default-allow-https` 확인 |
| AI 답변만 실패, 진단은 정상 | AI Service 또는 OpenAI 장애 | 정상 동작이다. Rule Engine 판정은 LLM과 무관하게 유지된다. `dc logs ai-service` 확인 |
| 답변이 딱딱한 정형문으로 바뀜 | OpenAI 호출 실패 → 결정론적 Fallback | `dc logs ai-service`에서 원인 확인. Key 만료·한도 초과 여부 점검 |
| HTTPS 인증서 오류 | Let's Encrypt 갱신 실패 | `dc logs caddy`. 80 포트가 막히면 갱신이 실패한다 |
| 디스크 부족 | 이미지·빌드 캐시 누적 | `docker system df` 확인 후 `docker image prune -f` |

`dc restart backend ai-service`로 대부분 복구된다. 이것으로 안 되면 아래 복구 절차로 넘어간다.

## 서버 재부팅

모든 서비스에 `restart: unless-stopped`가 걸려 있어 Docker가 시작되면 자동 복구된다.

```bash
sudo systemctl enable --now docker   # 최초 1회
sudo reboot
```

재접속 후 `dc ps`와 공개 Health URL을 확인한다.

## 백업

**운영 변경 전에는 반드시 먼저 백업한다.**

```bash
cd ~/ssafin
./infra/scripts/backup-production.sh
```

`backups/YYYYMMDDTHHMMSSZ/` 아래에 MySQL 덤프, RAG 색인 압축파일, Git commit, SHA-256 manifest가 저장된다. 디렉터리는 `0700`, 파일은 `0600`이며 Git에서 제외된다. 서버 Snapshot이나 별도 저장소로 한 번 더 복제해 둔다.

## 비상 복구

### 1단계 — 데이터는 정상, 코드만 문제

마지막 정상 commit으로 되돌린다.

```bash
cd ~/ssafin
./infra/scripts/backup-production.sh
git fetch origin
git checkout --detach LAST_KNOWN_GOOD_COMMIT
./infra/scripts/deploy-production.sh
```

정상화 후 `git checkout main`으로 돌아와 fast-forward 상태를 확인한다.

> DB Migration이 적용된 뒤의 코드 롤백은 스키마 호환성을 먼저 확인한다. Flyway 파일을 삭제하거나 되돌리지 않는다.

### 2단계 — 데이터가 손상됨

복구는 **현재 데이터를 교체**하므로 명시적 확인 문자열이 필요하다. 스크립트가 먼저 현재 상태의 안전 백업을 만든 뒤 checksum을 검증하고 복구한다.

```bash
./infra/scripts/restore-production.sh \
  backups/20260830T120000Z \
  --confirm-data-replacement
```

### 3단계 — 서버 자체를 못 쓰게 됨

DB는 Flyway `V1~V24`가 전부 재생성하므로 **백업 없이도 카탈로그는 복원된다.** 새 VM에서 [first-deployment-runbook.md](first-deployment-runbook.md)의 STEP 1~4를 그대로 수행한다.

단, **외부 IP가 바뀌면 sslip.io 도메인도 바뀐다.** `NEXT_PUBLIC_API_URL`이 Frontend 이미지에 Build 시점 값으로 박히므로, `.env.production`의 `VISAFY_DOMAIN`을 새 도메인으로 고치고 반드시 재배포(재Build)해야 한다. 제출한 URL이 바뀌므로 주최 측에 알린다.

## 절대 하지 말 것

- `docker compose ... down -v` — 운영 DB와 RAG 색인이 삭제된다
- 심사 기간 중 무근거 배포 — 불가피하면 백업 → `git pull` → 배포 → `verify-production.sh` 순서를 지킨다
- `.env.production` 내용을 문서·커밋·대화에 붙여넣기
- 관리자 화면에서 심사 기간 중 Rule 승인 또는 상품 변경

## 공개 종료

```bash
cd ~/ssafin
./infra/scripts/backup-production.sh
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production down
```

GCP 과금을 완전히 멈추려면 콘솔에서 VM을 **삭제**한다. 중지만 하면 디스크와 고정 IP 요금이 소액 남는다.
