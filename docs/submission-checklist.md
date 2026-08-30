# 2026 금융 AI Challenge 제출 준비

마감: **2026-09-07(월) 10:00**
URL 유지 의무: **2026-09-07 11:00 ~ 09-11 23:59** — 접근 불가 시 **결격**

## 제출물 3종

| # | 제출물 | 형식 | 제출 위치 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 공모전 기획서 | 제공 양식 → **PDF 변환** | [제출 탭] - [공모전 기획서 제출] | 초안 작성됨 |
| 2 | 기능 명세서 | 제공 양식 → **PDF 변환** | [제출 탭] - [MVP 산출물 제출] | 초안 작성됨 |
| 3 | 웹서비스 URL | 실행 가능한 링크 | [제출 탭] - [MVP 산출물 제출] | **준비됨** |

제출 URL:

```text
https://34-64-228-103.sslip.io
```

> 초안은 아래에 있다. 양식 표의 해당 칸에 옮긴 뒤 PDF로 변환한다.
>
> - 기획서 7개 항목: [submission-proposal-draft.md](submission-proposal-draft.md)
> - AI 중심 기능명세서: [submission-ai-functional-spec.md](submission-ai-functional-spec.md)
>
> **팀명과 구성원 성명은 등록된 값으로 직접 채운다.**

## URL 가용성 — 결격 방지

접근 불가가 곧 결격이므로 다른 어떤 항목보다 우선한다.

### 확인된 사실

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| HTTPS 인증서 만료 | **2026-11-27** | 심사 종료(09-11)보다 2개월 이상 뒤. 심사 중 갱신이 일어나지 않는다 |
| 응답 시간 | 70~120ms | `/api/health` 3회 측정 |
| 컨테이너 재시작 정책 | `restart: unless-stopped` | Docker 시작 시 자동 복구 |
| GCP 크레딧 | 여유 | 10일 운영 약 $39 / $300 |
| **인스턴스 종류** | **표준 (Spot 아님)** | 2026-08-30 서버 확인 `preemptible=FALSE` |
| 디스크 | 48G 중 11G · 23% | 2026-08-30 확인 |
| 메모리 | 16G 중 13.4G 사용 가능 · Swap 없음 | 2026-08-30 확인 |
| Docker 자동시작 | `enabled` | 재부팅 후 자동 복구 |
| **Watchdog cron** | **동작 중** | 2026-08-30 05:30:02 UTC 첫 자동 실행 `OK` 기록 |

### 서버 점검 (2026-08-30 완료)

아래를 실행해 결과를 확인한다. **Spot(선점형) 인스턴스면 GCP가 임의로 종료할 수 있어 즉시 조치해야 한다.** 2026-08-30 실행 결과는 위 표에 기록했고 모두 기대값을 만족했다.

```bash
echo "=== 인스턴스 종류 (spot이면 위험) ==="
curl -s -H "Metadata-Flavor: Google" \
  http://metadata.google.internal/computeMetadata/v1/instance/scheduling/preemptible; echo
echo "=== 디스크 ==="; df -h /
echo "=== 메모리 ==="; free -m
echo "=== 컨테이너 ==="; cd ~/ssafin && docker compose \
  -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  --env-file .env.production ps
echo "=== Docker 자동시작 ==="; systemctl is-enabled docker
```

기대값:

- 인스턴스 종류 `FALSE` (선점형 아님). `TRUE`면 새 VM을 표준 인스턴스로 만들어 이전한다
- 디스크 사용률 80% 미만
- 컨테이너 5개 모두 `Up`
- Docker `enabled`

### 자동 복구 설치

`infra/scripts/watchdog.sh`가 5분마다 공개 Health를 확인하고, 비정상인 서비스만 골라 재시작한다. `down`·`rm`·`prune`·`-v`를 쓰지 않아 DB와 RAG 볼륨에 영향이 없고 재빌드도 하지 않는다. 동작 규칙은 [operations-runbook.md](operations-runbook.md)에 정리했다.

```bash
cd ~/ssafin
chmod +x infra/scripts/watchdog.sh
./infra/scripts/watchdog.sh          # 1회 수동 실행해 OK 확인

( crontab -l 2>/dev/null; \
  echo "*/5 * * * * $HOME/ssafin/infra/scripts/watchdog.sh >> $HOME/ssafin/watchdog.log 2>&1" ) | crontab -
crontab -l
```

