# 작업 목록 (이전됨)

> **2026-05-09**: 본 TASKS 는 GitHub Issues 로 이전되었습니다. 진행 작업은 `gh issue list --state open` (도메인 필터: `--label <도메인>`, 본인 작업: `--assignee @me`). 본 파일은 마이그레이션 이전 항목의 영구 보존본이며, 아래 미완료 작업들은 사용자 승인 후 `gh issue create` 로 이전 예정입니다.

> 큰 그림은 [../../PLAN.md](../../PLAN.md) 의 Phase 정의 (milestone = Phase N), 도메인 상태는 [../INDEX.md](../INDEX.md) 의 자동생성 도메인 상태표.

표기:
- `[P1]` 우선순위 1 (즉시) / `[P2]` 다음 / `[P3]` 여유 시
- `[<도메인>]` 작업이 속한 도메인 — common / auth / market / group / life-study / prayer

---

## 🔵 진행 중 (동시 1~2건)

(없음 — 다음 작업 시 “🔥 다음” 에서 1건을 여기로 옮깁니다.)

---

## 🔥 다음 (Phase 1 세팅) — 작업 순서대로

> 의존성 설치는 **4 묶음(A → B → D → C)** 으로 분할합니다. 한 묶음을 끝낼 때마다 `npx expo-doctor` + `npx expo start` 스모크 테스트 → 커밋. 한 묶음이라도 New Architecture 비호환이 발견되면 즉시 멈추고 ADR 보강. 묶음 D(NativeWind) 직후에 셋업 단계가 따로 들어갑니다.

### 1) 의사결정 영속화 (코드 작업 0번째)

- [x] [P1] [common] **ADR 0001 — 기술 스택** 작성 ([docs/adr/0001-tech-stack.md](adr/0001-tech-stack.md))
- [x] [P1] [common] **ADR 0002 — 백엔드 선택 보류 (Mock-first)** 작성 ([docs/adr/0002-backend-tbd.md](adr/0002-backend-tbd.md))

### 2) 프로젝트 골격

- [ ] [P1] [common] `create-expo-app` 으로 프로젝트 생성 (`--template blank-typescript`) + 폴더 골격 (app/, src/{components,store,services,hooks,lib,types,constants,mocks}, assets/, .github/workflows/) 생성
  - 검증: `npx expo start` 로 빈 앱 부팅 확인 → 커밋

### 3) 의존성 설치 — 묶음 A (코어 상태/네트워크)

- [ ] [P1] [common] 의존성 설치 묶음 A
  ```bash
  npx expo install @tanstack/react-query
  npm install @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
  npx expo install @react-native-async-storage/async-storage
  npx expo install @react-native-community/netinfo
  npm install zustand
  ```
  - 검증: `npx expo-doctor` 통과 + `npx expo start` 부팅 → 커밋
- [ ] [P1] [common] `src/lib/queryClient.ts` — QueryClient + onlineManager(NetInfo) + focusManager(AppState) + AsyncStorage persister 연결
- [ ] [P1] [common] `src/lib/queryKeys.ts` — 도메인별 queryKey 컨벤션 (PLAN.md “🔑 queryKey 컨벤션” 그대로)
- [ ] [P1] [common] Root layout 에 QueryClientProvider 연결 + 빈 화면에서 Query DevTools 또는 useQuery 1건으로 동작 확인 → 커밋

### 4) 의존성 설치 — 묶음 B (폼·이미지·날짜)

- [ ] [P1] [common] 의존성 설치 묶음 B
  ```bash
  npm install react-hook-form zod @hookform/resolvers
  npm install date-fns
  npx expo install expo-image expo-image-picker expo-image-manipulator
  ```
  - 검증: `npx expo-doctor` 통과 + 부팅 확인 → 커밋
  - 주의: `@hookform/resolvers ^5.2.2` 이상 설치되었는지 확인 (zod v4 호환성)

### 5) 의존성 설치 — 묶음 D (스타일 시스템 — NativeWind)

> 묶음 C 보다 먼저 설치합니다. NativeWind 셋업 후에야 의미 있는 화면을 만들 수 있고, husky 의 typecheck 게이트(묶음 C 의 dev-tools 활성화 후)가 `nativewind-env.d.ts` 의 className 타입까지 통과해야 하기 때문입니다.

- [ ] [P1] [common] 의존성 설치 묶음 D
  ```bash
  npx expo install nativewind react-native-reanimated react-native-safe-area-context
  npm install -D tailwindcss prettier-plugin-tailwindcss
  ```
  - 검증: `npx expo-doctor` 통과 + 부팅 확인 → 커밋
  - 주의: NativeWind v4 는 `react-native-reanimated` 와 `react-native-safe-area-context` 가 peer dep. Expo SDK 가 이미 의존하고 있다면 중복 경고는 무시 가능.

### 6) NativeWind 셋업 — 4 게이트 통과

> [PLAN.md “⚠️ 버전 호환성 주의사항”](../PLAN.md) 의 NativeWind 행 참조. 4 가지 모두 충족해야 className 이 작동합니다 (한 개라도 빠지면 **에러 없이** 무시됨).

