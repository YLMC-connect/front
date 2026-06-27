# ADR 0001 — 기술 스택

> 상태: 수락 (Accepted) | 작성일: 2026-05-08 | 관련: [PLAN.md](../../PLAN.md) “🛠 기술 스택” · “⚠️ 버전 호환성 주의사항”

## 컨텍스트

YLMC Connect 는 iOS / Android 모두를 지원하는 교회 커뮤니티 앱이다. 단일 풀타임 개발자 + AI 협업 체계로 진행되며, 백엔드는 아직 미정이다 (→ [ADR 0002](0002-backend-tbd.md)). 따라서 다음 제약 위에서 스택을 결정해야 한다.

- **크로스플랫폼 단일 코드베이스** — iOS/Android 동시 출시, 추후 웹 가능성.
- **백엔드 무관 진행** — Mock 데이터로 UI 부터 완성하고, 추후 `services/` 만 교체.
- **검증된 조합 우선** — 신기술 학습 비용 < 안정성·문서화 가치.
- **버전 호환성 함정 사전 차단** — RN/Expo 생태계의 깨지기 쉬운 조합을 회피.

## 결정

다음 스택을 채택한다. 버전은 [PLAN.md “🛠 기술 스택”](../../PLAN.md) 표가 단일 출처이며 본 ADR 은 “왜” 만 설명한다.

### 런타임 · 라우팅

- **Expo SDK 55 (React Native 0.83 / React 19.2 / New Architecture 전용)**
  - Expo 의 OTA 업데이트 · EAS Build · 네이티브 API 추상화로 단일 개발자 운영 비용 최소화.
  - SDK 55 부터 Legacy Architecture 가 완전 제거되어, 채택 시 모든 서드파티 라이브러리의 New Arch 호환성을 첫날부터 확인해야 함 — **이 검증을 미루면 Phase 후반에 라이브러리 한 개 때문에 SDK 다운그레이드를 강요받는 사고**가 발생.
- **Expo Router v7** — 파일 기반 라우팅. 디렉토리 = 라우트 트리이므로 화면 추가 시 보일러플레이트 0. SDK 55 와 함께 배포되어 별도 버전 고정 불필요.

### 상태 관리 — 서버 / 클라이언트 명확히 분리

- **서버 상태: TanStack Query 5** — 페칭 · 캐싱 · 재시도 · 백그라운드 동기화의 사실상 표준. RN 에서는 `onlineManager` (NetInfo) + `focusManager` (AppState) 연동 + `query-async-storage-persister` 가 추가로 필요하다 (PLAN.md 의 RN 필수 설정 블록 참조).
- **클라이언트 상태: Zustand 5** — auth · UI 토글 등 서버와 무관한 상태만 담당. Redux 대비 보일러플레이트 1/10. React 18+ 필수이지만 React 19.2 사용으로 무관.
- **원칙**: 서버에서 온 데이터를 Zustand 에 복사하지 않는다. 두 곳에 저장하면 동기화 버그가 무한 발생.

### 폼 / 검증

- **화면별 local validation**
  - 현재 실제 입력 폼은 로그인, 회원가입, 기도제목 등록 3개뿐이다.
  - 별도 form/schema 라이브러리는 API 스키마가 늘어나거나 검증 규칙을 여러 화면에서 공유할 때 다시 채택한다.

### 스타일 — NativeWind v4 + StyleSheet (예외)

- **NativeWind v4 (Tailwind CSS for RN)** — `className` 으로 Tailwind 유틸리티 클래스를 RN 컴포넌트에 직접 적용. 화면 수가 30~50 으로 늘어나는 중간 규모에서 StyleSheet 만으로 가는 것보다 보일러플레이트가 크게 줄고, 디자인 토큰 일관성이 클래스 이름 자체로 강제됨.
- **디자인 토큰 단일 출처: `src/constants/theme.ts`** — `tailwind.config.js` 가 이 파일을 `require` 하여 `theme.extend.colors` / `spacing` / `fontSize` 로 흘려 넣는다. 따라서 토큰을 두 곳에 적을 일은 없음. JSX 에서는 `className="bg-brand"`, TS 에서는 `theme.colors.brand` 둘 다 같은 값에서 출발한다.
- **gluestack-ui는 보조 패턴 확보용 CLI로 둔다** — `gluestack-ui` CLI는 devDependency로 고정하되 `init`으로 기본 테마를 앱 기준에 섞지 않는다. 필요한 컴포넌트만 추가하고, Downloads 원본 JSX/token의 색상·간격·radius·타이포그래피·상태값으로 재정의한 뒤 프로젝트 공통 컴포넌트 계층에 흡수한다.
- **StyleSheet 는 “경계 케이스” 전용**: ① 차트/그래프 라이브러리의 색상 prop, ② React Navigation 헤더 옵션, ③ Sentry / 알림 등 네이티브 모달, ④ 동적 보간 (다크모드 색상 계산) — 즉 `className` 으로 표현 불가능한 곳만.
- **함정 4종**: PLAN.md 호환성 표에 명시 — Babel preset(`nativewind/babel`) · Metro 래퍼(`withNativeWind`) · entry 의 `import './global.css'` · `nativewind-env.d.ts` 중 하나라도 빠지면 **에러 없이 className 이 무시** 된다. Phase 1 NativeWind 셋업 작업이 4 개 게이트 모두 통과하도록 검증해야 함.

### 초기 보류 후 채택의 사유

본 ADR 작성 직후 NativeWind 는 “디자인 시스템을 처음부터 우리가 정의하는 단계라 토큰부터 안정시킨다” 는 이유로 보류되었다. 그러나 다음을 재검토한 결과 채택으로 전환:

