# ADR 0005 — 모바일 E2E는 Maestro 우선

- 상태: 수락
- 날짜: 2026-05-23

## 맥락

YLMC Connect v1은 Expo Dev Client 기반 모바일 앱이다. 수동 실행만으로는 홈/나눔/소모임/삶공부/중보기도/MY 탭의 회귀를 안정적으로 잡기 어렵다.

## 결정

- 모바일 E2E smoke는 Maestro를 우선 사용한다.
- 테스트 대상은 Expo Go가 아니라 `com.ylmc.connect.dev` development build다.
- 최소 E2E smoke는 `.maestro/smoke.yml`로 홈, 나눔, 소모임, 삶공부, 중보기도, MY 탭 진입을 확인한다.
- React Native 화면과 탭에는 가능한 범위에서 `testID`를 부여하고, Maestro selector도 텍스트보다 `id`를 우선 사용한다.
- 실제 API, 푸시, 이미지 업로드 스토리지는 mock-first v1 범위 밖이므로 E2E smoke에서도 검증하지 않는다.
- CI 기본 게이트는 `npm ci`, `npm run validate`로 두고, Dev Client/Simulator 기반 E2E는 일반 PR CI와 분리해 로컬 또는 전용 모바일 러너에서 실행한다.

## 결과

- `npm run validate`는 typecheck/lint/format/test를 묶는 빠른 로컬/CI 게이트로 둔다.
- `npm run test`와 `npm run test:coverage`는 Jest/RNTL 기반 단위·컴포넌트 smoke를 실행한다.
- `npm run test:dev-client:smoke`는 Metro 서버 부팅과 `/status` 응답을 확인한다.
- `npm run test:e2e:smoke`는 Maestro CLI와 development build가 준비된 환경에서 실행한다.
- `npm run validate:full`은 로컬 전체 게이트로 `validate`, Dev Client smoke, Maestro smoke를 순서대로 실행한다.
