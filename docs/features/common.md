# common (공통 인프라)

> 마지막 갱신: 2026-07-12 | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

---

## ✅ 완료

> AI 의 Pass 0/1 에서는 본 섹션을 **스킵** 합니다. 결과물 재사용 트리거가 있을 때만 본문 정독.
> 끝난 작업의 결과만 짧게. 상세 변경 이력은 머지된 PR description (`gh pr list --state merged --label common`).

- 공통 모션 시스템 적용 — Reanimated 기반 140~220ms 모션 토큰, 동작 줄이기 대응, `MotionPressable`, 선택 적용 Card 등장, Dialog/Sheet/Toast presence 전환을 공통 UI에 반영
- 탭 선택 indicator 공통화 — 하단 5탭은 이동 indicator와 선택 아이콘 pop을 사용하고, 나눔 상태 탭·동행 소모임/봉사·기도 작성 선택 탭은 공통 `SegmentedTabs` 이동 indicator를 공유
- Codex 작업 규칙 진입점 정리 — `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/INDEX.md`, `docs/MAINTENANCE.md`
- Expo SDK 55 앱 기반 생성 — `package.json`, `app.config.ts`, `eas.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
- 공통 런타임/디자인 기반 생성 — `src/lib/queryClient.ts`, `src/lib/queryKeys.ts`, `src/lib/secureStore.ts`, `src/constants/theme.ts`, `src/components/ui/index.tsx`, `src/components/layout/Screen.tsx`
- Expo Dev Client 기반 추가 — `expo-dev-client`, `npm run start:dev-client`, `ios:dev-client`, `android:dev-client`, `eas.json` development profile
- 전역 에러 바운더리와 CI(`validate`) 추가 — `app/_layout.tsx`, `.github/workflows/ci.yml`
- 자동 테스트 게이트 추가 — `npm run validate`, Jest/RNTL smoke, Dev Client Metro smoke, Maestro v1 탭 E2E smoke
- Android Emulator 기반 Maestro smoke 실제 검증 — `maestro 2.6.0`, `Medium_Phone_API_36.1`, `com.ylmc.connect.dev`
- Android Emulator Maestro smoke 안정화 — emulator 감지 시 Metro 상태 확인은 `localhost`, Dev Client deep link는 `127.0.0.1` + `adb reverse`를 사용하고, Dev Client 안내 메뉴는 `.maestro/smoke.yml`에서 `Continue`/닫기 처리 후 앱 탭 검증으로 넘김
- `열린문커넥트.zip` 디자인 번역 1차 반영 — 홈 화면, floating tab bar, 주요 v1 탭 목록 화면, 공통 `VisualThumb`/`VisualCover`, 카드/버튼/입력/칩 터치 영역 조정
- `열린문커넥트.zip` 원본 화면 105개 라우트 매핑 — `variant` 기반 reference 화면으로 auth/home/market/group/prayer/study/me 전체 접근 경로 확보
- `열린문커넥트.zip` 원본 화면 110개 기준 갱신 — JSX inventory를 기준으로 `my-wishlist`, `notif-settings`, `support`, `inquiry`, `account`까지 포함하고 Dev Client 앱 캡처/비교 스크립트를 추가
- Dev Client Maestro smoke 시작 상태 고정 — Dev Client 안내 메뉴는 조건부로 닫고 `ylmc-connect:///` 루트 딥링크를 연 뒤 v1 탭 smoke를 실행해 이전 캡처 route/dialog 상태에 영향받지 않도록 함
- 숨김 상세 route 시각 기준 정렬 — 실제 pathname 기준으로 루트 탭에서만 floating tab bar를 표시하고, 상세/모달/확인 화면은 원본 ZIP처럼 하단 탭 여백을 제거
- 폐기된 ZIP 5탭 정보구조 재정렬 — 한때 루트 탭을 홈/나눔/소모임/동행/MY로 맞췄으나, Downloads preview 확인 후 홈/나눔/동행/기도/삶공부로 대체
- ZIP 공통 디자인 토큰/컴포넌트 정렬 — `app-tokens.css`, `halo-tokens.css`, 공통 JSX의 button/card/tab/form/dialog/sheet/toast 패턴을 `theme.ts`, 공통 UI, Screen, custom tab bar에 React Native 방식으로 반영
- ZIP TopBar/Avatar 공통 패턴 정렬 — 상세 화면 back pill은 `뒤로` label을 포함하고, Avatar는 ZIP `gradFor` 해시 팔레트와 같은 색상 기준을 사용
- ZIP `Thumb` 공통 패턴 정렬 — `VisualThumb`는 ZIP JSX처럼 icon prop이 있을 때만 아이콘을 렌더링하고, 기본 썸네일은 추상 도형만 표시
- Dev Client Maestro smoke 서버 선택 보강 — Dev Client가 `DEVELOPMENT SERVERS` 화면에 머물면 `.maestro/smoke.yml`에서 개발 서버를 먼저 선택한 뒤 v1 탭 smoke를 실행
- 디자인 viewport 기반 부분 캡처 옵션 추가 — `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1` 사용 시 Android Emulator를 1080x2160@480으로 임시 조정해 ZIP 360x720 논리 viewport에 맞춰 캡처하고, 캡처 후 원래 size/density로 복원
- ZIP frame safe-area 정렬 — `Screen`은 ZIP `phone-status` 44px frame을 기준으로 top offset을 맞추고, 하단 fixed action/tab 계열은 ZIP처럼 bottom inset 위로 과도하게 뜨지 않도록 bottom safe-area padding을 제거
- ZIP RadioSheet compact/footer 정렬 — 긴 radio 목록은 ZIP 신고 sheet처럼 20px radio mark와 12px row padding을 사용하고, sheet footer는 48px pill 버튼으로 맞춤
- ZIP visual artifact 재생성 자동화 — `npm run test:visual:prepare`로 ZIP standalone HTML에서 110개 inventory/manifest/original PNG를 다시 만들고, full `npm run test:visual:compare`를 `screens=110`, `missing=0`으로 복구
- ZIP animated original settle 반영 — bottom sheet/toast animation이 끝난 최종 프레임을 기준으로 원본 PNG를 재생성하도록 `scripts/prepare-design-artifacts.mjs`에 `YLMC_PREPARE_RENDER_SETTLE_MS` 대기값을 추가
- Dev Client Maestro smoke 후행 메뉴 처리 보강 — 루트 딥링크 이후 늦게 표시되는 `Continue`/`Reload` developer menu도 조건부로 닫고 탭 검증을 진행
- Dev Client visual capture 메뉴 처리 보강 — design viewport override 시 입력 좌표는 `Override size`를 우선 사용하고, route 캡처 직전에 Expo Dev Client first-run menu를 짧게 dismiss해 overlay가 스크린샷에 섞이지 않도록 함
- HorizontalChips fixed row 보강 — non-scroll root screen에서도 ZIP chip row처럼 고정 높이를 유지하도록 horizontal ScrollView에 `flexGrow: 0`을 적용
- ZIP `ScreenNotifications` 구조 정렬 — 알림 reference 화면을 카드 목록이 아니라 ZIP의 `오늘`/`지난 알림` section label, unread soft row, circular icon, unread dot, `모두 읽음` top action 구조로 재구성
- ZIP `ActionBtn` compact action 정렬 — 나눔/소모임 상세 reference의 action button을 큰 원형 아이콘 카드가 아니라 ZIP의 44px inline icon+label button으로 재구성
- ZIP root overlay 패턴 정렬 — 멤버 관리처럼 list body와 Toast가 같이 있는 reference 화면은 `Screen` 기본 ScrollView에 Toast를 넣지 않고, 내부 ScrollView와 root fixed Toast layer로 분리
- ZIP bottom CTA surface 정렬 — 공통 `Button`의 Pressable style을 정적 surface로 확정해 Android Dev Client에서 배경/크기 없이 text만 보이던 bottom-flat CTA를 ZIP pill 버튼으로 복구
- auth/input 화면 부분 캡처 안정화 — route 진입 후 Dev Client dismiss 탭이 로그인/가입 버튼을 누르지 않도록 `YLMC_CAPTURE_DISMISS_AFTER_ROUTE=0` 옵션을 추가
- ZIP 홈 섹션 rhythm 정렬 — `ScreenHome` 기준 section header padding과 홈 소모임 카드 padding을 맞춰 `home` residual을 `16.96→15.42`로 낮춤
- 폐기된 ZIP 5탭 icon state 정렬 — 기존 홈/나눔/소모임/동행/MY 탭 아이콘 기준은 Downloads preview의 홈/나눔/동행/기도/삶공부 기준으로 대체
- ZIP `Thumb` proportional geometry 정렬 — 공통 `VisualThumb`의 추상 circle 위치/크기/opacity를 ZIP `Thumb` SVG 수식 기준으로 번역
- Maestro smoke ANR overlay 처리 보강 — Android Emulator가 일시적으로 `Process system isn't responding` dialog를 띄우면 `Wait`를 누른 뒤 Dev Client menu 처리와 5탭 smoke를 이어가도록 `.maestro/smoke.yml` 보강
- ZIP FAB root overlay 정렬 — 공통 `FloatingActionButton`도 정적 pill surface로 렌더링하고, FAB 사용 목록 화면은 body ScrollView와 root FAB layer를 분리해 ZIP `Phone` 구조에 맞춤
- 보수적 저장소 정리 — ZIP에서 재생성 가능한 루트 `index.html`, GitHub Issues 이관 후 남은 `.task-flow.conf`, 호출처 없는 준비 코드와 form/date-fns 의존성, 부정확해질 수 있는 RN reference 번역본을 제거하고, Downloads 원본과 peer dependency 연결 후보는 유지
- 홈 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `screens-home.jsx`의 프로필 카드, 오늘의 기도제목, 내 활동 요약 구조를 `/` route에 RN으로 직접 반영
- 알림 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenNotifications`의 오늘/지난 알림 section, unread row, circular icon, unread dot, 모두 읽음 action을 `/notifications` route에 RN으로 직접 반영
- 부정확한 reference/scaffold runtime 제거 — Downloads 원본이 확인된 화면은 실제 route로 옮기고, 원본 없는 reference route와 호출처 없는 modal/profile scaffold route를 삭제
- Downloads preview 탭 IA 재정렬 — 하단 탭을 홈/나눔/동행/기도/삶공부로 맞추고, MY는 홈 프로필 카드 진입으로 전환
- gluestack-ui Provider 적용 — `GluestackUIProvider`를 앱 루트에 연결하고, NativeWind/Tailwind 기존 설정은 유지
- 오래된 문서 정리 — GitHub Issues/PR로 이관된 archive 문서는 안내문만 남기고, PLAN.md의 폐기된 탭 설명을 최신 홈/나눔/동행/기도/삶공부 IA로 갱신
- CI lockfile 정합성 복구 — gluestack 전이 의존성의 peer 요구인 `@react-spectrum/provider@3.11.1`을 명시해 GitHub Actions의 `npm ci` 실패를 해소

---

## 주요 파일 (도메인 파일 지도)

| 경로                                                          | 역할                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                                   | Codex가 읽는 프로젝트 작업 규칙                                                                                                                                                                                                            |
| `CLAUDE.md`                                                   | Claude Code 호환용 작업 규칙 복사본                                                                                                                                                                                                        |
| `docs/INDEX.md`                                               | 작업자용 문서 진입점과 도메인 상태표                                                                                                                                                                                                       |
| `docs/MAINTENANCE.md`                                         | 문서 드리프트 복구 런북                                                                                                                                                                                                                    |
| `scripts/gen-index.sh`                                        | GitHub Issues 기반 도메인 상태표 재생성                                                                                                                                                                                                    |
| `docs/features/common.md`                                     | common 도메인 컨텍스트                                                                                                                                                                                                                     |
| `package.json`, `package-lock.json`                           | 공통 런타임 의존성과 CI 재현 가능한 npm lockfile                                                                                                                                                                                          |
| `app/_layout.tsx`                                             | QueryClient, SafeArea, Router Provider 루트                                                                                                                                                                                                |
| `app/(tabs)/_layout.tsx`                                      | Downloads preview 기준 홈/나눔/동행/기도/삶공부 5탭 layout와 glass custom floating tab bar                                                                                                                                                 |
| `app/(tabs)/index.tsx`                                        | 디자인 번역 기반 홈 화면. 홈 프로필 카드에서 숨김 MY route로 진입                                                                                                                                                                          |
| `app/(tabs)/group/index.tsx`                                  | Downloads `동행` 탭 루트. 내부에서 소모임/봉사 segment 전환                                                                                                                                                                                |
| `app/(tabs)/prayer/index.tsx`                                 | Downloads `기도` 하단 탭 루트. 기도 목록 화면 렌더링                                                                                                                                                                                       |
| `app/(tabs)/life-study/index.tsx`                             | Downloads `삶공부` 하단 탭 루트. 삶공부 목록 화면 렌더링                                                                                                                                                                                   |
| `src/components/faith/FaithSectionsScreen.tsx`                | 기도/삶공부 목록의 공유 렌더러. route가 아니라 `/prayer`, `/life-study`에서 section prop으로 사용                                                                                                                                          |
| `src/components/ui/index.tsx`                                 | ZIP 토큰 기준 Button, Card, Badge, Chip, form, modal/dialog, sheet, toast, FAB 등 공통 UI                                                                                                                                                  |
| `src/components/ui/motion.tsx`                                | Reanimated 기반 공통 press scale과 overlay presence 제어. 시스템 동작 줄이기 설정을 반영                                                                                                                                                  |
| `src/components/gluestack-ui/gluestack-ui-provider/index.tsx` | gluestack overlay/toast provider. 앱 루트에서 light mode로 사용                                                                                                                                                                            |
| `src/constants/theme.ts`                                      | `열린문커넥트.zip` 기준 color, radius, font, lineHeight, weight, shadow 디자인 토큰                                                                                                                                                        |
| `jest.setup.ts`                                               | Jest mock 설정과 Expo Router/native module 테스트 어댑터                                                                                                                                                                                   |
| `src/test/renderWithClient.tsx`                               | TanStack Query 화면 테스트용 test wrapper                                                                                                                                                                                                  |
| `.github/workflows/ci.yml`                                    | PR/push `npm ci` + `npm run validate`                                                                                                                                                                                                      |
| `.github/workflows/e2e-smoke.yml`                             | 수동/release/nightly용 Maestro smoke workflow 뼈대                                                                                                                                                                                         |
| `scripts/dev-client-smoke.mjs`                                | Expo Dev Client Metro 부팅과 `/status` 응답 확인                                                                                                                                                                                           |
| `scripts/maestro-smoke.mjs`                                   | Metro 확인/부팅과 Dev Client deep link를 거쳐 Maestro smoke 실행. Android Emulator는 `localhost`/`127.0.0.1` + `adb reverse` 기준이며 ADB로 Dev Client를 먼저 연 뒤 `.maestro/smoke.yml`이 메뉴/탭 검증을 담당                             |
| `scripts/design-screen-routes.mjs`                            | ZIP JSX inventory 110개 화면을 Expo Router route와 screenshot filename으로 매핑                                                                                                                                                            |
| `scripts/prepare-design-artifacts.mjs`                        | ZIP에서 110개 visual inventory와 원본 PNG를 재생성. 기본 출력은 `/private/tmp/ylmc-golden-screens/2026-05-23`                                                                                                                              |
| `scripts/capture-design-screens.mjs`                          | Android Dev Client에서 design route 스크린샷 캡처. `YLMC_CAPTURE_INDEXES`, `YLMC_CAPTURE_RESET_EACH_ROUTE`, `YLMC_CAPTURE_ROUTE_OPEN_REPEATS`, `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT`, `YLMC_CAPTURE_DISMISS_AFTER_ROUTE`로 부분 재캡처 가능 |
| `scripts/compare-design-screens.mjs`                          | 원본/앱 스크린샷 normalized diff 생성. 원본 PNG가 단색 빈 화면이면 `originalFlat`로 표시해 JSX 기준 검토 대상으로 분리                                                                                                                     |
| `.maestro/smoke.yml`                                          | v1 핵심 탭 진입 `testID` 기반 E2E smoke                                                                                                                                                                                                    |

## 데이터 타입

[../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통” 참조.

## 결정 사항 (최신 위)

- (2026-07-12) **짧은 상호작용 모션은 공통 토큰과 Reanimated로 관리한다** — 140~220ms 범위의 press/선택/overlay 전환을 사용하고 시스템 동작 줄이기 설정에서는 이동·확대를 생략합니다. 화면별 카드·목록 등장 효과는 자동 적용하지 않고 명시적으로 선택합니다.
- (2026-07-12) **화면 내부 선택 탭은 공통 `SegmentedTabs`를 사용한다** — 나눔의 전체/나눔중/예약중/나눔완료와 동행의 소모임/봉사, 기도 작성의 작성자 표시를 같은 이동 indicator와 접근성 상태로 관리합니다.
- (2026-07-10) **CI의 peer dependency 요구는 lockfile 우회 없이 명시한다** — gluestack 전이 의존성이 요구하는 `@react-spectrum/provider@3.11.1`을 직접 고정합니다. `npm ci --legacy-peer-deps`로 검증을 약화하지 않고 Node 20.19.4/npm 10.8.2 기준 깨끗한 설치를 유지합니다.
- (2026-06-29) **archive 문서는 이관 안내만 유지한다** — 작업 목록은 GitHub Issues, 변경 이력은 PR description이 단일 출처이므로 `docs/_archive/LOG.md`와 `docs/_archive/TASKS.md`는 긴 과거 본문 대신 조회 안내만 둡니다.
- (2026-06-27) **탭 IA는 Downloads preview 기준을 따른다** — 하단 탭은 `홈/나눔/동행/기도/삶공부`입니다. `MY`는 하단 탭에서 제거하고 홈 상단 `내 정보 보기` 카드로 진입합니다. `동행` 탭 내부는 Downloads `ScreenGroupList`/`ScreenServiceList`처럼 `소모임/봉사` segment를 둡니다.
- (2026-06-27) **부정확한 reference/scaffold runtime은 제거한다** — Downloads 최신 원본이 확인된 화면은 실제 RN route로 옮기고, 원본이 확인되지 않는 reference route나 호출처 없는 modal/profile scaffold route는 유지하지 않습니다.
- (2026-06-27) **디자인 기준은 Downloads 원본 하나로 둔다** — `/Users/mingulee/Downloads/열린문커넥트.zip`과 압축 해제 폴더를 디자인 단일 기준으로 사용합니다. RN으로 옮긴 `OriginalMockScreens`와 임시 reference 안내 화면은 최신 원본과 어긋날 수 있어 제거합니다.
- (2026-06-27) **주요 화면은 placeholder가 아니라 실제 RN 화면으로 되돌린다** — Downloads 원본을 확인하라는 안내 화면은 임시 연결용이며, 구현 대상 route는 원본 JSX/token을 기준으로 실제 앱 화면을 직접 렌더링합니다. 홈 route부터 `screens-home.jsx` 구조를 RN으로 반영합니다.
- (2026-06-27) **알림 route도 실제 RN 화면으로 렌더링한다** — Downloads `ScreenNotifications` 구조를 `/notifications`에 직접 반영하고, reference export는 제거합니다.
- (2026-06-27) **gluestack-ui는 Provider부터 적용한다** — `GluestackUIProvider`를 앱 루트에 연결합니다. NativeWind v4/Tailwind v3 기존 설정과 Downloads 디자인 토큰은 유지하며, 개별 컴포넌트는 화면에 직접 흩뿌리지 않고 공통 UI 계층에서 필요한 것만 흡수합니다.
- (2026-06-27) **폐기됨: 루트 탭 홈/나눔/소모임/동행/MY** — Downloads `PREVIEW_TAB_ROUTES` 확인 결과 실제 기준은 홈/나눔/동행/기도/삶공부이며, 이 결정은 위 최신 결정으로 대체합니다.
- (2026-05-27) **FAB도 ZIP root overlay surface로 관리한다** — `FloatingActionButton`은 공통 `Button`과 같이 정적 Pressable surface를 사용해 Android Dev Client 캡처에서 배경/크기 누락을 막습니다. `Screen` scroll content 안에 FAB를 두면 ZIP `Phone`의 fixed root layer와 달라지므로 FAB가 있는 reference 화면은 `Screen scroll={false}` + 내부 ScrollView + root FAB 구조로 둡니다.
- (2026-05-27) **폐기됨: 기도/삶공부를 동행 내부에 둔다** — 최신 Downloads preview에서는 기도와 삶공부가 독립 하단 탭입니다. 동행 내부 segment는 소모임/봉사만 유지합니다.
- (2026-05-27) **`VisualThumb` circle geometry는 ZIP SVG 수식을 비율로 번역한다** — ZIP `Thumb`는 100x100 viewBox에서 큰 circle `r=32 opacity=.35`, 작은 circle `r=22 opacity=.22`를 seed 기반 center로 배치합니다. RN `VisualThumb`도 size prop에 비례해 같은 center/diameter/opacity를 계산하고, fixed 58/38px orb는 사용하지 않습니다.
- (2026-05-27) **Maestro smoke는 Android 시스템 ANR dialog를 환경 overlay로 처리한다** — Dev Client가 정상 앱 화면을 띄운 뒤에도 Emulator가 `Process system isn't responding` dialog를 일시 표시할 수 있으므로, smoke flow는 해당 dialog에서 `Wait`를 누르고 기존 Dev Client `Continue`/`Reload` 처리로 복귀합니다. 이 처리는 앱 기능 검증 대상이 아니라 테스트 환경 안정화입니다.
- (2026-05-27) **홈 section header는 ZIP `.sec-head` rhythm을 따른다** — 공통 `Section`은 다른 화면의 밀도를 유지하고, 홈 reference 화면만 ZIP `ScreenHome`의 `padding: 16px 18px 8px` section header와 14px 소모임 카드 padding을 별도 wrapper로 번역합니다.
- (2026-05-27) **공통 Button은 정적 Pressable surface로 렌더링한다** — Android Dev Client에서 Pressable style callback이 bottom-flat CTA의 배경/크기 surface를 누락시키는 캡처가 확인되어, ZIP pill 버튼 재현을 우선해 `Button`은 정적 style로 렌더링합니다. pressed opacity보다 ZIP의 button surface 유지가 우선입니다.
- (2026-05-27) **auth/input visual capture는 route 이후 dismiss 탭을 끌 수 있다** — 로그인 화면처럼 fixed 좌표 dismiss가 화면 CTA를 누를 수 있는 route는 `YLMC_CAPTURE_DISMISS_AFTER_ROUTE=0`으로 route 진입 후 dismiss 탭을 생략합니다. 기본값은 기존처럼 dismiss를 수행해 Dev Client overlay 혼입을 막습니다.
- (2026-05-27) **visual capture 입력 좌표는 override viewport 기준을 우선한다** — `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1`은 Android `wm size` override를 적용하므로, tap helper가 Physical size만 읽으면 Dev Client `Continue` 버튼 아래를 누르게 됩니다. 캡처 스크립트는 `Override size`를 우선 읽고 route 캡처 직전에도 짧게 Dev Client 메뉴를 닫습니다.
- (2026-05-27) **horizontal chip row는 non-scroll 화면에서도 높이를 고정한다** — `HorizontalChips`가 non-scroll `Screen`에서 남는 flex height를 먹으면 ZIP의 얇은 chip row가 세로로 늘어나므로, 공통 ScrollView에 `flexGrow: 0`을 둡니다.
- (2026-05-27) **알림 화면은 ZIP sectioned flat list를 우선한다** — 현재 앱의 카드형 알림 목록은 기준이 아니며, `screens-extra-home.jsx`의 `ScreenNotifications`처럼 `오늘`/`지난 알림` section과 unread row 배경, 38px circular icon, 6px unread dot, `모두 읽음` text action을 RN reference 화면에 번역합니다.
- (2026-05-27) **상세 action은 ZIP `ActionBtn` inline 구조를 따른다** — 나눔/소모임 상세 action은 별도 원형 icon tile이 아니라 `screens-market.jsx`/`screens-group.jsx`의 `ActionBtn`처럼 44px 높이, transparent background, icon+label inline button으로 번역합니다.
- (2026-05-27) **Toast overlay는 ZIP `Phone` root layer에 맞춘다** — `Screen` 기본 ScrollView 안에 `Toast`를 넣으면 긴 list 화면에서 toast가 viewport 밖으로 밀리므로, ZIP `CheckToast`처럼 root fixed layer에 놓이도록 화면 body를 내부 ScrollView로 분리합니다.
- (2026-05-27) **Maestro smoke는 루트 딥링크 이후 Dev Client 메뉴도 닫는다** — Expo Dev Client developer menu가 앱 루트 로딩 뒤 늦게 표시되면 `tab-home`을 가려 false negative가 발생하므로, `.maestro/smoke.yml`은 `openLink` 이후에도 `Continue`/`Reload`를 한 번 더 조건부 처리합니다.
- (2026-05-27) **ZIP 원본 캡처는 animation settle 이후 저장한다** — `BottomSheet`, `TermsSheet`, toast처럼 ZIP JSX가 CSS animation을 쓰는 화면은 렌더 직후 2 rAF만 기다리면 중간 프레임이 원본 PNG로 저장됩니다. `test:visual:prepare`는 기본 320ms settle 이후 캡처하며, 필요 시 `YLMC_PREPARE_RENDER_SETTLE_MS`로 조정합니다.
- (2026-05-26) **visual compare 원본은 ZIP에서 재생성한다** — `/private/tmp` 산출물이 정리되면 기본 `npm run test:visual:compare`가 inventory 없이 실패하므로, `test:visual:prepare`가 ZIP `app.jsx` artboard 105개와 extra MY 5개를 합쳐 110개 inventory/manifest를 만들고, standalone HTML을 headless Chrome으로 렌더링해 원본 PNG를 재생성합니다.
- (2026-05-26) **`Screen` safe-area는 ZIP phone frame을 기준으로 번역한다** — Android native status inset(약 24dp)을 그대로 쓰면 ZIP의 44px `phone-status`보다 콘텐츠가 위로 붙고, bottom inset을 적용하면 comment composer가 ZIP보다 위로 뜹니다. `Screen`은 top을 최소 44dp로 보정하고 bottom inset은 fixed action geometry에 포함하지 않습니다.
- (2026-05-26) **긴 `RadioSheet`는 compact row를 사용한다** — 신고처럼 항목이 많은 bottom sheet는 ZIP `ReportSheet`와 같이 20px radio mark, 12px row padding, 48px footer pill 버튼을 사용합니다. 짧은 상태 변경 sheet는 기존 generic rhythm을 유지합니다.
- (2026-05-26) **visual capture는 필요 시 ZIP 논리 viewport에 맞춘다** — Android Emulator 기본 해상도(1080x2400@420)는 ZIP 원본 360x720과 논리 viewport가 달라 layout diff를 키우므로, 부분 visual compare에서는 `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1`로 1080x2160@480을 임시 적용해 360x720dp 기준에 맞춥니다. 스크립트는 캡처 후 원래 `wm size/density`를 복원합니다.
- (2026-05-26) **`VisualThumb` 기본형은 ZIP `Thumb`처럼 icon-less** — ZIP 공통 JSX의 `Thumb`는 `icon`을 넘긴 경우에만 아이콘을 표시하므로, RN `VisualThumb`도 기본 `redeem` 아이콘을 제거하고 호출부가 명시적으로 요청할 때만 아이콘을 렌더링합니다.
- (2026-05-26) **Dev Client smoke는 서버 선택 화면도 조건부 처리한다** — Android Emulator에서 앱 상태를 clear하면 Expo Dev Client가 `DEVELOPMENT SERVERS` 화면에 남을 수 있으므로, `.maestro/smoke.yml`은 해당 화면이 보일 때 개발 서버 row를 탭하고 `Reload` 메뉴를 닫은 뒤 앱 루트 딥링크 검증을 진행합니다.
- (2026-05-25) **공통 UI 토큰은 ZIP app-level tokens를 우선 번역한다** — `app-tokens.css`의 primary/surface/ink/line/radius/shadow/type, `halo-tokens.css`의 glass/elevation/type 기준을 `theme.ts`에 반영하고, Button/Card/Badge/Chip/SegmentedTabs/TopBar/Dialog/Sheet/Toast/FAB/Input은 화면별 땜질보다 공통 컴포넌트에서 먼저 맞춥니다. RN에서 직접 표현이 어려운 CSS blur/box-shadow는 `borderColor`, `shadow*`, `elevation` 조합으로 번역합니다.
- (2026-05-25) **상세 TopBar와 Avatar는 ZIP 공통 JSX를 따른다** — `TopBar` back affordance는 원형 아이콘이 아니라 `뒤로` text pill이며, `Avatar` 색상은 이름/seed 해시 기반 ZIP 팔레트를 사용합니다. gradient는 새 라이브러리 없이 solid swatch로 번역합니다.
- (2026-05-25) **폐기됨: 탭 구조는 ZIP 5탭 기준으로 한다** — 루트 탭 홈/나눔/소모임/동행/MY와 기도/삶공부 동행 segment 결정은 Downloads preview 확인 후 폐기했습니다.
- (2026-05-23) **시각 검증은 JSX + Dev Client 캡처를 함께 본다** — ZIP의 JSX를 화면 구조/컴포넌트 원천으로 보고, 스크린샷은 실제 렌더링 확인용으로 사용합니다. 원본 PNG가 단색 빈 화면이면 `compare` report의 `originalFlat`를 근거로 pixel diff를 품질 판단에서 제외하고 JSX 소스를 우선합니다.
- (2026-05-23) **루트 탭과 숨김 route의 하단 여백을 분리한다** — Expo Router tabs state는 상세 route에서도 루트 탭을 유지할 수 있으므로, floating tab bar와 `Screen` 하단 padding은 `usePathname()`의 실제 path 기준으로 적용합니다.
- (2026-05-23) **Maestro smoke는 루트 route에서 시작한다** — Dev Client가 이전 deep link route나 confirm dialog를 복원할 수 있으므로, smoke flow는 안내 메뉴를 조건부로 닫은 뒤 `ylmc-connect:///`를 열어 홈 탭부터 검증합니다.
- (2026-05-23) **ZIP 화면 기준은 110개** — `/Users/mingulee/Downloads/열린문커넥트.zip` 최신 inventory 기준 구현 대상은 110개 화면/상태입니다. 채팅/v2는 제외하되, ZIP 안에 있는 v1 화면은 route와 screenshot capture 대상으로 둡니다.
- (2026-05-23) **ZIP에 있는 화면은 모두 구현 대상으로 본다** — 제품 기본 플로우와 별개로, `/Users/mingulee/Downloads/열린문커넥트.zip`의 110개 화면/상태는 `variant` 라우트로 접근 가능해야 하며 누락 화면을 임의 제외하지 않습니다.
- (2026-05-23) **Android Emulator E2E URL 분리** — Maestro smoke에서 Android Emulator가 감지되면 Metro 상태 확인은 host의 `localhost:8081`을 보고, Dev Client 앱에는 `adb reverse`가 동작하는 `127.0.0.1:8081` URL을 전달합니다. Dev Client 안내 메뉴는 앱 기능 검증 대상이 아니므로 `.maestro/smoke.yml`에서 `Continue`와 닫기 동작만 처리한 뒤 v1 탭 `testID` 검증으로 넘어갑니다.
- (2026-05-23) **디자인 ZIP은 RN 번역 기준으로 사용** — `열린문커넥트.zip`의 CSS/JSX를 직접 이식하지 않고, 색상·간격·카드·버튼·탭·폼 톤을 Expo React Native 컴포넌트로 번역합니다.
- (2026-05-23, 2026-05-25 폐기) **탭 구조는 PLAN/Notion v1 기준 유지** — ZIP prototype의 5탭보다 6탭을 우선하던 결정은 제공 디자인 산출물을 최우선 기준으로 재정의하면서 폐기했습니다.
- (2026-05-22) **Codex 작업 규칙 SSOT** — Codex는 `AGENTS.md`를 기준으로 읽고, `CLAUDE.md`는 Claude Code 호환본으로 유지합니다. 문서 링크는 `AGENTS.md`를 우선 가리킵니다.
- (2026-05-23) **PR 자동 검증 게이트** — `npm run validate`는 `typecheck`, `lint`, `format:check`, `test`를 묶고, GitHub Actions PR CI는 `npm ci` 후 `npm run validate`를 실행합니다.
- (2026-05-23) **Jest/RNTL smoke 우선 적용** — v1 mock-first 범위에서는 공통 UI, 도메인 옵션, 핵심 탭 화면 렌더링을 먼저 자동화하고 실제 API/푸시/업로드 스토리지는 제외합니다.
- (2026-05-23) **NativeWind Babel 설정** — `nativewind/babel`은 Babel plugin 위치가 아니라 preset 위치에 둡니다. plugin 위치에 두면 Metro 번들링에서 `.plugins is not a valid Plugin property`로 실패합니다.
- (2026-05-23) **Expo Router 탭 이름** — Expo Router v7 탭 screen name은 실제 route인 `market/index`, `group/index` 등을 사용하고 상세 route는 `href: null`로 탭에서 숨깁니다.
- (2026-05-22) **Expo Dev Client 기준** — Expo Go가 아니라 development build와 `expo start --dev-client`를 검증 기준으로 둡니다.
- (2026-05-23) **모바일 E2E는 Maestro 우선** — Expo Dev Client가 설치된 Simulator/Emulator에서 `scripts/maestro-smoke.mjs`가 LAN Metro를 확인/부팅하고 deep link를 열어, `.maestro/smoke.yml`로 v1 핵심 탭 진입을 `testID` 기준으로 확인합니다.
- (2026-05-22) **Mock-first 앱 기반** — 실제 API가 없는 도메인은 TanStack Query hook과 service/mock 레이어를 먼저 만들고, 실제 API 연결 시 service만 교체합니다.
- (2026-05-22) **이미지 선택은 MVP 포함** — 실제 업로드는 제외하지만 `expo-image-picker` 기반 로컬 선택/미리보기는 공통 UI로 제공합니다.

