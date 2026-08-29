# SSAFIN 첫 배포 실행 매뉴얼 (심사 공개용)

이 문서는 배포 경험이 없는 상태에서 순서대로 따라 하면 공개 HTTPS URL이 나오도록 만든 실행 절차다.
배포 원리와 운영 정책은 [production-deployment.md](production-deployment.md)에 있고, 이 문서는 그 문서를 실제로 실행하는 방법만 다룬다.

## 결론: 어떤 조합으로 배포하는가

```text
Google Cloud 무료 체험 ($300 / 90일)
  → Ubuntu 24.04 LTS · x86_64 · e2-standard-4 (4 vCPU / 16 GB)
  → 고정 외부 IP
  → 도메인 없이 <IP>.sslip.io
  → Caddy 자동 HTTPS (Let's Encrypt)
  → 서버비 0원 (크레딧 차감), 도메인비 0원
```

### 왜 이 조합인가 (SSAFIN 기준 근거)

| 판단 | SSAFIN에서의 근거 |
| --- | --- |
| **x86_64를 쓴다 (ARM 아님)** | `deploy-production.sh`는 서버에서 4개 이미지를 **직접 Build**한다. ai-service는 `fastembed`(ONNX Runtime), backend는 Maven, frontend는 Next.js Build를 서버에서 수행한다. 지금까지 모든 Build·Test는 amd64에서만 검증했다. ARM에도 대응 Wheel이 존재할 가능성은 높지만, **검증되지 않은 아키텍처를 배포 당일에 처음 시험하는 것**이 첫 배포에서 가장 큰 리스크다. |
| **RAM 16 GB** | 권장 사양은 4 vCPU / 8 GB지만, 서버에서 Next.js와 Maven Build를 동시에 수행하므로 Build 순간 메모리 여유가 필요하다. 16 GB면 swap 설정 없이 진행된다. |
| **디스크 50 GB** | 4개 이미지 + Build 캐시 + MySQL 볼륨 + RAG 색인 기준. 기본 10 GB로는 Build 도중 실패한다. |
| **sslip.io** | 도메인 구매 없이 IP 기반 서브도메인으로 Caddy가 Let's Encrypt 인증서를 발급받을 수 있다. `infra/Caddyfile`은 `{$VISAFY_DOMAIN}` 하나만 쓰므로 도메인 형태에 제약이 없다. |
| **DB 초기 데이터 걱정 없음** | 상품·Rule·서류·Journey 데이터는 전부 Flyway Migration(`V1`~`V24`)에 들어 있다. 빈 서버에서 기동해도 **로컬과 동일한 데이터가 재생성**된다. 로컬 DB를 옮길 필요가 없다. |
| **RAG 색인 걱정 없음** | `RagIndexLifecycle`이 Backend 기동 완료 시점에 자동으로 색인을 동기화한다. 수동 작업이 없다. |

### Oracle Cloud Always Free를 1순위로 두지 않은 이유

Oracle이 못 쓸 정도는 아니지만, **첫 배포에서 감당할 필요 없는 변수 3개**가 추가된다.

1. **ARM(Ampere A1)이다.** 위 표의 첫 번째 이유가 그대로 적용된다. FastEmbed/ONNX Runtime의 ARM 동작을 배포 당일 처음 확인하게 된다.
2. **Ampere A1 재고 부족이 흔하다.** `Out of host capacity` 로 인스턴스 생성 자체가 며칠간 안 되는 경우가 실제로 있다. 제출 마감이 걸린 일정에서 통제 불가능한 변수다.
3. **Always Free 인스턴스는 저사용량이 지속되면 회수(중지) 대상이 될 수 있다.** 심사 기간 중 트래픽이 적은 새벽에 영향을 받을 여지가 있다.

무료 체험 크레딧은 "심사 중 소진되면 꺼진다"는 우려가 있을 수 있으나, 이 프로젝트 기준 실제 비용은 **10일 운영 시 약 $35~40** 수준이라 $300 크레딧의 15% 미만이다. 크레딧 소진 리스크는 사실상 없다.

