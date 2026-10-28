# auth (인증)

> 마지막 갱신: 2026-10-28 (회원가입 신규 카드 등장 트랜지션 및 타이핑 디바운스 완화 적용) | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도가 앱에 들어오기 위한 회원가입/로그인 흐름과 인증 상태를 관리합니다.

---

## ✅ 완료

- 회원가입 신규 카드 등장 트랜지션 및 타이핑 디바운스 완화 — 조건 충족 시 다음 카드가 딱딱하게 튀어나오지 않도록 `FadeInDown`(진입 페이드 및 하향 슬라이드)과 `LinearTransition`(기존 카드의 부드러운 하향 이동 레이아웃 트랜지션), 그리고 플랫폼 네이티브 `LayoutAnimation`을 결합. 타이핑 도중 급작스러운 레이아웃 밀림을 방지하기 위해 500ms 입력 멈춤 디바운스(`AUTO_ADVANCE_DEBOUNCE`, 테스트 환경은 0ms)를 두고, 카드 확장 애니메이션이 자연스럽게 안착된 후 350ms 딜레이(`FOCUS_HANDOFF_DELAY`, 테스트 환경 0ms)를 거쳐 새 카드의 첫 번째 입력 필드로 포커스를 부드럽게 인계. 키보드의 '다음' 액션 시에는 즉시 레이아웃 애니메이션과 함께 다음 단계로 진행.
- 회원가입 신규 카드 상단 추가 및 전체 카드 펼침 상태 유지 — 완료된 카드를 1줄 요약으로 접지 않고 모든 필드를 항상 펼쳐진 상태로 유지하며, 새로 작성할 카드(2단계 성도 정보, 3단계 약관 동의)가 이전 완료 카드보다 물리적으로 위(상단)에 나타나도록 배치. 수동 다음 버튼 없이 조건 충족 시 자동으로 다음 카드가 상단에 나타나며(디바운스/키보드 다음 액션), 이전 카드들도 아래에 온전히 펼쳐져 있어 언제든 직접 확인 및 수정할 수 있다.
- 회원가입 하단 버튼 불투명 그라데이션 적용 — 하단 탭 메뉴 및 삶공부/중보기도 신청 버튼과 동일한 3스톱 페이드 그라데이션(`LinearGradient`: `["rgba(246,247,249,0)", "rgba(246,247,249,0.78)", "rgba(246,247,249,0.96)"]`)을 회원가입 하단 바(`bottomFlat`)에 적용하여 스크롤되는 콘텐츠가 버튼 아래로 자연스럽게 투과되며 페이드되도록 개선.
- 약관 전문 바텀시트 하단 슬라이드업 및 키보드 자동 닫기 — 바텀시트(`TermsSheet`) 오픈 시 키보드를 즉시 닫고(`Keyboard.dismiss()`), 딤 배경 페이드인(`FadeIn`)과 함께 시트 패널이 화면 아래(하단)에서 위로 부드럽게 미끄러지듯 올라오도록(`SlideInDown`) 방향 수정.
- 이름 필드 IME 조합 중 오진단 방지 및 완료 시점 검증 — 한글 조합 도중(예: '이ㅅ')에 불필요하게 오류가 번쩍이지 않도록 타이핑 중에는 에러를 띄우지 않으며, '이시영' 등 유효한 실명 입력 완료 시 우측 초록 체크가 켜지고, 입력 완료 후 포커스 이탈(`onBlur`) 또는 키보드 다음 액션 시점에만 형식 미충족 시 인라인 에러를 노출하도록 개선.
- 성도 정보 입력 피드백 다이어트 및 실시간/이탈 오류 안내 — 불필요한 하단 규칙 칩(2~10자, 한글만 등)을 제거하는 대신, 이름에 숫자/영문/특수문자가 들어가면 포커스 이탈(onBlur) 시점에 붉은색 테두리와 함께 "이름은 한글만 입력할 수 있어요." 인라인 에러를 노출하고 1자 입력 후 이탈 시 "이름을 2자 이상 입력해주세요."를 안내. 연락처 역시 010 외 번호 입력 시 실시간 오류("연락처는 010으로 시작해야 해요.") 및 자리수 미달 이탈 시 안내를 제공하며, 올바른 입력 시 오류가 즉시 해제되고 초록색 체크 아이콘(`check-circle`)이 표시된다.
- 인증 HTTP adapter 활성화 — login/refresh 성공 envelope의 `data`에서 토큰 payload를 읽고, signup 후 login 합성, `/api/member/me`, `/api/member/duplicate`를 `httpAuthAdapter`로 연결. 회원가입은 아이디와 이메일을 필수 입력으로 받고 각각 중복확인을 통과해야 한다. 값이 바뀌면 기존 확인 결과를 폐기한다. development 기본값은 HTTP, 테스트/Maestro는 `EXPO_PUBLIC_AUTH_ADAPTER=mock`. API origin은 `EXPO_PUBLIC_API_URL`. 회원가입 중복확인 실패는 해당 필드에 표시. 로그인 성공 schema는 `ApiResponseLoginResponse`이고, 그 밖 Swagger 성공 schema가 비어 있는 항목 때문에 `test:api:contract` 실패는 남아 있다
- 조용한 톤 인증 여백·위계 — 로그인 상단 로고 아이콘과 회원가입 상단 점선 아바타 미리보기를 제거해 타이포그래피·폼 중심으로 정리하고(소프트 배지 `열린문교회 커뮤니티` + 2줄 환영 헤드라인 `열린문 커넥트에 오신 것을 환영합니다` 좌측 정렬), 로그인·회원가입 메인 CTA 곡률은 앱 공통 톤에 맞춰 `radius.pill`을 유지하며, 로그인 하단 회원가입 이동은 하단 서피스 카드로 배치하고 회원가입 비밀번호·비밀번호 확인을 단일 섹션으로 묶어 계정/성도 정보를 구분하며 중복확인 통과 시 버튼을 `확인 완료` 상태로 전환; glass 하단 바 실험은 단순 `bottomFlat`으로 유지
- 로그인·회원가입 절제 모션 (C-set) — 진입은 이동(`translateY`)·시간차(`stagger`) 없는 단일 페이드(`opacity`), 필드 검증 shake·인라인 에러 fade, 중복확인 성공 체크 pop, CTA `MotionPressable`, 가입 버튼 enable soft 활성, auth Stack slide/fade. `designVariant !== default`·`useReducedMotion`에서 진입 애니는 static
- 로그인·회원가입 입력 포커스 통일 — 인증 전용 공통 `AuthInput`으로 전체 입력 surface를 공유하고 웹 기본 내부 outline을 제거한 뒤 나눔·동행 검색·작성 입력과 같은 primary 2px focus border를 적용하며 오류 테두리는 danger 색상을 우선
- 로그인 비밀번호 보기 아이콘 Material 복원 — 로그인 secure field의 `visibility / visibility-off`만 기존 Material Icons로 렌더링하고 나머지 앱 아이콘과 회원가입 아이콘은 Solar 체계를 유지
- 로그인·회원가입 세로 배치 정리 — 로그인은 상단(소프트 배지·2줄 환영 타이틀·입력 폼·로그인 버튼)과 하단(회원가입 안내 카드)을 `justifyContent: "space-between"`으로 배치해 상하 여백 균형을 맞추고, 그 높이는 첫 레이아웃에 고정한다. 키보드가 열려도 다시 계산하지 않으며, iOS는 가려진 입력만 `automaticallyAdjustKeyboardInsets`로 올린다. 회원가입은 헤더 아래 20px에서 시작하고 하단 가입 버튼은 키보드 위에 둔다
- 약관 뒤로·닫기 의미 구분 — 약관 동의 page에는 공통 `chevron-left + 뒤로`와 `router.back()`을 연결하고 같은 화면의 약관 전문 sheet에는 `close + 닫기`를 표시해 sheet state만 해제
- 기본 mock 로그인 계정 변경 — 개발·테스트 계정을 `admin / admin`으로 통일하고 mock adapter가 해당 자격증명만 허용하도록 고정
- 인증 typography·접근성 정리 — 로그인/회원가입의 display·제목·본문·보조·오류 문구를 역할형 `AppText`와 semantic tone으로 정리하고 양쪽 비밀번호 입력에 44px 표시/숨김 버튼을 적용
- 로그인 보조 동작 연결 — 비밀번호 표시/숨기기를 접근 가능한 버튼으로 연결한다. 비밀번호 찾기 문구와 준비 중 안내는 로그인 화면에 두지 않는다
- 인증 route guard와 웹 세션 저장 경계 추가 — 복원 중 route를 숨기고 anonymous/unavailable은 auth만, authenticated는 app/modal만 허용하며, 네이티브 SecureStore를 유지한 채 웹은 탭 단위 sessionStorage를 사용하도록 테스트로 고정
- Mock 회원가입/로그인 화면 구현 — `app/(auth)/signup.tsx`, `app/(auth)/login.tsx`
- ZIP 원본 auth 화면 라우트 보강 — splash, 가입 코드, 약관 동의/전문, 로그인/회원가입 상태 variant
- 로그인 화면 1차 디자인 정렬 — ZIP prototype 기준 로고 hero, 카드 없는 폼, 큰 pill 버튼, 가입 CTA divider 적용
- ZIP 110개 visual inventory 재검증에 포함 — auth reference 화면을 Dev Client capture/compare 대상에 유지
- 인증 상태 저장소와 mock service 구현 — `src/store/authStore.ts`, `src/services/authService.ts`, `src/hooks/useAuth.ts`, `src/mocks/auth.ts`
- 토큰 저장 유틸 골격 구현 — `src/lib/secureStore.ts`
- Swagger 인증 API 연결을 위한 adapter 골격 구현 — `src/services/authAdapter.ts`
- ZIP auth toast 문구 정렬 — 로그인/가입 코드 네트워크 toast를 원본 문구 `네트워크 연결을 확인해주세요` 기준으로 맞춤
- ZIP auth 화면 residual 정렬 — 실제 로그인 route와 가입 코드/약관 reference 화면을 ZIP `ScreenLogin`, `ScreenInviteCode`, `ScreenTermsSheet` 구조 기준으로 재정렬하고 auth 2-11번 화면 partial capture/compare를 갱신
- ZIP 회원가입 화면 구조 정렬 — 실제 `/signup` route를 ZIP `ScreenSignup`의 카드 없는 구조, 자동 아바타 미리보기, field stack, 안내 박스, bottom-flat 가입 버튼 기준으로 재구성하고 auth 12-17번 화면 partial capture/compare를 갱신
- ZIP auth bottom CTA/toast 렌더 정렬 — 공통 `Button` surface가 Android Pressable에서 빠지던 문제를 고쳐 로그인/가입 코드 bottom-flat CTA를 ZIP pill 버튼으로 복구하고, auth toast icon을 ZIP 네트워크 toast 계열에 맞춤
- ZIP splash 로고/status 정렬 — ZIP `ScreenSplash`처럼 splash 전용 light status bar와 도어 glyph를 사용해 `splash mean=15.82→15.69`로 낮춤
- ZIP 약관 전문 bottom sheet 정렬 — `/terms-sheet` overlay를 ZIP full-phone dim layer 기준으로 맞추고 sheet 높이, 약관 5조 문구, title/icon weight를 반영해 `terms-sheet mean=17.78→12.21`로 낮춤
- Splash 실제 route 복구 — `DesignSourceScreens` placeholder를 제거하고 Downloads `ScreenSplash` 기준 gradient, door logo, title/subtitle, loading dots를 실제 RN 화면으로 반영
- 약관 동의 실제 route 복구 — `DesignSourceScreens` placeholder를 제거하고 Downloads `ScreenTerms`/`ScreenTermsSheet` 기준 전체 동의, 필수/선택 약관 row, bottom sheet 전문을 실제 RN 화면으로 반영
- 가입 코드 reference route 제거 — Downloads 원본에 독립 `ScreenInviteCode`가 없고 MVP 제외 결정이 있어 부정확한 placeholder route를 삭제
- 인증 API 공통 기반 추가 — `{ code, message, data }` envelope와 Authorization 헤더, 공통 오류를 처리하는 `src/lib/apiClient.ts` 및 단위 테스트 구현
- SecureStore 토큰 조회 보강 — access/refresh token 개별·동시 조회와 저장·삭제 동작을 테스트로 고정
- Swagger 인증 계약 검사 추가 — `npm run test:api:contract`로 login/refresh/signup/me 성공 DTO와 JWT 정의 누락을 자동 판정
- 인증 세션 수명주기 구현 — 로그인·회원가입 토큰 저장, 앱 시작 세션 복원, 401 refresh token rotation, 재발급 실패 토큰 정리·로그아웃을 `authSessionService`로 통합하고 자동 테스트 추가
- 회원 중복확인 계약 검사 추가 — `POST /api/member/duplicate` 요청 enum과 공개 endpoint 여부, 200 envelope의 `data.available` 필드를 자동 검증
- 회원 중복확인 mock 경계와 화면 연결 — `id | phone` 요청과 `available` 도메인 결과를 auth adapter/service/hook으로 격리하고, 기존 아이디 중복확인 버튼·가입 전 확인 gate를 실제 mutation에 연결
- 인증 오류 코드 메시지 경계 추가 — Swagger에 문서화된 `MEM001~MEM006`을 고정 사용자 문구로 매핑하고 미등록 API 코드는 안전한 fallback을 사용
- 로그인 화면·세션 통합 검증 추가 — 입력 검증 후 `useAuth → authService → authSessionService → SecureStore`로 access/refresh token을 저장하고 `authenticated` 상태가 된 뒤 홈으로 이동하는 순서를 화면 테스트로 고정
- 핵심 Maestro 로그인 선행 — 앱 데이터를 초기화한 Dev Client에서 `/login`에 진입해 `admin/admin`으로 로그인한 뒤 나눔·동행·기도·삶공부 스모크를 실행하도록 골든 패스를 연결
- 회원가입 화면·세션 통합 검증 추가 — 현재 아이디의 사용 가능 응답을 받은 뒤 전체 입력을 제출하고, signup session의 토큰 저장·신규 사용자 인증 상태·홈 이동을 화면 테스트로 고정
- 회원가입 중복확인 결과 무효화 검증 — 사용 가능 확인 후 아이디가 바뀌면 이전 결과를 폐기하고 재확인 전 제출·토큰 저장을 차단하는 회귀 테스트 추가
- 핵심 Maestro 회원가입 선행 — 앱 상태 초기화 후 회원가입 중복확인→전체 입력→홈 진입을 완료하고 다시 로그인한 뒤 도메인 스모크를 실행하도록 인증 골든 패스 확장
- 로그아웃 토큰 정리 내결함성 보강 — access token 삭제가 실패해도 refresh token 삭제를 함께 시도하고, 정리 오류와 무관하게 session manager가 메모리 인증 상태를 `anonymous`로 전환하도록 테스트로 고정
- 핵심 Maestro 로그아웃 종결 — 회원가입·로그인·도메인 흐름 후 홈→마이페이지→로그아웃을 실행하고 로그인 입력 화면 복귀까지 인증 골든 패스에 포함