- 토큰 안정화와 NativeWind 도입은 **상호 배타적이지 않음** — `theme.ts` 단일 출처 패턴에서는 토큰을 다듬는 동안에도 className 으로 사용 가능.
- 화면 규모(30~50 추정)에서 StyleSheet 만 쓸 때의 보일러플레이트 비용이 NativeWind 셋업 비용을 1~2 도메인 안에 회수.
- 단일 개발자 + AI 협업 환경에서 className 의 “보면 바로 의미가 보이는” 특성이 인계·리뷰 비용을 낮춤.

### 보안 · 모니터링

- **expo-secure-store** — iOS Keychain / Android Keystore. Phase 6/7 에서 토큰 저장. `AsyncStorage` 와 절대 혼동하지 않는다 (AsyncStorage 는 평문).
- **Sentry (@sentry/react-native)** — 에러 추적. **`beforeSend` 스크러빙 의무**: 기도제목 본문 · 회원 PII 가 이벤트에 포함되면 안 된다 (→ [ADR 0002](0002-backend-tbd.md) 의 개인정보 정책과 함께 검토).
- Sentry 는 Expo plugin 등록 (`app.json` plugins) 누락 시 소스맵이 안 붙어 디버깅 불능.

### 기타 핵심 의존성

- **TypeScript 5.8 strict** — 협업·리팩터링 안전망.
- **expo-image** — 캐싱 · placeholder · 메모리 최적화 내장. 표준 `Image` 대비 목록 스크롤에서 큰 차이.
- **MaterialIcons (`@expo/vector-icons`)** — Expo 내장으로 별도 폰트 등록 무비용.

### 개발 도구

- **ESLint (expo preset) + Prettier** — Expo 권장 설정 그대로 사용해 분쟁 회피.
- **Jest + @testing-library/react-native + jest-expo** — RN 표준 조합.
- **husky + lint-staged + commitlint** — 커밋 전 typecheck / lint / format 자동화. **Phase 1 P1 끝물에 우선 활성화** (CI 워크플로우 활성화 전이라도 로컬 게이트는 첫 커밋부터 작동).

## 고려했지만 채택하지 않은 대안

| 대안                                             | 기각 사유                                                                                                                                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bare React Native** (Expo 미사용)              | 단일 개발자에게 네이티브 빌드 · 인증 · 푸시 인프라 직접 운영은 비용 과다. Expo 가 “충분히 빠져나갈 수 있는” 추상화를 제공함.                                                                                |
| **Redux / Redux Toolkit**                        | 서버 상태는 Query 가, 클라 상태는 Zustand 가 더 적은 코드로 처리. RTK Query 도 후보였으나 RN 생태계 채택률은 TanStack Query 가 압도적.                                                                      |
| **Yup / zod 같은 schema validation 라이브러리**  | 현재 실제 폼 3개에는 공통 schema 계층이 과하다.                                                                                                                                                             |
| **react-hook-form + zod**                        | 실제 폼 3개에는 과하다. API 입력 스키마가 늘어나면 재검토한다.                                                                                                                                              |
| **date-fns**                                     | 현재 코드 사용처가 없다. `Date` / `Intl`로 충분하지 않은 날짜 로직이 생기면 재도입한다.                                                                                                                     |
| **react-navigation 직접 사용**                   | Expo Router 가 내부적으로 react-navigation 위에 얹혀 있어, 굳이 한 단계 낮은 API 를 직접 다룰 이유 없음.                                                                                                    |
| **NativeWind 미사용 (StyleSheet only)**          | 초기에 보류했으나 채택으로 전환. 위 “스타일” 섹션의 “초기 보류 후 채택의 사유” 참조.                                                                                                                        |
| **NativeWind 가 토큰 단일 출처 (theme.ts 폐기)** | 차트 라이브러리 색상 prop · 네이티브 모달 등 className 을 못 쓰는 경계 상황에서 hex 를 다시 꺼내기 번거로움. theme.ts 가 단일 출처이고 tailwind.config 가 import 하는 패턴이 양쪽에서 자연스럽게 접근 가능. |
| **Legacy Architecture 유지**                     | SDK 55 에서 제거되어 선택지 없음.                                                                                                                                                                           |

## 영향

- 모든 신규 의존성은 **New Architecture 호환** 을 PR 머지 전 확인해야 한다. 비호환이면 PR 차단.
- queryKey 는 `src/lib/queryKeys.ts` 에서만 생성한다 (PLAN.md “🔑 queryKey 컨벤션”). 흩어지면 무효화가 깨진다.
- 서버 데이터는 Zustand 에 절대 복사하지 않는다.
- Sentry `beforeSend` 가 빠진 채 production 빌드를 올리는 일은 없어야 한다 — Phase 1 의 “Sentry 초기화 + 스크러빙” 작업이 차단 게이트.
- **디자인 토큰 단일 출처는 `src/constants/theme.ts`**. `tailwind.config.js` 는 이를 `require` 하여 동기화한다. tailwind.config 에 직접 hex / 픽셀 값을 적지 않는다 (반대 방향 동기화 금지).
- 스타일은 className 우선. StyleSheet 는 위에 명시된 4 가지 경계 케이스에 한정한다.

## 변경 이력

- 2026-05-08 — 최초 수락. PLAN.md 의 기술 스택 표를 ADR 화하여 “왜” 를 영속화.
- 2026-05-08 — 스타일 도구 결정 갱신: 보류했던 NativeWind v4 를 채택으로 전환. `theme.ts` 단일 출처 + `tailwind.config.js` import 패턴. 기각 대안에서 “NativeWind 미사용” 과 “tailwind.config 단일 출처(theme.ts 폐기)” 두 안을 모두 기록.
- 2026-06-27 — 실제 사용처 기준으로 `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`를 제거하고 화면별 local validation으로 축소.