> Google Cloud 무료 체험은 **신규 계정 대상**이다. 이미 소진했다면 Oracle A1로 가되, 반드시 아래 **부록 A**의 ARM 사전 검증을 먼저 수행한다.

### 시작 전 반드시 지킬 것

- **9월 7일에 배포하지 않는다.** 늦어도 **9월 1~2일에 배포를 끝내고**, 남은 기간을 검증과 예비일로 쓴다. 첫 배포는 반드시 예상하지 못한 곳에서 한 번 막힌다.
- **OpenAI Key는 새로 발급한다.** 로컬 개발에 쓰던 Key를 그대로 운영에 넣지 않는다. 발급·폐기가 무료이고 2분이면 되므로, 운영 전용 Key를 새로 만들고 기존 Key는 폐기한다.
- **`.env.production`은 절대 커밋하지 않는다.** 생성 스크립트가 권한 600으로 만들고 Git에서 제외하지만, 내용을 다른 문서나 대화에 붙여넣지 않는다.

---

## STEP 1 — Google Cloud 계정과 VM 만들기

### 1-1. 무료 체험 시작

1. <https://console.cloud.google.com> 접속 후 Google 계정 로그인
2. 상단 **무료로 시작하기** → 국가/약관 동의 → **결제 수단(카드) 등록**
   - 본인 확인용이며 무료 체험 중에는 청구되지 않는다.
   - 크레딧 소진이나 90일 만료 시 **자동으로 유료 전환되지 않고 서비스가 중지**된다.
3. 완료되면 상단에 `무료 체험판 크레딧 $300` 배너가 보인다.

### 1-2. 프로젝트 생성

상단 프로젝트 선택기 → **새 프로젝트** → 이름 `ssafin` → 만들기 → 생성된 프로젝트를 선택.

### 1-3. VM 인스턴스 생성

좌측 메뉴 **Compute Engine → VM 인스턴스** → (처음이면 `Compute Engine API 사용 설정` 클릭, 1~2분 소요) → **인스턴스 만들기**

아래 값으로 설정한다. **명시되지 않은 항목은 기본값을 그대로 둔다.**

| 항목 | 값 | 이유 |
| --- | --- | --- |
| 이름 | `ssafin-prod` | |
| 리전 | `asia-northeast3 (서울)` | 심사위원 접속 지연 최소화 |
| 영역 | `asia-northeast3-a` | |
| 머신 계열 | **범용** → **E2** | |
| 머신 유형 | **e2-standard-4** (4 vCPU / 16 GB) | 서버 내 Build 수행 |
| 부팅 디스크 | **변경** 클릭 → 운영체제 `Ubuntu` / 버전 **`Ubuntu 24.04 LTS (x86/64)`** / 디스크 유형 `균형 있는 영구 디스크` / 크기 **`50` GB** | **x86/64 표기 확인 필수.** `arm64` 버전을 고르면 안 된다 |
| 방화벽 | **`HTTP 트래픽 허용`**, **`HTTPS 트래픽 허용`** 둘 다 체크 | 80/443 개방 (Caddy 인증서 발급에 필수) |

**만들기** 클릭. 1분 내 생성된다.

### 1-4. 외부 IP를 고정으로 승격

기본 외부 IP는 임시(ephemeral)라 재부팅 시 바뀔 수 있다. IP가 바뀌면 sslip.io 도메인도 바뀌고 **HTTPS와 Frontend를 전부 다시 빌드해야 하므로 반드시 고정한다.**

좌측 메뉴 **VPC 네트워크 → IP 주소 → 외부 IP 주소**
→ `ssafin-prod` 행의 **유형**을 `임시` → **`고정`** 으로 변경 → 이름 `ssafin-ip` → 예약

**이때 표시된 외부 IP를 적어둔다.** 이후 전 과정에서 사용한다. (예시: `34.64.10.20`)

### 1-5. 도메인 결정

SSH 키 설정 없이 브라우저에서 접속할 수 있다. VM 인스턴스 목록에서 `ssafin-prod` 행의 **SSH** 버튼 클릭 → 새 창에 터미널이 열린다.