## 주요 파일 (도메인 파일 지도)

| 경로                                         | 역할                                                 |
| -------------------------------------------- | ---------------------------------------------------- |
| `app/(auth)/_layout.tsx`                     | 인증 스택 layout (slide/fade 전환)                   |
| `src/components/ui/motion.tsx`               | 진입·shake·fade·pop 공통 모션 프리미티브 (auth 사용) |
| `src/components/auth/AuthRouteNavigator.tsx` | 인증 상태별 auth/app route 보호                      |
| `app/(auth)/splash.tsx`                      | Splash 실제 화면                                     |
| `app/(auth)/terms.tsx`                       | 약관 동의 실제 화면                                  |
| `app/(auth)/terms-sheet.tsx`                 | 약관 전문 bottom sheet 실제 화면                     |
| `app/(auth)/login.tsx`                       | 로그인 입력·오류·세션 시작 화면                      |
| `app/(auth)/signup.tsx`                      | 회원가입 화면                                        |
| `src/components/auth/auth-input.tsx`         | 로그인·회원가입 공통 focus input surface             |
| `src/store/authStore.ts`                     | Zustand 인증 상태                                    |
| `src/services/authService.ts`                | 인증 mock service                                    |
| `src/services/authSessionService.ts`         | 토큰 저장·복원·재발급·로그아웃 상태 전이             |
| `src/services/authAdapter.ts`                | mock/http auth adapter 스위치 지점                   |
| `src/services/authMapper.ts`                 | 관측된 서버 DTO → 도메인 세션/회원                   |
| `src/hooks/useAuth.ts`                       | 인증 액션 hook                                       |
| `src/types/auth.ts`                          | 인증 입력/응답 타입                                  |
| `src/types/authApi.ts`                       | 라이브 관측 인증 서버 DTO                            |
| `src/lib/rolePermissions.ts`                 | 관리자 도메인별 역할 접근 판별                       |
| `src/types/api.ts`                           | 공통 `ApiResponse<T>` envelope                       |
| `src/mocks/auth.ts`                          | mock 로그인 계정과 사용자/성도 데이터                |
| `src/lib/apiClient.ts`                       | 공통 응답·오류·Authorization 처리                    |
| `src/lib/apiErrorMessage.ts`                 | API 오류 코드→사용자 문구 변환                       |
| `src/constants/apiErrorMessages.ts`          | 문서화된 인증 오류 코드 메시지 표                    |
| `src/lib/secureStore.ts`                     | 네이티브 SecureStore·웹 sessionStorage 토큰 저장     |
| `scripts/check-auth-api-contract.mjs`        | Swagger 인증 계약 검사                               |

