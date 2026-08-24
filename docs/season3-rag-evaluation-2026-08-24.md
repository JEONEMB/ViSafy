# Season 3 승인 Source RAG 평가

> 실행일: 2026-08-24  
> 데이터셋: `ai-service/evaluation/rag_eval_dataset.json`  
> 검색 기준선: 384차원 로컬 Hash Embedding

일반상품 5개, 상품별 질문 5개 이상, 미지원 질문 1개로 평가했다. 문서와 질문의 `productId`는 Flyway V18/V19의 실제 상품·Source ID를 사용한다.

| 지표 | 결과 |
| --- | ---: |
| 평가 Case | 26 |
| Top-K Recall | 1.00 |
| Top-1 Source 인용 정확도 | 0.44 |
| Mean Top-K Precision | 0.40 |
| 숫자 무결성 | 1.00 |
| 근거 없는 답변 차단 | 1.00 |
| 타 상품 Source 혼입 | 0.00 |

## 해석

- Product Metadata Filtering과 안전 차단은 정상 동작한다.
- 기대 문서는 모두 Top-K에 포함됐다.
- Hash Embedding은 다국어 질문에서 가장 적합한 Source를 첫 번째로 정렬하는 품질이 부족하다.
- 따라서 제출 전 `sentence_transformers/paraphrase-multilingual-MiniLM-L12-v2`와 같은 다국어 Semantic Embedding을 같은 Dataset으로 비교하고 Top-1 인용 정확도를 개선해야 한다.
- 현재 수치는 숨기지 않고 Hash 기준선으로 보관한다. READY 상품 수와 RAG 검색 정렬 품질은 서로 다른 완료조건이다.
