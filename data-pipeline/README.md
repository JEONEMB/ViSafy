# Data Pipeline

운영 Runtime과 분리된 공식 Source 수집·검수 작업 공간입니다.

- `source_registry`: 기관, URL, source type, 수집 주기, 담당자 등록
- `snapshots`: 수집 당시 원문 보관(로컬 원문은 Git 제외)
- `validation`: AI가 추출한 Rule Candidate의 Human Verification 도구와 결과

AI 추출 결과는 후보일 뿐이며 `APPROVED` 상태로 검수되기 전에는 Runtime Rule Engine에서 사용할 수 없습니다.

