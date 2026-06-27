# YLMC Connect

> 우리 교회(YLMC) 성도를 서로 이어주는 모바일 앱

## 무엇을 만드나

Notion “열린문커넥트” 최신 기획을 기준으로 **MVP + v1 모바일 화면** 을 Expo Dev Client 기반으로 제공합니다.
현재 범위는 회원가입/로그인 · 홈 · 나눔 · 소모임 · MY · 이미지 선택 · 삶공부 · 중보기도입니다. 실제 API가 없는 기능은 Mock-first 구조로 동작합니다.

## 진행 상태

```
[✅ Phase 0 기획] → [✅ Phase 1~5 MVP/v1 mock-first] → [🔵 Phase 6 API 연결 준비]
```

자세한 진행 상태와 도메인별 상태표: [docs/INDEX.md](docs/INDEX.md)

## 실행

```bash
npm install
npm run start:dev-client
```

Expo Go가 아니라 **development build가 설치된 기기/시뮬레이터** 에서 실행합니다.

Dev Client 빌드:

```bash
npm run ios:dev-client
npm run android:dev-client
```

EAS development build:

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

Metro만 먼저 확인하려면:

```bash
npm run start:dev-client -- --port 8081 --localhost
```

Codex 기본 샌드박스에서는 위 명령이 `Starting project...` 이후 8081 포트에 바인딩되지 않을 수 있습니다. 샌드박스 밖 로컬 권한으로는 `npm run test:dev-client:smoke`가 `http://localhost:8081/status` 응답까지 확인했습니다. development build가 설치된 iOS/Android 기기에서는 같은 Metro에 연결해 실제 앱 실행을 확인합니다.

검증 명령:

```bash
npm run validate
```

`validate`는 `typecheck`, `lint`, `format:check`, `test`를 순서대로 실행합니다. CI도 `npm ci` 후 `npm run validate`를 수행합니다.

단위/컴포넌트 테스트:

```bash
npm run test
npm run test:coverage
```

Jest + React Native Testing Library로 공통 UI, 도메인 옵션, 홈/나눔/소모임/동행(중보기도·삶공부)/MY 핵심 화면 렌더링을 mock-first 기준으로 확인합니다.

Dev Client Metro smoke:

```bash
npm run test:dev-client:smoke
```

이 명령은 `expo start --dev-client --port 8081 --localhost`를 띄우고 `http://localhost:8081/status` 응답을 확인한 뒤 종료합니다.

Maestro E2E smoke:

```bash
npm run test:e2e:smoke
```

Maestro smoke는 `com.ylmc.connect.dev` development build가 설치된 iOS Simulator 또는 Android Emulator에서 실행합니다. `test:e2e:smoke`는 Android Emulator 감지 시 로컬 Metro는 `http://localhost:8081/status`, Dev Client URL은 `http://127.0.0.1:8081` + `adb reverse` 기준으로 확인합니다. 그 외 기기는 LAN host를 사용합니다. Android Emulator에서는 스크립트가 ADB로 Dev Client deep link를 먼저 열고, Maestro 플로우가 Dev Client 안내 메뉴를 닫은 뒤 React Native `testID` 기반으로 홈, 나눔, 소모임, 동행, MY 5탭과 동행 내부 삶공부 segment 진입을 확인합니다. 다른 host/port가 필요하면 `EXPO_DEV_CLIENT_HOST`, `EXPO_DEV_CLIENT_PORT`, `EXPO_DEV_CLIENT_METRO_URL`, `EXPO_DEV_CLIENT_TARGET_METRO_URL`, `EXPO_DEV_CLIENT_URL` 환경변수로 덮어씁니다.

현재 로컬 환경에는 Maestro CLI `2.6.0`을 Homebrew로 설치했고, Android Emulator `Medium_Phone_API_36.1`에서 `npm run test:e2e:smoke` 통과를 확인했습니다. 새 환경에서는 Java 17+와 Xcode Command Line Tools를 확인한 뒤 다음 중 하나로 Maestro를 설치합니다:

```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
maestro --version
```

전체 로컬 검증:

