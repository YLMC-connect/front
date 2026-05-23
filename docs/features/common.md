# common (공통 인프라)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

---

## ✅ 완료
> AI 의 Pass 0/1 에서는 본 섹션을 **스킵** 합니다. 결과물 재사용 트리거가 있을 때만 본문 정독.
> 끝난 작업의 결과만 짧게. 상세 변경 이력은 머지된 PR description (`gh pr list --state merged --label common`).

- Codex 작업 규칙 진입점 정리 — `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/INDEX.md`, `docs/MAINTENANCE.md`
- Expo SDK 55 앱 기반 생성 — `package.json`, `app.config.ts`, `eas.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
- 공통 런타임/디자인 기반 생성 — `src/lib/queryClient.ts`, `src/lib/queryKeys.ts`, `src/lib/secureStore.ts`, `src/constants/theme.ts`, `src/components/ui/index.tsx`, `src/components/layout/Screen.tsx`
- Expo Dev Client 기반 추가 — `expo-dev-client`, `npm run start:dev-client`, `ios:dev-client`, `android:dev-client`, `eas.json` development profile
- 전역 에러 바운더리와 CI(`validate`) 추가 — `app/_layout.tsx`, `.github/workflows/ci.yml`
- 자동 테스트 게이트 추가 — `npm run validate`, Jest/RNTL smoke, Dev Client Metro smoke, Maestro v1 탭 E2E smoke
- Android Emulator 기반 Maestro smoke 실제 검증 — `maestro 2.6.0`, `Medium_Phone_API_36.1`, `com.ylmc.connect.dev`
- Android Emulator Maestro smoke 안정화 — emulator 감지 시 Metro 상태 확인은 `localhost`, Dev Client deep link는 `127.0.0.1` + `adb reverse`를 사용하고 Dev Client welcome sheet는 좌표 탭으로 넘김
- `열린문커넥트.zip` 디자인 번역 1차 반영 — 홈 화면, 6탭 floating tab bar, 주요 v1 탭 목록 화면, 공통 `VisualThumb`/`VisualCover`, 카드/버튼/입력/칩 터치 영역 조정
- `열린문커넥트.zip` 원본 화면 105개 라우트 매핑 — `variant` 기반 reference 화면으로 auth/home/market/group/prayer/study/me 전체 접근 경로 확보

---

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `AGENTS.md` | Codex가 읽는 프로젝트 작업 규칙 |
| `CLAUDE.md` | Claude Code 호환용 작업 규칙 복사본 |
| `docs/INDEX.md` | 작업자용 문서 진입점과 도메인 상태표 |
| `docs/MAINTENANCE.md` | 문서 드리프트 복구 런북 |
| `scripts/gen-index.sh` | GitHub Issues 기반 도메인 상태표 재생성 |
| `docs/features/common.md` | common 도메인 컨텍스트 |
| `app/_layout.tsx` | QueryClient, SafeArea, Router Provider 루트 |
| `app/(tabs)/_layout.tsx` | Expo Router 6탭 layout와 custom floating tab bar |
| `app/(tabs)/index.tsx` | 디자인 번역 기반 홈 화면 |
| `src/components/ui/index.tsx` | Button, Card, Badge, form, state, modal, image picker 등 공통 UI |
| `src/components/prototype/OriginalMockScreens.tsx` | ZIP 원본 화면 상태를 Expo RN에서 확인하기 위한 mock-first reference 화면 묶음 |
| `src/constants/theme.ts` | `열린문커넥트.zip` 기준 디자인 토큰 |
| `jest.setup.ts` | Jest mock 설정과 Expo Router/native module 테스트 어댑터 |
| `src/test/renderWithClient.tsx` | TanStack Query 화면 테스트용 test wrapper |
| `.github/workflows/ci.yml` | PR/push `npm ci` + `npm run validate` |
| `.github/workflows/e2e-smoke.yml` | 수동/release/nightly용 Maestro smoke workflow 뼈대 |
| `scripts/dev-client-smoke.mjs` | Expo Dev Client Metro 부팅과 `/status` 응답 확인 |
| `scripts/maestro-smoke.mjs` | Metro 확인/부팅과 Dev Client deep link를 거쳐 Maestro smoke 실행. Android Emulator는 `localhost`/`127.0.0.1` + `adb reverse` 기준 |
| `.maestro/smoke.yml` | v1 핵심 탭 진입 `testID` 기반 E2E smoke |

## 데이터 타입
[../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통” 참조.

## 결정 사항 (최신 위)
- (2026-05-23) **ZIP에 있는 화면은 모두 구현 대상으로 본다** — 제품 기본 플로우와 별개로, `/Users/mingulee/Downloads/열린문커넥트.zip`의 105개 화면/상태는 `variant` 라우트로 접근 가능해야 하며 누락 화면을 임의 제외하지 않습니다.
- (2026-05-23) **Android Emulator E2E URL 분리** — Maestro smoke에서 Android Emulator가 감지되면 Metro 상태 확인은 host의 `localhost:8081`을 보고, Dev Client 앱에는 `adb reverse`가 동작하는 `127.0.0.1:8081` URL을 전달합니다. Dev Client 안내 sheet는 앱 기능 검증 대상이 아니므로 좌표 탭으로 통과합니다.
- (2026-05-23) **디자인 ZIP은 RN 번역 기준으로 사용** — `열린문커넥트.zip`의 CSS/JSX를 직접 이식하지 않고, 색상·간격·카드·버튼·탭·폼 톤을 Expo React Native 컴포넌트로 번역합니다.
- (2026-05-23) **탭 구조는 PLAN/Notion v1 기준 유지** — ZIP prototype은 `동행`으로 일부 기능을 묶은 5탭이지만, 현재 v1 범위는 홈/나눔/소모임/삶공부/중보기도/MY 6탭이므로 floating tab bar만 디자인 톤을 반영합니다.
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
- Maestro CLI `2.6.0`은 Homebrew tap(`mobile-dev-inc/tap`)으로 설치되어 있으며, Android Emulator `Medium_Phone_API_36.1`에서 `npm run test:e2e:smoke` 통과를 확인했습니다.
- 제공 ZIP 105개 화면의 자동 스크린샷 diff는 이번 범위에서 확정하지 않았습니다. Expo Dev Client development build에서 앱 route deep link가 DevLauncherActivity로 먼저 잡히는 문제가 있어, 별도 시각 회귀 테스트는 후속 작업으로 분리합니다.

## 의존성
- GitHub Issues / PR description 기반 작업 추적 규칙에 의존합니다.
- Expo SDK 55, Expo Dev Client, TanStack Query, Zustand, NativeWind, `expo-image-picker`, `expo-image`에 의존합니다.

## 관련 ADR
- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
