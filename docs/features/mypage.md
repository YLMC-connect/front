# mypage (MY / 성도 프로필)

> 마지막 갱신: 2026-05-27 | 담당 Phase: P4 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
내 프로필, 내 활동, 관심 목록, FAQ/고객센터, 로그아웃/탈퇴 요청 흐름을 제공합니다.

---

## ✅ 완료
- MY 화면 고도화 — `app/(tabs)/mypage/index.tsx`
- MY mock service/hook/type 구현 — `src/types/mypage.ts`, `src/services/myPageService.ts`, `src/hooks/useMyPage.ts`
- 프로필 수정 mock, 내 활동 탭, 관심 목록, FAQ accordion, 로그아웃 확인, 탈퇴 요청 mock 구현
- MY 화면 1차 디자인 정렬 — ZIP prototype 기준 마이페이지 title, 프로필 카드의 수정 CTA, 활동 관리 섹션명 적용
- ZIP 원본 MY/성도 프로필 화면 30개 상태 매핑 — 프로필 수정, 활동, 차단, FAQ, 약관/개인정보, 탈퇴, 타 성도 프로필, 관심목록, 알림설정, 고객센터, 문의, 계정 관리 reference 라우트 연결
- MY 확인 팝업 문구 정렬 — 차단 해제, 회원 탈퇴, 타 성도 차단 확인 다이얼로그의 제목/본문/확인 버튼을 ZIP 원본 JSX 문구와 맞춤
- MY/성도 프로필 toast 문구 정렬 — 차단 해제/차단 완료 toast를 ZIP 원본 JSX 문구로 맞춤
- MY 차단/타 성도 프로필 원본 구조 정렬 — ZIP `ScreenBlocked`, `ScreenUserProfile` 기준으로 카드형 wrapper를 제거하고, fixed toast overlay, 차단 안내 박스, flat row list, 104px 프로필 avatar, outline 차단 CTA를 reference 화면에 반영
- MY 차단/프로필 partial visual compare 개선 — `me-blocked*`, `user*` 8개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `user-ts 29.61→4.97`, `me-blocked-ts 26.57→6.13`, `user 3.60`, `user-blocked 3.71`, `me-blocked-em 3.25`로 정렬
- MY 회원 탈퇴 ZIP 구조 정렬 — ZIP `ScreenWithdraw` 기준 안내 제목/주의사항 header/별도 정보 카드/fixed danger CTA를 reference 화면에 반영하고 `me-withdraw 16.74→8.48`, `me-withdraw-cf 9.08→5.46`으로 낮춤
- MY 법적 문서 ZIP 구조 정렬 — ZIP `ScreenLegal` 기준 이용약관/개인정보처리방침을 카드 요약이 아니라 시행일자와 조항별 전문 텍스트 화면으로 재구성
- MY 법적 문서 heading weight 정렬 — ZIP `ScreenLegal`의 조항 제목 weight 700을 반영하고 97/98번을 재캡처해 `me-terms 14.41→14.38`, `me-privacy 15.65→15.61`로 소폭 낮춤

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/mypage/index.tsx` | MY 화면 |
| `app/(tabs)/mypage/edit.tsx` | ZIP 원본 프로필 수정 reference 화면 |
| `app/(tabs)/mypage/activity.tsx` | ZIP 원본 활동 내역 reference 화면 |
| `app/(tabs)/mypage/blocked.tsx` | ZIP 원본 차단 사용자 reference 화면 |
| `app/(tabs)/mypage/faq.tsx` | ZIP 원본 FAQ reference 화면 |
| `app/(tabs)/mypage/wishlist.tsx` | ZIP 원본 관심 목록 reference 화면 |
| `app/(tabs)/mypage/notification-settings.tsx` | ZIP 원본 알림 설정 reference 화면 |
| `app/(tabs)/mypage/support.tsx` | ZIP 원본 고객센터 reference 화면 |
| `app/(tabs)/mypage/inquiry.tsx` | ZIP 원본 1:1 문의 reference 화면 |
| `app/(tabs)/mypage/account.tsx` | ZIP 원본 계정 관리 reference 화면 |
| `app/(tabs)/mypage/terms.tsx` | ZIP 원본 이용약관 reference 화면 |
| `app/(tabs)/mypage/privacy.tsx` | ZIP 원본 개인정보처리방침 reference 화면 |
| `app/(tabs)/mypage/withdraw.tsx` | ZIP 원본 회원 탈퇴 reference 화면 |
| `app/(tabs)/mypage/user/[id].tsx` | ZIP 원본 타 성도 프로필 reference 화면 |
| `src/services/myPageService.ts` | MY mock service |
| `src/hooks/useMyPage.ts` | MY query hook |
| `src/types/mypage.ts` | MY 데이터 타입 |

## 데이터 타입
`MyPageData`는 나눔, 소모임, 삶공부, 기도방, 관심 제목, FAQ 목록을 묶어 반환합니다.

## 결정 사항 (최신 위)
- (2026-05-27) **법적 문서 조항 제목 weight는 ZIP 700을 따른다** — `ScreenLegal`의 section heading은 800이 아니라 700 weight를 사용하므로, RN reference도 `theme.fontWeight.bold`로 맞춥니다.
- (2026-05-27) **법적 문서 화면은 ZIP 전문 구조를 따른다** — 이용약관/개인정보처리방침은 현재 앱의 단일 카드 요약이 아니라 ZIP `ScreenLegal`처럼 `TopBar` 아래 시행일자, 조항 제목, 조항 본문을 full document 형태로 렌더링합니다. Pixel residual은 RN/웹 한글 font metric과 실제 status bar 차이를 별도 원인으로 분리합니다.
- (2026-05-27) **회원 탈퇴는 ZIP bottom-flat CTA 구조를 따른다** — 탈퇴 화면은 일반 `Screen` scroll content 안의 버튼이 아니라 ZIP `ScreenWithdraw`처럼 body 안내 영역과 하단 `bottom-flat` danger CTA를 분리합니다. 주의사항 카드도 icon title, bullet row, 별도 정보 카드를 유지합니다.
- (2026-05-27) **MY toast 화면은 ZIP fixed overlay 구조를 따른다** — 차단 완료/차단 해제 toast는 화면 ScrollView 내부 요소가 아니라 `Phone` root의 fixed bottom overlay로 두어야 ZIP 하단 위치와 일치합니다.
- (2026-05-27) **타 성도 프로필은 카드형 wrapper를 쓰지 않는다** — ZIP `ScreenUserProfile`은 full-width 카드가 아니라 중앙 avatar/name과 outline 차단 CTA 구조이므로 reference 화면도 같은 구조로 둡니다.
- (2026-05-26) **MY toast 문구도 ZIP 원본을 따른다** — 차단 해제 toast는 `차단이 해제되었습니다`, 타 성도 프로필 차단 완료 toast는 `차단되었습니다`를 기준으로 합니다.
- (2026-05-23) **MY 위험/권한 확인 문구는 ZIP 원본을 따른다** — 탈퇴·차단·차단 해제처럼 사용자 영향이 큰 확인 다이얼로그는 mock 동작보다 원본 UX 문구 일치를 우선합니다.
- (2026-05-23) **MY 추가 화면도 110개 inventory에 포함** — 관심 목록, 알림 설정, 고객센터, 1:1 문의, 계정 관리를 ZIP JSX 기준 reference 라우트로 추가하고 Dev Client capture/compare 대상에 포함합니다.
- (2026-05-23) **MY 원본 상태는 숨김 라우트로 모두 보강** — 기본 MY 외 프로필 수정/활동/차단/FAQ/법적 문서/탈퇴/타 성도 프로필 상태를 `variant` 기반 reference 화면으로 둡니다.
- (2026-05-23) **MY 첫 화면은 프로필 카드 중심** — 인라인 mock 기능은 유지하되, 첫 인상은 ZIP prototype처럼 프로필 카드와 관리 섹션이 먼저 읽히도록 조정합니다.
- (2026-05-22) **MY도 service/hook 경유** — 화면에서 mock 파일을 직접 읽지 않고 `useMyPage -> myPageService -> mocks` 흐름을 따릅니다.
- (2026-05-22) **회원 탈퇴는 mock 요청 상태** — 실제 soft delete와 관리자 처리 정책은 API 연결 후 확정합니다.

## 미결 / 추적
- 휴대폰 중복 확인, 비밀번호 제약, 탈퇴 soft delete API 스키마 확인 필요.
- 알림 설정/고객센터/문의 화면은 reference UI만 구현되어 있으며 실제 알림 권한, 문의 API, 고객지원 운영 정책은 후속 Phase에서 확정합니다.

## 의존성
- auth 도메인의 현재 사용자와 common 도메인의 UI에 의존합니다.
- market, group, life-study, prayer mock 데이터에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
