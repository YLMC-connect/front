# mypage (MY / 성도 프로필)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P4 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
내 프로필, 내 활동, 관심 목록, FAQ/고객센터, 로그아웃/탈퇴 요청 흐름을 제공합니다.

---

## ✅ 완료
- MY 화면 고도화 — `app/(tabs)/mypage/index.tsx`
- MY mock service/hook/type 구현 — `src/types/mypage.ts`, `src/services/myPageService.ts`, `src/hooks/useMyPage.ts`
- 프로필 수정 mock, 내 활동 탭, 관심 목록, FAQ accordion, 로그아웃 확인, 탈퇴 요청 mock 구현
- MY 화면 1차 디자인 정렬 — ZIP prototype 기준 마이페이지 title, 프로필 카드의 수정 CTA, 활동 관리 섹션명 적용
- ZIP 원본 MY/성도 프로필 화면 25개 상태 매핑 — 프로필 수정, 활동, 차단, FAQ, 약관/개인정보, 탈퇴, 타 성도 프로필 reference 라우트 연결

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/mypage/index.tsx` | MY 화면 |
| `app/(tabs)/mypage/edit.tsx` | ZIP 원본 프로필 수정 reference 화면 |
| `app/(tabs)/mypage/activity.tsx` | ZIP 원본 활동 내역 reference 화면 |
| `app/(tabs)/mypage/blocked.tsx` | ZIP 원본 차단 사용자 reference 화면 |
| `app/(tabs)/mypage/faq.tsx` | ZIP 원본 FAQ reference 화면 |
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
- (2026-05-23) **MY 원본 상태는 숨김 라우트로 모두 보강** — 기본 MY 외 프로필 수정/활동/차단/FAQ/법적 문서/탈퇴/타 성도 프로필 상태를 `variant` 기반 reference 화면으로 둡니다.
- (2026-05-23) **MY 첫 화면은 프로필 카드 중심** — 인라인 mock 기능은 유지하되, 첫 인상은 ZIP prototype처럼 프로필 카드와 관리 섹션이 먼저 읽히도록 조정합니다.
- (2026-05-22) **MY도 service/hook 경유** — 화면에서 mock 파일을 직접 읽지 않고 `useMyPage -> myPageService -> mocks` 흐름을 따릅니다.
- (2026-05-22) **회원 탈퇴는 mock 요청 상태** — 실제 soft delete와 관리자 처리 정책은 API 연결 후 확정합니다.

## 미결 / 추적
- 휴대폰 중복 확인, 비밀번호 제약, 탈퇴 soft delete API 스키마 확인 필요.
- 알림 설정, 약관/개인정보 상세 화면은 후속 Phase입니다.

## 의존성
- auth 도메인의 현재 사용자와 common 도메인의 UI에 의존합니다.
- market, group, life-study, prayer mock 데이터에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
