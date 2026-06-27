# mypage (MY / 성도 프로필)

> 마지막 갱신: 2026-06-27 | 담당 Phase: P4 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

내 프로필, 내 활동, 관심 목록, FAQ/고객센터, 로그아웃/탈퇴 요청 흐름을 제공합니다.

---

## ✅ 완료

- MY 화면 고도화 — `app/(tabs)/mypage/index.tsx`
- MY 타입 구현 — `src/types/mypage.ts`
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
- 알림 설정 ZIP section/card 구조 정렬 — ZIP `ScreenNotifSettings` 기준으로 단일 카드/경고 문구를 제거하고 전체·중고/나눔·소모임·중보기도·삶공부 섹션 카드와 40x24 switch를 반영해 `notif-settings 14.23→12.32`로 낮춤
- MY 루트 실제 화면 복구 — `DesignSourceScreens` placeholder를 제거하고 Downloads `ScreenMyPage` 기준 프로필 카드, 활동 관리, 고객센터, 계정, 계정 관리 메뉴를 실제 RN route로 반영
- FAQ 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenFAQ`의 category chip row, Q row, 펼친 답변 box, empty state를 `/mypage/faq` route에 RN으로 직접 반영
- MY 법적 문서 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenLegal`의 시행일자와 조항별 전문 텍스트 구조를 `/mypage/terms`, `/mypage/privacy` route에 RN으로 직접 반영
- 차단 사용자 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenBlocked`의 안내 박스, flat row list, 차단 해제 pill, confirm/toast/empty state를 `/mypage/blocked` route에 RN으로 직접 반영
- 회원 탈퇴 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenWithdraw`의 안내 제목, 주의사항 박스, 정보 카드, fixed danger CTA, 탈퇴 confirm을 `/mypage/withdraw` route에 RN으로 직접 반영
- 프로필 수정 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenEditProfile`의 읽기 전용 프로필 카드, 연락처 입력, 비밀번호 변경 필드, 오류 상태를 `/mypage/edit` route에 RN으로 직접 반영
- 활동 내역 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenActivity`의 나눔 게시글/댓글/소모임 tab list와 empty state를 `/mypage/activity` route에 RN으로 직접 반영
- 타 성도 프로필 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenUserProfile`의 중앙 avatar/name, outline 차단 CTA, blocked/withdrawn/confirm/toast 상태를 `/mypage/user/[id]` route에 RN으로 직접 반영
- 원본 없는 MY reference route 제거 — Downloads 최신 원본에서 확인되지 않는 관심목록/알림설정/고객센터/문의/계정관리 placeholder route를 삭제하고, 로그아웃은 MY 메뉴에서 직접 처리

## 주요 파일 (도메인 파일 지도)

| 경로                              | 역할                              |
| --------------------------------- | --------------------------------- |
| `app/(tabs)/mypage/index.tsx`     | MY 화면                           |
| `app/(tabs)/mypage/edit.tsx`      | 프로필 수정 연락처/비밀번호 화면  |
| `app/(tabs)/mypage/activity.tsx`  | 나눔 게시글/댓글/소모임 활동 내역 |
| `app/(tabs)/mypage/blocked.tsx`   | 차단 사용자 목록과 해제 상태      |
| `app/(tabs)/mypage/faq.tsx`       | FAQ 목록과 empty state            |
| `app/(tabs)/mypage/terms.tsx`     | 이용약관 전문 문서                |
| `app/(tabs)/mypage/privacy.tsx`   | 개인정보처리방침 전문 문서        |
| `app/(tabs)/mypage/withdraw.tsx`  | 회원 탈퇴 안내와 확인             |
| `app/(tabs)/mypage/user/[id].tsx` | 타 성도 프로필과 차단 상태        |
| `src/types/mypage.ts`             | MY 데이터 타입                    |

## 데이터 타입

`MyPageData`는 나눔, 소모임, 삶공부, 기도방, 관심 제목, FAQ 목록을 묶어 반환합니다.

## 결정 사항 (최신 위)

- (2026-06-27) **원본 없는 MY reference route는 제거한다** — Downloads 최신 원본에서 독립 화면 함수를 확인할 수 없는 관심목록/알림설정/고객센터/문의/계정관리 placeholder는 유지하지 않습니다. 로그아웃은 별도 화면 없이 MY 메뉴에서 `useAuth.logout()`으로 처리합니다.
- (2026-06-27) **타 성도 프로필은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenUserProfile` 구조를 `/mypage/user/[id]` route에 직접 반영합니다. 실제 차단 API와 탈퇴 사용자 조회 정책은 사용자 정책 확정 후 연결합니다.
- (2026-06-27) **활동 내역은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenActivity` 구조를 `/mypage/activity` route에 직접 반영합니다. 실제 사용자 활동 API는 나눔/소모임/댓글 API 확정 후 연결합니다.
- (2026-06-27) **프로필 수정은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenEditProfile` 구조를 `/mypage/edit` route에 직접 반영합니다. 실제 연락처 중복 확인과 비밀번호 변경 API는 인증/계정 정책 확정 후 연결합니다.
- (2026-06-27) **MY 루트는 placeholder가 아니라 실제 RN 화면으로 둔다** — Downloads `ScreenMyPage`를 기준으로 프로필 카드와 메뉴 그룹을 실제 route에 구현하고, 하위 상세 화면은 기존 숨김 reference route로 연결합니다.
- (2026-06-27) **FAQ는 실제 RN 화면으로 렌더링한다** — Downloads `ScreenFAQ` 구조를 `/mypage/faq` route에 직접 반영합니다. 실제 고객지원 검색/API는 운영 정책 확정 후 연결합니다.
- (2026-06-27) **법적 문서는 실제 RN 화면으로 렌더링한다** — Downloads `ScreenLegal` 구조를 `/mypage/terms`, `/mypage/privacy` route에 직접 반영합니다.
- (2026-06-27) **차단 사용자 화면은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenBlocked` 구조를 `/mypage/blocked` route에 직접 반영합니다. 실제 차단 해제 API는 사용자 정책 확정 후 연결합니다.
- (2026-06-27) **회원 탈퇴 화면은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenWithdraw` 구조를 `/mypage/withdraw` route에 직접 반영합니다. 실제 soft delete API는 정책 확정 후 연결합니다.
- (2026-06-27) **미사용 MY service/hook 레이어는 제거한다** — 현재 MY 화면은 Downloads 원본을 기준으로 다시 구현할 예정이고 `useMyPage -> myPageService` 호출처가 없어 제거했습니다. 실제 API 연결 시 필요한 query hook만 다시 만듭니다.
- (2026-05-27) **알림 설정은 ZIP section/card 구조를 따른다** — 알림 설정은 단일 카드 목록이 아니라 ZIP `ScreenNotifSettings`처럼 섹션 제목과 카드 목록을 반복합니다. `거래 채팅` 행은 v2 범위이므로 v1 reference에서는 제외하고, 경고 카드로 대체하지 않습니다.
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
- (2026-05-22) **회원 탈퇴는 mock 요청 상태** — 실제 soft delete와 관리자 처리 정책은 API 연결 후 확정합니다.

## 미결 / 추적

- 휴대폰 중복 확인, 비밀번호 제약, 탈퇴 soft delete API 스키마 확인 필요.
- 알림 권한, 문의 API, 고객지원 운영 정책은 후속 Phase에서 확정합니다. Downloads에 독립 원본 화면이 생기면 그때 실제 route로 추가합니다.
- 알림 설정 residual은 ZIP section/card 구조 정렬 후 `notif-settings mean=12.32`입니다. ZIP 원본의 `거래 채팅` 행은 v2 제외 원칙으로 빠졌고, 남은 차이는 RN font metrics, switch antialiasing, status bar/time 차이로 추적합니다.

## 의존성

- auth 도메인의 현재 사용자와 common 도메인의 UI에 의존합니다.
- market, group, life-study, prayer mock 데이터에 의존합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
