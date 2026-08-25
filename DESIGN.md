# SSAFIN Design System

> Version: 1.0
> Updated: 2026-08-20
> Scope: `frontend/` 전체 사용자 화면 및 관리자 화면

## 1. Purpose

이 문서는 새로운 UI를 임의로 생성하기 위한 무드보드가 아니다. Codex와 개발자가 SSAFIN의 기존 기능을 보존하면서 화면 전체를 일관된 금융 서비스 경험으로 개선하기 위한 실행 기준이다.

UI 작업자는 디자인 취향보다 다음 우선순위를 따른다.

1. 기존 금융 판정과 사용자 흐름을 깨뜨리지 않는다.
2. 사전자격 결과와 공식 근거를 가장 빠르게 이해하게 한다.
3. 모든 화면에서 동일한 토큰과 컴포넌트 규칙을 사용한다.
4. 한국어·영어·베트남어에서 같은 정보 구조를 유지한다.
5. 시각적 장식보다 신뢰성, 접근성, 설명 가능성을 우선한다.

## 2. Brand and visual direction

### Brand statement

> SSAFIN helps foreign residents understand how far their profile meets publicly verified Korean financial product conditions.

### Visual keywords

- trustworthy fintech
- clean Korean financial service
- minimal and precise
- accessible and multilingual
- calm rather than flashy
- evidence-led rather than promotional

### Reference blend

레퍼런스는 복제 대상이 아니라 의사결정 비율이다.

- **Wise 50%**: 쉬운 문장, 명확한 다음 행동, 친근하지만 가볍지 않은 금융 UX, 복잡한 정보를 작은 단위로 나누는 방식
- **Stripe 30%**: 정교한 간격, 선명한 타이포그래피 위계, 구조화된 데이터 표현, 절제된 프리미엄 감각
- **한국 은행 UX 20%**: 익숙한 입력 양식, 보수적인 상태 표현, 명시적인 라벨·기준일·공식 출처·유의사항

Wise 또는 Stripe의 로고, 고유 일러스트, 레이아웃, 색상 조합을 그대로 복제하지 않는다. SSAFIN의 금융 사전자격 진단 목적에 맞게 원칙만 적용한다.

## 3. Non-regression contract

디자인 변경은 기능 변경 권한을 의미하지 않는다. 별도 요구사항이 없다면 다음 항목을 변경하거나 제거하지 않는다.

- Next.js route와 query parameter
- Backend API URL, request/response field, status enum
- `localStorage` key와 임시 profile session 동작
- 관리자 인증과 일반 사용자 접근 제어
- 한국어·영어·베트남어 번역 key
- Profile Wizard의 입력값, 검증, 저장, 단계 이동
- 상품 필터, 추천 정렬, 상세 탭과 URL anchor
- Pre-check 실행과 결과 우선순위
- PASS, FAIL, EXTERNAL_CHECK, UNKNOWN, INSUFFICIENT 상태 의미
- Source URL, 정보 기준일, 근거 위치
- 로딩, 빈 상태, 오류, 만료 profile, API 장애 처리
- 복사, 외부 링크, 뒤로 가기, 재시도 같은 기존 사용자 액션
- E2E selector에 사용되는 접근 가능한 이름과 의미

UI 리팩터링 중 비즈니스 로직을 발견하더라도 컴포넌트 밖으로 임의 이동하거나 재작성하지 않는다. 필요한 구조 변경은 먼저 테스트로 현재 동작을 고정한 후 별도 작업으로 수행한다.

## 4. Information hierarchy

사용자 화면의 기본 정보 순서는 다음과 같다.

1. **Eligibility result**: 현재 공개조건 기준 상태
2. **Reason**: 충족·미충족·추가 확인·정보 부족 이유
3. **Official evidence**: 공식 Source, 근거 위치, 정보 기준일
4. **Next action**: 프로필 보완, 서류 준비, 은행 문의, 공식 채널 이동
5. **Disclaimer**: 최종 가입승인이 아니라는 안내

상품 상세에서 마케팅 설명이 사전자격 결과보다 먼저 나오지 않게 한다. Source 링크는 숨기거나 장식용 아이콘만으로 표현하지 않는다.

## 5. Color system

색상은 CSS variable 또는 Tailwind semantic token으로 등록하고, 화면에서 임의 hex 값을 반복해 사용하지 않는다.

### Core tokens

