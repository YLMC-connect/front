# common (공통 인프라)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P1/P6/P7

## 한 줄 요약

프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

## 현재 동작

- Expo SDK 57(React Native 0.86) + Dev Client. 서버 데이터는 TanStack Query, 인증·UI 상태는 Zustand. 모든 도메인이 실제 HTTP API 를 쓴다(런타임 mock 없음).
- API origin 은 로컬 `.env` 의 `EXPO_PUBLIC_API_URL`. 없으면 `app.config.ts` 가 실패한다. 처음 실행 안내는 `docs/GETTING_STARTED.md`, `.env.example`.
- `apiClient` 는 `{ code, message, data }` envelope 에서 `data` 만 돌려주고, Authorization 헤더와 401 시 토큰 재발급 후 1회 재시도를 맡는다.
- 루트 탭은 홈/나눔/동행/기도/삶공부 5개, 상세는 각 탭의 중첩 Stack(`slide_from_right`, 배경 `theme.colors.bg`). MY(`app/mypage`)·`dawn`·등록 모달은 탭 밖 루트 Stack 에 있다.
- 루트 탭 목록은 glass sticky 헤더 + `StickyHeaderScreen`. 당겨서 새로고침 표시(`RefreshIndicator`)는 사용자가 직접 끌어내렸을 때만 보이고, 인터넷이 끊기면 `OfflineBanner` 를 띄운다.
- 하단 고정 CTA 는 `FloatingBottomBar`(그라데이션 배경, Safe Area 바닥 인셋 자동 계산, 본문은 `FLOATING_BOTTOM_BAR_INSET` 만큼 비움)로 통일.
- React Query 캐시는 AsyncStorage 에 24시간 저장한다. 로그아웃·새 로그인 때 메모리·기기 캐시를 모두 지운다.
- 오류 리포트는 Sentry. `app/_layout.tsx` 가 `initSentry()` 를 부르고, 서버 응답 형식 오류(`INVALID_RESPONSE`)는 `queryClient` 의 Query/MutationCache `onError` 가 보고한다.
- PR CI 는 `npm run validate`(typecheck·lint·format·test:scripts·test). 도메인별 Swagger 계약 검사는 `test:api:contract [-- <도메인>]`.

## 데이터 타입

