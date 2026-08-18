# Data Policy

- MVP는 로그인 없이 만료되는 임시 프로필을 사용합니다.
- 수집을 최소화하며 주민등록번호, 여권번호, 계좌번호, 비밀번호, 신용점수를 수집하지 않습니다.
- 모든 금융정보는 Source URL, snapshot, content hash, 기준일과 유효기간을 가집니다.
- 공식 도메인 allowlist에 등록되고 Human Verification을 거친 Source/Rule만 Runtime에서 사용합니다.
- Source 충돌, 만료, 누락 상태에서는 더 최신으로 보이는 값을 임의 선택하지 않고 `NEED_REVIEW` 또는 `INSUFFICIENT_INFORMATION`으로 처리합니다.
- LLM에는 판정 권한을 부여하지 않으며 근거 없는 답변과 가입 보장 표현을 차단합니다.