| Token | Value | Usage |
| --- | --- | --- |
| `canvas` | `#F6F8FB` | 전체 페이지 배경 |
| `surface` | `#FFFFFF` | 카드, 폼, 패널 |
| `surface-subtle` | `#F0F4F8` | 보조 영역, 비활성 영역 |
| `text-primary` | `#0F172A` | 제목, 핵심 본문 |
| `text-secondary` | `#526071` | 설명, 보조 본문 |
| `text-tertiary` | `#748196` | 메타데이터, placeholder |
| `border` | `#DCE3EC` | 기본 경계선 |
| `border-strong` | `#BAC5D3` | 강조 경계선 |

### Brand and action tokens

| Token | Value | Usage |
| --- | --- | --- |
| `primary` | `#3157E8` | 핵심 CTA, 선택 상태, 링크 |
| `primary-hover` | `#2444C8` | Primary hover |
| `primary-soft` | `#EEF2FF` | 선택 배경, 정보 강조 |
| `secondary` | `#17866B` | 보조 강조, 진행 완료 |
| `secondary-hover` | `#116B56` | Secondary hover |
| `secondary-soft` | `#EAF7F2` | 친화적 보조 배경 |
| `focus` | `#5B7CFA` | keyboard focus ring |

### Semantic status tokens

| State | Foreground | Background | Border |
| --- | --- | --- | --- |
| Success / conditions met | `#16794B` | `#EAF7F0` | `#A9DFC1` |
| Warning / bank confirmation | `#8A5A00` | `#FFF7D6` | `#E9CC72` |
| Danger / conditions not met | `#B83245` | `#FFF0F2` | `#F0B5BE` |
| Neutral / insufficient | `#526071` | `#F1F4F7` | `#CDD5DF` |
| Information | `#2457C5` | `#EDF4FF` | `#B9D1FF` |

### Color rules

- Primary blue는 한 화면에서 가장 중요한 행동 한두 개에만 사용한다.
- Secondary green은 성공과 브랜드 보조 강조에 사용하되 Success 상태와 혼동되지 않도록 라벨을 함께 표시한다.
- 상태는 색만으로 전달하지 않는다. 아이콘, 상태명, 설명을 함께 제공한다.
- 본문 텍스트에 연한 회색을 사용하지 않는다.
- gradient는 기본값이 아니다. 필요한 경우 브랜드 배경의 작은 영역에만 두 색 이하로 사용한다.
- 관리자 화면에서도 사용자 화면과 같은 semantic status color를 사용한다.

## 6. Typography

### Font family

- Primary: `Pretendard Variable`
- Fallback: `Pretendard`, `Inter`, `Noto Sans KR`, `ui-sans-serif`, `system-ui`, `sans-serif`
- 숫자, 금액, 비자코드는 proportional font를 기본으로 사용하고 정렬이 중요한 표에서만 tabular numerals를 적용한다.
- Source locator나 기술 식별자 외에는 monospace를 사용하지 않는다.

### Type scale

| Role | Desktop | Mobile | Weight | Line height |
| --- | --- | --- | --- | --- |
| Display | 48px | 36px | 700 | 1.15 |
| Page title | 36px | 30px | 700 | 1.2 |
| Section title | 26px | 24px | 700 | 1.3 |
| Card title | 20px | 18px | 700 | 1.35 |
| Body large | 18px | 17px | 400–500 | 1.65 |
| Body | 16px | 16px | 400–500 | 1.6 |
| Label | 14px | 14px | 600 | 1.45 |
| Caption | 12px | 12px | 500 | 1.5 |

### Typography rules

- Hero title은 desktop 48px를 기본 상한으로 한다.
- 한 화면에서 굵기 700 이상을 과도하게 반복하지 않는다.
- 긴 설명은 최대 65–72자로 제한한다.
- 영어 uppercase와 넓은 letter spacing은 짧은 eyebrow에만 사용한다.
- 한국어 본문에는 과도한 음수 자간을 적용하지 않는다.
- 번역 문자열 길이가 30% 늘어나도 버튼과 카드가 깨지지 않아야 한다.

## 7. Layout and spacing

### Spacing scale