## 데이터 타입

`LoginInput`, `SignupInput`, `MemberDuplicateInput`, `MemberAvailability`, `AuthSession`, `AuthStatus`를 `src/types/auth.ts`에 정의합니다. `AuthStatus`는 `restoring / authenticated / anonymous / unavailable`을 구분합니다. 성도 기본 정보는 `src/types/common.ts`의 `Member`와 `UserRole`을 사용하며, 역할은 `ADMIN`, `USER`, `MANAGER_COMMUNION`, `MANAGER_SHARE`, `MANAGER_LIFESTUDY`, `MANAGER_PRAYER` 중 하나입니다. 서버 공통 envelope는 `src/types/api.ts`의 `ApiResponse<T>`로 분리합니다. 중복확인 요청은 Swagger의 `searchType: id | phone | email`, `searchValue` 계약을 따르며 화면에는 `available` 도메인 결과만 노출합니다. 실제 HTTP mapper는 공통 envelope의 `data`만 사용합니다. 중복확인은 `available`, login/refresh는 `accessToken`, `refreshToken`, `userId`, `userName`, `role`, `/api/member/me`는 회원 필드입니다. 로그인 성공 schema는 `ApiResponseLoginResponse`입니다. 그 밖 Swagger 성공 schema가 비어 있는 항목은 `test:api:contract`가 계속 실패합니다.

