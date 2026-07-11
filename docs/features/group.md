# group (소모임)

> 마지막 갱신: 2026-07-11 | 담당 Phase: P1/P3/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도가 소모임을 탐색하고 참여하거나 새 모임을 개설할 수 있게 합니다.

---

## ✅ 완료

- 소모임 목록/상세/개설 화면 구현 — `app/(tabs)/group/index.tsx`, `app/(tabs)/group/[id].tsx`, `app/modal/group-new.tsx`
- 소모임 타입과 mock 데이터 구현 — `src/types/group.ts`, `src/mocks/groups.ts`
- 대표 이미지 선택/미리보기 연결 — `GroupInput.coverImage`를 카드/상세 cover에 표시
- 참여, 탈퇴, 공지 작성, 멤버 목록 mock mutation 구현
- 검색, 모집/참여/관심 필터, 관심 소모임, 정원 마감 제한, 소모임장 탈퇴 제한, 멤버 내보내기 mock 구현
- 소모임 카드 cover fallback 디자인 정렬 — 대표 이미지가 없을 때 ZIP prototype 톤의 gradient cover placeholder 적용
- 소모임 목록 1차 디자인 정렬 — ZIP prototype 기준 접힌 검색, 상태 segmented tabs, category chips, bottom-right 개설 FAB 적용
- ZIP 원본 소모임 화면 29개 상태 매핑 — 목록/상세/개설/공지/멤버 관리 variant reference 라우트 연결
- ZIP 110개 visual inventory 재검증에 포함 — 소모임 reference 화면을 Dev Client capture/compare 대상에 유지
- 소모임 상세/멤버 관리 원본 시각 정렬 — ZIP JSX 기준 상세 header, 리더 카드, 멤버 rail, 공지 list, 강퇴/소모임장 이관 list와 확인 문구를 reference 화면에 반영
- 소모임 멤버 관리 residual 개선 — ZIP `ScreenGroupMembers` 기준 `뒤로` pill TopBar와 이름 해시 Avatar 팔레트를 반영해 기본 멤버 관리 diff를 `mean=73.43`에서 `13.39`로 낮춤
- ZIP 소모임 toast 문구 정렬 — 인원 초과/소모임장 탈퇴 제한 toast를 원본 JSX의 짧은 문구로 맞춤
- 소모임 상세 overlay/section geometry 정렬 — ZIP `ScreenGroupDetail`처럼 body는 내부 ScrollView로 두고 toast/dialog를 fixed overlay로 분리, soft category chip·멤버 horizontal rail·공지 카드·primary/outline action pill을 reference 화면에 반영
- 소모임 상세 partial visual compare 개선 — `group-detail*` 10개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `full-toast 31.63→20.76`, `non-member 23.19→20.81`, `leader 18.72→18.07`, `leader-closed 18.71→18.09`로 감소
- 소모임 상세 action compact 정렬 — ZIP `ScreenGroupDetail`의 44px inline `ActionBtn` 구조를 반영하고 소모임장 카드 shadow/border를 제거해 `group-detail*` 10개 상태를 재캡처, `missing=0` 확인
- 소모임 멤버 관리 Toast overlay 정렬 — ZIP `ScreenGroupMembers`처럼 list body와 fixed overlay를 분리해 강퇴 toast가 화면 하단에 표시되도록 재구성, `group-members-kickts 17.86→9.39`로 감소
- 소모임 상세 typography 정렬 — ZIP `ScreenGroupDetail` inline style 기준으로 title, meta, leader card, member rail, notice title weight를 화면 전용 스타일로 낮춰 `group-detail*` 10개 상태를 재캡처, `missing=0` 확인
- 소모임 상세 설명문 wrap 정렬 — ZIP `ScreenGroupDetail`의 설명문 줄 감김에 맞춰 화면 전용 description style을 적용하고 47-57 전체를 재캡처, `missing=0` 확인. 대표 residual은 `non-member 19.56→10.18`, `full-toast 19.44→10.38`, `leader 15.96→10.79`, `leader-closed 16.03→10.81`로 감소
- 소모임 목록 FAB root overlay 정렬 — ZIP fixed FAB 구조에 맞춰 list body ScrollView와 root FAB를 분리하고 43-46번을 재캡처, `group-list 11.61→10.21`, `group-list-mine 11.70→10.28`, empty/error 계열은 6점대까지 낮춤
- 소모임 목록 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenGroupList`의 내 소모임 가로 카드, 전체 모임 category chip, 모집 상태 카드, root FAB 구조를 `/group` route에 RN으로 직접 반영
- 소모임 상세 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenGroupDetail`의 정보 header, 리더 카드, 권한별 action, 멤버 rail, 공지 카드 구조를 `/group/[id]` route에 RN으로 직접 반영
- 소모임 개설 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenGroupCreate`의 close/action topbar, 카테고리 chip, 소모임명/설명/최대인원 section, 안내 박스를 `modal/group-new` route에 RN으로 직접 반영
- 소모임 공지 작성/수정 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenGroupNotices`의 close topbar, 삭제/등록 action, 공개 안내, 제목/내용 입력 section, 삭제 confirm을 `/group/notices` route에 RN으로 직접 반영
- 소모임 멤버 관리 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenGroupMembers`의 flat row list, 강퇴 pill, 이관 경고/선택 row, 하단 이관 action, confirm/toast variant를 `/group/members` route에 RN으로 직접 반영
- 동행 탭 구조 반영 — Downloads `ScreenGroupList`/`ScreenServiceList` 기준으로 `/group`을 `동행` 루트로 두고 내부 `소모임/봉사` segment와 봉사 전용 card list를 추가
- 동행 API 계약 게이트 추가 — `npm run test:api:contract:group`으로 목록·상세·내 목록·멤버/공지·참여/탈퇴·생성/수정/상태/관리 endpoint와 화면 필수 계약을 자동 검증
- 동행 조회 데이터 경계 추가 — 목록·봉사·내 목록·상세·멤버 fixture를 화면에서 `mockGroupDataSource`로 이동하고 `useGroupOverview`/`useGroupDetail`/`useGroupMembers` query로 렌더링하며 미사용 중복 mock 목록 제거

## 주요 파일 (도메인 파일 지도)

| 경로                             | 역할                               |
| -------------------------------- | ---------------------------------- |
| `app/(tabs)/group/index.tsx`     | 동행 탭 루트, 소모임/봉사 segment  |
| `app/(tabs)/group/[id].tsx`      | 소모임 상세, 참여/탈퇴, 공지, 멤버 |
| `app/(tabs)/group/notices.tsx`   | 소모임 공지 작성/수정              |
| `app/(tabs)/group/members.tsx`   | 소모임 멤버 관리와 소모임장 이관   |
| `app/modal/group-new.tsx`        | 소모임 개설 모달                   |
| `src/mocks/groups.ts`            | 소모임 mock 데이터                 |
| `src/services/groupService.ts`   | 교체 가능한 동행 조회 data source 경계 |
| `src/hooks/useGroups.ts`         | 동행 목록·상세·멤버 TanStack Query hook |
| `src/constants/domainOptions.ts` | 소모임 카테고리/상태 필터 옵션     |
| `src/types/group.ts`             | 소모임 타입                        |
| `scripts/check-group-api-contract.mjs` | 동행 Swagger endpoint·화면/관리 계약 검사 |

## 데이터 타입

`Group`은 `coverImage?: string`, `leader`, `members`, `maxMembers`, `schedule`, `status`, `isJoined`, `isFavorite`, `notices`를 포함합니다. 화면 조회 모델 `GroupOverview`/`GroupDetail`/`GroupMemberDetail`은 목록·봉사·권한·멤버·공지 표시값을 포함하며 API DTO mapper의 출력 경계입니다. 카테고리는 성경공부·예배/기도모임/봉사/취미·문화/운동·건강/목장/선교/카풀/기타를 사용합니다.

## 결정 사항 (최신 위)

- (2026-07-11) **동행 핵심 흐름은 오류 코드가 문서화되어야 HTTP로 전환한다** — 상세·생성·수정·삭제·상태·참여·탈퇴·강퇴·공지 CUD의 4xx/5xx code가 Swagger에 있어야 권한/정원/상태 오류 문구를 확정할 수 있습니다. 현재 오류 문서 누락 11건을 포함한 전체 누락은 46건입니다.
- (2026-07-11) **동행 request 계약은 PLAN의 일정·장소와 화면 제한을 함께 검증한다** — 목록·상세·생성·수정에서 일정과 장소를 요구하고 제목 20자, 내용 200자, 정원 2~100명, 공지 30/500자 제약을 확인합니다. 현재 Swagger와 PLAN 사이의 일정·장소 충돌을 포함한 전체 누락은 35건입니다.
- (2026-07-11) **동행 조회 화면은 계약 확정 전에도 mock data source를 사용한다** — HTTP DTO/enum/권한 mapper 활성화는 기존 24건 계약 gate 뒤로 유지하되, 목록·상세·멤버 화면은 `useGroup* → groupService → mockGroupDataSource`를 소비합니다. 실제 목록·내 목록·멤버 응답은 같은 data source 인터페이스로 교체합니다.
- (2026-07-10) **동행 디자인 variant와 실제 탐색 상태를 분리한다** — 캡처용 권한·오류·confirm/toast 상태는 development 전용 `designVariant`, 실제 소모임/봉사 segment는 `section` query를 사용합니다. 서버 권한·모집 상태가 연결되면 domain model이 화면 분기를 소유합니다.
- (2026-07-10) **동행 mapper는 화면·관리 계약 24건 해소 후 활성화한다** — 주요 endpoint는 대부분 존재하지만 목록 `content/schedule`, category/status/keyword 필터, 응답 enum, 화면 입력 제한, 소모임장 이관 endpoint가 부족합니다. `test:api:contract:group` 통과 전에는 기존 mock 화면을 유지하고 강퇴를 이관처럼 사용하는 권한 추측을 금지합니다.
- (2026-06-27) **동행 탭은 소모임/봉사 segment를 가진다** — Downloads `ScreenGroupList`와 `ScreenServiceList`를 기준으로 `/group`은 하단 `동행` 탭 루트가 되고, 내부에서 `소모임` 목록과 `봉사` 전용 리스트를 전환합니다.
- (2026-06-27) **미사용 service/hook/card 레이어는 제거한다** — 현재 소모임 화면은 Downloads 원본을 기준으로 다시 구현할 예정이고 `GroupCard`, `groupService`, `useGroups` 호출처가 없어, 실제 API 연결 시 필요한 표면만 다시 만든다.
- (2026-06-27) **소모임 목록은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenGroupList` 구조를 `/group` route에 직접 반영합니다. 별도 service/hook은 실제 API 스키마 확정 전까지 만들지 않습니다.
- (2026-06-27) **소모임 상세는 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenGroupDetail`의 기본 leader/member/non-member 구조를 `/group/[id]` route에 직접 반영합니다. 삭제/탈퇴/신청 confirm과 toast variant는 실제 필요 시 작은 overlay로 추가합니다.
- (2026-06-27) **소모임 개설은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenGroupCreate`의 기본 create/create-filled/edit/error 구조를 `modal/group-new` route에 직접 반영합니다. 실제 저장 API는 스키마 확정 전까지 붙이지 않습니다.
- (2026-06-27) **소모임 공지는 실제 RN 화면으로 렌더링한다** — Downloads `ScreenGroupNotices` 구조를 `/group/notices` route에 직접 반영합니다. 실제 공지 저장/삭제 API는 권한 정책 확정 후 붙입니다.
- (2026-06-27) **소모임 멤버 관리는 실제 RN 화면으로 렌더링한다** — Downloads `ScreenGroupMembers` 구조를 `/group/members` route에 직접 반영합니다. 강퇴/이관 API는 운영 정책 확정 후 연결합니다.
- (2026-05-27) **소모임 목록 FAB는 ScrollView 밖 root layer에 둔다** — ZIP `ScreenGroupList`는 list body와 `+ 개설` FAB가 같은 scroll content가 아니라 `Phone` root 기준 absolute layer이므로, reference 화면도 `Screen scroll={false}`와 내부 ScrollView로 분리합니다.
- (2026-05-27) **소모임 상세 설명문은 화면 전용 text metric을 사용한다** — Android RN 폰트 폭이 ZIP web/Pretendard 렌더보다 넓어 공통 `bodyText`를 쓰면 설명문이 한 줄 더 감기고 리더 카드/CTA/멤버 rail이 아래로 밀립니다. 공통 typography를 흔들지 않고 `ScreenGroupDetail` 설명문에만 `fontSize: 13`, `lineHeight: 22`를 적용해 ZIP 줄 감김과 vertical rhythm을 맞춥니다.
- (2026-05-27) **소모임 상세 typography는 화면 전용 ZIP weight를 우선한다** — 공통 `cardTitle`/`metaText`는 다른 reference 화면에서도 쓰이므로 변경하지 않고, `ScreenGroupDetail`의 title 800, meta 600, leader name 700, member label 600, notice title 700 weight를 별도 스타일로 번역합니다.
- (2026-05-27) **소모임 상세 toast/dialog는 ZIP overlay 구조를 따른다** — `Screen` 기본 ScrollView 안에 toast를 두면 원본처럼 fixed bottom overlay로 캡처되지 않으므로, 상세 body만 내부 ScrollView로 두고 toast/dialog는 `Phone` root overlay처럼 분리합니다.
- (2026-05-27) **멤버 관리 Toast는 list ScrollView 밖 fixed layer에 둔다** — ZIP `ScreenGroupMembers`는 `phone-body` list와 `CheckToast` overlay를 분리하므로, RN reference도 `Screen scroll={false}` + 내부 ScrollView + root Toast 구조로 맞춥니다.
- (2026-05-27) **소모임장 action card는 compact inline 버튼을 사용한다** — ZIP `ScreenGroupDetail`의 leader action card는 큰 원형 icon tile이 아니라 44px 높이의 inline icon+label `ActionBtn` grid이므로 reference 화면도 같은 구조로 맞춥니다.
- (2026-05-27) **소모임 상세 CTA는 화면 전용 pill geometry를 사용한다** — 비멤버 참여 신청과 멤버 탈퇴 버튼은 ZIP의 52px full-width pill을 기준으로 하며, 공통 Button 번역 차이가 큰 곳은 화면 전용 style로 맞춥니다.
- (2026-05-26) **소모임 toast 문구는 ZIP 원본을 따른다** — `full-toast`는 `인원이 꽉 찼습니다`, `leader-leave-toast`는 `소모임장은 탈퇴할 수 없어요. 먼저 이관해주세요`를 기준으로 합니다.
- (2026-05-25) **멤버 관리 화면은 ZIP flat list 기준으로 유지한다** — 멤버 관리는 카드 묶음이 아니라 full-width row list, 오른쪽 강퇴 pill, 이관 모드 radio row, 하단 fixed action 구조를 따릅니다. 남은 confirm 계열 diff는 list 자체보다 modal overlay와 원본 캡처 프레임 차이로 분리 추적합니다.
- (2026-05-23) **소모임 상세는 cover hero 없이 정보 header를 우선한다** — ZIP 원본은 소모임 상세에서 대표 cover보다 카테고리/모집 상태/인원/설명/리더 정보를 먼저 보여주므로 reference 화면도 같은 구조를 따릅니다.
- (2026-05-23) **소모임장 이관은 별도 list mode로 검증한다** — 멤버 관리는 기본 강퇴 모드와 이관 모드를 분리하고, 이관 모드에서는 경고 배너, radio 선택, 하단 고정 이관 버튼을 표시합니다.
- (2026-05-23) **소모임 원본 상태는 `variant` 라우트로 검증** — ZIP의 공지/멤버 관리 포함 29개 화면 상태를 모두 접근 가능하게 두고, 실제 권한/API 정책은 mock-first로 유지합니다.
- (2026-05-23) **소모임 검색은 접힌 상태로 시작** — 나눔 목록과 같은 탐색 패턴을 유지하기 위해 검색 입력은 상단 아이콘으로 펼치고, 개설 액션은 floating FAB로 둡니다.
- (2026-05-23) **대표 이미지 없음은 시각 placeholder로 처리** — 실제 cover 이미지가 없는 mock/초기 데이터도 목록에서 빈 박스로 보이지 않도록 공통 `VisualCover`를 사용합니다.
- (2026-05-22) **카풀은 소모임 카테고리로 포함** — Notion MVP 정의에 따라 별도 도메인이 아니라 소모임 카테고리로 처리합니다.
- (2026-05-22) **멤버 정책은 mock-first** — 최소 2명, 정원 초과 방지, 소모임장 탈퇴 제한을 mock service에서 먼저 검증합니다.
- (2026-05-22) **공지/멤버 관리는 mock UI까지** — 운영자 권한과 실제 멤버 관리 API는 후속 Phase에서 확정합니다.