도메인은 IP의 점을 하이픈으로 바꿔 만든다.

```text
외부 IP : 34.64.10.20
도메인  : 34-64-10-20.sslip.io
```

이 값을 이 문서에서 계속 `YOUR_DOMAIN`으로 표기한다. DNS 설정은 필요 없다. sslip.io가 이 이름을 해당 IP로 자동 응답한다.

---

## STEP 2 — 서버 기본 설정

**여기부터는 STEP 1-5에서 연 브라우저 SSH 터미널에 입력한다.**

### 2-1. 패키지 업데이트와 Git 설치

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl
```

### 2-2. Docker Engine + Compose plugin 설치

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo systemctl enable --now docker
```

**여기서 터미널 창을 닫고 SSH 버튼으로 다시 접속한다.** (그룹 권한이 재로그인 후에 적용된다.)

재접속 후 확인:

```bash
docker version
docker compose version
```

두 명령이 모두 버전을 출력해야 한다. `permission denied`가 나오면 재접속이 안 된 것이다.

### 2-3. 저장소 복제

```bash
git clone https://github.com/JEONEMB/ViSafy.git ssafin
cd ssafin
git checkout main
chmod +x infra/scripts/*.sh
```

> 저장소가 비공개면 `git clone`에서 인증을 요구한다. 이 경우 GitHub에서 **Personal Access Token(classic, `repo` 권한)** 을 발급해 사용자명 자리에 계정명, 비밀번호 자리에 토큰을 입력한다.

---

## STEP 3 — 운영 Secret 생성

### 3-1. OpenAI 운영 Key 발급

로컬 PC 브라우저에서 <https://platform.openai.com/api-keys> 접속
→ **Create new secret key** (이름 `ssafin-production`)
→ 생성된 `sk-...` 값을 복사해 둔다. **화면을 닫으면 다시 볼 수 없다.**
→ 기존 개발용 Key는 **Revoke** 한다.

### 3-2. Secret 파일 생성

서버 터미널에서:

```bash
cd ~/ssafin
./infra/scripts/new-production-env.sh 34-64-10-20.sslip.io gpt-5.6-terra
```

`34-64-10-20.sslip.io` 자리에 **본인의 YOUR_DOMAIN**을 넣는다.

`OpenAI Project API Key:` 프롬프트가 뜨면 Key를 붙여넣고 Enter.
**보안 입력이라 화면에 아무것도 표시되지 않는 것이 정상이다.** 붙여넣은 뒤 그냥 Enter를 누른다.

> 브라우저 SSH에서는 우측 상단 톱니 → **클립보드에 붙여넣기** 를 사용하거나 `Ctrl+Shift+V`를 쓴다.

DB 비밀번호·관리자 계정·JWT Secret·내부 토큰은 모두 무작위로 자동 생성된다.

### 3-3. 관리자 계정 확인 후 별도 보관

```bash
grep -E '^(ADMIN_USERNAME|ADMIN_PASSWORD)=' .env.production
```

출력된 아이디와 비밀번호를 **본인 비밀번호 관리 도구에 옮겨 적는다.** 관리자 화면 시연에 필요하다.

---

## STEP 4 — 배포 실행

```bash
cd ~/ssafin
./infra/scripts/deploy-production.sh
```

이 한 줄이 다음을 순서대로 수행한다.

1. Secret 검증 (`validate_production_config.py`)
2. Compose 구성 검증
3. 4개 이미지 Build (frontend / backend / ai-service + mysql·caddy pull)
4. 컨테이너 기동 → MySQL → Flyway Migration → RAG 색인 자동 동기화
5. `https://YOUR_DOMAIN/api/health` 가 응답할 때까지 최대 5분 대기

**첫 실행은 10~20분 걸린다.** Maven 의존성 다운로드, Next.js Build, ONNX Runtime 설치가 처음 수행되기 때문이다. 진행 로그가 멈춘 것처럼 보여도 기다린다.

성공하면 마지막에 다음이 출력된다.

```text
SSAFIN production deployment is healthy.
```

