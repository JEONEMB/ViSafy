# Demo A~E 공식 Source RAG 평가

> 실행일: 2026-08-29 (수정 후 재측정 포함)
> 데이터셋: [`ai-service/evaluation/demo_rag_eval_dataset.json`](../ai-service/evaluation/demo_rag_eval_dataset.json)
> 원본 리포트: [`ai-service/evaluation/demo_rag_eval_report.json`](../ai-service/evaluation/demo_rag_eval_report.json)
> 검색 엔진: FastEmbed `intfloat/multilingual-e5-small` (384차원), Top-K = 3
> 재현: `docker run --rm -v <repo>/ai-service:/src -w /src -e PYTHONPATH=/src visafy-ai-service python scripts/evaluate_rag.py --dataset evaluation/demo_rag_eval_dataset.json`

고정된 Demo A~E 상품 5개에 대해 상품별 질문 5개 이상, 6개 언어, 근거 없는 질문 6개를 포함한 **48 Case**로 평가했다.
문서 ID·상품 ID·본문은 실행 DB의 승인 Source와 동일하며, Runtime과 같은 공식 도메인 allowlist를 적용했다.

## 1. 발표용 요약표

| 지표 | 결과 | 의미 |
| --- | ---: | --- |
| 평가 Case | 48 | 상품 5개 × 질문 5개 이상 × 6개 언어 + 근거 없는 질문 6개 |
| Top-K 포함률 | **1.00** | 기대한 공식 Source가 모두 Top-3 안에 검색됨 |
| Top-1 Source 인용 정확도 | **0.95** | 첫 번째로 인용한 문서가 기대 문서인 비율 |
| Mean Top-K Precision | **0.79** | 검색된 3건 중 기대 문서의 비율 |
| 타 상품 Source 혼입률 | **0.00** | 다른 상품 문서가 단 한 건도 섞이지 않음 |
| 근거 없는 질문 차단률 | **1.00** | 6개 언어 모두에서 임의 생성 없이 차단 |
| 6개 언어 Top-K 일치율 | **0.85** | 같은 질문을 6개 언어로 물었을 때 검색 결과 일치도 |
| 숫자·Visa 코드 무결성 | **1.00** | 6개 언어 모두에서 원문의 숫자와 체류자격 코드가 답변에 보존됨 |

## 2. 2026-08-24 기준선 대비

동일한 평가 코드로 측정한 이전 Hash Embedding 기준선과 비교하면 검색 정렬 품질이 크게 개선됐다.

| 지표 | 2026-08-24 (Hash) | 2026-08-29 (Multilingual) |
| --- | ---: | ---: |
| Top-1 Source 인용 정확도 | 0.44 | **0.95** |
| Mean Top-K Precision | 0.40 | **0.79** |
| Top-K 포함률 | 1.00 | 1.00 |
| 타 상품 Source 혼입률 | 0.00 | 0.00 |

## 3. 평가로 발견하고 수정한 문제 — 비한국어 답변의 수치 손실

최초 측정에서 숫자·Visa 코드 무결성은 0.77이었고, 실패 11건이 **전부 비한국어**였다.

| 언어 | 수정 전 무결성 실패 | 수정 후 |
| --- | ---: | ---: |
| 한국어 | 0건 | 0건 |
| 영어 | 3건 | 0건 |
| 베트남어·중국어·일본어·태국어 | 각 2건 | 0건 |

원인은 [`answer_builder.py`](../ai-service/app/guardrail/answer_builder.py)의 `_localized_excerpt`였다.
한국어는 공식 원문을 그대로 인용하지만, 비한국어는 원문의 한국어 키워드를 감지해 **미리 정의된 문장으로 대체**했다.
그 과정에서 `E-7`, `E-9` 같은 체류자격 코드와 금액·기간 숫자가 답변에서 사라졌다.
없는 숫자를 만들어낸 것이 아니라 누락시킨 것이므로 안전 문제는 아니었지만, 외국인 대상 서비스에서 **비한국어 사용자가 한국어 사용자보다 덜 구체적인 답변을 받는** 상태였다.

**수정**: 번역된 요약문 뒤에 공식 원문 문장을 언어별 라벨과 함께 그대로 인용한다.

> The official materials say: New applications are handled at a branch. Official identity documents include a passport or residence card. **Official source text (Korean)**: “대출대상: 외국인등록증을 보유한 국내 거주 외국인 중 체류자격 E-7 또는 E-9, 국내 거주기간 3개월 이상 …”

이 방식은 검수된 번역 문장을 그대로 유지하면서 원문의 수치를 함께 보존하므로, 재측정 결과 무결성이 **1.00**으로 올랐다.

남은 제약: 인용되는 원문은 한국어다. 은행 공식 문서 자체가 한국어이므로 원문 표기를 숨기지 않는 편이 정확하며, 수치의 자연어 번역은 OpenAI 설명 계층이 담당한다. 그 계층은 숫자·Visa 코드 무결성 검증을 통과한 출력만 사용하고, 실패하면 위 템플릿 경로로 복귀한다.

## 4. 상품별 결과

| Demo | 상품 | Case | Top-K 포함률 | Top-1 인용 정확도 | 타 상품 혼입 |
| --- | --- | ---: | ---: | ---: | ---: |
| A·B | KB나만의 적금 (`KB-MY-SAVINGS`) | 10 | 1.00 | 0.90 | 0.00 |
| B | 하나더이지 적금 (`HANA-EASY-SAVINGS-2025`) | 10 | 1.00 | 0.90 | 0.00 |
| C | 급여하나 월복리 적금 (`HANA-SALARY-COMPOUND-SAVINGS`) | 10 | 1.00 | 1.00 | 0.00 |
| D | 하나 외국인 EZ Loan (`HANA-EZ-LOAN`) | 10 | 1.00 | 1.00 | 0.00 |
| E | SOL글로벌 전세대출 (`SHINHAN-SOL-GLOBAL-JEONSE`) | 2 | 1.00 | 1.00 | 0.00 |

Demo E는 공식 자료가 부족한 상품이다. 검색 자체는 정상 동작하지만 등록된 문서가 "이 문서는 전세대출의 직접 상품설명서가 아니므로 가입조건 Rule 근거로 사용하지 않습니다"라고 명시하고 있어, Rule Engine은 `INSUFFICIENT_INFORMATION`을 유지한다.

## 5. 언어별 결과

| 언어 | Case | Top-K 포함률 | Top-1 인용 정확도 | 타 상품 혼입 |
| --- | ---: | ---: | ---: | ---: |
| 한국어 | 12 | 1.00 | 0.92 | 0.00 |
| 영어 | 8 | 1.00 | 1.00 | 0.00 |
| 베트남어 | 7 | 1.00 | 1.00 | 0.00 |
| 중국어 | 5 | 1.00 | 1.00 | 0.00 |
| 일본어 | 5 | 1.00 | 1.00 | 0.00 |
| 태국어 | 5 | 1.00 | 0.80 | 0.00 |

6개 언어 모두 기대 Source를 Top-3 안에 검색했다. 같은 질문을 6개 언어로 물은 5개 질문군의 Top-K 일치율은 0.85로, 언어를 바꿔도 대체로 같은 공식 문서를 찾는다.

## 6. 발표에서 쓸 한 문장

> 확률 점수 대신 **검증 가능한 지표**로 말합니다.
> 기대한 공식 근거 Top-K 포함률 100%, 타 상품 자료 혼입 0%, 근거 없는 질문 차단률 100%(6개 언어).
> 평가 과정에서 발견한 비한국어 답변의 수치 누락도 숨기지 않고 수정한 뒤 재측정했습니다.
