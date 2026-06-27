# auth (인증)

> 마지막 갱신: 2026-06-27 | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도가 앱에 들어오기 위한 회원가입/로그인 흐름과 인증 상태를 관리합니다.

---

## ✅ 완료

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

## 주요 파일 (도메인 파일 지도)

| 경로                          | 역할                               |
| ----------------------------- | ---------------------------------- |
| `app/(auth)/_layout.tsx`      | 인증 스택 layout                   |
| `app/(auth)/splash.tsx`       | Splash 실제 화면                   |
| `app/(auth)/terms.tsx`        | 약관 동의 실제 화면                |
| `app/(auth)/terms-sheet.tsx`  | 약관 전문 bottom sheet 실제 화면   |
| `app/(auth)/login.tsx`        | 로그인 화면                        |
| `app/(auth)/signup.tsx`       | 회원가입 화면                      |
| `src/store/authStore.ts`      | Zustand 인증 상태                  |
| `src/services/authService.ts` | 인증 mock service                  |
| `src/services/authAdapter.ts` | mock/http auth adapter 스위치 지점 |
| `src/hooks/useAuth.ts`        | 인증 액션 hook                     |
| `src/types/auth.ts`           | 인증 입력/응답 타입                |
| `src/mocks/auth.ts`           | mock 사용자/성도 데이터            |

## 데이터 타입

`LoginInput`, `SignupInput`, `AuthSession`을 `src/types/auth.ts`에 정의합니다. 성도 기본 정보는 `src/types/common.ts`의 `Member`를 사용합니다.

## 결정 사항 (최신 위)

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

- 실제 로그인 API의 응답 스키마와 refresh token rotation 정책 확인 필요.
- 약관/개인정보 동의 화면의 필수 여부와 문구 확정 필요.
- auth bottom CTA/toast 정렬 후 `login-toast mean=10.18`, `code-toast mean=10.10`, `code-error mean=8.80`, `code-loading mean=8.32`, `code default mean=8.66`까지 낮췄습니다. `terms-sheet mean=12.21`는 Android status bar/time, backdrop blur 미적용, RN/web font metric 차이가 남아 후속 공통 overlay 정렬에서 추적합니다.
- signup variant residual은 `ScreenSignup` 구조 정렬 후 `signup-pw-error 21.74→10.14`, `signup-id-dup 20.65→9.18`, `signup default 12.50→7.76`까지 낮췄습니다. 남은 차이는 RN status bar/time, secure input glyph/font metrics, CSS gradient/shadow 번역 차이 중심으로 후속 공통 정렬에서 추적합니다.

## 의존성

- common 도메인의 `Member`, `secureStore`, `queryClient`에 의존합니다.

## 관련 ADR

- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