## 결정 사항 (최신 위)

- (2026-10-28) **회원가입 하단 CTA 버튼 불투명 그라데이션 배경 적용** — 앱 공통(하단 탭 메뉴 및 삶공부/기도 신청 버튼) 디자인 톤에 맞추어 `rgba(246,247,249,...)` 3단계 그라데이션(`LinearGradient`)을 회원가입 하단 CTA 영역에 일관되게 적용하였다.

- (2026-10-28) **약관 바텀시트 하단 슬라이드업 방향 교정, 키보드 dismiss 및 이름 IME 입력 중 오류 지연 검증 적용** — Reanimated의 `SlideInDown` 프리셋(하단에서 위로 슬라이드)으로 바텀시트 진입 방향을 올바르게 교정하고, 시트 오픈 시 열려 있는 소프트 키보드를 자동으로 닫도록 보강하였다. 또한 성도 이름 입력 시 한글 조합 과정(예: '이ㅅ')에서 섣부르게 오류를 띄우지 않고, 입력 완료 후 포커스 이탈(`onBlur`) 또는 키보드 다음 액션 시점에만 최종 유효성을 판별하여 편안한 한글 입력 경험을 제공한다.

- (2026-10-28) **약관 전문(이용약관·개인정보 처리방침) 바텀시트 부드러운 슬라이드업 애니메이션 적용** — 약관 [보기] 클릭 시 바텀시트가 즉각 튀어나오지 않도록 `FadeIn` 딤 오버레이와 `SlideInUp` 바텀시트 슬라이드업 애니메이션을 적용하여 부드럽고 안정적인 진입 경험을 제공한다.

- (2026-10-28) **성도 정보(이름·연락처) 오류 피드백 즉시 노출(인라인 에러 및 테두리 강조) 적용** — 하단 칩을 제거한 상태에서 사용자가 잘못된 값(숫자, 영문, 010 외 번호 등)을 입력했을 때 이유를 인지할 수 있도록, 입력 즉시 및 포커스 이탈(onBlur) 시점에 붉은색 테두리(`hasError`)와 인라인 에러 문구를 즉각 노출하도록 보강하였다.