### 배포가 실패했을 때 확인 순서

```bash
cd ~/ssafin
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production ps

docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production logs --tail 200 caddy backend ai-service
```

| 증상 | 원인과 조치 |
| --- | --- |
| Caddy 로그에 인증서 발급 실패 | 80/443이 막혀 있다. STEP 1-3의 HTTP/HTTPS 허용 체크를 확인한다. GCP 콘솔 **VPC 네트워크 → 방화벽**에서 `default-allow-http`, `default-allow-https` 규칙 존재를 확인 |
| `backend` 가 재시작 반복 | MySQL 기동 대기 중일 수 있다. 2~3분 더 기다린 뒤 `logs backend` 확인. Flyway 오류면 로그에 Migration 파일명이 찍힌다 |
| `ai-service` 기동 지연 | 최초 1회 임베딩 모델(`multilingual-e5-small`)을 다운로드한다. 서버 외부 인터넷 접속이 필요하며 수 분 소요 |
| Build 중 `killed` / OOM | 머신 유형이 작다. e2-standard-4인지 확인 |
| `Missing .env.production` | STEP 3을 건너뛰었다 |

---

## STEP 5 — 자동 점검

```bash
./infra/scripts/verify-production.sh 34-64-10-20.sslip.io
```

다음이 모두 `PASS` 여야 한다.

- Frontend / Backend health / AI health proxy / Products API 응답
- 익명 관리자 접근 401 차단
- `/internal/**`, `/v3/api-docs`, `/swagger-ui` 404 은닉
- AI Service가 `openai` Provider 보고
- HSTS·CSP·X-Content-Type-Options·X-Frame-Options 보안 헤더

하나라도 `FAIL`이면 그 항목의 로그를 먼저 확인하고, 해결 전에는 다음 단계로 넘어가지 않는다.

---

## STEP 6 — 브라우저 수동 검증 (제출 전 필수)

로컬 PC에서 **시크릿 창**으로 `https://YOUR_DOMAIN` 접속 후 확인한다.

- [ ] 주소창에 자물쇠 표시(HTTPS 정상)
- [ ] 전체 흐름: 언어 선택 → 금융 목적 → Profile 저장 → 추천 → Financial Journey → 상품 진단 → 공식문서 질문 → 공식 Source/신청 URL 이동
- [ ] Demo A~E 5개 시나리오 재현 및 **화면 캡처 저장** ([season3-demo-scenarios.md](season3-demo-scenarios.md) 기준)
- [ ] 한국어·영어 질문에서 OpenAI 답변이 질문에 직접 응답하는지 확인 후 **캡처 저장**
- [ ] 언어 6종(ko/en/vi/zh/ja/th) 전환 시 상품명·Journey 단계·상품 카드가 해당 언어로 표시
- [ ] 공식 Source 링크와 신청 URL이 실제로 열림
- [ ] 모바일(휴대폰 실기기)에서 가로 스크롤 없이 표시
- [ ] **개발 PC와 Docker Desktop을 완전히 종료한 상태에서도 접속 가능**

### 재부팅 복구 확인

```bash
sudo reboot
```

2~3분 뒤 다시 SSH 접속하여 확인한다.

```bash
cd ~/ssafin
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production ps
curl -sSf https://YOUR_DOMAIN/api/health && echo OK
```

모든 서비스에 `restart: unless-stopped`가 걸려 있어 자동 복구되어야 한다.

---

## STEP 7 — 심사 기간 운영 (9/7 11:00 ~ 9/11 23:59)

### 하루 1회 점검

```bash
cd ~/ssafin && ./infra/scripts/verify-production.sh YOUR_DOMAIN
```

### 코드 수정을 반영할 때

```bash
cd ~/ssafin
./infra/scripts/backup-production.sh      # 먼저 백업
git pull --ff-only origin main
./infra/scripts/deploy-production.sh
```

> **심사 기간 중에는 가급적 배포하지 않는다.** 불가피한 경우에만 위 순서를 지키고, 배포 후 STEP 5를 다시 실행한다.

