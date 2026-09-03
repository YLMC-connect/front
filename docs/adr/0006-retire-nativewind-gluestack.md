# ADR 0006 — Gluestack UI 및 NativeWind 퇴역, 순수 React Native StyleSheet 체제 확정

- **상태**: 수락
- **일자**: 2026-09-03
- **결정자**: 프로젝트 관리자
- **관련**: [ADR 0001](0001-tech-stack.md), [docs/features/common.md](../features/common.md)

---

## 1. 맥락

[ADR 0001](0001-tech-stack.md)에서는 NativeWind v4(`className`)를 주 스타일 도구로, Gluestack UI를 보조 UI 패턴 확보용으로 채택하였다.

그러나 Phase 1~5를 거치며 110여 개 화면과 공통 UI 컴포넌트가 구현되는 동안 실제 운영 결과는 다음과 같았다:
1. **실제 사용률 0%**: 모든 컴포넌트와 화면이 `src/constants/theme.ts`와 순수 `StyleSheet.create`로 완성되었으며, 코드베이스 전체에서 `className` 사용률은 0건이었다.
2. **독자 디자인 시스템 완성**: Gluestack 컴포넌트를 가져와 테마를 덮어쓰는 대신, 피그마 원본 디자인 토큰과 Reanimated 모션에 맞춘 순수 React Native 컴포넌트 계층(`src/components/ui/`)을 자체 구축하였다.
3. **의존성 및 빌드 오버헤드**: 쓰지 않는 Gluestack으로 인해 CI에서 peer dependency 충돌(`@react-spectrum/provider` 강제 핀 필요)이 발생했고, Metro 번들러(`withNativeWind`) 및 Babel 플러그인이 빌드 복잡도를 가중시켰다.

---

## 2. 결정

1. **Gluestack UI 완전 퇴역**
   - `@gluestack-ui/core`, `@gluestack-ui/utils`, `gluestack-ui`, `@react-spectrum/provider` 의존성을 제거한다.
   - 앱 루트의 `GluestackUIProvider`를 제거한다.
2. **NativeWind v4 및 Tailwind CSS 완전 퇴역**
   - `nativewind`, `tailwindcss` 의존성을 제거한다.
   - `metro.config.js`의 `withNativeWind`, `babel.config.js`의 `nativewind/babel`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`를 제거한다.
3. **순수 React Native `StyleSheet` + `theme.ts` 단일 표준 확정**
   - 모든 스타일링은 `src/constants/theme.ts`의 디자인 토큰 단일 출처(SSOT)와 `StyleSheet.create`로 통일한다.
4. **`src/components/ui/` 모듈화**
   - 1,775줄 단일 파일이었던 `src/components/ui/index.tsx`를 `buttons`, `display`, `inputs`, `navigation`, `dialog`, `feedback`으로 분리하고, 기존 import와의 하위 호환성을 위해 barrel export를 유지한다.

---

## 3. 결과

- **긍정적 영향**:
  - 160개 불필요 패키지 제거로 `node_modules` 및 번들 크기 대폭 감소.
  - 번들러 변환 레이어 제거로 빌드 및 테스트 실행 속도 향상.
  - 향후 Expo SDK 판올림 시 의존성 충돌 리스크 원천 차단.
  - 자체 디자인 시스템 코드의 가독성 및 모듈화 완성.
- **부정적 영향 / 트레이드오프**:
  - 인라인 Tailwind 유틸리티 클래스 작성 불가 (이미 프로젝트 전반에서 사용하지 않았으므로 실질적 영향 없음).