```bash
npm run validate:full
```

`validate:full`은 `validate`, Dev Client Metro smoke, Maestro smoke를 순서대로 실행합니다. 로컬에 Maestro CLI나 development build가 없으면 E2E 단계는 실패하므로, 먼저 `npm run ios:dev-client` 또는 `npm run android:dev-client`로 dev build를 설치합니다.

무거운 모바일 E2E는 일반 PR CI와 분리되어 있으며, `.github/workflows/e2e-smoke.yml`에서 수동 실행을 기본값으로 둡니다. release/nightly 실행은 `E2E_SMOKE_ENABLED=true` repo variable과 Dev Client 설치가 가능한 전용 러너가 준비된 뒤 활성화합니다.

디자인 캡처/비교:

```bash
npm run test:visual:prepare
npm run test:visual:capture
npm run test:visual:compare
```

`test:visual:prepare`는 `/Users/mingulee/Downloads/열린문커넥트.zip`에서 110개 JSX 화면 inventory와 원본 PNG를 `/private/tmp/ylmc-golden-screens/2026-05-23` 아래에 재생성합니다. 원본 PNG 렌더링에는 로컬 Chrome/Chromium이 필요하며, inventory/manifest만 빠르게 만들 때는 `YLMC_PREPARE_ORIGINALS=0 npm run test:visual:prepare`를 사용할 수 있습니다.

`test:visual:capture`는 위 inventory를 Android Dev Client route로 열어 앱 스크린샷을 저장합니다. 일부 화면만 다시 찍을 때는 `YLMC_CAPTURE_INDEXES=29,30`처럼 지정할 수 있고, stale route를 줄이려면 `YLMC_CAPTURE_RESET_EACH_ROUTE=1 YLMC_CAPTURE_ROUTE_OPEN_REPEATS=2`를 함께 사용합니다. ZIP 원본 360x720 논리 viewport에 맞춰 비교할 때는 `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1`을 추가합니다. 이 옵션은 캡처 중 Android Emulator를 1080x2160@480으로 임시 조정하고 완료 후 원래 size/density로 복원합니다. 캡처 스크립트는 Dev Client first-run menu를 route 캡처 직전에 닫고, viewport override가 있으면 입력 좌표도 override size 기준으로 계산합니다. 로그인/가입 코드처럼 route 진입 후 고정 좌표 탭이 화면 버튼을 누를 수 있는 경우에는 `YLMC_CAPTURE_DISMISS_AFTER_ROUTE=0`으로 route 이후 dismiss 탭만 끕니다. `test:visual:compare`는 원본 PNG와 앱 PNG를 비교하되, 원본 PNG가 단색 빈 화면이면 report에 `originalFlat=yes`로 표시합니다. 이런 항목은 pixel diff보다 JSX 소스와 앱 캡처를 직접 비교합니다.

## 문서 지도

- 처음 보는 분: [docs/INDEX.md](docs/INDEX.md) 부터 — 5분에 전체 흐름 파악
- 설계 기준 문서: [PLAN.md](PLAN.md) — 기술 스택, 데이터 타입, Phase 정의
- 진행 작업: GitHub Issues — `gh issue list --state open` (label = 도메인). 기존 항목 보존: [docs/_archive/TASKS.md](docs/_archive/TASKS.md)
- 변경 이력: 머지된 PR description — `gh pr list --state merged --limit 30`. 기존 항목 보존: [docs/_archive/LOG.md](docs/_archive/LOG.md)
- AI 작업 규칙: [AGENTS.md](AGENTS.md) — Codex 동작 규약 (`CLAUDE.md` 는 Claude Code 호환본)
- 유지보수 / 드리프트 복구: [docs/MAINTENANCE.md](docs/MAINTENANCE.md)

## 기술 스택 (요약)

Expo SDK 55 · Expo Dev Client · React Native 0.83 · TypeScript · Expo Router SDK 55 계열 · TanStack Query · Zustand · local form validation · MaterialIcons · NativeWind v4. 상세는 [PLAN.md](PLAN.md) 의 “🛠 기술 스택”.
