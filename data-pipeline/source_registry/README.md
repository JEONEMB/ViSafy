# Source Registry

공식 도메인 allowlist와 Source 등록 메타데이터를 둡니다. 실제 기관·URL은 Phase 0 데이터 실현 가능성 검증 후 추가합니다.

`*.candidate.json`은 사용자가 수집한 자료를 공식 Source 등록 전에 보존하는 검수 대기 패키지입니다.

- `runtimeEligible=false`인 Candidate는 DB Migration이나 Runtime Rule로 사용하지 않습니다.
- `sourceUrl`, Snapshot, `contentHash`, 원문 발췌가 확보되기 전에는 Source를 승인하지 않습니다.
- `NOT_FOUND` 또는 `null` 값은 임의로 보완하지 않습니다.
- `실명의 개인`만으로 `FOREIGNER_ALLOWED` Rule을 생성하지 않습니다.
- 상품 수준 모바일 가능 Evidence는 외국인 모바일 이용을 직접 명시하지 않으면 Runtime에서 `UNKNOWN`으로 유지합니다.