### 장애 시 1차 조치

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production restart backend ai-service
```

복구되지 않으면 [production-deployment.md](production-deployment.md)의 백업·복구 절차를 따른다.

### 심사 종료 후

백업을 먼저 만든 뒤 내린다. **`down -v`는 절대 쓰지 않는다** (운영 DB와 RAG 색인이 삭제된다).

```bash
./infra/scripts/backup-production.sh
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production down
```

GCP 과금을 완전히 멈추려면 콘솔에서 VM을 **삭제**한다. (중지만 하면 디스크·고정 IP 요금이 소액 남는다.)

---

## 비용 예상

| 항목 | 단가 | 10일 기준 |
| --- | --- | --- |
| e2-standard-4 (asia-northeast3) | 약 $0.15 / 시간 | 약 $36 |
| 영구 디스크 50 GB | 약 $0.10 / GB·월 | 약 $2 |
| 고정 외부 IP (사용 중) | 무료 | $0 |
| 네트워크 송신 | 심사 트래픽 수준 | $1 미만 |
| **합계** | | **약 $39 — $300 크레딧에서 차감** |

실제 청구액은 0원이다. OpenAI 사용료만 별도 계정으로 과금된다.

---

## 부록 A — Oracle Cloud Always Free를 선택했을 때

Google 무료 체험을 쓸 수 없다면 Oracle A1로 진행하되 **인스턴스 생성 직후, 배포 전에** ARM 호환성부터 확인한다.

인스턴스는 `Ampere A1 / Ubuntu 24.04 / 4 OCPU / 24 GB / 부팅 디스크 50 GB` 로 만든다. (Always Free A1 한도는 전체 A1 인스턴스 합계 기준이며, 이 프로젝트는 인스턴스 1대로 전부 사용한다.)

STEP 2까지 동일하게 진행한 뒤, **STEP 3보다 먼저** 다음을 실행한다.

```bash
cd ~/ssafin
docker build -t ssafin-ai-arm-check ./ai-service
docker run --rm ssafin-ai-arm-check python -c \
  "from fastembed import TextEmbedding; \
   m = TextEmbedding('intfloat/multilingual-e5-small'); \
   print(len(list(m.embed(['테스트'])) [0]))"
```

`384`가 출력되면 ARM에서 RAG 임베딩이 정상 동작한다. STEP 3부터 이어서 진행한다.

**실패하면 ARM에서 배포하지 않는다.** ai-service만 x86으로 분리하는 구성은 첫 배포에서 감당할 난이도가 아니다. Google Cloud 또는 다른 x86 서버로 전환한다.

Oracle은 추가로 다음 두 가지를 서버 안에서 직접 열어야 한다. (GCP와 달리 인스턴스 내부 방화벽이 기본 차단이다.)

```bash
sudo apt-get install -y iptables-persistent
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

그리고 Oracle 콘솔의 **VCN → 보안 목록**에서 `0.0.0.0/0` 대상 TCP 80, 443 수신 규칙을 추가한다. 둘 중 하나라도 빠지면 Caddy 인증서 발급이 실패한다.

---

## 부록 B — sslip.io 인증서가 발급되지 않을 때

sslip.io는 여러 사용자가 공유하는 도메인이라, 드물게 Let's Encrypt 발급 제한에 걸릴 수 있다. **배포 첫날 STEP 5에서 즉시 확인되므로 예비일이 확보된다.**

발급 실패 시 도메인을 직접 확보한다. Cloudflare Registrar 등에서 `.com` 기준 연 $10 내외이며, 다음 순서로 전환한다.

1. 도메인 구입 후 DNS에 **A 레코드**로 서버 외부 IP 등록 (전파 5~30분)
2. 서버에서 `.env.production`의 `VISAFY_DOMAIN` 값을 새 도메인으로 수정
3. `./infra/scripts/deploy-production.sh` 재실행

> `NEXT_PUBLIC_API_URL`이 Frontend 이미지에 Build 시점 값으로 박히므로, **도메인을 바꾸면 반드시 재배포(재Build)해야 한다.** 컨테이너 재시작만으로는 반영되지 않는다.
