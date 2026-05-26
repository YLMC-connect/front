# market (나눔)

> 마지막 갱신: 2026-05-26 | 담당 Phase: P1/P2 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도 간 무료 나눔 글을 등록하고 상태/댓글/신고를 관리합니다.

---

## ✅ 완료
- 나눔 목록/상세/작성 화면 구현 — `app/(tabs)/market/index.tsx`, `app/(tabs)/market/[id].tsx`, `app/modal/market-new.tsx`
- 나눔 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/market.ts`, `src/mocks/market.ts`, `src/services/marketService.ts`, `src/hooks/useMarketItems.ts`
- 이미지 선택/미리보기 연결 — `ImagePickerField`에서 선택한 URI를 `MarketInput.images`로 저장하고 목록/상세 썸네일에 표시
- 상태 변경, 댓글 등록, 신고 접수 mock mutation 구현
- 검색, 관심 목록, 신고 사유 선택, 활성 나눔 5개 제한, 사진 필수 검증 구현
- 나눔 목록 1차 디자인 정렬 — ZIP prototype 기준 접힌 검색, 상태 segmented tabs, category chips, compact row list, bottom-right FAB 적용
- ZIP 원본 나눔 화면 23개 상태 매핑 — 목록/상세/작성 variant를 reference 화면으로 접근 가능하게 연결
- ZIP 110개 visual inventory 재검증에 포함 — 나눔 reference 화면을 Dev Client capture/compare 대상에 유지
- 나눔 상세 원본 시각 정렬 — ZIP JSX 기준 정사각형 사진 hero, 예약중/나눔완료 overlay, 상태 안내 배너, 작성자/카테고리/액션 영역을 reference 화면에 반영
- 나눔 상세 댓글/고정 composer 정렬 — ZIP `ScreenMarketDetail` 기준 댓글 리스트, 수정/삭제/신고 mini action, 하단 glass comment composer, 멀티라인 preview card를 reference 화면에 반영
- 나눔 상세 partial visual compare 개선 — `market-detail-*` 10개 원본/앱 캡처를 재생성해 `missing=0` 확인, 대표 residual은 `done 42.63→30.38`, `status 35.99→26.25`, `delete 41.43→17.34`, `report-dup-toast 34.04→32.72`로 감소
- 나눔 상세 toast/viewport 정렬 — ZIP toast 문구와 `offset=106`을 맞추고 디자인 viewport 캡처로 재검증해 `missing=0`, `report-dup-toast 32.72→28.92`, `status 26.25→13.29`, `delete 17.34→11.62`, `done 30.38→20.54`로 감소

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/market/index.tsx` | 나눔 목록, 상태/카테고리 필터 |
| `app/(tabs)/market/[id].tsx` | 나눔 상세, 상태 변경, 댓글, 신고 |
| `app/modal/market-new.tsx` | 나눔 작성 모달 |
| `src/components/market/MarketItemCard.tsx` | 나눔 카드 |
| `src/services/marketService.ts` | 나눔 mock service |
| `src/hooks/useMarketItems.ts` | 나눔 query/mutation hook |
| `src/mocks/market.ts` | 나눔 mock 데이터 |
| `src/constants/domainOptions.ts` | 나눔 카테고리/상태/신고 사유 옵션 |
| `src/types/market.ts` | 나눔 타입 |
| `src/components/prototype/OriginalMockScreens.tsx` | ZIP 나눔 목록/상세/작성 reference variant 화면 |

## 데이터 타입
`MarketItem`은 `images: string[]`, `status: sharing | reserved | done`, `comments`, `liked`, `condition`, `location`을 포함합니다. `MarketInput`은 Notion MVP 기준 사진 필수이므로 `images: string[]`를 1장 이상 받습니다.

## 결정 사항 (최신 위)
- (2026-05-26) **나눔 상세 toast는 ZIP `CheckToast offset={106}`을 따른다** — 하단 comment composer가 있는 나눔 상세의 중복 신고 toast는 기본 offset이 아니라 ZIP 원본처럼 bottom action area 위에 뜨도록 `offset=106`을 적용하고, 문구도 `이미 신고한 게시글입니다`로 맞춥니다.
- (2026-05-26) **나눔 상세 reference는 ZIP 고정 comment composer를 따른다** — 상세 화면의 댓글 입력은 카드형 textarea가 아니라 ZIP 원본의 하단 glass `bottom-bar` composer이며, 멀티라인 입력 상태는 composer 위 preview card로 표현합니다.
- (2026-05-26) **나눔 상세 hero는 ZIP `Thumb`를 직접 번역한다** — `VisualCover` 기반 wide cover 대신 ZIP의 정사각 `Thumb size=360 seed=0` 구조를 사용하고, 기본 `Thumb`에는 아이콘을 표시하지 않습니다.
- (2026-05-23) **나눔 상세는 full-bleed hero를 기준으로 한다** — 상세 reference 화면은 공통 TopBar 카드형 layout보다 ZIP 원본의 사진 hero + overlay back button + status banner 구조를 우선합니다.
- (2026-05-23) **나눔 원본 상태는 `variant` 라우트로 검증** — 현재 서비스 기반 화면을 유지하되 `?variant=...`가 있으면 ZIP 원본의 목록/상세/작성 상태를 mock-first reference 화면으로 렌더링합니다.
- (2026-05-23) **목록 검색은 상단 아이콘으로 접기** — ZIP prototype 톤에 맞춰 기본 목록은 상태/카테고리 탐색을 먼저 보이고, 검색 입력은 상단 검색 아이콘으로 펼치되 기존 검색 로직은 유지합니다.
- (2026-05-23) **나눔 카드 기본형은 compact row** — 목록 화면은 이미지 썸네일, 상태 badge, 제목/위치/시간을 한 줄 흐름으로 읽는 row를 기본으로 하고, 홈 요약 영역은 별도 2열 card grid를 사용합니다.
- (2026-05-22) **나눔은 무료 나눔만 MVP 포함** — 가격/결제는 MVP에서 제외하고 상태 변경과 댓글만 둡니다.
- (2026-05-22) **Notion 운영 정책 일부를 mock service에서 검증** — 진행 중인 내 나눔은 최대 5개, 사진은 1장 이상 필수입니다.
- (2026-05-22) **이미지는 로컬 URI 우선** — 실제 업로드 API가 없으므로 `expo-image-picker` URI를 mock 데이터에 저장해 UI 흐름을 검증합니다.

## 미결 / 추적
- 실제 나눔 API 스키마, 이미지 업로드 방식, 페이지네이션 방식 확인 필요.
- 신고 처리 후 블라인드/관리자 큐 정책은 API/운영 정책 확정 후 반영.
- 나눔 상세 residual은 viewport 정렬 후 추가로 줄었지만 `report-dup-toast`, `done/reserved`, 기본 상세 계열은 Android status bar, RN font metrics, blur/shadow 번역, hero 내부 추상 shape 위치 차이가 남아 후속 공통 geometry 정렬에서 추가 축소 대상입니다. 최신 부분 비교 리포트는 `/private/tmp/ylmc-golden-screens/market-detail/compare-vp2`입니다.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`, 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