4px 기반 scale을 사용한다.

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
```

### Containers

- Global content width: 최대 `1120px`
- Reading content width: 최대 `720px`
- Page horizontal gutter: mobile `20px`, tablet `24px`, desktop `32px`
- Section vertical gap: mobile `48px`, desktop `64px`
- 카드 내부 padding: mobile `20px`, desktop `24px`

### Layout rules

- 핵심 콘텐츠는 viewport 중앙에 두되 과도하게 좁히지 않는다.
- 같은 정보 수준의 카드 높이를 억지로 맞추기 위해 빈 공간을 크게 만들지 않는다.
- desktop 다단 화면은 mobile에서 자연스러운 단일 열 순서로 변환한다.
- 고정 높이보다 content-driven min-height를 사용한다.
- 장식용 배경이 콘텐츠 대비나 클릭을 방해하지 않게 한다.

## 8. Shape, border, and elevation

### Radius

| Element | Radius |
| --- | --- |
| Input, small button, chip | 10–12px |
| Standard card, panel | 14–16px |
| Modal, major result panel | 16–20px |
| Pill | 상태 badge와 짧은 filter에만 사용 |

### Border

- 기본 카드: `1px solid border`
- 선택 카드: primary border + primary soft background
- 정보 그룹 구분에는 그림자보다 border 또는 spacing을 우선한다.

### Shadow

- 기본 카드에는 shadow를 생략하거나 매우 약하게 사용한다.
- hover 가능한 카드에만 작은 elevation 변화를 허용한다.
- 여러 겹의 glow, 컬러 shadow, glassmorphism shadow를 사용하지 않는다.

권장 기본 shadow:

```css
box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
```

## 9. Components

### Buttons

- 기본 높이: `44px`, 핵심 CTA는 `48px`
- 기본 radius: `12px`
- 좌우 padding: `16–24px`
- 한 화면의 primary CTA는 가능한 한 하나로 유지한다.
- Primary, secondary, tertiary/text, destructive 네 종류만 사용한다.
- disabled는 opacity만 낮추지 말고 배경·텍스트 대비를 유지하며 cursor 상태를 표시한다.
- loading 중에는 버튼 폭이 바뀌지 않게 하고 동작 중임을 텍스트로 알린다.
- 아이콘만 있는 버튼은 accessible name과 최소 44px hit area가 필요하다.

### Inputs

- 높이: 최소 `48px`
- label은 항상 입력창 위에 표시한다.
- placeholder는 label을 대체하지 않는다.
- 도움말은 입력 이유를 설명하고, 오류문은 해결 방법을 알려준다.
- focus, error, disabled, read-only 상태를 명확히 구분한다.
- 날짜·금액 입력은 locale에 맞게 표시하되 Backend로 보내는 구조화 값은 변경하지 않는다.
- 숫자 입력의 쉼표·언어 표현은 시각적 보조이며 원본 숫자값을 훼손하지 않는다.

### Cards

- subtle border, radius `14–16px`, minimal shadow를 기본으로 한다.
- 카드 전체가 클릭 가능하면 내부의 별도 링크와 클릭 영역이 충돌하지 않게 한다.
- 정보 계층은 eyebrow → title → summary → metadata → action 순서를 권장한다.
- 서로 다른 색 배경을 장식 목적으로 반복하지 않는다.

### Status badges and alerts

- badge는 짧은 상태명에만 사용한다.
- 중요한 상태에는 badge만 두지 않고 요약 문장을 함께 제공한다.
- 성공: 공개조건 충족
- 경고: 은행 확인 필요
- 위험: 공개조건 미충족
- 중립: 정보 부족 또는 진단 준비 안 됨
- alert는 제목, 원인, 다음 행동을 포함한다.

### Tabs

- 현재 tab을 색, border, `aria-current` 중 두 가지 이상으로 표시한다.
- tab 순서와 URL query는 유지한다.
- mobile에서는 가로 scroll을 허용하되 선택 tab이 보이도록 한다.

### Tables and admin lists

- 관리자 데이터는 장식보다 스캔 가능성을 우선한다.
- header, 행 구분선, 상태, 최종 수정일을 명확히 표시한다.
- mobile에서는 핵심 열을 카드형으로 재배치하거나 안전한 가로 scroll을 제공한다.
- 수정·승인·거절 action은 상태와 분리하며 destructive action은 명시적으로 표시한다.

## 10. Page-specific rules

### Landing

- 방문자가 먼저 언어를 선택하고, CTA로 Profile Wizard에 이동하는 현재 동작을 유지한다.
- 언어 카드는 국적 선택으로 표현하지 않는다. 국기는 보조 시각 요소일 뿐이다.
- Hero는 짧은 가치 제안, 한 문단 설명, 하나의 CTA로 구성한다.
- oversized hero text, 큰 blur orb, 과도한 카드 hover 이동을 줄인다.
- 언어 선택 전에도 각 카드의 언어명을 해당 언어로 읽을 수 있어야 한다.

### Profile Wizard

- 현재 단계, 전체 단계 수, 이전·다음 행동을 항상 확인할 수 있게 한다.
- 필수 항목과 선택 항목을 명확히 구분한다.
- 국적은 언어와 독립적으로 입력받는다.
- 한 단계의 질문 수를 최소화하고 관련 필드만 같은 그룹에 둔다.
- 오류 발생 시 해당 필드로 focus를 이동하고 입력값을 보존한다.

### Product list and recommendations

- 필터보다 결과 목록이 시각적으로 우세해야 한다.
- 상품 카드에는 기관, 상품명, 진단 준비 상태, 공개조건 요약, 정보 기준일을 우선 표시한다.
- 확률형 점수처럼 보이는 시각 표현을 사용하지 않는다.
- `PUBLIC_CONDITIONS_NOT_MET` 상품을 추천처럼 강조하지 않는다.
- `INSUFFICIENT_INFORMATION`은 별도 정보 필요 영역으로 구분한다.

### Product detail and result dashboard

- 첫 viewport에서 결과 상태, 핵심 이유, 최종 승인 아님 문구를 확인할 수 있게 한다.
- 조건별 결과는 충족, 미충족, 은행 확인, 공개되지 않음, 정보 부족으로 구분한다.
- Rule 실제값과 기대값을 장식적인 차트로 바꾸지 않는다.
- 공식 Source 제목, 근거 위치, 확인일, 외부 링크를 함께 표시한다.
- Unknown Resolver와 은행 문의문은 결과를 바꾸는 기능처럼 보이지 않게 한다.

### RAG and AI explanation

- AI 설명과 Rule Engine 판정을 시각적으로 구분한다.
- `AI explanation`보다 `Official evidence`가 먼저다.
- 근거가 없을 때 빈 답변이나 확신형 문장을 표시하지 않는다.
- 숫자, 금액, 기간, 비자코드는 구조화 데이터 영역에서 강조하고 번역 문장과 대조 가능하게 한다.
- 출처 링크 없는 AI 문장을 공식 판정 카드처럼 표현하지 않는다.

### Admin

- 사용자용 navigation과 관리자 navigation의 시각적 문맥을 분리한다.
- 관리자 화면은 compact density를 허용하지만 입력 높이와 접근성 기준은 동일하다.
- 승인 상태, Source lifecycle, Rule nature, 변경 이력을 일관된 semantic color로 표시한다.
- 저장 성공·실패와 현재 검수 상태를 명확히 피드백한다.

## 11. Accessibility

최소 목표는 WCAG 2.1 AA다.

- 일반 텍스트 대비 `4.5:1` 이상
- 큰 텍스트와 UI 경계 대비 `3:1` 이상
- 모든 interactive element keyboard 접근 가능
- `focus-visible` ring을 제거하지 않음
- touch target 최소 `44 × 44px`
- 의미 있는 heading 순서 유지
- form label, fieldset, legend, error association 제공
- 색 이외의 상태 단서 제공
- loading 영역에 적절한 `aria-live` 또는 status 사용
- animation은 짧고 기능적이어야 하며 `prefers-reduced-motion` 지원
- 외부 링크와 새 창 동작을 사용자에게 알림
- flag 이미지에는 언어 선택 목적에 맞는 대체 텍스트 또는 장식 처리 적용

## 12. Motion

- transition 기본 길이: `150–200ms`
- 허용: 색, border, opacity, 작은 elevation 변화
- hover 이동: 최대 `2px`
- 금지: 큰 bounce, 연속 pulse, 결과 카드 회전, 불필요한 parallax
- 실제 Backend 처리와 무관한 가짜 분석 단계를 만들지 않는다.

## 13. Content design

- 쉬운 문장과 구체적인 다음 행동을 사용한다.
- “가입 가능” 대신 “입력 정보 기준 공개조건 충족”을 사용한다.
- “실패”만 표시하지 말고 어떤 값과 기준이 맞지 않는지 설명한다.
- “정보 부족”은 사용자 입력 부족과 공식 Source 부족을 구분한다.
- 번역문에서도 상품명, 기관명, 비자코드, 숫자, 금액, 개월 수를 임의 변경하지 않는다.
- 버튼 label은 행동을 설명한다. 예: `확인`, `진행`보다 `내 조건으로 확인하기`, `공식 페이지 열기`.

## 14. Iconography and imagery

- 기능 또는 상태 전달에 필요한 아이콘만 사용한다.
- 동일 의미에는 동일 아이콘을 사용한다.
- emoji와 서로 다른 icon style을 무작위로 섞지 않는다.
- 아이콘은 텍스트 label을 대체하지 않는다.
- 국기 이미지는 언어 선택의 보조 표현으로만 사용하고 금융 판정의 국적값으로 간주하지 않는다.
- 금융 서비스와 무관한 stock photo, 3D coin, AI robot 이미지를 사용하지 않는다.

## 15. Avoid

- excessive gradients
- oversized hero text
- excessive glassmorphism or backdrop blur
- random icons and emoji decoration
- multiple competing primary buttons
- radius가 제각각인 카드와 버튼
- 의미 없이 떠오르는 카드 hover
- 낮은 대비의 회색 본문
- 모든 영역을 카드 안에 다시 넣는 nested-card UI
- 확률처럼 보이는 점수·게이지
- Source보다 AI 설명을 더 권위 있게 보이게 하는 구성
- 언어 선택을 국적 선택으로 오해하게 하는 copy
- 기능 확인 없이 파일 전체를 시각적 이유로 재작성하는 작업

## 16. Implementation guidance for Codex

### Before editing

1. 대상 화면의 route, API call, mutation, local state, storage key를 확인한다.
2. loading, empty, error, success, expired state를 목록화한다.
3. 현재 E2E 또는 component test가 보호하는 accessible name을 확인한다.
4. 공통화할 시각 요소와 기능 로직을 분리한다.

### While editing

1. 먼저 global token과 작은 primitive를 추가한다.
2. 한 번에 한 화면군씩 교체한다.
3. 기존 component props와 data flow를 유지한다.
4. Tailwind arbitrary value를 새로 늘리지 않는다.
5. 같은 조합이 세 번 이상 반복되면 token 또는 공통 component를 검토한다.
6. 화면에 존재하는 모든 상태를 새 디자인에 매핑한다.
7. 다국어 문자열을 component 안에 새로 하드코딩하지 않는다.

### Recommended migration order

1. font, color, spacing, focus token
2. button, input, badge, alert, card primitive
3. global header and page container
4. Landing and Profile Wizard
5. Product list and recommendations
6. Product detail, eligibility result, evidence
7. AI explanation and inquiry UI
8. Admin screens
9. loading, empty, error, health pages

### Validation after each screen

- TypeScript typecheck
- production build
- relevant unit/integration test
- Playwright E2E user journey
- keyboard-only navigation
- mobile `360px`, tablet `768px`, desktop `1280px` 확인
- ko, en, vi에서 overflow와 의미 일치 확인
- API payload와 localStorage 값이 변경되지 않았는지 확인

## 17. Definition of done

디자인 변경은 다음을 모두 만족해야 완료다.

- 해당 화면의 모든 기능과 상태가 변경 전과 동일하게 동작한다.
- 이 문서의 semantic token을 사용하고 임의 색상 사용을 추가하지 않았다.
- CTA, form, card, status가 다른 화면과 같은 규칙을 따른다.
- mobile과 desktop에서 가로 overflow가 없다.
- keyboard focus와 label이 정상 동작한다.
- 한국어·영어·베트남어의 핵심 값과 상태가 동일하다.
- 공식 Source와 정보 기준일이 기존보다 덜 보이게 되지 않았다.
- 최종 가입승인이 아니라는 안내가 결과 화면에 유지된다.
- build와 E2E가 통과한다.

## 18. Reference notes

- [getdesign.md](https://getdesign.md/)가 제안하는 DESIGN.md의 목적처럼, 이 문서는 색상·타입·간격·컴포넌트와 그 이유를 반복 사용 가능한 기준으로 제공한다.
- [Wise design analysis](https://getdesign.md/wise/design-md)는 친근하고 명확한 fintech 방향의 참고자료다.
- [Stripe design analysis](https://getdesign.md/stripe/design-md)는 정교한 위계와 premium fintech 표현의 참고자료다.
- 이 문서는 위 서비스를 모방하거나 제휴를 나타내지 않으며, 공개적으로 관찰 가능한 디자인 원칙을 SSAFIN 목적에 맞게 재해석한다.