- [ ] [P1] [common] `src/constants/theme.ts` 작성 — 디자인 토큰의 단일 출처. 우선 `colors.brand`, `spacing.gutter`, 폰트 1~2 개 등 임시 값으로 시작 (P2 의 본격 토큰 작업이 이를 채워 나감)
- [ ] [P1] [common] `tailwind.config.js` 작성 — `theme.ts` 를 `require` 하여 `theme.extend.colors / spacing / fontSize` 로 흘려 넣기. content 경로: `./app/**/*.{ts,tsx}`, `./src/**/*.{ts,tsx}`
- [ ] [P1] [common] `babel.config.js` 에 `nativewind/babel` preset 등록 (게이트 1)
- [ ] [P1] [common] `metro.config.js` 에 `withNativeWind(metroConfig, { input: './global.css' })` 래퍼 적용 (게이트 2)
- [ ] [P1] [common] root `global.css` 작성 — `@tailwind base; @tailwind components; @tailwind utilities;` (게이트 3)
- [ ] [P1] [common] entry (`app/_layout.tsx` 또는 expo-router entry) 최상단에 `import '../global.css'` 추가 (게이트 3 연결)
- [ ] [P1] [common] root `nativewind-env.d.ts` 작성 — `/// <reference types="nativewind/types" />` (게이트 4)
- [ ] [P1] [common] **검증**: 빈 화면에 `<View className="flex-1 items-center justify-center bg-blue-500"><Text className="text-white text-xl">NativeWind OK</Text></View>` 렌더 — 파란 배경 + 흰 글씨가 실제로 적용되는지 디바이스/시뮬레이터에서 확인 → 커밋

### 7) 의존성 설치 — 묶음 C (보안·모니터링·dev-tools)

- [ ] [P1] [common] 의존성 설치 묶음 C
  ```bash
  npx expo install expo-secure-store
  npx expo install expo-notifications expo-device expo-constants
  npx expo install @sentry/react-native
  npm install -D eslint prettier
  npm install -D jest @testing-library/react-native @types/jest jest-expo
  npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
  ```
  - 검증: `npx expo-doctor` 통과 + 부팅 확인 → 커밋
  - 주의: Sentry 는 `app.json` plugins 등록 필요 (소스맵). expo-notifications 는 development build 필요 (Expo Go 일부 미지원).

### 8) 핵심 인프라 코드

- [ ] [P1] [common] `src/lib/secureStore.ts` — 토큰 저장 유틸 (Phase 6/7 에서 사용)
- [ ] [P1] [common] Sentry 초기화 + `beforeSend` 스크러빙 (기도제목 본문·PII 제거) — production 빌드 차단 게이트
- [ ] [P1] [common] Root layout 에 QueryClientProvider + Zustand + Sentry + 에러 바운더리 연결

### 9) 커밋 전 게이트 — Phase 1 마무리에 우선 활성화

> CI 워크플로우는 P3 로 두되, **로컬 게이트는 첫 도메인 작업(Phase 2) 진입 전에 반드시 작동** 해야 함. 안 그러면 typecheck 통과 안 한 코드가 누적됨.

- [ ] [P1] [common] husky + lint-staged + commitlint 설정 — pre-commit 에서 typecheck (`tsc --noEmit`) + ESLint + Prettier (prettier-plugin-tailwindcss 로 className 정렬) 자동 실행
- [ ] [P2] [common] `src/types/` 도메인별 분리 (common / market / group / lifeStudy / prayer)
- [ ] [P2] [common] `src/constants/theme.ts` 본격 디자인 토큰 채우기 (WCAG AA 색상 검증) — 6) 단계의 임시 토큰을 본 단계에서 확장. tailwind.config 는 자동 반영됨
- [ ] [P2] [common] 5탭 네비게이션 뼈대 (MaterialIcons, NativeWind className)

### 10) 운영 인프라 — 여유 시

- [ ] [P3] [common] GitHub Actions typecheck/lint/test 워크플로우 (`.github/workflows/ci.yml`)
- [ ] [P3] [common] Jest + RTL 설정 + 샘플 테스트 1개
- [ ] [P3] [common] `app.config.ts` + `eas.json` profiles (dev/preview/production)

---

## 📋 백로그

Phase 2~10 의 산출물 범위와 큰 그림은 [../PLAN.md](../PLAN.md) “🚀 개발 단계 (Phase)” 표가 단일 출처입니다. 새 작업이 가시화되면 본 섹션 또는 “🔥 다음” 으로 옮겨 우선순위를 부여합니다.

- **Phase 2 (market) 진입 시 동시 처리**: `docs/features/_template.md` 를 `docs/features/market.md` 로 복사 + 상단 메타 채움 (CLAUDE.md 의 “새 도메인 작업 첫 진입” 트리거)
- **Phase 5 종료 직전**: ADR 0003 — 백엔드 플랫폼 결정 ([ADR 0002](adr/0002-backend-tbd.md) 의 보류 해제)

---

## 🧊 보류 (의존성 또는 결정 대기)

(없음)
