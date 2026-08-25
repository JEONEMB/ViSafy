# Season 3 공식 Source 패키지 추가 기록

> 검수일: 2026-08-25  
> 반영 마이그레이션: `V20__season3_three_official_packages.sql`

## 추가 완료한 패키지

| 상품 | Eligibility 근거 | Access·서류 근거 | Runtime 핵심 |
| --- | --- | --- | --- |
| 하나더이지 적금 | 공식 상품페이지·특약 | 2025.12.31 상품설명서, 하나은행 외국인 실명확인 안내 | 영업점 확인, 상품 수준 스마트폰 채널 표시, 고객별 모바일 이용은 보수적으로 분리 |
| Easy-One Pack 통장 | 공식 상품페이지·특약 | 2025.09.01 상품설명서, 하나은행 외국인 실명확인 안내 | 신규는 영업점, 온라인 신규는 `UNKNOWN`, 준비서류 안내 포함 |
| KB증권 외국인 해외주식 거래 | 공식 매매안내·투자위험 확인서 | 계좌개설 가이드·고객확인제도 | 거주 외국인 채널 확인, 강화된 고객확인은 `EXTERNAL_CHECK` |

## 실제 불확실성 사례

### EXTERNAL_CHECK

- 상품: KB증권 외국인 해외주식 거래
- 근거: KB증권 고객확인제도는 위험도가 큰 경우 거래목적과 자금원천 등을 추가 확인한다고 안내한다.
- 처리: `IDENTITY_ENHANCED_DUE_DILIGENCE / EXTERNAL_CHECK`
- 의미: 사용자 입력만으로 완료할 수 없고 금융기관 확인 절차가 필요하다.

기존 하나 외국인 EZ Loan의 거래외국환 지정 및 E-9 최초 입국 여부 확인도 공식 Source가 연결된 Eligibility `EXTERNAL_CHECK` 사례로 유지한다.

### UNKNOWN

- 상품: Easy-One Pack 통장
- 확인된 사실: 공식 상품설명서는 신규 채널을 영업점으로 명시한다.
- 확인되지 않은 사실: 외국인 고객의 온라인·모바일 신규 가능 여부
- 처리: 영업점은 `AVAILABLE`, 온라인은 `UNKNOWN`; 신분확인 준비서류가 있어 전체 상태는 `ACCESS_ADDITIONAL_DOCUMENTS`

공식 자료에 없는 온라인 가능 여부를 추정하거나 `AVAILABLE`로 승격하지 않는다.

## 제외한 상품

`Easy-One Pack 적금`은 하나은행 공식 보호금융상품등록부에서 신규 중지일이 2021-04-30으로 확인되어 활성 상품에서 제외했다. 과거 Source와 Rule 이력은 재현성을 위해 보존한다.

## 공식 URL

- 하나더이지 적금 상품페이지: <https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1508308_115157.jsp>
- 하나더이지 적금 상품설명서: <https://image.kebhana.com/cont/download/documents/manual/0100324000101_20251231_m.pdf>
- Easy-One Pack 통장 상품페이지: <https://www.kebhana.com/cont/mall/mall08/mall0801/mall080103/1431574_115188.jsp>
- Easy-One Pack 통장 상품설명서: <https://image.kebhana.com/cont/download/documents/manual/0170114000101_20250901_m.pdf>
- KB증권 해외주식 매매안내: <https://www.kbsec.com/go.able?linkcd=m04040026>
- KB증권 해외주식 투자위험 확인서: <https://fdata.kbsec.com/agree/globalStock_02.pdf>
- KB증권 해외주식 매매 시작하기: <https://fdata.kbsec.com/agree/foreignstock03.pdf>
- KB증권 고객확인제도: <https://nwww.kbsec.com/go.able?linkcd=m06100021>
