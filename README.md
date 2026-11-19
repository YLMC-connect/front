# YLMC Connect

> 우리 교회(YLMC) 성도를 서로 이어주는 모바일 앱

## 무엇을 만드나

Notion “열린문커넥트” 최신 기획을 기준으로 **MVP + v1 모바일 화면** 을 Expo Dev Client 기반으로 제공합니다.
현재 범위는 회원가입/로그인 · 홈 · 나눔 · 소모임 · MY · 이미지 선택 · 삶공부 · 중보기도입니다. 모든 화면이 라이브 API(`EXPO_PUBLIC_API_URL`)를 씁니다.

## 진행 상태

```
[✅ Phase 0 기획] → [✅ Phase 1~5 MVP/v1] → [✅ 전 도메인 API 연결]
```

도메인별 남은 일은 GitHub Issues(`gh issue list --label <도메인>`)에서 봅니다.

## 실행

저장소를 처음 받은 분은 [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) 를 먼저 보세요. 준비물, Dev Client, API 연결, 막힐 때 확인할 것을 한곳에 모아 두었습니다.

```bash
npm install
cp .env.example .env
# .env 에 팀에서 받은 EXPO_PUBLIC_API_URL 을 넣은 뒤
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

Codex 기본 샌드박스에서는 위 명령이 `Starting project...` 이후 8081 포트에 바인딩되지 않을 수 있습니다. Metro 가 떴는지는 `curl http://localhost:8081/status` 로 확인합니다. development build가 설치된 iOS/Android 기기에서는 같은 Metro에 연결해 실제 앱 실행을 확인합니다.

API origin은 로컬 `.env`의 `EXPO_PUBLIC_API_URL`만 사용합니다. 저장소에 실제 주소를 두지 않습니다. 없으면 앱이 시작되지 않습니다.

```bash
EXPO_PUBLIC_API_URL=https://example.test npm run start:dev-client
```

검증 명령:

```bash
npm run validate
```

`validate`는 `typecheck`, `lint`, `format:check`, `test`를 순서대로 실행합니다. CI도 `npm ci` 후 `npm run validate`를 수행합니다.

OpenAPI 계약 검사와 디자인 토큰 동기화 같은 Node 스크립트는 `test:scripts`로 네트워크 없이 검증하며 `validate`에 포함됩니다. 실제 Swagger 상태를 확인하는 도메인별 계약 명령은 백엔드 계약이 미완성인 동안 별도로 실행합니다.

단위/컴포넌트 테스트:

```bash
npm run test
npm run test:coverage
npm run test:api:contract
npm run test:api:contract -- market group
```

Jest + React Native Testing Library로 공통 UI, 도메인 옵션, 홈/나눔/동행/기도/삶공부 핵심 화면 렌더링을 확인합니다. 테스트에서는 API 호출을 `jest.setup.ts` 의 테스트 대역으로 바꿉니다.

`test:api:contract`는 `scripts/check-api-contract.mjs`로 도메인별 계약을 확인합니다. 인자가 없으면 전체(auth·market·group·life-study·home·prayer·mypage)를, `--` 뒤에 도메인을 주면 그 도메인만 검사하며 Swagger는 한 번만 받습니다. 도메인별 검사 목록은 `scripts/api-contract/<도메인>.mjs`에 있습니다.

`auth`는 OpenAPI 문서의 로그인·토큰 재발급·회원가입·내 정보 성공 DTO, 회원 중복확인 `data.available`, 공개 endpoint/JWT 정의를 확인합니다. 출처는 `YLMC_OPENAPI_URL`, `YLMC_OPENAPI_FILE`, 또는 `EXPO_PUBLIC_API_URL`의 `/v3/api-docs`입니다. 백엔드 계약이 불완전하면 누락 항목을 출력하고 실패하며, 계약 확정 전에는 일반 `validate`와 분리해 실행합니다.

`market`은 나눔 CRUD·댓글·신고·이미지 업로드 endpoint와 목록/상세/작성 화면에 필요한 작성자명·이미지·검색·장소·enum·상태 변경·제목/본문 길이·사진 5장 계약을 확인합니다. 업로드 경로 이름을 가정하지 않고 operation summary/id로 찾은 뒤 request/200 DTO를 검증합니다. 누락 필드를 임의 fallback으로 감추지 않고 DTO mapper를 활성화하기 전에 실패로 노출합니다.

`group`은 동행 목록·상세·내 목록·멤버/공지·참여/탈퇴·생성/수정/상태/관리 endpoint와 카드 표시 필드, 일정·장소, 필터, enum, 제목/본문·정원 입력 제한, 소모임장 이관 계약을 확인합니다.

`mypage`는 2026-10-06 마이페이지 활동 `GET /api/mypage/activities` 5종을 확인합니다. posts·comments·groups는 0-based `page` 요청과 `PageResponse`의 `content`, `totalElements`, `totalPages`, 1-based `currentPage`, `size`, `hasNext`를 확인하고, life-studies·prayers는 페이징 없는 단일 객체를 확인합니다. `npm run validate`에는 넣지 않습니다.

API 오류는 `getApiErrorMessage`가 `ApiError.code`를 도메인 메시지 표로 변환합니다. 문서화되지 않은 API 코드는 서버 `message`를 그대로 노출하지 않고 화면별 안전한 fallback을 사용하며, 현재 Swagger에 정의된 인증 `MEM001~MEM007`은 `authApiErrorMessages`로 관리합니다. `MEM007`은 비밀번호 8자·영문+숫자 조합 위반입니다.

인증 세션은 `authSessionService`가 SecureStore 토큰 저장·앱 시작 복원·동시 401 단일 재발급·재발급 실패 로그아웃을 관리합니다.

Maestro E2E smoke (로컬, 선택):

```bash
maestro test .maestro/smoke.yml
```

`com.ylmc.connect.dev` development build가 설치된 iOS Simulator 또는 Android Emulator에서 앱을 Metro에 연결해 둔 뒤 실행합니다. Dev Client 안내 메뉴를 닫고 React Native `testID` 기준으로 주요 탭 진입을 확인합니다. CI 에서는 돌리지 않습니다. 새 환경에서는 Java 17+와 Xcode Command Line Tools를 확인한 뒤 Maestro를 설치합니다:

```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
maestro --version
```

## 문서 지도

- 처음 보는 분: [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) — 클론부터 라이브 API 실행
- 문서 지도·ADR 목록: [docs/INDEX.md](docs/INDEX.md)
- 설계 기준 문서: [PLAN.md](PLAN.md) — 앱 범위, 공통 데이터 타입, 정책
- 진행 작업: GitHub Issues — `gh issue list --state open` (label = 도메인).
- 변경 이력: 머지된 PR description — `gh pr list --state merged --limit 30`.
- AI 작업 규칙: [AGENTS.md](AGENTS.md) — Codex 동작 규약 (`CLAUDE.md` 는 Claude Code 호환본)

## 기술 스택 (요약)

Expo SDK 57 · Expo Dev Client · React Native 0.86 · TypeScript · Expo Router · TanStack Query · Zustand · local form validation · React Native StyleSheet. 상세는 [PLAN.md](PLAN.md) 의 “🛠 기술 스택”.
