# YLMC Connect — 프로젝트 기획 문서

> 우리 교회(YLMC) 성도를 서로 이어주는 커뮤니티 앱

본 문서는 앱 범위·데이터 타입·공통 정책의 기준이다. 도메인별 현재 동작은 `docs/features/<도메인>.md`, 기술 선택 이유는 `docs/adr/`, 작업 이력은 머지된 PR 에 있다. 수정은 사용자 승인이 필요하다.

---

## 📌 앱 개요

| 항목    | 내용                                    |
| ------- | --------------------------------------- |
| 앱 이름 | YLMC Connect                            |
| 플랫폼  | iOS / Android (크로스플랫폼)            |
| 대상    | YLMC 교회 성도                          |
| 목적    | 성도 간 연결 — 나눔, 소모임, 교육, 기도 |

---

## 🛠 기술 스택

- 선택 이유는 [ADR 0001](docs/adr/0001-tech-stack.md), 스타일·공통 UI 는 [ADR 0006](docs/adr/0006-retire-nativewind-gluestack.md)(React Native StyleSheet + `src/constants/theme.ts`), 디자인 토큰·아이콘은 [ADR 0007](docs/adr/0007-design-system-v2.md).
- 버전은 `package.json` 이 단일 출처다. Node 기준은 `package.json` 의 `engines`.
- **상태 분리 원칙** — 서버 데이터는 TanStack Query, 인증·UI·임시 작성 상태는 Zustand.

---

## 🗂 핵심 기능

### 범위

Notion 의 "열린문커넥트" 기획 정의를 범위 기준으로 삼는다 ([ADR 0003](docs/adr/0003-mvp-scope-notion-first.md), [ADR 0004](docs/adr/0004-notion-v1-dev-client-scope.md)).

| 구분 | 포함 범위                                                          | 제외 / 후속                                                        |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| MVP  | 회원가입, 로그인, 홈, 나눔, 동행(소모임·봉사), MY, 사진 선택·업로드 | 비밀번호 찾기, 가입코드, 사용자 차단, 신고 서버 전송               |
| v1   | 삶공부, 중보기도                                                   | 교회 공지·알림, 푸시, 관리자 도구(모바일은 `/api/admin` 을 부르지 않음) |

모든 도메인이 실제 HTTP API(`EXPO_PUBLIC_API_URL`)를 쓴다. 데이터 흐름은 `screens -> hooks(TanStack Query) -> services -> API` 이고, `services/` 는 `*HttpDataSource`(요청) + `*Mapper`(DTO → 화면 모델)로 나뉜다.

### 🛒 나눔

> 성도 간 무료 나눔

| 화면          | 설명                                          | 주요 액션                       |
| ------------- | --------------------------------------------- | ------------------------------- |
| 목록          | `전체 / 나눔중 / 내 나눔` 세그먼트 + 카테고리 | 카테고리 선택, 무한 스크롤      |
| 상세          | 사진, 작성자, 상태, 댓글                      | 댓글, 상태 변경(내 글), 수정    |
| 글쓰기 (모달) | 사진·제목·카테고리·물품 상태·설명·수령 장소   | 등록하기 / 수정하기             |

### 👥 동행 (소모임·봉사)

> 모임 탐색, 참여, 개설

| 화면        | 설명                                       | 주요 액션                         |
| ----------- | ------------------------------------------ | --------------------------------- |
| 목록        | `소모임 / 봉사 / 내 모임` + 카테고리 필터  | 검색, 카테고리 전환               |
| 상세        | 모임 정보, 멤버, 공지                      | 참여하기 / 탈퇴하기               |
| 개설 (모달) | 이름·카테고리·정원·소개                    | 개설하기 / 수정하기               |
| 소모임장    | 모집 상태, 공지, 멤버 관리                 | 상태 변경, 공지 작성, 내보내기·이관 |

### 📖 삶공부

> 교회 과정 신청 + 수료 이력

| 화면      | 설명                                         | 주요 액션 |
| --------- | -------------------------------------------- | --------- |
| 목록      | 학습경로 + 신청 가능 과정 + 전체 과정        | 과정 진입 |
| 과정 상세 | 커리큘럼, 신청 여부                          | 수강 신청 |
| 수강 신청 | 생년·신앙 연차·수강 약속                     | 신청하기  |
| 내 이력   | MY 의 삶공부 수강 내역(수강 중 / 수료)       | —         |