## 미결 / 추적

- Swagger 목록 설명·일정·장소·필터, 상세 일정·장소, type/category/status enum, 입력 제한, 소모임장 이관, 핵심 흐름 오류 코드 46건 확정 필요. 일정·장소를 백엔드 계약에 추가할지 최신 기획에서 제거할지도 명시적으로 결정해야 합니다. 단일 출처는 Issue #21이며 `npm run test:api:contract:group`으로 확인합니다.
- 참여 신청이 즉시 참여인지 승인 대기인지 운영 정책 확인 필요.
- 공지 작성 권한과 소모임장/관리자 권한 모델 확인 필요.
- 강제 내보내기 이의 제기/복구 플로우는 실제 API와 운영 정책 확정 후 반영.
- 소모임 상세 residual은 설명문 wrap 정렬 후 47-57 전체가 10대 초반 이하로 내려갔습니다. 남은 차이는 Android native status bar/time, RN font metrics, Avatar gradient 미적용, Toast/check icon glyph 차이로 분리 추적합니다. 최신 주요 residual은 `leader-closed mean=10.81`, `leader mean=10.79`, `leader-leave-toast mean=10.71`, `full-toast mean=10.38`, `non-member mean=10.18`이며 전체 비교 리포트는 `/private/tmp/ylmc-golden-screens/2026-05-23/compare/visual-compare-report.tsv`입니다.

## 의존성

- common 도메인의 UI, `queryKeys`, `queryClient`, 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