로그 확인:

```bash
tail -20 ~/ssafin/watchdog.log
```

> Watchdog은 서버가 살아 있을 때만 동작한다. VM 자체가 죽는 경우는 아래 외부 감시로 잡는다.

### 외부 감시 (서버가 죽어도 알림)

GCP 콘솔 → **Monitoring → Uptime checks → CREATE UPTIME CHECK**

| 항목 | 값 |
| --- | --- |
| Protocol | HTTPS |
| Hostname | `34-64-228-103.sslip.io` |
| Path | `/api/health` |
| Check frequency | 5 minutes |
| Alerting | 알림 채널에 본인 이메일 등록 |

무료 한도 안에서 동작하며, 사이트가 죽으면 메일이 온다. **심사 기간에는 이게 유일한 조기 경보다.**

### 심사 기간 금지 사항

- `docker compose ... down -v` — 운영 DB와 RAG 색인 삭제
- VM 중지·삭제·머신 유형 변경
- 무근거 재배포 — 불가피하면 백업 → `git pull` → 배포 → `verify-production.sh`. Swap이 없어 재빌드 중 메모리가 몰리면 여유가 적다
- 관리자 화면에서 Rule 승인·상품 변경 (판정 결과가 즉시 바뀐다)
- **외부 IP 해제** — IP가 바뀌면 sslip.io 도메인이 바뀌어 제출 URL이 죽는다

### 매일 점검 (09-07 ~ 09-11)

```bash
cd ~/ssafin
./infra/scripts/verify-production.sh 34-64-228-103.sslip.io
python3 docs/evidence/demo-verification.py
tail -5 watchdog.log
```

---

## 기획서 내용 재료

양식의 칸 이름은 다를 수 있으나, 대부분의 기획서 양식이 요구하는 항목을 아래에 준비했다. 그대로 옮기거나 분량에 맞게 줄여 쓴다.

### 문제 정의

국내 체류 외국인이 금융에 정착할 때 막히는 지점은 두 단계다.

1. **정보 접근** — 상품 조건·필요서류·신청 절차가 한국어로만 제공된다. 번역기를 써도 "실명확인증표", "거래외국환 지정은행" 같은 용어는 의미가 전달되지 않는다.
2. **창구 실행** — 상품을 찾아내도 은행 창구에서 막힌다. 준비한 말은 보여줄 수 있지만 **은행원이 되물으면 대화가 멈춘다.** 서류가 하나 빠져 헛걸음하는 일이 반복된다.

기존 서비스는 1번만 다룬다. 그래서 결국 "은행 사이트로 보내주는 번역기"에 머문다.

### 해결 방식

SSAFIN은 공식 자료에 근거해 조건을 판정하고, 그 결과를 **창구에서 쓸 수 있는 형태로** 사용자 손에 쥐어준다.

```text
공식 Source 수집
  → LLM 조건 후보 제안
  → 원문 대조 검증 (인용문·숫자·비자코드·값 형식)
  → 사람 검수 승인
  → Rule Engine 결정론적 판정
  → RAG 근거 검색
  → LLM 설명·번역
  → 창구 준비 패킷
```

**LLM은 자격을 결정하지 않는다.** 조건 후보를 제안할 수는 있지만, 원문과 대조해 검증에 통과하고 사람이 승인한 것만 판정에 쓰인다.

### 차별점

| | 일반적 접근 | SSAFIN |
| --- | --- | --- |
| 근거 | LLM 생성 | 공식 원문 인용 + 페이지 위치 |
| 판정 | 확률·점수 | 결정론적 규칙, 충족·미충족·은행확인·불명 4분류 |
| 모르는 것 | 그럴듯하게 생성 | `UNKNOWN`으로 남기고 은행에 확인할 항목으로 정리 |
| 결과물 | 상품 링크 | **창구 준비 패킷** — 서류·한국어 문장·은행원 질문 대응 |
| 언어 | 영어 대체 | 6개 언어(ko/en/vi/zh/ja/th) 전면 |

### 핵심 기능