- (2026-10-28) **성도 정보(이름·연락처) 규칙 칩 제거 및 피드백 다이어트 적용** — 이름과 전화번호는 한국 사용자에게 당연한 기본 입력값이므로 하단 규칙 칩을 제거하여 시각적 과밀과 입력 압박감을 해소하였다. 유효성 검증(한글 2~10자, 010 번호) 및 우측 완료 체크 아이콘 피드백은 그대로 유지하여 깔끔하고 편안한 입력 경험을 제공한다.

- (2026-10-28) **회원가입 신규 카드 등장 트랜지션 및 타이핑 디바운스 완화 적용** — 입력 완료 즉시 카드가 딱딱하게 밀려나는 인지적 부담을 없애기 위해, `FadeInDown` 및 `LinearTransition` 레이아웃 애니메이션과 `LayoutAnimation.Presets.easeInEaseOut`을 적용하였다. 또한 타이핑 도중 급작스러운 레이아웃 변화를 방지하기 위해 500ms 디바운스(입력 정지 감지) 후 카드가 확장되도록 하였으며, 키보드 완료(Return/Next) 시에는 지체 없이 부드러운 레이아웃 전환과 함께 포커스를 인계하도록 최적화하였다(테스트 환경은 0ms 즉시 실행으로 회귀 방지).

- (2026-10-28) **회원가입 신규 카드 상단 추가(Top-Prepend) 및 전체 카드 펼침 상태 유지 적용** — 완료된 카드를 접어서 요약 카드(summaryCard)로 축소하지 않고 모든 필드를 항상 펼쳐진 상태로 유지한다. 다음 단계로 진행 시 새로 작성해야 하는 카드(2단계 성도 정보, 3단계 약관 동의)가 이전 카드보다 물리적으로 화면 위쪽(상단)에 나타나며, 수동 '다음' 버튼 없이 유효성 충족 시 자동으로 다음 카드가 상단에 추가되고 포커스가 이동하도록 구현하였다.

- (2026-10-28) **성도 정보 실시간 유효성 규칙 칩 제공 및 자동 카드 전환(수동 다음 버튼 제거)** — 성도 정보의 각 필드(이름: 2~10자·한글만 허용, 연락처: 010 시작·10~11자리, 이메일: 형식·중복확인) 하단에 실시간 규칙 충족 여부를 보여주는 인터랙티브 가이드 칩과 완료 체크 아이콘을 적용하였다. 또한 사용자가 조건을 모두 충족하면 수동 '다음' 버튼을 누를 필요 없이 자동으로 다음 섹션 카드가 활성화 및 펼쳐지도록 하여 가입 흐름의 마찰을 최소화하였다.

- (2026-10-28) **회원가입 토스·뱅킹 스타일 상향 축소(Upward Collapse) 및 접힘 요약 인터랙션 적용** — 화면에 긴 폼이 계속 늘어나는 대신, 이전 완료된 카드는 상단으로 밀려 올라가며 1줄 컴팩트 요약 카드(체크 배지, 주요 값 요약, [수정] 버튼)로 접히고, 현재 입력 중인 카드만 키보드 바로 위 최적 시야에 활성화된다. 각 카드 내 '다음' CTA 및 키보드 '다음' 액션으로 순차 진행되며, 요약 카드의 [수정] 버튼을 누르면 언제든지 해당 카드가 다시 펼쳐져 입력값을 변경할 수 있다. 폼 제출 시 에러가 발생한 항목이 있는 카드가 자동으로 재확장되어 오류를 즉시 인지하도록 한다.

- (2026-10-28) **이메일 중복확인 별도 버튼 제거 및 약관 동의 기본 미선택 적용** — 이메일 입력 필드의 별도 중복확인 버튼을 제거하여 전폭으로 확장하고 onBlur 시 자동 검증 및 trailing 인라인 아이콘을 노출한다. 회원가입 약관 동의(전체/이용약관/개인정보)는 기본 선택 해제(false) 상태로 시작하여 사용자가 명시적으로 동의한 경우에만 가입 버튼이 활성화되도록 한다.

- (2026-10-28) **아이디 중복확인 별도 버튼 제거 및 자동 인라인 상태 표시** — 아이디 입력 필드 우측의 별도 48px 중복확인 버튼을 제거하여 입력창을 전폭으로 확장하고, 포커스 아웃(onBlur) 시 자동으로 중복확인을 수행하여 입력창 내부 우측(trailing)에 인라인 스피너 및 확인 완료 체크 아이콘(check-circle)을 노출한다. 기존 자동화 테스트/스크립트 호환성을 위한 트리거는 유지한다.

- (2026-10-28) **회원가입 비밀번호 확인 입력 제거 및 약관 동의 폼 통합** — 중복 비밀번호 확인 입력을 제거하여 단일 비밀번호 필드로 간소화하고, 유효성 검증과 서버 전송 시 passwordConfirm을 password 값과 자동 동기화한다. 입력 편의를 위해 키보드 '다음(next)' 포커스 체인과 onBlur 시 자동 중복확인을 지원하며, 가입 폼 하단에 서비스 이용약관 및 개인정보 처리방침 동의(전문 보기 TermsSheet 지원)를 통합하여 필수 동의 시에만 가입 버튼이 활성화되도록 한다.

