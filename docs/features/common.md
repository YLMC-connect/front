# common (공통 인프라)

> 마지막 갱신: 2026-10-28 (직접 제스처 시에만 새로고침 스피너 노출. 탭 클릭 시 첫 화면 스택 리셋. FloatingBottomBar 공통화. Expo SDK 57. 웹 라이브 API는 검증 대상 아님. login/refresh도 공통 envelope. 선택 중인 루트 탭은 다시 열지 않음) | 담당 Phase: P1/P6/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

---

## ✅ 완료

> 지금 시스템이 어떻게 동작하는지. 날짜별 이력은 머지된 PR (`gh pr list --state merged --label common`).

- 처음 실행 안내 — `docs/GETTING_STARTED.md`와 `.env.example`. API origin은 `EXPO_PUBLIC_API_URL`(로컬 `.env`, gitignore). HTTP adapter일 때 없으면 Expo config가 실패. 웹은 브라우저 CORS 때문에 라이브 API 검증 대상이 아님(Dev Client). development 기본 adapter는 인증·나눔·동행 HTTP. 홈·기도·삶공부는 사용자 API가 없어 mock
- Expo SDK 57 + Dev Client 기준. 서버 데이터는 TanStack Query, 인증·UI는 Zustand. mock-first 후 `services/` 만 교체. iOS는 `ios.enableSceneSupport`로 scene lifecycle을 켠다
- Gluestack UI 및 NativeWind 퇴역 및 UI 모듈화 — 실제 미사용 중이던 Gluestack UI 및 NativeWind/Tailwind 관련 패키지 160개 및 설정 파일을 완전 제거하고, 1,775줄의 공통 UI index.tsx를 6개 서브모듈(buttons, display, inputs, navigation, dialog, feedback)로 분리 (Issue #119, ADR 0006)
- 본문 글꼴 Pretendard. 아이콘은 공통 `AppIcon`(Lucide Icons `lucide-react-native`, `weight="bold"` 시 strokeWidth 2.75 강조)
- 루트 5탭 홈/나눔/동행/기도/삶공부. MY는 홈에서 숨김 route. 상세는 탭 중첩 Stack. 탭 클릭 시 언제나 해당 탭의 첫 화면(`tab.href`)으로 스택을 깨끗하게 리셋(`router.replace`)하며, 이미 보고 있는 첫 화면을 다시 누르면 불필요하게 다시 열지 않는다
- 당겨서 새로고침(Pull-to-Refresh) 스피너는 사용자가 직접 화면을 손으로 끌어내렸을 때만 표시되며, 탭 전환·화면 진입·백그라운드 쿼리 갱신 시에는 새로고침 모션이 노출되지 않는다 (`StickyHeaderScreen`, `Screen`의 `isPullRefreshing` 제어)
- 화면 상단은 `safe area + 20px`. 이미지 hero overlay는 예외이며, 등록 바텀 모달(presentation: "modal")은 safe area 대신 좌우 여백(screenX=20px)과 동일한 상단 여백 적용
- 루트 탭은 glass sticky 헤더 + `StickyHeaderScreen`. 기본 숨김은 아래 12px / 위 4px(`direction`). 화면 오버레이(`overlay`)는 `ScreenHeader` 상위 레이어로 배치되어 플로팅 메뉴 backdrop이 헤더까지 온전히 덮는다
- 화면 하단 고정 액션 바 공통화 — `FloatingBottomBar` 및 `FLOATING_BOTTOM_BAR_INSET = 130`. 배경 그라데이션(`LinearGradient` 0~1 투명도)과 Safe Area 바닥 인셋(`Math.max(insets.bottom, 24)`)을 자동 계산하며 회원가입/신청/모달/약관/탈퇴 등 하단 CTA 액션 바를 일원화
- 작성 입력은 공통 `ModalFormTextInput`(primary 2px 포커스). 검색은 `SearchField`
- 숨긴 웹 route의 `0×0` layout은 탭·필터 geometry로 쓰지 않음
- API client는 기본 `{ code, message, data }` envelope. 비envelope 성공만 `format: "json"`
- 인증·나눔·동행 Swagger 계약 검사 스크립트 (`test:api:contract*`)
- PR CI 게이트는 `npm run validate`. visual 비교와 Maestro는 요청 시
- 오류 리포트는 Sentry(`@sentry/react-native`). `app/_layout.tsx`가 `initSentry()`를 부르고, 초기화했을 때만 루트를 `Sentry.wrap`으로 감싼다. 배포 빌드 + `EXPO_PUBLIC_SENTRY_DSN`이 있을 때만 전송. 화면이 처리하는 오류 중 서버 응답 형식 오류(`INVALID_RESPONSE`, 4xx 제외)는 `queryClient`의 Query/MutationCache `onError`가 `reportInvalidResponse`로 보고한다

---

## 주요 파일

| 경로                                           | 역할                                                          |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `AGENTS.md` / `CLAUDE.md`                      | AI 작업 규칙                                                  |
| `.task-flow.conf`                              | 도메인 목록 단일 출처                                         |
| `docs/GETTING_STARTED.md`                      | 클론·Dev Client·라이브 API / mock 실행 안내                   |
| `.env.example`                                 | `EXPO_PUBLIC_API_URL`과 adapter 스위치                        |
| `docs/INDEX.md`                                | 진입점. 도메인 상태표는 Issues 기반 자동생성                  |
| `scripts/gen-index.sh`                         | INDEX 상태표 재생성                                           |
| `docs/MAINTENANCE.md`                          | 문서 드리프트 복구                                            |
| `src/lib/apiClient.ts`                         | envelope·오류·Authorization                                   |
| `src/lib/sentry.ts`                            | Sentry 초기화·wrap·응답 형식 오류 보고                        |
| `src/types/common.ts`                          | 공통 회원·서버 역할 타입                                      |
| `src/lib/rolePermissions.ts`                   | 관리자 도메인별 역할 접근 판별                                |
| `src/constants/theme.ts` / `designTokens.json` | 디자인 토큰                                                   |
| `src/components/layout/Screen.tsx`             | 공통 화면 + 상단 inset                                        |
| `src/components/layout/StickyHeaderScreen.tsx` | 루트 탭 sticky 헤더·필터                                      |
| `src/components/ui/floating-bottom-bar.tsx`    | FloatingBottomBar 하단 플로팅 액션 바                         |
| `src/components/ui/buttons.tsx`                | Button, FloatingActionButton 공통 컴포넌트                    |
| `src/components/ui/display.tsx`                | Card, Badge, Avatar, VisualThumb, VisualCover, Chip           |
| `src/components/ui/inputs.tsx`                 | TextField, Textarea, ImagePickerField, FormSection            |
| `src/components/ui/navigation.tsx`             | TopBar, SegmentedTabs, HorizontalChips                        |
| `src/components/ui/dialog.tsx`                 | ConfirmDialog, BottomSheet, RadioSheet                        |
| `src/components/ui/feedback.tsx`               | Empty, EmptyState, ErrorState, SuccessState, Toast            |
| `src/components/ui/motion.tsx`                 | MotionPressable, MotionEnter, MotionPop, AnimatedProgressFill |
| `src/components/ui/index.tsx`                  | 6개 서브모듈 barrel export                                    |
| `.github/workflows/ci.yml`                     | PR `npm run validate`                                         |
| `scripts/check-*-api-contract.mjs`             | Swagger 계약 검사                                             |
| `scripts/prepare-design-artifacts.mjs` 등      | ZIP 시각 비교. **요청 시에만**                                |

홈 루트 화면 지도는 [home.md](home.md).

## 데이터 타입

[../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통” 참조. `ApiResponse<T>` 는 `src/types/api.ts`.

## 결정 사항 (지금 유효한 것만)

- **공통 Empty 컴포넌트 표준화 (FAQ 기준 통일 스펙)** — 빈 목록/데이터 부재 상태를 위한 `Empty` 공통 컴포넌트(`src/components/ui/feedback.tsx`)를 FAQ 화면 기준으로 통일. 84px 큰 원형 배경(`surface2`), 42px 큰 아이콘(`inkHint`), `cardTitle` 볼드 제목 및 `caption` 설명 문구로 구성하며 상하 정중앙 배치(`flex: 1`, `justifyContent: "center"`)를 유지하고 일체의 CTA 버튼을 배제. 약관, 개인정보처리방침, FAQ, 차단 목록, 내 활동, 나눔, 소모임, 기도, 삶공부 전반에 일관되게 적용.
- **화면 전환 배경색 고정 및 전 하위 Stack 우측 슬라이드(`slide_from_right`) 모션 일원화** — 루트 `<Tabs>`와 각 하위 Stack(`market`, `group`, `prayer`, `life-study`, `mypage`)에 `sceneStyle` / `contentStyle: { backgroundColor: theme.colors.bg }` 및 `animation: "slide_from_right"`를 일괄 지정해 화면 전환 시 흰색 플래시를 방지하고, iOS 및 Android 전 기기에서 모든 상세 진입/퇴장이 일관된 우측 슬라이드로 동작하도록 통일. 상세 진입 시 `AppTabBar`는 `180ms` 페이드·슬라이드(`translateY`)로 부드럽게 숨겨지도록 개선.
- **서버 역할은 공통 타입으로 보존** — `UserRole`은 `ADMIN`, `USER`, 도메인별 `MANAGER_*` 역할을 원본 값으로 유지한다. 프런트 판별은 메뉴/route 노출용이며 실제 API 인가는 서버가 담당한다.
- **개인정보 쿼리는 기기에 저장하지 않음** — React Query 캐시는 AsyncStorage(암호화 없음)에 24시간 저장하되, `src/lib/queryClient.ts` 의 `NON_PERSISTED_QUERY_KEY_PREFIXES`(`member`, `market/mine`, `group/detail`, `prayer/overview`, `lifeStudy/overview`)로 시작하는 쿼리는 메모리에만 둔다. 개인정보 쿼리를 새로 만들면 이 목록에 넣는다.
- **API origin은 로컬 env만** — `EXPO_PUBLIC_API_URL`. 실제 호스트를 코드·문서·`.env.example`에 두지 않음. HTTP adapter를 쓰는 동안 없으면 `app.config.ts`가 실패. mock만이면 URL 없이 실행 가능.
- **웹 라이브 API는 검증 대상이 아님** — 브라우저 CORS. 서버 CORS를 열지 않는 한 `npm run web`으로 라이브 인증을 맞추지 않음. 검증 기준은 Expo Dev Client.
- **development 기본 adapter는 HTTP** — 인증·나눔·동행. 홈·기도·삶공부는 사용자 API가 생길 때까지 mock. 테스트와 Maestro mock 계정은 `EXPO_PUBLIC_*_ADAPTER=mock`.
- **기본 검증은 `npm run validate`** — visual capture/compare 와 Maestro/`validate:full` 은 사용자가 요청하거나 디자인 번역·릴리스일 때만.
- **features `✅ 완료` 는 현재 동작** — 작업 일시는 머지된 PR description.
- **도메인 목록은 `.task-flow.conf`** — `home` 포함. INDEX 표는 이 목록 + Issues 라벨.
- **공유용 mock 웹은 공식 제품이 아님** — `export:web:mock` 정적 export. 검증 기준은 Expo Dev Client. (코드는 별도 PR)
- **API client `format: "json"` 은 opt-in** — 기본은 `{ code, message, data }`에서 `data`만 반환. login/refresh도 이 envelope를 쓴다.
- **본문 글꼴 Pretendard / 아이콘 Solar** — 화면이 글꼴·아이콘 세트를 직접 고르지 않음.
- **UI 톤은 조용한 깔끔함** — 제목 bold, 카드 hairline, ZIP 픽셀 맞춤보다 톤 일관성.
- **화면 상단 `safe area + 20px`** — 나눔 상세 이미지 overlay는 예외이며, 등록 바텀 모달(presentation: "modal")은 safe area 대신 좌우 여백(screenX=20px)과 동일한 상단 여백을 모달 자체에 적용.
- **작성 입력은 `ModalFormTextInput` 소유** — 화면은 값·제약만.
- **sticky 기본 숨김은 direction(12px/4px)** — hide mode를 화면이 바꿀 수 있음 (`past-inset` / `never`).
- **숨긴 route의 0 크기 layout은 무시** — 마지막 양수 geometry 유지.
- **탭 IA는 홈/나눔/동행/기도/삶공부** — MY는 홈 진입. 보고 있는 루트 탭을 다시 누르면 이동하지 않고, 다른 탭은 탭 네비게이터로 전환해 이미 떠 있는 화면을 유지한다. Issue #136.
- **Expo Dev Client 기준** — Expo Go 아님.
- **런타임은 Expo SDK 57** — React Native 0.86. Node는 `package.json` `engines`(`^22.13.0 || ^24.3.0 || >=25.0.0`)이고 CI는 22.22.0. iOS는 `expo-build-properties`의 `ios.enableSceneSupport`로 UIKit scene lifecycle을 켠다. `userInterfaceStyle: light`는 `expo-system-ui`가 적용한다. `ios/`·`android/`는 gitignore이며 prebuild로 다시 만든다.
- **Gluestack UI 및 NativeWind 퇴역 (ADR 0006)** — 순수 React Native StyleSheet + `src/constants/theme.ts` 단일 표준 확정. 1,775줄 ui/index.tsx를 6개 서브모듈로 모듈화하되 하위 호환성을 위해 barrel export 유지.
- **Sentry는 배포 빌드에서만** — `__DEV__`이거나 `EXPO_PUBLIC_SENTRY_DSN`이 비면 초기화하지 않는다. DSN은 로컬 `.env`/EAS env에만 둔다. 응답 형식 오류 보고에는 쿼리 키 앞 두 조각·HTTP status·code 태그만 싣고, 응답 본문·메시지·개인정보는 보내지 않는다. 네트워크 오류·4xx 는 보내지 않는다. 소스맵·디버그 심볼 자동 업로드는 아직 끔(`SENTRY_DISABLE_AUTO_UPLOAD=true`: `eas.json`, `ios:dev-client`/`android:dev-client` 스크립트). 업로드를 켜려면 Sentry org/project와 `SENTRY_AUTH_TOKEN`이 필요하다.
- **Mock-first** — API 없는 도메인은 service/mock 후 adapter 교체.

## 미결 / 추적

- #212 Sentry 소스맵·디버그 심볼 업로드 (auth token 필요)
- hook 테스트: mutation hook(나눔·동행·기도·삶공부·MY)은 `src/test/renderHookWithClient.tsx` 로 서비스 인자·캐시 갱신/무효화 key·실패 시 캐시 유지를 검증한다. 남은 것은 query hook(`useHome`, `useHomeTodayProgress`, 삶공부 조회, 목록 페이지네이션)
- #25 Android TopBar 캡처 이상은 시각 파이프라인을 다시 돌릴 때
- mock 웹의 실제 Vercel URL은 계정 연결 후

## 의존성

- GitHub Issues / PR description 작업 추적
- Expo SDK 57, Dev Client, Reanimated 4, TanStack Query, Zustand, Solar icons

## 관련 ADR

- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
- [ADR 0006 — Gluestack/NativeWind 퇴역 및 공통 UI 모듈화](../adr/0006-retire-nativewind-gluestack.md)
