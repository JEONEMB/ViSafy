# 외국인 특화 금융상품·서비스 검수 후보

> 조사일: 2026-08-28  
> 목적: SSAFIN 관리자 Human Verification 전에 사용할 공식 Source 조사표  
> 주의: 이 문서의 후보는 관리자 승인 전 Runtime 추천과 Eligibility 판정에 사용하지 않는다.

## 분류 원칙

- `IMPORT_CANDIDATE`: 공식 상품페이지 또는 약관에서 대상과 핵심 조건을 직접 확인함
- `ACCESS_RESOURCE`: 금융상품이 아니라 신분확인·채널·조회 등 금융 정착 경로에 연결할 공식 서비스
- `NEED_DIRECT_DOCUMENT`: 보도자료로 존재는 확인했지만 직접 상품설명서·약관이 부족함
- `DO_NOT_RECOMMEND`: 공식 가입대상이 외국 국적 사용자와 맞지 않음
- `ALREADY_REGISTERED`: 현재 SSAFIN 데이터셋과 중복되므로 새 상품을 만들지 않음

## 우선 검수 후보

| 우선 | 기관 | 상품·서비스 | 분류 | 공식적으로 확인한 핵심 내용 | 처리 제안 |
| ---: | --- | --- | --- | --- | --- |
| 1 | KB국민은행 | KB Global Star 적금 | `IMPORT_CANDIDATE` | 실명의 외국인, 1인 1계좌, 12개월, 월 1천원~50만원, KB스타뱅킹·지점 | 외국인 특화 적금으로 등록 |
| 2 | KB국민은행 | KB Global Star 통장 | `IMPORT_CANDIDATE` | 특약상 가입대상은 실명의 개인인 외국인 | 외국인 특화 입출금계좌로 등록하되 신분증·신규 채널은 별도 Evidence 확인 |
| 3 | KB증권 | RIA 국내시장 복귀계좌 | `IMPORT_CANDIDATE` | 대한민국 거주 개인 중 외국인 가능, 미국·캐나다 국적 제외, 영업점·M-able 개설 | 투자 목적 후보로 등록; 한시 세제상품이므로 유효기간 검수 필수 |
| 4 | 신한은행 | SOL Global | `ACCESS_RESOURCE` | 외국인 전용 모바일 플랫폼, 다국어, 계좌개설·환전·대출 등 제공 | 상품이 아니라 외국인 전용 금융 채널로 Journey에 연결 |
| 5 | 카카오뱅크 | 모바일 외국인등록증 | `ACCESS_RESOURCE` | 모바일 외국인등록증 발급 지원, 본인 명의 휴대폰과 IC 신분증 또는 기관 QR 필요 | Journey 1단계 신분확인 준비에 연결 |
| 6 | 생명보험협회 | 내보험찾아줌 | `ACCESS_RESOURCE` | 보험가입·미청구보험금 조회, 온라인 인증 또는 지역본부 방문 | 보험상품 추천이 아니라 보험생활 조회·다음 행동으로 연결 |

## 현재 데이터와 중복되는 상품

- 하나은행 `하나더이지 적금`: 외국인 특화 적금으로 등록되어 있음
- 하나은행 `하나 외국인 EZ Loan`: 외국인 신용대출로 등록되어 있음
- 하나은행 `Easy-One Pack 통장`: 외국인 특화 입출금계좌로 등록되어 있음
- 신한은행 `SOL글로벌 적금`: 외국인 전용 적금으로 등록되어 있음
- 신한은행 `SOL글로벌 전세대출(서울보증_외국인)`: 직접 조건 Source 보완 대상으로 등록되어 있음
- KB증권 `외국인 해외주식 거래`: 거주자·국적 제한 Rule과 함께 등록되어 있음

중복 상품은 신규 Product를 만들지 않고 기존 Source·Access Evidence의 최신성을 갱신한다.

## 직접 문서 추가 확보가 필요한 후보

### 신한은행 SOL 글로벌론

신한금융그룹 공식 보도자료에서 SOL Global 탑재 계획과 외국인 전용 대출이라는 사실은 확인된다. 그러나 Runtime HARD Rule을 만들 때 필요한 직접 상품설명서·약관 URL은 이번 조사에서 확보하지 못했다.

처리:

- Product는 `NOT_READY` 또는 조사 후보로만 유지
- 비자, 급여수령기간, 잔여 체류기간, 한도는 제3자 기사만으로 승인하지 않음
- 신한은행 직접 상품설명서·약관 확보 후 Rule Candidate 생성

## 추천하면 안 되는 카카오뱅크 서비스