- (2026-10-27) **로그인·회원가입 아이디 영문 소문자·숫자 제한(`^[a-z0-9]+$`) 및 영문 키보드 호출 적용** — 아이디 입력 필드는 기본 영문 키보드(`ascii-capable`)를 호출하고 대문자는 자동으로 소문자로 변환(`sanitizeLoginId`)한다. 타이핑 중 한글 입력을 실시간으로 강제 제거하지 않고 노출하되, 유효하지 않은 문자나 3자 미만 입력 시 인라인 안내 문구("영문 소문자와 숫자만 입력할 수 있어요.")로 유효성 검증(`isValidLoginId`)한다. Issue #193.
- (2026-10-27) **인증 화면 진입 모션은 이동·시간차 없는 단일 페이드로 두고 폼 밀도를 정돈한다** — `MotionEnter` 기본 모드를 `fade`(`opacity`만 `duration.base 200ms`)로 두고 로그인·회원가입의 블록별 `stagger` 지연과 `translateY` 상승·로고 `settle` 스케일을 제거한다. 로그인 제목 위의 도어 로고 아이콘을 제거하고 상단 소프트 배지(`열린문교회 커뮤니티`)와 2줄 환영 헤드라인(`열린문 커넥트에 오신 것을 환영합니다`)을 좌측 정렬 `display`(28px)로 두며, 상단(헤드라인·입력 폼·로그인 버튼)과 하단(`열린문 커넥트가 처음이신가요? 회원가입하기` 서피스 카드)을 `space-between`으로 배치한다. 회원가입 상단 88px 점선 아바타 미리보기는 제거해 입력 흐름에 집중시킨다. 공통 `AuthInput`은 흰색 `surface` 배경과 `lineStrong` 테두리를 쓰고, 메인 CTA 곡률은 앱 공통 톤인 `radius.pill`을 유지한다. 회원가입은 비밀번호·비밀번호 확인을 하나의 그룹으로 묶은 뒤 계정 정보와 성도 정보 사이에 구분선을 두며, 중복확인 통과 시 버튼을 `확인 완료` 상태로 전환한다. Issue #190.
- (2026-07-18) **인증 입력은 전체 surface에 공통 focus border를 표시한다** — 로그인·회원가입의 내부 `TextInput` 웹 outline은 제거하고 공통 `AuthInput` 외곽에 primary 2px를 표시하며, 오류가 함께 있으면 danger 색상을 우선합니다.
- (2026-07-23) **회원가입 화면에서 목장·부서 배정 안내 배지와 연락처 하이픈 안내 문구는 두지 않는다** — 하단 info 배지(“목장과 부서는 가입 후…”)와 연락처 힌트는 제거하고, 연락처 하이픈 자동 포맷은 조용히 유지합니다.
- (2026-07-23) **회원가입 연락처는 숫자만 받아 010-XXXX-XXXX 하이픈을 자동 삽입한다** — 입력은 최대 11자리 숫자로 제한하고 표시·제출 값은 `010-1234-5678` 형식을 쓰며, 검증은 하이픈을 제외한 숫자 길이(10자 이상)로 판단합니다.
- (2026-07-23) **로그인·회원가입 비밀번호 보기 아이콘은 Material Icons를 사용한다** — secure field의 `visibility / visibility-off`만 Material Icons로 렌더링하고, 나머지 앱 아이콘과 회원가입의 기타 아이콘(아바타·에러·info 등)은 Solar/`AppIcon` 체계를 유지합니다.
- (2026-07-18) **로그인 비밀번호 보기 아이콘은 Material Icons를 사용한다** — (2026-07-23에 회원가입 secure field까지 동일 정책으로 확장)
- (2026-10-09) **로그인 묶음의 세로 위치는 키보드가 나와도 다시 계산하지 않는다** — 키보드가 없을 때는 중앙보다 약간 위(`paddingBottom: 72`)를 유지한다. 그 높이는 첫 `ScrollView` 레이아웃에 `minHeight`로 고정한다. iOS 키보드 대응은 `automaticallyAdjustKeyboardInsets` 하나다. Android는 `adjustResize`가 창 높이를 줄인다. `KeyboardAvoidingView`로 영역을 줄인 뒤 가운데 정렬을 다시 하지 않는다. 회원가입은 `TopBar` 아래 24px에서 긴 입력과 하단 고정 가입 버튼을 유지한다. 나눔 등록·소모임 개설도 상단에서 시작하고, 하단 버튼을 키보드 위로 올리려고 `KeyboardAvoidingView`를 유지한다.
- (2026-07-15) **약관 page 이동과 전문 sheet 해제를 다른 action으로 표시한다** — `/terms`와 `/terms-sheet`의 기본 page header는 공통 `뒤로`로 이전 경로를 pop하고, 약관 전문 overlay는 명시적인 `닫기`로 local sheet state만 해제합니다.
- (2026-07-23) **개발용 기본 계정은 `admin / admin`으로 고정한다** — mock adapter는 빈 값만 검사하지 않고 정확한 자격증명을 확인하며, 해당 아이디는 회원가입 중복확인에서도 사용 중으로 처리합니다. 실제 HTTP adapter 활성화 시 서버 인증 계약이 이 값을 대체합니다.
- (2026-07-23) **회원가입 하단 CTA glass/블러 실험은 철회하고 단순 bottomFlat으로 되돌린다** — 탭 glass와 동일 비주얼을 맞추기 어려워 `BlurTargetView`/`GlassBackdrop`/soft edge 오버레이를 제거하고, 기존처럼 하단 고정 패딩 바에 primary 가입 버튼만 둔다.
- (2026-07-14) **개발용 기본 계정은 `admin / admin123`으로 고정한다** — (2026-07-23에 `admin / admin`으로 변경)
- (2026-07-12) **인증 화면은 display와 입력 흐름만 강하게 강조한다** — 브랜드 제목·가입 display 외 설명/label/hint는 body·caption 역할로 제한하고, 작은 문구는 `textMuted` 이상 대비를 사용합니다. 로그인/회원가입 secure field는 동일한 44px visibility 조작을 제공합니다.

