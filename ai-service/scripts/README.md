# Scripts

운영 API와 분리된 ingestion, embedding, evaluation 실행 스크립트를 둡니다. 스크립트는 공식 Source allowlist와 검수 상태를 우회해서는 안 됩니다.

## RAG 기준선 평가

AI Service 컨테이너 또는 Python 가상환경에서 다음을 실행합니다.

```bash
python scripts/evaluate_rag.py --dataset evaluation/rag_eval_dataset.json
```

출력 지표는 `topKRecall`, `meanTopKPrecision`, `citationAccuracy`, `numericIntegrityRate`,
`unsupportedAnswerBlockingRate`, `crossProductContaminationRate`,
`multilingualTopKOverlap`입니다. 저장소의 Dataset은 파이프라인 회귀용 합성 Fixture입니다.
제출 전에는 `expectedDocumentIds`를 관리자 검수 완료된 실제 Source ID로 교체해야 합니다.
