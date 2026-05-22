# auth (인증)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도가 앱에 들어오기 위한 회원가입/로그인 흐름과 인증 상태를 관리합니다.

---

## ✅ 완료
- Mock 회원가입/로그인 화면 구현 — `app/(auth)/signup.tsx`, `app/(auth)/login.tsx`
- 로그인 화면 1차 디자인 정렬 — ZIP prototype 기준 로고 hero, 카드 없는 폼, 큰 pill 버튼, 가입 CTA divider 적용
- 인증 상태 저장소와 mock service 구현 — `src/store/authStore.ts`, `src/services/authService.ts`, `src/hooks/useAuth.ts`, `src/mocks/auth.ts`
- 토큰 저장 유틸 골격 구현 — `src/lib/secureStore.ts`
- Swagger 인증 API 연결을 위한 adapter 골격 구현 — `src/services/authAdapter.ts`

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(auth)/_layout.tsx` | 인증 스택 layout |
| `app/(auth)/login.tsx` | 로그인 화면 |
| `app/(auth)/signup.tsx` | 회원가입 화면 |
| `src/store/authStore.ts` | Zustand 인증 상태 |
| `src/services/authService.ts` | 인증 mock service |
| `src/services/authAdapter.ts` | mock/http auth adapter 스위치 지점 |
| `src/hooks/useAuth.ts` | 인증 액션 hook |
| `src/types/auth.ts` | 인증 입력/응답 타입 |
| `src/mocks/auth.ts` | mock 사용자/성도 데이터 |

## 데이터 타입
`LoginInput`, `SignupInput`, `AuthSession`을 `src/types/auth.ts`에 정의합니다. 성도 기본 정보는 `src/types/common.ts`의 `Member`를 사용합니다.

## 결정 사항 (최신 위)
- (2026-05-23) **로그인 화면은 카드 없는 단순 흐름** — ZIP prototype의 첫 진입 흐름에 맞춰 form을 큰 카드에 넣지 않고, 로고 hero와 primary CTA 중심으로 둡니다.
- (2026-05-22) **MVP 인증은 Mock-first** — Swagger에서 `/api/signup`, `/api/auth/login`, `/api/auth/refresh`만 확인됐으므로 실제 API 연결은 Phase 6 이후로 분리합니다.
- (2026-05-22) **실제 fetch는 adapter 뒤로 격리** — Swagger 응답 스키마 확정 전까지 `mockAuthAdapter`를 사용하고, `httpAuthAdapter`는 Phase 6에서 활성화합니다.
- (2026-05-22) **가입코드와 비밀번호 찾기는 제외** — Notion 최신 MVP 기준에 따라 가입코드 입력/검증, 비밀번호 찾기는 MVP에서 만들지 않습니다.

## 미결 / 추적
- 실제 로그인 API의 응답 스키마와 refresh token rotation 정책 확인 필요.
- 약관/개인정보 동의 화면의 필수 여부와 문구 확정 필요.

## 의존성
- common 도메인의 `Member`, `secureStore`, `queryClient`에 의존합니다.

## 관련 ADR
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
