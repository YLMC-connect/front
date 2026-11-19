# mypage (MY / 성도 프로필)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P4/P7

## 한 줄 요약

내 프로필, 내 활동(활동 내역·중보기도 활동·삶공부 수강 내역), 계정(비밀번호 변경·로그아웃), 고객센터(FAQ·약관 · 정책), 회원 탈퇴를 제공합니다.

## 현재 동작

- 하단 탭이 아니라 홈의 `내 정보` 카드에서 `/mypage` 루트 Stack 으로 push 되고, 모든 하위 화면도 같은 Stack 에서 우측 슬라이드로 열린다. 루트에도 뒤로가기를 둔다.
- 메뉴는 내 활동·계정·고객센터 세 묶음. 프로필 카드 전체를 누르면 프로필 수정으로 간다. 내 정보는 `GET /api/member/me`.
- 프로필 수정(`/mypage/edit`)은 이름·소속 교회 읽기 전용, 연락처만 `PUT /api/member/me` 로 바꾼다. 맨 아래 `회원 탈퇴` 링크.
- 비밀번호 변경(`/mypage/password`)은 현재·새·확인 입력 후 `PUT /api/member/password`.
- 회원 탈퇴(`/mypage/withdraw`)는 안내 확인 체크 후에만 버튼이 켜지고, 확인 팝업을 한 번 더 거쳐 `DELETE /api/member/me` 후 `/login` 으로 간다.
- 활동 내역(`/mypage/activity`)은 `GET /api/mypage/activities/posts`·`comments`·`groups` 를 한꺼번에 받아 나눔·댓글·소모임 탭으로 보이고, 탭 이름 옆에 `totalElements` 를 적는다. 탭 전환은 로컬 상태라 히스토리가 쌓이지 않는다.
- 중보기도 활동(`/mypage/prayer-history`)은 `GET /api/prayer/me/history` 로 요약(활동 중·참여 기도방)과 활동 중/지난 기도방 목록을 그린다.
- 삶공부 수강 내역(`/mypage/life-study-history`)은 `GET /api/mypage/activities/life-studies` 의 `ongoing`/`completed` 를 수강 중/수료로 나눈다.
- FAQ 는 `GET /api/faqs`(카테고리 칩은 응답에서 만든다), 약관 · 정책은 이용약관/개인정보 처리방침 탭 한 화면으로 `GET /api/site-policies/{policyType}`(1=이용약관, 2=개인정보). `/mypage/privacy` 는 개인정보 탭으로 연다.
- 로그아웃은 확인 다이얼로그 뒤 `useAuth().logout()` 을 부르고, 성공·실패와 관계없이 `/login` 으로 간다 (#191).

## 데이터 타입

- 활동 화면 행은 `MyPageActivityPost`·`MyPageActivityComment`·`MyPageActivityGroup`, DTO(`src/types/mypageApi.ts`)는 Notion 에 적힌 필드만 가진다.
- 페이지: 요청 `page` 는 0부터, 응답 `currentPage` 는 1부터라 다음 요청 page 는 `currentPage` 다. `currentPage` 가 1 미만이면 잘못된 응답. 기본 `size` 10, 정렬은 글·댓글 `id,desc`, 소모임 `joinedAt,desc`.
- 나눔 행: `statusName` 을 배지 문구로, `status` `AVAILABLE`/`RESERVED`/`COMPLETED` 를 tone `primary`/`warn`/`mute` 로. 날짜는 `yyyy-MM-dd` → `yyyy.MM.dd`. 댓글 출처는 `shareTitle`, 소모임 인원은 `currentParticipants`.
- 삶공부 이력 원소는 이름만 있고 값 타입이 없어 `unknown` 으로 읽는다.

## 결정 사항 (지금 유효한 것만)

- **서버가 주지 않는 값은 그리지 않는다** — 중보기도 활동의 이번 달 기도·함께 기도한 제목·피드, 약관 이전 버전, FAQ 문의 카드의 전화번호·운영 시간, `현재 비밀번호를 잊으셨나요?`(재설정 흐름 없음), 소속 교회 변경(API 없음), 수강 내역 행 이동(목적지 미정)은 두지 않는다.
- **차단 기능은 두지 않는다** — 차단 API 가 없어 차단 사용자 화면과 타 성도 프로필의 차단 상태를 지웠다.
- **원본 없는 MY 화면은 만들지 않는다** — 관심목록·알림설정·고객센터·1:1 문의·계정관리 화면은 디자인 원본이 없어 두지 않는다. 로그아웃은 별도 화면 없이 메뉴에서 처리한다.
- **로그아웃 토큰 정리는 auth 가 소유한다** — MY 화면은 저장소 삭제 결과로 분기하지 않고 `/login` 으로만 보낸다.
- **호출 범위** — 이 도메인은 `/api/mypage/activities/*`·`/api/member/*`·약관/FAQ 만 호출한다. 중보기도 이력은 `GET /api/mypage/activities/prayers` 대신 prayer 도메인의 `GET /api/prayer/me/history` 를 쓴다. `/api/admin` 은 호출하지 않는다 (#137).
- **약관·FAQ 는 서버 데이터만** — 하드코딩 fallback 조항·질문은 두지 않고, 로딩·빈 상태를 따로 그린다.

## 미결

- 문의 API·알림 설정·고객지원 운영 정책은 후속 Phase. 디자인 원본이 생기면 화면을 추가한다.

## 코드 위치

- 화면: `app/mypage/`
- 공용 부품: `src/components/mypage/`
- 활동 데이터: `src/services/mypage*`, `src/types/mypage*`
- 회원·약관·FAQ: `src/services/authAdapter.ts`, `src/hooks/useMember.ts`, `src/services/siteContent*`, `src/hooks/useSiteContent.ts`
- 계약 검사: `scripts/api-contract/mypage.mjs` (`npm run test:api:contract -- mypage`, `validate` 에는 없음)

## 의존성 · 관련 ADR

- auth 의 현재 사용자·로그아웃, prayer 의 내 기도 이력, common 의 queryClient · queryKeys · UI 컴포넌트.
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
