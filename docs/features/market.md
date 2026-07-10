# market (나눔)

> 마지막 갱신: 2026-07-10 | 담당 Phase: P1/P2/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도 간 무료 나눔 글을 등록하고 상태/댓글/신고를 관리합니다.

---

## ✅ 완료

- 나눔 목록/상세/작성 화면 구현 — `app/(tabs)/market/index.tsx`, `app/(tabs)/market/[id].tsx`, `app/modal/market-new.tsx`
- 나눔 타입과 mock 데이터 구현 — `src/types/market.ts`, `src/mocks/market.ts`
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
- 나눔 상세 safe-area/sheet geometry 정렬 — ZIP 44px status frame과 bottom action 위치 기준으로 `Screen`을 조정하고 긴 `RadioSheet` compact row를 적용해 `missing=0`, `report 18.50→11.50`, `report-dup-toast 28.92→15.73`, `done 20.54→11.17`, `status 13.29→7.51`로 감소
- 나눔 작성 원본 구조 정렬 — ZIP `ScreenMarketCreate` 기준으로 close/action topbar, 사진 레일, 7개 카테고리 chip, 제목/물품상태/상세설명 section, 안내 박스, 작성 중단 dialog, 5개 제한 toast를 reference 화면에 반영
- 나눔 작성 partial visual compare 개선 — `market-create*` 5개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `limit-toast 32.50→15.21`, `create 12.56→12.04`, `back-warn 8.76→7.63`, `create-filled/edit 14.21→14.11`로 감소
- 나눔 목록 ZIP compact row 재정렬 — ZIP `ScreenMarketList` 기준으로 카드 wrapper를 제거하고 full-width row, 86px `Thumb`, divider, 예약/완료 overlay, 8개 카테고리 chip 순서를 reference 화면에 반영
- 나눔 목록 partial visual compare 개선 — `market-list*` 6개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `market-list-all 20.56→15.44`, `market-list 14.24→12.27`, `market-list-reserved 10.80→8.31`, `market-list-done 12.35→7.77`로 감소
- 나눔 상세 action compact 정렬 재검증 — ZIP `ActionBtn` inline 구조를 공통 reference action에 반영한 뒤 `market-detail*` 정상 상태 10개를 재캡처해 `missing=0` 확인
- ZIP `Thumb` proportional geometry 재검증 — 공통 `VisualThumb`을 ZIP `Thumb` SVG circle 수식에 맞춘 뒤 나눔 목록/상세/작성/관심 목록 영향 화면을 Android Dev Client에서 재캡처하고 `missing=0` 확인
- 나눔 목록 FAB root overlay 정렬 — 공통 FAB를 ZIP pill surface로 복구하고 목록 20-25번을 재캡처해 `market-list-all 15.27→13.75`, `market-list 12.15→10.64`, `reserved 8.36→6.79`, `done 7.83→6.31`로 낮춤
- 나눔 상세 typography/chip/scrim 정렬 — ZIP `ScreenMarketDetail` 기준으로 overlay back, hero scrim, 작성자명, soft chip, 제목/본문 text metric, 예약 배너 색상을 맞추고 26-35번을 재캡처해 `own 14.53→9.31`, `reserved 14.15→9.36`, `other 14.46→9.34`, `composer-multiline 12.75→9.47`, `report-dup-toast 14.76→10.00`로 낮춤
- 나눔 작성 topbar/chip/control typography 정렬 — ZIP `ScreenMarketCreate` 기준으로 56px topbar rhythm, close pill, action width, chip padding/font, section label/hint/control weight를 맞추고 38-42번을 재캡처해 `limit-toast 14.99→14.62`, `create-filled 14.01→13.69`, `edit 14.01→13.70`으로 낮춤
- 나눔 목록 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketList`의 상태 탭, 카테고리 칩, 86px thumb row, 예약/완료 overlay, fixed FAB 구조를 `/market` route에 RN으로 직접 반영
- 나눔 상세 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketDetail`의 정사각형 hero, 상태 overlay/banner, 작성자/칩/본문, 액션 row, 댓글, 하단 composer 구조를 `/market/[id]` route에 RN으로 직접 반영
- 나눔 작성 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketCreate`의 close/action topbar, 사진 레일, 카테고리 chip, 제목/물품상태/상세설명 section, 안내 박스를 `modal/market-new` route에 RN으로 직접 반영
- 나눔 API 계약 게이트 추가 — `npm run test:api:contract:market`으로 CRUD·댓글·신고 endpoint와 목록/상세 화면 요구 필드를 자동 검증

## 주요 파일 (도메인 파일 지도)

| 경로                             | 역할                              |
| -------------------------------- | --------------------------------- |
| `app/(tabs)/market/index.tsx`    | 나눔 목록, 상태/카테고리 필터     |
| `app/(tabs)/market/[id].tsx`     | 나눔 상세, 상태 변경, 댓글, 신고  |
| `app/modal/market-new.tsx`       | 나눔 작성 모달                    |
| `src/mocks/market.ts`            | 나눔 mock 데이터                  |
| `src/constants/domainOptions.ts` | 나눔 카테고리/상태/신고 사유 옵션 |
| `src/types/market.ts`            | 나눔 타입                         |
| `scripts/check-market-api-contract.mjs` | 나눔 Swagger endpoint·화면 요구 필드 검사 |

## 데이터 타입

`MarketItem`은 `images: string[]`, `status: sharing | reserved | done`, `comments`, `liked`, `condition`, `location`을 포함합니다. `MarketInput`은 Notion MVP 기준 사진 필수이므로 `images: string[]`를 1장 이상 받습니다.

## 결정 사항 (최신 위)

- (2026-07-10) **나눔 mapper는 화면 필수 계약 13건 해소 후 활성화한다** — 목록의 `authorName/images/keyword`, 상태·카테고리·물품상태 enum, 이미지 필수 정책, 상태 변경 endpoint가 Swagger에 없어 현재 HTTP 전환은 작성자 ID 노출·썸네일 소실·코드 추측을 유발합니다. `test:api:contract:market` 통과 전에는 기존 mock 화면을 유지합니다.
- (2026-06-27) **미사용 service/hook/card 레이어는 제거한다** — 현재 나눔 화면은 Downloads 원본을 기준으로 다시 구현할 예정이고 `MarketItemCard`, `marketService`, `useMarketItems` 호출처가 없어, 실제 API 연결 시 필요한 표면만 다시 만든다.
- (2026-06-27) **나눔 목록은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketList` 구조를 `/market` route에 직접 반영하고, 상태별 variant는 query parameter에서 필요한 범위만 해석합니다. 별도 service/hook은 실제 API 스키마 확정 전까지 만들지 않습니다.
- (2026-06-27) **나눔 상세는 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketDetail`의 기본 상세 구조를 `/market/[id]` route에 직접 반영합니다. 신고/상태 변경 sheet 같은 예외 variant는 실제 필요 시 작은 overlay로 추가합니다.
- (2026-06-27) **나눔 작성은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketCreate`의 기본 작성/입력 완료/edit/limit-toast 구조를 `modal/market-new` route에 직접 반영합니다. 실제 저장 API는 스키마 확정 전까지 붙이지 않습니다.
- (2026-05-27) **나눔 작성 topbar/control은 ZIP `ScreenMarketCreate` metric을 따른다** — 작성/수정 reference는 ZIP `phone-topbar`의 56px rhythm과 700/600/500 weight 체계를 따르고, chip은 ZIP `.chip`의 12px semibold metric으로 번역합니다.
- (2026-05-27) **나눔 상세 text/chip은 ZIP 전용 metric을 따른다** — 상세 제목은 공용 `titleText`가 아니라 ZIP `20px/700/1.35`에 맞춘 전용 style을 쓰고, 카테고리/상태 chip도 dark selected chip이 아닌 ZIP `chip soft` 톤으로 렌더링합니다.
- (2026-05-27) **나눔 목록 FAB는 ZIP fixed root layer를 따른다** — `ScreenMarketList`의 글쓰기 FAB는 list ScrollView 안 요소가 아니라 ZIP `Phone` root의 absolute pill button으로 관리합니다. 공통 `FloatingActionButton`은 정적 surface를 사용해 Android 캡처에서 pill 배경과 위치가 유지되도록 합니다.
- (2026-05-27) **나눔 thumbnail은 ZIP `Thumb` proportional geometry를 따른다** — 목록 86px thumb, 상세 360px hero, 작성/관심 목록 thumb 모두 같은 공통 `VisualThumb`를 쓰므로, circle 위치/크기/opacity는 ZIP `lib.jsx`의 `Thumb` SVG viewBox 수식을 size 비례로 번역합니다.
- (2026-05-27) **나눔 목록은 ZIP full-width row를 따른다** — `ScreenMarketList` 원본은 카드형 리스트가 아니라 `padding 14/22`, 86px thumb, row divider, status overlay를 쓰는 compact row 구조이므로 reference 목록에서는 공통 `Card` wrapper를 사용하지 않습니다.
- (2026-05-27) **나눔 상세 action은 ZIP `ActionBtn` inline 구조를 따른다** — 수정/삭제/상태 변경/신고/차단 action은 큰 원형 icon tile이 아니라 ZIP `screens-market.jsx`의 44px transparent inline icon+label button으로 번역합니다.
- (2026-05-27) **나눔 작성은 ZIP section form 구조를 따른다** — 작성/수정 reference는 카드형 폼이 아니라 ZIP 원본의 상단 `닫기`/등록 action, horizontal photo rail, 8px divider section, 7개 카테고리 chip, 상태 segmented button, 안내 박스를 기준으로 번역합니다.
- (2026-05-26) **나눔 상세 geometry는 ZIP phone frame 기준으로 본다** — Android native safe-area를 그대로 쓰는 대신 ZIP `phone-status` 44px와 bottom fixed composer 위치를 기준으로 맞춰야 원본 상세의 hero, 작성자, composer 위치가 일치합니다.
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

