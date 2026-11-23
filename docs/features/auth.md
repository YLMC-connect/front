# auth (인증)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P1/P6

## 한 줄 요약

성도가 앱에 들어오기 위한 회원가입/로그인 흐름과 인증 상태를 관리합니다.

## 현재 동작

- 앱 시작 시 `authSessionService.restore()` 가 저장된 토큰으로 `GET /api/member/me` 를 불러 세션을 복원한다. 복원 중에는 화면 대신 로딩만 보인다.
- `AuthRouteNavigator` 가 `Stack.Protected` 로 route 를 나눈다. 인증 전에는 `(auth)` 만, 인증 후에는 탭·`mypage`·`dawn`·등록 모달만 열린다.
- 로그인은 `POST /api/auth/login` (아이디·비밀번호). 성공하면 홈(`/`)으로 `router.replace`. "아이디 저장" 을 체크하면 아이디만 AsyncStorage(`ylmc.saved_login_id`)에 두고 다음 진입 때 채운다. 자동 로그인은 토큰으로 항상 유지된다.
- 회원가입은 한 화면에서 카드 3장(아이디·비밀번호 → 이름·연락처·이메일 → 약관 동의)을 차례로 연다. 앞 카드가 유효하면 다음 카드가 위에 나타나고, 끝난 카드도 펼친 채 둔다. 비밀번호 확인 입력은 없다.
- 아이디·이메일 중복확인은 입력칸을 벗어날 때 `POST /api/member/duplicate` (`searchType`, `searchValue`)로 자동 실행하고 결과를 입력칸 오른쪽에 보인다.
- 가입은 `POST /api/signup` 후 같은 아이디·비밀번호로 로그인을 이어 불러 세션을 만든다.
- 약관 [보기] 는 하단 시트(`TermsSheet`)에 `GET /api/site-policies/{policyType}` 본문을 보여 준다(`useActiveSitePolicy`, MY 의 약관 화면과 공유).
- 인증이 필요한 요청이 401 이면 `apiClient` 가 `POST /api/auth/refresh` 로 토큰을 한 번 재발급받고 다시 보낸다. 재발급이 실패하면 로그아웃한다.
- 회원 정보 수정·비밀번호 변경·탈퇴(`/api/member/me`, `/api/member/password`)도 같은 `authAdapter` 에 있고 MY 화면이 쓴다. 비밀번호 확인(`/api/member/verify-password`)은 쓰는 화면이 없어 연결하지 않았다.

## 데이터 타입

- `src/types/auth.ts`: `LoginInput`, `SignupInput`(email 은 타입상 선택), `MemberDuplicateInput`(`searchType: id | phone | email`), `MemberAvailability`, `AuthSession`, `AuthStatus`(`restoring / authenticated / anonymous / unavailable`).
- 서버 DTO 는 `src/types/authApi.ts`. 공통 envelope 의 `data` 만 쓴다.
- login/refresh 의 `accessToken`, `refreshToken`, `userId`, `userName` 중 하나라도 없으면 `INVALID_RESPONSE`. `/api/member/me` 는 `id`·`userName` 이 필수이고 `mokjangName` 은 `Member.department` 로 옮긴다.
- 역할은 `src/types/common.ts` 의 `UserRole`(`ADMIN`, `USER`, `MANAGER_*`). 대문자로 맞춰 읽고 모르는 값은 `USER` 로 둔다.

## 결정 사항 (지금 유효한 것만)

