# group (소모임)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P1/P3/P7

## 한 줄 요약

성도가 소모임·봉사를 탐색하고 참여하거나 새 모임을 개설할 수 있게 합니다.

## 현재 동작

- `/group` 은 하단 `동행` 탭 루트. 세그먼트 `소모임` | `봉사` | `내 모임`, 카테고리 필터·검색·개설 FAB(`소모임 개설` / 봉사 탭에서는 `봉사 개설`).
- 소모임 목록은 `GET /api/communion?type=SMALL_GROUP&size=&lastId=` 커서 무한 스크롤. 첫 페이지에서만 `type=VOLUNTEER` 목록과 `/api/communion/my?type=VOLUNTEER` 를 함께 읽고, `내 모임` 은 `/api/communion/my?type=SMALL_GROUP` 전체 결과를 쓴다. 목록·상세는 당겨서 새로고침.
- 상세 `/group/[id]` 는 `GET /api/communion/{id}` + `/members` + `/notices`. 참여 `POST /join`, 탈퇴 `DELETE /leave`. 상세·공지·멤버는 동행 탭 Stack 에 쌓여 뒤로가기 시 같은 필터·목록으로 돌아온다.
- 개설·수정 `modal/group-new`(`?kind=service` 면 `type=VOLUNTEER`): `POST /api/communion`(JSON), `PUT /api/communion/{id}`. 개설하면 창을 닫고 목록 위에 상세를 쌓고, 수정은 창만 닫는다.
- 소모임장 관리: 모집 상태 `PUT /{id}/status`, 삭제 `DELETE /{id}`, 내보내기 `DELETE /{id}/kick/{targetUserId}`, 이관 `PUT /{id}/leader`, 공지 CUD `/{id}/notices[/{noticeId}]`.
- 멤버 화면 `/group/members` 는 상세 `전체보기` 로 일반 멤버도 들어온다. `내보내기`·이관은 소모임장에게만 보인다.
- `npm run test:api:contract:group` 이 동행 Swagger endpoint 와 화면 필수 계약을 검사한다.

## 데이터 타입

- 화면 모델: `GroupOverview`(groups · services · myGroups), `GroupDetail`, `GroupMemberDetail`, `GroupDetailNotice`(수정 폼용 전체 `content`). 쓰기 입력은 `GroupInput` / `GroupUpdateInput` / `GroupStatusUpdateInput` / `GroupKickMemberInput` / `GroupTransferLeaderInput`(`newLeaderUserId`) / `GroupNotice*Input`.
- DTO: `src/types/groupApi.ts` 의 `Communion*Dto`.
- 매핑: 상태 `RECRUITING`→open(모집중), `COMPLETED`→closed(모집완료). 상태 변경도 closed 를 `COMPLETED` 로 보낸다(서버 명세에 `CLOSED` 는 없다). `PENDING`·`CANCELED`·`REJECTED` 는 매핑하지 않는다. 카테고리 `WORSHIP_STUDY`/`PRAYER`/`HOBBY_CULTURE`/`SPORTS_HEALTH`/`OTHER` ↔ bible/pray/hobby/sport/etc.
- 목록 응답에 본문·일정이 없어 카드 `description`·`schedule` 은 빈 문자열. 봉사 항목은 `linkedGroupId`(자기 id)로 상세에 연결.
- `isLeader`/`isJoined` 는 `leaderId`·멤버 `userId` 를 `authStore` 현재 사용자와 비교해 만든다. 상세 멤버는 소모임장을 맨 앞에 둔다.

## 결정 사항 (지금 유효한 것만)

- **서버에 있는 값만 매핑한다** — 서버에 없는 화면 카테고리(목장·선교·카풀·봉사)는 OTHER 로 추측해 보내지 않고 개설·수정을 거절한다. 폼은 서버 코드가 있는 5개만 보인다. (#313)
- **서버가 저장하지 않는 입력은 폼에 두지 않는다** — 모임 일정·장소는 communion 요청·응답에 없어 개설/수정 폼에서 뺐다. 서버 필드가 생기면 복원한다. (#301)
- **대표 사진은 색 바탕으로 채운다** — communion API 에 이미지 필드가 없어 상세 대표 사진 자리는 `thumb` 색 + 아이콘, 개설 폼에 사진 입력이 없다. 공지 목록 화면이 없어 공지 `전체보기` 는 두지 않는다.
- **참여는 즉시 가입이다** — `POST /join` 으로 바로 멤버가 된다. 승인 대기 플로우는 서버가 상태를 주기 전까지 만들지 않는다. (#317)
- **소모임장은 탈퇴할 수 없다** — 서비스에서 막고 "먼저 이관해주세요" 를 안내한다. 정원이 찼거나 모집완료면 참여를 막는다.
- **이관은 `PUT /api/communion/{id}/leader`** — 본문은 `newLeaderUserId` 하나. 기존 방장은 일반 멤버로 남고 상세·멤버·목록 쿼리를 다시 읽는다. `COM003`/`COM011`/`COM012` 는 토스트 문구로 보인다. (#197)
- **입력 제한은 서비스에서 검증한다** — 소모임명 2~20자, 설명 5~200자, 정원 2~100명, 공지 제목 30자·내용 500자.
- **카테고리 필터는 전체 목록에만 적용** — `내 모임` 은 가입한 모임 전체를 유지한다. 필터·세그먼트는 route query 로 보존해 상세에서 돌아와도 유지된다.
- **수정 폼은 서버 상세로 채운다** — 예시 값은 `id` 없는 디자인 미리보기에서만 쓴다. 개발 빌드의 `designVariant` 파라미터는 캡처용 상태이며 실제 폼 상태와 섞지 않는다.

## 미결

- 소모임 삭제 시 다른 멤버 참여 기록이 남아 있으면 서버 400 (#318)
- 가입 신청·대기·소모임장 승인 절차 없음 (#317)
- 카테고리 목록 하드코딩, 서버 목록 필터 없음 (#313)
- 일정·장소 서버 필드 추가 후 폼 복원 (#301)

## 코드 위치

- 화면: `app/(tabs)/group/`, `app/modal/group-new.tsx`
- 데이터: `src/services/group*`, `src/hooks/useGroups.ts`, `src/types/group*`
- 오류 문구: `src/constants/apiErrorMessages.ts` (`COM*`)
- 계약 검사: `scripts/check-group-api-contract.mjs`

## 의존성 · 관련 ADR

- common 의 UI 컴포넌트, `queryKeys`, `queryClient`
- auth 의 현재 사용자(`authStore`) — 소모임장·가입 여부 판정
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