- 6개 언어 선택과 24시간 임시 프로필 (여권번호·등록번호·계좌번호 미수집)
- 승인된 Rule에 필요한 항목만 동적으로 질문 — 비자 조건이 없는 상품은 비자를 묻지 않는다
- 일반상품과 외국인 특화상품 통합 추천, 가입 확률 미제공
- 조건별 판정과 공식 원문 근거 표시
- 신분확인·영업점·온라인 채널을 각각 근거와 함께 판정, 근거 없으면 `UNKNOWN`
- 9단계 금융생활 여정과 다음 한 가지 행동
- 공식문서 RAG 질의응답 (근거 인용 포함)
- **창구 준비 패킷** — 서류 체크리스트, 창구용 한국어 문장, 은행원 예상 질문과 답변, 신청 절차, 공식 근거

### 기술 구성

| 영역 | 스택 |
| --- | --- |
| Frontend | Next.js · TypeScript · TanStack Query |
| Backend | Java 21 · Spring Boot · JPA · Flyway · MySQL 8.4 |
| AI Service | Python 3.11 · FastAPI · FastEmbed(`multilingual-e5-small`) · ChromaDB |
| LLM | OpenAI Responses API · Structured Output |
| 배포 | Docker Compose · Caddy 자동 HTTPS · Ubuntu 24.04 |

### 검증 결과 (수치)

| 지표 | 값 | 출처 |
| --- | --- | --- |
| RAG 인용 정확도 | 0.44 → **0.95** | [season3-demo-rag-evaluation-2026-08-29.md](season3-demo-rag-evaluation-2026-08-29.md) |
| RAG 정밀도 | 0.40 → **0.79** | 같음 |
| 평가 데이터셋 | 48케이스 · 6개 언어 · 답변불가 6건 포함 | `ai-service/evaluation/` |
| 자동 테스트 | Backend 87 · AI Service 61 · E2E 20 | CI 없이 로컬·Docker 실행 |
| 공개 URL 검증 | 상품 11개 전수, 공식 링크 10개 전부 접근 가능 | [production-verification-2026-08-30.md](production-verification-2026-08-30.md) |
| 다국어 완전성 | 미번역 문자열 **0** (11개 상품 전수 자동 검사) | 같음 |
| 모바일 | 360px에서 가로 스크롤 **0px** | 같음 |

### 한계와 다음 단계

정직하게 적는 편이 유리하다. 심사에서 반드시 묻는다.

- 등록 상품 11개 — 공식 원문을 확보하고 사람이 검수한 것만 올렸다. 수를 늘리려 검수되지 않은 상품을 넣으면 전제가 무너진다
- 문서 수집이 수동 — 은행별 HTML 추출기, PDF 페이지 보존, 정기 수집 스케줄러가 다음 단계
- 운영 관측성 미구현 — 색인 이력, 지연시간·오류율 수집이 다음 단계

---

## 기능 명세서 재료

저장소의 [ViSafy 기능명세서 Season 3.md](../ViSafy%20기능명세서%20Season%203.md)에 기능 ID별(FR-101, DATA-001 등) 명세가 이미 정리되어 있다. 양식의 항목 구조에 맞춰 옮긴다.

기능 목록 요약은 [README.md](../README.md)의 "현재 구현 범위"에 있다.

---

## 제출 전 최종 확인

**09-06(일)**

- [ ] 기획서 PDF 변환 후 열어서 깨진 글자·잘린 표 확인
- [ ] 기능 명세서 PDF 동일 확인
- [ ] 제출 URL을 **다른 기기·다른 네트워크**(휴대폰 LTE)에서 열어 확인
- [ ] `verify-production.sh` 전 항목 PASS
- [ ] `demo-verification.py` 10건 PASS
- [x] watchdog cron 등록 확인 (`crontab -l`) — 2026-08-30 등록, 첫 자동 실행 확인
- [ ] GCP Uptime check 알림 메일 수신 테스트

**09-07(월) 10:00 이전**

- [ ] 기획서 PDF 제출 완료
- [ ] 기능 명세서 PDF + URL 제출 완료
- [ ] 제출 화면 캡처 보관

**09-07 11:00 이후 매일**

- [ ] 위 "매일 점검" 3개 명령 실행