### 🙏 중보기도

> 기도방 참여 + 기도제목 나눔

| 화면          | 설명                                   | 주요 액션             |
| ------------- | -------------------------------------- | --------------------- |
| 목록          | 이번 주 진행, 내 기도방, 내 기도제목   | 기도방 진입, 신청 취소 |
| 기도방 상세   | 기도·응답·현황 탭                      | 기도 완료 체크        |
| 중보기도 신청 | 요일·시간 선택                         | 신청하기              |
| 기도제목 등록 | 카테고리·제목·내용 (익명 없음, #304)   | 등록하기              |
| 내 기도제목   | 상태 배지 목록                         | 응답 기록 요청        |

---

## 🗃 데이터 타입 설계

타입의 단일 출처는 `src/types/` 다. 도메인마다 서버 DTO(`*Api.ts`)와 화면 모델(`<도메인>.ts`)을 나누고, `services/*Mapper.ts` 가 서버 코드를 화면 값으로 바꾼다. 아래는 여러 도메인이 공유하는 요약이다.

### 공통

```typescript
// src/types/api.ts — 모든 응답의 envelope. apiClient 가 data 만 돌려준다
interface ApiResponse<T> {
  code: string;
  message: string;
  data: T | null;
}

// src/types/common.ts — 서버 역할 원본 값
type UserRole =
  | "ADMIN"
  | "USER"
  | "MANAGER_COMMUNION"
  | "MANAGER_SHARE"
  | "MANAGER_LIFESTUDY"
  | "MANAGER_PRAYER";

interface Member {
  id: string;
  name: string;
  profileImage?: string;
  department?: string; // 서버 mokjangName
  role: UserRole;
  phone?: string;
  email?: string;
  point?: number;
}
```

- 목록 페이지네이션은 서버마다 다르다. 나눔·동행은 `lastId`·`size` 커서, MY 활동은 page 기반 `MyPageActivityList<T>` 다.
- 역할 판별(`src/lib/rolePermissions.ts`)은 메뉴·route 노출용이고 실제 인가는 서버가 한다. `ADMIN` 이나 해당 도메인 `MANAGER_*` 만 관리 도메인에 허용한다.

### 도메인별 코드 매핑

| 도메인   | 화면 값                                                   | 서버 코드                                         |
| -------- | --------------------------------------------------------- | ------------------------------------------------- |
| 나눔     | 상태 `sharing / reserved / done`                          | `AVAILABLE / RESERVED / COMPLETED`                |
| 나눔     | 물품 상태 `새것 / 사용감 있음 / 파손 있음`                | `NEW / USED / DAMAGED`                            |
| 동행     | 모집 상태 `open / closed`                                 | `RECRUITING / COMPLETED`                          |
| 동행     | 종류                                                      | `SMALL_GROUP / VOLUNTEER`                         |
| 삶공부   | 과정 종류 `required / optional`, 상태 `completed / recommended / pending` | 수료 기록·신청 가능 기수로 계산          |
| 중보기도 | 요일 `mon~fri`, 시간 `morning / afternoon`                | 신청 시 `yoil`·`timeSlot`                         |
| 중보기도 | 기도제목 상태 `reviewing / published / rejected / answerRequested / answered / hidden` | `topics/my` 응답 상태 |

카테고리는 아래 "나눔·동행 카테고리" 를 따른다. 화면 모델 상세(필드 목록)는 각 `docs/features/<도메인>.md` 의 "데이터 타입" 과 `src/types/` 를 본다.

---

## 🌐 네트워크 레이어

- **API origin** — 로컬 `.env` 의 `EXPO_PUBLIC_API_URL` 을 `app.config.ts` 가 `extra.apiUrl` 로 넘긴다. 없으면 설정 단계에서 실패한다. 실제 호스트는 코드·문서에 두지 않는다.
- **`src/lib/apiClient.ts`** — `fetch` 기반. `{ code, message, data }` envelope 에서 `data` 만 돌려주고, 실패는 `ApiError { code, status, data }` 로 던진다. envelope 가 없는 응답만 `format: "json"` 으로 받는다.
- **인증** — Authorization 헤더를 붙이고, 401 이면 `POST /api/auth/refresh` 로 한 번 재발급 후 재시도한다. 재발급이 실패하면 로그아웃한다.
- **응답 검증** — mapper 는 화면이 쓰는 필드만 확인한다. 응답 형태가 틀리면 `INVALID_RESPONSE`, 목록의 잘못된 항목은 빼고 `reportResponseIssue` 로 경로·필드 이름만 알린다.
- **빌드 변형** — `APP_VARIANT`(development / preview / production)에 따라 Bundle ID 를 `com.ylmc.connect.dev` / `.preview` / `com.ylmc.connect` 로 나눠 동시에 설치할 수 있다. EAS profile 은 `eas.json`.

### TanStack Query 설정

`src/lib/queryClient.ts`:

- `retry` — 4xx `ApiError` 는 재시도하지 않고, 그 외는 2회까지.
- `staleTime` 기본 5분.
- `onlineManager` 는 `@react-native-community/netinfo`, `focusManager` 는 `AppState` 에 연결한다.
- Query/MutationCache `onError` 는 `INVALID_RESPONSE` 만 Sentry 에 보고한다(아래 "에러 추적").

### queryKey 컨벤션

모든 queryKey 는 `src/lib/queryKeys.ts` 에서만 만든다. 도메인마다 `all` 을 뿌리로 두고 `overview()`·`detail(id)` 등을 이어 붙인다.

```typescript
queryKeys.market.all; // ["market"]
queryKeys.market.detail(id); // ["market", "detail", id]
queryKeys.group.members(id); // ["group", "detail", id, "members"]
```

- 도메인: `home`, `market`, `group`, `lifeStudy`, `prayer`, `member`, `mypage`, `siteContent`.
- 응답 형태가 바뀌어 옛 캐시를 버려야 하면 key 끝에 버전 조각(`"http-v6"` 등)을 붙인다.
- 무효화는 `queryClient.invalidateQueries({ queryKey: queryKeys.<도메인>.all })` 처럼 key 함수로만 한다.

### 영속 캐시

- `@tanstack/query-async-storage-persister` + AsyncStorage 로 캐시를 24시간 보관한다(`buster` 로 형식 변경 시 일괄 폐기).
- **개인정보 쿼리는 기기에 저장하지 않는다** — `NON_PERSISTED_QUERY_KEY_PREFIXES`(`member`, `market/mine`, `group/detail`, `prayer/overview`, `lifeStudy/overview`)는 메모리에만 둔다. 개인정보 쿼리를 새로 만들면 이 목록에 넣는다.
- 로그인·가입·로그아웃·세션 만료 때 `clearQueryCache()` 로 메모리·기기 캐시를 모두 지운다.
- 오프라인이면 `OfflineBanner` 를 띄운다. 오프라인 mutation 큐는 두지 않는다.

---

## 🔐 보안 및 개인정보

교회 성도 데이터(이름·연락처·기도제목)는 민감 정보로 취급한다.

| 항목             | 정책                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 토큰 저장        | 네이티브는 `expo-secure-store`(Keychain / Keystore), 웹은 탭 단위 `sessionStorage`. AsyncStorage 금지 |
| 토큰 갱신        | 401 시 refresh 1회 → 실패하면 토큰 삭제 후 로그인 화면                                        |
| 세션 전환        | 사용자 전환 시 쿼리 캐시·기기 캐시 삭제                                                       |
| 캐시             | 개인정보 쿼리는 영속 캐시 제외 (위 "영속 캐시")                                               |
| 오류 보고        | Sentry 에 응답 본문·메시지·개인정보를 싣지 않음 (아래 "에러 추적")                            |
| 서버 오류 문구   | 서버 message 대신 code 로 앱 문구를 고른다                                                    |
| 약관 동의        | 회원가입 시 이용약관·개인정보 처리방침 필수 동의                                              |
| 익명 기도제목    | 등록 API 에 익명 필드가 없어 선택지를 두지 않음 (#304)                                        |

---

## 🏷 나눔·동행 카테고리

서버 코드가 기준이다. 화면 key·라벨은 `src/constants/domainOptions.ts`, 매핑은 각 mapper.

### 나눔 (`src/services/marketMapper.ts`)

| 서버 코드             | 화면 key | 라벨          |
| --------------------- | -------- | ------------- |
| `CLOTHING_ACC`        | `cloth`  | 의류·잡화     |
| `APPLIANCE_FURNITURE` | `home`   | 가전·가구     |
| `BOOK_STATIONERY`     | `book`   | 도서·문구     |
| `FOOD_DAILY`          | `food`   | 식품·생필품   |
| `BABY_KIDS`           | `baby`   | 유아·아동용품 |
| `SPORTS_HOBBY`        | `sport`  | 스포츠·취미   |
| `OTHER`               | `etc`    | 기타          |

### 동행 (`src/services/groupMapper.ts`)

| 서버 코드       | 화면 key | 라벨          |
| --------------- | -------- | ------------- |
| `WORSHIP_STUDY` | `bible`  | 성경공부·예배 |
| `PRAYER`        | `pray`   | 기도모임      |
| `HOBBY_CULTURE` | `hobby`  | 취미·문화     |
| `SPORTS_HEALTH` | `sport`  | 운동·건강     |
| `OTHER`         | `etc`    | 기타          |

- 화면 옵션에 남은 봉사·목장·선교·카풀은 서버 코드가 없어 개설·수정에 쓰지 않는다. 폼은 위 5개만 보인다 (#313).
- 두 카테고리 목록 모두 앱에 고정돼 있다. 카테고리 목록 API 가 생기면 옮긴다 (#312, #313).
- 기도제목 카테고리는 `GET /api/prayer/categories` 로 받는다.

---

## 🚨 에러 처리

| 상황            | 처리 방식                                                          |
| --------------- | ------------------------------------------------------------------ |
| 네트워크·5xx    | TanStack Query 재시도(2회) 후 화면 오류 상태 + 다시 시도            |
| 4xx             | 재시도 없음. `apiErrorMessage` 로 code 별 문구, 없으면 화면 fallback |
| 데이터 로딩 중  | `Skeleton` / `ListSkeleton`                                        |
| 빈 목록         | `EmptyState`                                                       |
| 일부 API 실패   | 여러 API 를 합치는 화면은 `Promise.allSettled` 로 성공한 부분만 그림 |
| 폼 유효성 실패  | 화면별 local validator 인라인 메시지                               |
| 짧은 결과 안내  | `Toast`                                                            |
| 전역 예외       | expo-router `ErrorBoundary` (`app/_layout.tsx`)                    |

---

## 📊 에러 추적 (Sentry)

- `@sentry/react-native`. `app/_layout.tsx` 가 `initSentry()` 를 부른다. `__DEV__` 이거나 `EXPO_PUBLIC_SENTRY_DSN` 이 비면 켜지 않는다.
- 보내는 것: 서버 응답 형식 오류(`INVALID_RESPONSE`, 4xx 제외)와 목록에서 버린 항목. 태그는 쿼리 키 앞 두 조각·HTTP status·code·경로·필드 이름뿐이다.
- 보내지 않는 것: 응답 본문·메시지·개인정보, 네트워크 오류, 4xx.
- 소스맵·디버그 심볼 업로드는 아직 끔(`SENTRY_DISABLE_AUTO_UPLOAD=true`) — #212.
- 사용성 분석(Analytics)은 도입하지 않았다.

---

## 🧪 테스트 전략

| 레이어          | 도구                                    | 실행                                           |
| --------------- | --------------------------------------- | ---------------------------------------------- |
| 단위·컴포넌트   | Jest + React Native Testing Library     | `npm test`, 대상 파일 옆 `__tests__/`          |
| 스크립트        | `node --test`                           | `npm run test:scripts`                         |
| API 계약        | Swagger/OpenAPI 대조 스크립트           | `npm run test:api:contract*`                   |
| Dev Client 부팅 | Metro `/status` 확인                    | `npm run test:dev-client:smoke`                |
| E2E             | Maestro (`.maestro/smoke.yml`)          | 로컬에서 `maestro test .maestro/smoke.yml` |

- PR CI 는 `npm ci` + `npm run validate`(typecheck · lint · format:check · test:scripts · test). Maestro 는 PR CI 에서 돌리지 않는다 ([ADR 0005](docs/adr/0005-mobile-e2e-maestro-first.md)).
- Maestro smoke 는 `com.ylmc.connect.dev` 개발 빌드에서 가입 → 로그인 → 5개 탭 진입을 `testID` 기준으로 확인한다.
- 훅 테스트는 `renderHook` + 테스트마다 새 `QueryClientProvider`. 서버 응답은 테스트 안의 fixture 로 만든다.

---

## 📱 탭 구성

`app/(tabs)/_layout.tsx` 기준.

| 순서 | 탭명   | route        | 아이콘 (off / on)                                           | 주요 화면                       |
| ---- | ------ | ------------ | ----------------------------------------------------------- | ------------------------------- |
| 1    | 홈     | `/`          | `home-outline` / `home`                                     | 주일 말씀, 오늘의 기도, 새벽기도 |
| 2    | 나눔   | `/market`    | `shopping-outline` / `shopping`                             | 목록 / 상세                     |
| 3    | 동행   | `/group`     | `account-multiple-outline` / `account-multiple`             | 소모임·봉사 / 상세 / 공지 / 멤버 |
| 4    | 기도   | `/prayer`    | `hands-pray` / `hands-pray`                                 | 기도방 / 신청 / 내 기도제목     |
| 5    | 삶공부 | `/life-study`| `book-open-page-variant-outline` / `book-open-page-variant` | 과정 목록 / 상세 / 신청         |

- 상세는 각 탭의 중첩 Stack 에 push 된다. MY(`/mypage`)·새벽기도 상세(`/dawn`)·등록 모달(`/modal/*`)은 탭 밖 루트 Stack 이다.
- MY 는 하단 탭이 아니라 홈의 `내 정보` 진입점에서 연다.
- 아이콘은 `AppIcon`(Lucide) 이름이다 (ADR 0007).

---

## 🖼 이미지 업로드

현재 사진을 올리는 곳은 나눔 글쓰기뿐이다. 동행은 API 에 이미지 필드가 없어 색 바탕 + 아이콘으로 대신하고, 프로필 사진 변경은 없다.

| 단계 | 방식                                                                                  |
| ---- | ------------------------------------------------------------------------------------- |
| 선택 | `expo-image-picker`, 1장 이상 필수·최대 5장                                           |
| 축소 | `resizeImageForUpload`(`expo-image-manipulator`) — 긴 변 1600px, JPEG 0.8. 실패하거나 20초를 넘으면 원본 |
| 전송 | `POST /api/share` multipart. 수정은 남길 서버 사진을 `keepImageIds` 로 보냄            |
| 표시 | `expo-image`. 상대 경로 URL 은 API origin 을 붙여 해석                                 |

- 업로드 후 이미지 URL 404 문제는 백엔드 확인 대기 (#217).

---

## 🚩 신고 / 차단

- 나눔 상세에 신고 UI 와 사유 목록(`MARKET_REPORT_REASONS`)이 있지만 서버로 보내지 않는다. 서버 신고 사유 enum 과 신고 후 처리 정책이 정해지면 mapper 로 연결한다.
- 사용자 차단은 두지 않는다 — 차단 API 가 없고 MVP 범위 밖이다.
- 신고 누적 비공개·관리자 처리는 서버와 별도 관리 도구의 몫이다. 모바일은 사용자용 화면만 둔다.

---

## ♿ 접근성

시니어 성도 비율을 고려한다.

- 인터랙션 요소에 `accessibilityLabel`, `accessibilityRole` 을 단다.
- 색 대비 WCAG AA(4.5:1) 를 기준으로 한다. 끝난 항목(모집완료·나눔완료)을 흐리게 두는 것은 점검(#237) 후 의도적으로 유지하고 배지 글자로 상태를 함께 알린다.
- 시스템 글자 크기를 따른다. 고정 높이는 `src/lib/fontScale.ts` 의 `scaleHeightForFont` 로 함께 키운다.
- 터치 타겟은 최소 44×44pt.

---

## 🔔 푸시 알림 (미구현)

`expo-notifications` 는 아직 설치하지 않았다. 서버 알림 API 와 정책이 정해지면 다음을 다룬다.

- 디바이스 토큰을 로그인 때 등록, 로그아웃 때 해제
- 알림 탭 → 해당 화면 deep link (`app.config.ts` 의 `scheme: "ylmc-connect"`)
- 후보 시나리오: 소모임 일정, 삶공부 신청 결과, 기도 관련 알림
- MY 의 알림 설정 화면 (디자인 원본 필요)

---

## 🚀 진행 단계

Phase 1~5 는 완료했다. 이후 작업은 GitHub Issues(라벨 = 도메인)에서 관리한다 — `gh issue list --state open`.