카카오뱅크의 해외송금 보내기·받기와 외화통장 공식 페이지는 이용대상을 `국민인 거주자`로 명시한다. 따라서 국내 체류 외국인에게 외국인 특화 상품으로 추천하지 않는다.

처리:

- 외국인 추천 후보에서 제외
- 일반 사용자에게도 국적 HARD Rule 근거가 연결된 경우 `PUBLIC_CONDITIONS_NOT_MET`로 설명
- `국내 거주`와 `국민인 거주자`를 같은 의미로 해석하지 않음

## 생명보험협회 처리 원칙

생명보험협회는 보험상품 판매사가 아니므로 협회 자체 상품을 만들지 않는다. `내보험찾아줌`은 다음 행동용 공공성 서비스로만 연결한다.

- 현재 가입 보험 확인
- 미청구보험금 확인
- 온라인 인증이 어렵다면 지역본부 방문 경로 안내
- 특정 보험사의 상품 가입 가능 여부를 협회 서비스로부터 추론하지 않음

## 공식 Source URL

### KB국민은행

- KB Global Star 적금 상품페이지: https://obank1.kbstar.com/quics?cc=b061496:b061645&isNew=Y&page=C016613&prcode=DP01001654
- KB Global Star 통장 상품페이지: https://obank.kbstar.com/quics?cc=b061496:b061645&isNew=N&page=C016613&prcode=DP01000569
- KB Global Star 통장 특약: https://img2.kbstar.com/obj/ocommon/kb_global_star.pdf

### 신한은행·신한금융그룹

- SOL Global 개편 공식 보도자료: https://shinhangroup.com/kr/archive/press/detail/521
- SOL글로벌 적금 상품설명서: https://img.shinhan.com/sbank2016/seol/20170630814200000030LC000030.PDF

### 하나은행

- 외국인 EZ Loan 상품공시 목록: https://www.kebhana.com/cont/mall/mall09/mall0903/mall090303/index.jsp
- 하나더이지 적금 상품페이지: https://www.kebhana.com/cont/mall/mall08/mall0801/mall080102/1508308_115157.jsp

### KB증권

- RIA 안내: https://etcimg.kbsec.com/html/design/20260319115347/RIA.html
- 외국인 해외주식 매매안내: https://www.kbsec.com/go.able?linkcd=m04040026
- 글로벌원마켓플러스: https://m.kbsec.com/go.able?linkcd=m10060000

### 카카오뱅크

- 모바일 외국인등록증: https://www.kakaobank.com/products/mobileIdIntro
- 해외송금 보내기 이용대상: https://www.kakaobank.com/products/foreignRemittanceSend
- 해외송금 받기 이용대상: https://www.kakaobank.com/products/foreignRemittanceReceive

### 생명보험협회

- 내보험찾아줌 조회 안내: https://cont.insure.or.kr/cont_web/information/information.do

## 관리자 검수 체크리스트

- [ ] 상품이 조사일 현재 신규 가입 가능한지 다시 확인
- [ ] 상품페이지 외에 상품설명서 또는 약관 확보
- [ ] Source Snapshot과 SHA-256 `contentHash` 생성
- [ ] 가입대상 문구와 상품 채널 문구를 분리
- [ ] 신분확인 방법을 HARD 가입조건으로 승격하지 않음
- [ ] 모바일 가능 여부가 외국인에게도 적용되는지 별도 확인
- [ ] 유효기간·정보 기준일·근거 위치 기록
- [ ] 관리자 승인 후 RAG 재색인 확인

## 위치 기반 Agent 확장 제안

거주지 또는 현재 위치는 Eligibility 점수에 포함하지 않는다. 대신 `접근 편의성`을 별도 정보로 제공한다.

권장 출력:

```text
공개조건: 충족
이용경로: 영업점 신청
가까운 외국인 지원 영업점: 2.1km
운영시간: 일요일 10:00~15:00
준비할 것: 외국인등록증, 여권
```

권장 정렬 순서:

```text
Eligibility 상태
→ 공식 Evidence 완전성
→ 금융 목적 일치
→ 이용 가능한 채널
→ 영업점 거리·운영시간
```

개인정보 원칙:

- 정확한 집 주소를 수집하지 않음
- 브라우저 위치 권한은 선택사항으로 제공
- 좌표는 가까운 영업점 검색 요청에만 사용하고 DB에 영구 저장하지 않음
- 위치 권한을 거절하면 시·구 선택 방식 제공
- 거리값을 가입확률 또는 금융 적합도처럼 표시하지 않음