- Swagger 목록 작성자명·대표 이미지·검색, 코드 enum, 이미지 필수, 상태 변경 endpoint 13건 확정 필요. 단일 출처는 Issue #19이며 `npm run test:api:contract:market`으로 확인합니다.
- 신고 처리 후 블라인드/관리자 큐 정책은 API/운영 정책 확정 후 반영.
- 나눔 작성 residual은 topbar/chip/control typography 정렬 후 `market-create-limit mean=14.62`, `market-create-fill mean=13.69`, `market-edit mean=13.70`, `market-create mean=12.22`, `market-create-back mean=7.72`입니다. 빈 작성/뒤로가기 화면은 status bar/time, RN font metrics, confirm overlay geometry 차이로 소폭 상승했지만 화면군 합계는 감소했습니다.
- 나눔 목록 residual은 FAB root overlay 정렬 후 `market-list-all mean=13.75`, `market-list mean=10.64`, `market-list-reserved mean=6.79`, `market-list-done mean=6.31`입니다. 남은 차이는 native status bar/time, RN font metrics, tab bar geometry와 목록 row text metric 차이로 추적합니다.
- 나눔 상세 residual은 typography/chip/scrim 정렬 후 `market-detail-own mean=9.31`, `market-detail-resv mean=9.36`, `market-detail-other mean=9.34`, `market-detail-rep2 mean=10.51`, `market-detail-repts mean=10.00`입니다. 남은 차이는 RN font metrics, native shadow/blur 번역, sheet/input capture 조건으로 추적합니다. 전체 비교 리포트는 `/private/tmp/ylmc-golden-screens/2026-05-23/compare/visual-compare-report.tsv`입니다.

## 의존성

- common 도메인의 UI와 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
