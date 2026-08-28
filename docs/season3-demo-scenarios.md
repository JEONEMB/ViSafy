# SSAFIN Season 3 Demo 검증 시나리오

이 문서는 [season3-demo-manifest.md](season3-demo-manifest.md)에 고정한 Demo A~E의 합격 기준을 정의한다.

## 공통 판단 경계

```text
Official Source → Human Verification → Rule Engine → Eligibility
Access Evidence → Identity / Branch / Online / Document
RAG → 승인된 공식 근거 검색
LLM → 쉬운 설명 / 번역 / 다음 행동 / 은행 문의문
```

LLM은 Eligibility 또는 Access 상태를 변경하지 않는다. 국적·비자·채널·서류·금액·대출 승인 가능성을 Source 없이 생성하지 않는다.

## Demo A 합격 기준

- `KB-MY-SAVINGS` 조회 성공
- `productAudience=GENERAL`
- `requiredFields`에 Visa 관련 필드 없음
- 일반상품이라는 이유만으로 국적 제한을 생성하지 않음
- 공식 Rule과 Source가 결과에 연결됨

## Demo B 합격 기준

- `KB-MY-SAVINGS`와 `HANA-EASY-SAVINGS-2025`가 같은 추천 결과에 표시됨
- 외국인 특화 여부가 추천 점수나 가입 가능성을 자동 결정하지 않음
- 추천 이유가 충족 HARD Rule 수, UNKNOWN 수, 금융 목적 일치로 설명됨

## Demo C 합격 기준

- `HANA-SALARY-COMPOUND-SAVINGS`의 Branch와 Online 상태가 별도로 표시됨
- 상품 수준 모바일 채널과 외국인 모바일 신규 가능성을 구분함
- 직접 근거가 없는 외국인 모바일 상태는 `UNKNOWN`

## Demo D 합격 기준

- `HANA-EZ-LOAN`에서만 승인 Rule에 필요한 Visa·체류·재직 입력을 동적으로 요청함
- E-7/E-9, 국내 거주기간, 급여소득 기간을 결정론적으로 비교함
- 거래외국환 지정과 E-9 최초 입국 확인을 은행 확인사항으로 표시함
- 외국인등록증·여권·고용 및 소득 관련 서류를 공식 Source와 함께 표시함
- 영업점 채널은 확인되고 모바일 신청은 생성하지 않음

## Demo E 합격 기준

- `SHINHAN-SOL-GLOBAL-JEONSE`를 PASS 또는 READY로 간주하지 않음
- 상품 존재를 확인한 보조 문구를 가입조건 근거로 승격하지 않음
- `NOT_READY`, `SOURCE_INSUFFICIENT`, `ACCESS_UNKNOWN`을 사용자용 쉬운 문구로 표시함
- Agent가 신한은행에 확인할 항목을 구조화함

## Agent 질문 세트

Demo D에서 다음 질문을 순서대로 사용한다.

```text
1. 이 대출은 누가 신청할 수 있어?
2. E-9 비자인 내가 준비할 서류는 무엇이야?
3. 모바일로 신청할 수 있어?
4. 그럼 은행에 무엇을 물어봐야 해?
5. Can I apply online and what documents should I bring?
```

합격 기준:

- 질문에 대한 직접 답변이 첫 문장에 표시됨
- 한국어 질문은 한국어, 영어 질문은 영어로 답변
- 후속 질문이 같은 상품의 대화 맥락을 유지함
- 승인 Source 인용이 연결됨
- 모바일 근거가 없으면 영업점만 안내하고 모바일 가능을 만들지 않음

## 시연 직전 체크

- 새 브라우저에서 Landing부터 시작
- 고정 Profile 값 준비
- OpenAI Dashboard와 AI Service Health 확인
- 공식 Source URL을 새 탭에서 미리 검증
- Demo E의 부족 상태가 변경되지 않았는지 확인
- 화면 녹화 예비본과 캡처 준비