- 공통 envelope `ApiResponse<T>` 는 `src/types/api.ts`. 회원 `Member` 와 서버 역할 `UserRole`(`ADMIN`, `USER`, `MANAGER_COMMUNION`, `MANAGER_SHARE`, `MANAGER_LIFESTUDY`, `MANAGER_PRAYER`)은 `src/types/common.ts`.
- 전체 설계는 [../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통”.

## 결정 사항 (지금 유효한 것만)

- **API origin 은 로컬 env 에만** — 실제 호스트를 코드·문서·`.env.example` 에 두지 않는다.
- **검증 기준은 Expo Dev Client** — Expo Go 아님. 웹(`npm run web`)은 브라우저 CORS 때문에 라이브 API 검증 대상이 아니다.
- **API client `format: "json"` 은 opt-in** — 기본은 envelope 의 `data` 만 반환. login/refresh 도 같은 envelope 다. envelope 가 없는 성공 응답만 `format: "json"`.
- **서버 역할은 원본 값으로 보존** — 프런트는 지금 역할로 메뉴·route 를 가르지 않는다. 실제 API 인가는 서버가 한다.
- **개인정보 쿼리는 기기에 저장하지 않는다** — `queryClient.ts` 의 `NON_PERSISTED_QUERY_KEY_PREFIXES`(`member`, `market/mine`, `group/detail`, `prayer/overview`, `lifeStudy/overview`)는 메모리에만 둔다. AsyncStorage 는 암호화가 없기 때문이다. 개인정보 쿼리를 새로 만들면 이 목록에 넣는다.
- **응답 해석은 화면이 쓰는 필드만 엄격** — mapper 는 화면이 쓰는 필드(id, 제목, 상태, 날짜 등)만 형식을 확인하고 나머지는 `null` 로 읽는다. 목록은 형식이 틀린 항목만 빼고, `reportResponseIssue({ source, reason })` 로 경로·필드 이름만 알린다(값·개인정보 금지). 응답 자체가 배열·객체가 아니면 `INVALID_RESPONSE`.
- **Sentry 는 배포 빌드에서만** — `__DEV__` 이거나 `EXPO_PUBLIC_SENTRY_DSN` 이 비면 켜지 않는다. 보고에는 쿼리 키 앞 두 조각·HTTP status·code 만 싣고 응답 본문·메시지·개인정보, 네트워크 오류·4xx 는 보내지 않는다. 소스맵 업로드는 아직 끔(`SENTRY_DISABLE_AUTO_UPLOAD=true`, #212).
- **기본 검증은 `npm run validate`** — visual capture/compare(`test:visual:*`)와 Maestro(`test:e2e:smoke`, `validate:full`)는 사용자가 요청하거나 디자인 번역·릴리스일 때만.
- **도메인 목록은 `.task-flow.conf`** — GitHub 라벨·`docs/features/` 파일 이름과 같은 이름을 쓴다.
- **탭 IA 는 홈/나눔/동행/기도/삶공부** — MY 는 홈에서 진입. 보고 있는 탭을 다시 누르면 이동하지 않고 맨 위로 스크롤, 다른 탭은 떠날 때 상태 그대로 연다 (#136).
- **디자인 토큰은 디자인 시스템 v2 (ADR 0007)** — `design-system/tokens.json` 을 고치고 `node scripts/sync-design-tokens.mjs` 로 `src/constants/designTokens.json` 을 만든다(`test:scripts` 가 어긋남을 잡음). 색은 `theme.colors` v2 이름만, 글자는 `theme.typography` 6단계(display/title/heading/body/label/caption)만, 그림자는 `sm`·`md`·`lg`·`sheet`(+ Fab 전용 `fab`)만. 옛 이름 별칭은 없다.
- **화면 코드에 색을 직접 쓰지 않는다** — hex/rgba 를 쓰면 `no-raw-colors` 테스트가 실패한다. 토큰이 없는 반투명 오버레이만 사유와 개수를 적어 허용 목록에 둔다.
- **글꼴·아이콘은 공통 컴포넌트가 고른다** — 글자는 `AppText` 나 `@/components/ui/text` 의 `Text`·`TextInput` 으로 그려야 굵기에 맞는 Pretendard 파일이 쓰인다(react-native `Text` 를 바로 쓰면 시스템 글꼴). 한국어 줄바꿈은 `AppText` 기본값 `lineBreakStrategyIOS="hangul-word"`. 아이콘은 `AppIcon`(Lucide).
- **스타일은 React Native StyleSheet + `theme` 단일 표준 (ADR 0006)** — Gluestack UI·NativeWind 는 쓰지 않는다. 공통 UI 는 `src/components/ui` 에 있고 `index.tsx` 가 barrel export 한다.
- **끝난 항목은 일부러 흐리게 둔다** — 모집완료 카드는 `theme.opacity.disabled`(0.5), 나눔완료는 `theme.opacity.soft`(0.8). 대비가 4.5:1 아래로 내려가는 것은 접근성 점검(#237)에서 확인 후 의도적으로 유지했고, 배지 글자로 상태를 함께 알린다.
- **버튼 높이 규격** — 다이얼로그 `Button size="dialog"`(48), 카드 안 `md`(44), 화면 하단 주 버튼 `lg`(52).
- **화면 상단은 `safe area + 20px`** — 이미지 hero overlay 는 예외, 등록 바텀 모달(`presentation: "modal"`)은 safe area 대신 좌우 여백과 같은 20px.
- **작성 입력은 `ModalFormTextInput` 소유** — 화면은 값·제약만 넘긴다. 검색은 `SearchField`.
- **입력 화면의 선택 칩은 줄바꿈** — 목록 필터는 가로 스크롤, 개설·등록 화면 카테고리는 `FilterChips wrap` 으로 모든 선택지를 한눈에 보인다.
- **체크 모양** — 여러 개 고르기·동의는 둥근 네모(`Checkbox`, 직접 그리면 `CheckboxMark`), 하나만 고르기는 동그라미(`Radio`).
- **sticky 헤더 기본 숨김은 direction(아래 12px / 위 4px)** — 화면이 `past-inset` / `never` 로 바꿀 수 있다. 숨긴 route 의 0 크기 layout 은 탭·필터 geometry 로 쓰지 않는다.
- **런타임 설정** — Node 는 `package.json` `engines`. iOS 는 `expo-build-properties` 의 `ios.enableSceneSupport` 로 scene lifecycle 을 켠다. `ios/`·`android/` 는 gitignore 이며 prebuild 로 다시 만든다.

## 미결

- #212 Sentry 소스맵·디버그 심볼 업로드 (Sentry org/project 와 `SENTRY_AUTH_TOKEN` 필요)

## 코드 위치

- 네트워크·캐시·오류: `src/lib/` (`apiClient`, `queryClient`, `sentry`, `reportResponseIssue`)
- 공통 타입: `src/types/api.ts`, `src/types/common.ts`
- 레이아웃·UI: `src/components/layout/`, `src/components/ui/`
- 디자인 토큰: `design-system/tokens.json`, `src/constants/` (`theme.ts`, `designTokens.json`), `scripts/sync-design-tokens.mjs`
- 스크립트·CI: `scripts/check-api-contract.mjs`, `scripts/api-contract/<도메인>.mjs`, `.github/workflows/ci.yml`
- 문서·규칙: `AGENTS.md`, `.task-flow.conf`, `docs/INDEX.md`

## 의존성 · 관련 ADR

- Expo SDK 57, Dev Client, Reanimated, TanStack Query, Zustand, Lucide(`lucide-react-native`), Sentry
- 작업 추적은 GitHub Issues / PR description. 홈 루트 화면 지도는 [home.md](home.md)
- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
- [ADR 0006 — Gluestack/NativeWind 퇴역 및 공통 UI 모듈화](../adr/0006-retire-nativewind-gluestack.md)
- [ADR 0007 — 디자인 시스템 v2 반영](../adr/0007-design-system-v2.md)
