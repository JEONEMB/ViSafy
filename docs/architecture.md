# Architecture

## Offline data pipeline

공식 Source 등록 → Snapshot 저장 → AI Rule Candidate 추출 → Human Verification → Approved Product/Rule DB 및 Vector DB 반영 순서로 구성합니다.

## Runtime

```text
Next.js Frontend
        |
        v
Spring Boot API ---- MySQL (Source of Truth)
        |  \
        |   +---- Eligibility Engine (approved deterministic rules)
        v
FastAPI AI Service ---- Vector DB (retrieval index)
```

책임 경계:

- Spring Boot: 프로필, 상품, 승인 Rule, 사전자격 판정, 관리자 기능
- AI Service: 수집 보조, RAG, 설명, 번역, 문의문, guardrail
- MySQL: 정형 데이터와 검수 상태의 단일 기준
- Vector DB: 검색 인덱스이며 판정의 Source of Truth가 아님