- (2026-07-12) **비밀번호 표시는 로컬 UI 상태로 즉시 전환한다** — (2026-10-09에 비밀번호 찾기 `준비 중` 문구는 화면에서 제거)

- (2026-07-11) **로그아웃은 모든 토큰 삭제를 시도한 뒤 메모리 세션을 반드시 종료한다** — SecureStore의 한 키 삭제가 실패해도 다른 키 삭제를 건너뛰지 않으며, native cleanup 오류는 호출자에게 전달하되 session manager의 `finally`가 `anonymous` 상태를 보장합니다. 마이페이지는 오류 여부와 관계없이 로그인 화면으로 이동합니다.
- (2026-07-11) **핵심 E2E는 회원가입과 로그인을 같은 세션 경계로 검증한다** — 메인 Maestro는 회원가입 성공으로 홈에 도달한 뒤 로그인 route를 다시 열어 재인증하고 도메인 흐름을 실행합니다. 두 화면은 토큰을 직접 다루지 않고 동일한 session manager를 사용해야 합니다.
- (2026-07-11) **핵심 E2E는 로그인 성공 이후에만 도메인 흐름을 실행한다** — 메인 Maestro는 앱 상태를 초기화하고 로그인 화면의 실제 입력과 mutation을 거쳐 홈에 도달해야 나눔·동행 검증을 계속합니다. 서비스 단위 테스트와 별도로 화면→SecureStore→인증 store→navigation 연결을 증명합니다.
- (2026-07-11) **중복확인 결과는 검사한 값과 함께 보관한다** — 요청 중 아이디가 바뀌었을 때 이전 응답을 현재 값의 결과로 오인하지 않도록 `{ value, available }`을 함께 비교합니다. 기본 가입 제출은 현재 아이디의 사용 가능 응답을 받은 뒤에만 허용하고, 연락처 중복확인 UI는 디자인 확정 전까지 새로 만들지 않습니다.
- (2026-07-11) **API 오류는 서버 message가 아니라 code로 사용자 문구를 결정한다** — 문서화된 `MEM001~MEM006`은 인증 메시지 표로 관리하고, 네트워크/응답 형식 오류는 공통 문구를 사용합니다. 미등록 API 코드는 내부 서버 문장을 노출하지 않고 화면별 fallback을 표시합니다.
- (2026-07-11) **회원가입 전 중복확인도 인증 계약 gate에 포함한다** — `POST /api/member/duplicate`는 구체 요청뿐 아니라 공개 endpoint `security: []`와 200 응답 `data.available`을 반드시 제공해야 합니다. 설명 문자열만으로 성공 응답을 추측하지 않습니다.
- (2026-07-10) **로그인·회원가입 오류/loading/toast query는 디자인 전용이다** — 캡처용 `designVariant`는 development에서만 해석합니다. 실제 로그인 오류와 pending 상태는 mutation 결과가 단일 출처이며 URL query로 인증 결과를 만들지 않습니다.
- (2026-07-10) **세션 상태 전이는 session manager가 단독 소유한다** — 화면/hook은 토큰을 직접 다루지 않습니다. adapter 성공 후 SecureStore 저장이 끝나야 `authenticated`가 되며, 앱 시작은 현재 회원 조회로 복원하고 401이면 refresh합니다. refresh 실패는 토큰을 지우고 `anonymous`, 일반 네트워크 실패는 토큰을 보존하고 `unavailable`로 구분합니다.
- (2026-07-10) **불완전한 인증 성공 응답은 추측하지 않는다** — login/refresh/signup/me 성공 DTO와 refresh rotation 정책이 Swagger에 확정되기 전에는 `httpAuthAdapter`를 활성화하지 않습니다. `test:api:contract`는 이 계약 게이트를 자동 판정하며, 미확정 기간에는 일반 `validate`와 분리합니다.
- (2026-07-10) **API DTO와 화면 도메인 모델을 분리한다** — 공통 API client는 envelope·오류·Authorization만 담당하고, 서버 DTO를 화면 모델로 바꾸는 책임은 도메인 service/mapper에 둡니다.
- (2026-06-27) **가입 코드 route는 제거한다** — Downloads 최신 원본에 독립 `ScreenInviteCode` 구현이 없고 기존 MVP 결정에서도 가입코드를 제외했으므로, 부정확한 reference 안내 화면을 유지하지 않습니다.
- (2026-06-27) **Splash route는 placeholder가 아니라 실제 RN 화면으로 둔다** — Downloads `ScreenSplash`의 핵심 구조를 직접 렌더링하고, 웹 전용 blur/status glyph는 새 의존성 없이 생략합니다.
- (2026-06-27) **약관 route는 placeholder가 아니라 실제 RN 화면으로 둔다** — Downloads `ScreenTerms`와 `ScreenTermsSheet`의 동의 row/bottom sheet 구조를 공통 `TermsAgreementScreen`으로 직접 렌더링합니다.
- (2026-05-27) **약관 전문 sheet는 ZIP full-phone overlay 기준으로 둔다** — `/terms-sheet`는 `Screen` safe-area 내부만 dim 처리하지 않고 ZIP `ScreenTermsSheet`처럼 status frame까지 dim layer가 덮이도록 보정합니다. Sheet panel은 ZIP `maxHeight: 80%`에 맞춰 80% 높이로 관리하고, 약관 문구는 ZIP JSX의 bullet wording을 우선합니다.
- (2026-05-27) **Splash는 ZIP `ScreenSplash`의 status/logo 톤을 따른다** — root status bar 기본 dark 설정을 그대로 쓰지 않고 splash reference 화면 안에서 light status bar를 적용합니다. 로고는 Material icon glyph가 아니라 ZIP door SVG에 가까운 RN View 조합으로 번역합니다.
- (2026-05-27) **auth network toast는 ZIP auth 전용 icon을 따른다** — 로그인/가입 코드의 `네트워크 연결을 확인해주세요` toast는 공통 성공 toast check icon이 아니라 ZIP `screens-auth.jsx`의 네트워크 안내 icon 톤에 맞춰 `sync` icon을 사용합니다.
- (2026-05-27) **회원가입 실제 route는 ZIP `ScreenSignup` 구조를 따른다** — 기존 `Card`/공통 `TextField` 묶음은 ZIP 구조와 맞지 않아 제거하고, `/signup` route 자체를 `정보를 입력해주세요` display, 자동 아바타, 아이디 중복확인 row, 비밀번호 확인 field, 하단 고정 primary CTA로 번역합니다. 실제 submit은 기존 `useAuth` mock-first 흐름을 유지합니다.
- (2026-05-27) **auth 화면 구조는 ZIP `screens-auth.jsx`를 우선한다** — 로그인 실제 route는 서비스 기능을 유지하되 ZIP의 카드 없는 hero/form/divider/toast 구조를 따른다. 가입 코드와 약관 전문 reference는 `variant` 캡처 화면이므로 ZIP JSX의 화면 구조를 RN으로 직접 번역합니다.
- (2026-05-26) **auth toast 문구는 ZIP 원본을 따른다** — 로그인/가입 코드 네트워크 오류 reference 상태는 앱 내부 설명형 문구가 아니라 ZIP JSX의 짧은 안내 문구 `네트워크 연결을 확인해주세요`를 기준으로 합니다.
- (2026-05-23) **ZIP auth 화면은 variant reference로 보강** — 가입 코드/약관처럼 Notion MVP 정책 확정이 필요한 화면도 ZIP에 존재하면 캡처·검증 가능한 mock-first 라우트로 둡니다.
- (2026-05-23) **로그인 화면은 카드 없는 단순 흐름** — ZIP prototype의 첫 진입 흐름에 맞춰 form을 큰 카드에 넣지 않고, 로고 hero와 primary CTA 중심으로 둡니다.
- (2026-05-22) **MVP 인증은 Mock-first** — Swagger에서 `/api/signup`, `/api/auth/login`, `/api/auth/refresh`만 확인됐으므로 실제 API 연결은 Phase 6 이후로 분리합니다.
- (2026-05-22) **실제 fetch는 adapter 뒤로 격리** — Swagger 응답 스키마 확정 전까지 `mockAuthAdapter`를 사용하고, `httpAuthAdapter`는 Phase 6에서 활성화합니다.
- (2026-05-22) **가입코드와 비밀번호 찾기는 제외** — Notion 최신 MVP 기준에 따라 가입코드 입력/검증, 비밀번호 찾기는 MVP에서 만들지 않습니다.