## 미결 / 추적

- `AGENTS.md` 와 `CLAUDE.md` 의 수동 동기화 부담을 줄일 자동 검증 여부는 추후 필요 시 결정합니다.
- Sentry SDK 설치/초기화, husky/lint-staged는 후속 작업입니다.
- Jest/RNTL은 smoke 범위부터 적용했습니다. 서비스 mutation, hook edge case, 상세/작성 화면 테스트는 Phase 6 이후 API adapter 범위와 함께 확장합니다.
- Codex 기본 샌드박스에서는 `expo start --dev-client --port 8081 --localhost`가 `Starting project...` 이후 8081에 바인딩되지 않을 수 있습니다. 샌드박스 밖 로컬 권한에서는 `npm run test:dev-client:smoke`로 `/status` 응답을 확인했습니다.
- Maestro CLI `2.6.0`은 Homebrew tap(`mobile-dev-inc/tap`)으로 설치되어 있으며, Android Emulator `Medium_Phone_API_36.1`에서 `npm run test:e2e:smoke` 통과 이력이 있습니다. 현재 smoke 기준은 홈/나눔/동행/기도/삶공부 탭 진입입니다.
- 제공 ZIP 110개 화면은 `test:visual:prepare` → Dev Client full capture/partial recapture → `test:visual:compare`로 검증하며 현재 비교 리포트 기준 `screens=110`, `missing=0`, `originalFlat=0`입니다. 남은 residual diff는 상태바/SafeArea, React Native 폰트·모달 번역 차이와 실제 UI 차이를 분리해 추적합니다.
- 2026-05-27 ZIP FAB root overlay 정렬 후 비교 리포트는 `screens=110`, `missing=0`입니다. 대표 residual은 `market-list-all 15.27→13.75`, `group-list 11.61→10.21`, `pray-list 13.32→12.28`, `pray-request 10.17→9.34`로 낮췄습니다. 남은 상위 residual은 `splash`, `me-privacy`, `home`, market detail/create 계열입니다.

## 의존성

- GitHub Issues / PR description 기반 작업 추적 규칙에 의존합니다.
- Expo SDK 55, Expo Dev Client, Reanimated 4, TanStack Query, Zustand, NativeWind, `expo-image-picker`, `expo-image`, `@react-spectrum/provider@3.11.1`에 의존합니다.

## 관련 ADR

- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