- **세션 상태 전이는 session manager 가 단독 소유한다** — 화면/hook 은 토큰을 직접 다루지 않는다. 토큰 저장이 끝나야 `authenticated`. refresh 실패는 토큰을 지우고 `anonymous`, 일반 네트워크 실패는 토큰을 남기고 `unavailable` 로 구분한다.
- **세션이 바뀌면 이전 사용자 데이터를 지운다** — 새 로그인·가입·로그아웃 때 쿼리 캐시와 기기 저장분을 비워 다른 사용자의 화면 데이터가 보이지 않게 한다.
- **로그아웃은 모든 토큰 삭제를 시도한 뒤 반드시 `anonymous` 로 끝낸다** — 한 키 삭제가 실패해도 나머지를 지우고, MY 는 오류와 관계없이 로그인 화면으로 간다.
- **토큰 저장소는 플랫폼별** — 네이티브는 SecureStore, 웹은 탭 단위 `sessionStorage`.
- **API DTO 와 화면 모델을 분리한다** — `apiClient` 는 envelope·오류·Authorization 만, DTO → 화면 모델 변환은 `authMapper` 가 한다. 불완전한 성공 응답은 추측하지 않고 `INVALID_RESPONSE` 로 막는다.
- **오류 문구는 서버 message 가 아니라 code 로 정한다** — `MEM001~MEM007` 은 `apiErrorMessages` 표로, 미등록 code 는 화면별 fallback 을 보인다. 서버 내부 문장은 노출하지 않는다.
- **중복확인 결과는 검사한 값과 함께 보관한다** — `{ value, available }` 로 비교해, 확인 뒤 값이 바뀌면 결과를 버리고 다시 확인해야 가입할 수 있다.
- **아이디는 영문 소문자·숫자만** — 대문자는 소문자로 바꾸고, 3자 미만이나 다른 문자는 인라인 안내로 막는다 (#193).
- **이메일·이름은 필수** — 서버 회원가입 요청(`MemberJoinRequest`)도 `id`·`password`·`userName`·`email` 을 필수로 받는다. 앱은 이메일 형식·중복확인을 통과해야 가입된다. 필수값이 빠지면 서버는 500 이 아니라 400(`COMMON001`)으로 답한다.
- **전화번호는 선택** — 서버(`MemberJoinRequest`, 최대 20자)와 같이 비워도 가입된다. 적었을 때만 010 으로 시작하는 10~11자리인지 검사하고, 비우면 요청에서 뺀다(빈 값을 보내면 서버 중복 검사 `MEM002` 에 걸릴 수 있다). 입력칸 이름은 "연락처 (선택)".
- **약관 동의는 기본 미선택** — 필수 약관(이용약관·개인정보)에 모두 동의해야 가입 버튼이 켜진다. 동의 여부는 서버에 보내지 않는다(#201).
- **가입코드·비밀번호 찾기는 만들지 않는다** — Notion MVP 범위 밖. 로그인 화면에 관련 문구도 두지 않는다.
- **로그인 묶음 높이는 키보드가 나와도 다시 계산하지 않는다** — 첫 레이아웃 높이를 `minHeight` 로 고정하고, iOS 는 `automaticallyAdjustKeyboardInsets`, Android 는 `adjustResize` 에 맡긴다.

## 미결

- #201 회원가입 정책 남은 결정: 아이디·이름·전화번호 형식을 서버에서도 검사할지, 약관 동의 여부를 서버에 저장할지.

## 코드 위치

- 화면: `app/(auth)/` (login, signup, splash, terms, terms-sheet)
- 화면 부품: `src/components/auth/` (`AuthRouteNavigator`, `TermsAgreementScreen`, `auth-input`, `signup/`)
- 데이터: `src/services/auth*`, `src/hooks/useAuth.ts`, `src/store/authStore.ts`, `src/types/auth*`
- 토큰·오류: `src/lib/secureStore.ts`, `src/lib/authRecovery.ts`, `src/lib/apiErrorMessage.ts`, `src/constants/apiErrorMessages.ts`
- 계약 검사: `scripts/api-contract/auth.mjs` (`npm run test:api:contract -- auth`)

## 의존성 · 관련 ADR

- common 의 `apiClient`, `Member`·`UserRole`, `queryClient`(캐시 비우기)
- 약관 본문은 MY 와 같은 `src/services/siteContent*`, `src/hooks/useSiteContent.ts`
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