## 미결 / 추적

- Swagger 성공 DTO·공개 endpoint security·`bearerAuth` scheme·로그인/재발급 오류 코드는 여전히 미기재. 프런트 HTTP 연결은 라이브 관측값으로 진행했고, `test:api:contract` 13건은 백엔드 문서 작업이다. 단일 출처는 Issue #9.
- 약관/개인정보 동의 화면의 필수 여부와 문구 확정 필요.
- auth bottom CTA/toast 정렬 후 `login-toast mean=10.18`, `code-toast mean=10.10`, `code-error mean=8.80`, `code-loading mean=8.32`, `code default mean=8.66`까지 낮췄습니다. 로그인 입력 식별자 추가 후 기본 화면 부분 재캡처는 `login mean=13.18`로 렌더 구조 변동이 없음을 확인했습니다. `terms-sheet mean=12.21`는 Android status bar/time, backdrop blur 미적용, RN/web font metric 차이가 남아 후속 공통 overlay 정렬에서 추적합니다.
- signup variant residual은 `ScreenSignup` 구조 정렬 후 `signup-pw-error 21.74→10.14`, `signup-id-dup 20.65→9.18`, `signup default 12.50→7.76`까지 낮췄습니다. 입력 식별자 추가 후 기본 화면 부분 재캡처는 `signup mean=12.99`로 확인했으며 구조 변경은 없습니다. 남은 차이는 RN status bar/time, secure input glyph/font metrics, CSS gradient/shadow 번역 차이 중심으로 후속 공통 정렬에서 추적합니다.

## 의존성

- common 도메인의 `Member`, `secureStore`, `queryClient`에 의존합니다.

## 관련 ADR

- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
