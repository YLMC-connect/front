# prayer (중보기도)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P5/P7

## 한 줄 요약

성도가 요일별 기도방에 참여 신청하고, 기도를 완료 체크하고, 기도제목을 등록·응답 요청합니다.

## 현재 동작

- `/prayer` 는 하단 `기도` 탭 루트. 상세·신청·내 기도제목은 기도 탭 Stack 에 push 되고 뒤로가면 `/prayer` 로 온다.
- 루트 overview 는 `GET /api/prayer/cohorts/my`·`topics/my`·`applications/my` 를 `Promise.allSettled` 로 함께 받아, 일부가 실패해도 나머지로 그린다 (#185). 이번 주 기도 진행 카드, 내 기도방, 내 기도제목을 보인다.
- 승인 대기 신청은 `pending` 기도방 카드로 붙는다. 상세로 가지 않고, 누르면 확인 후 `DELETE /api/prayer/applications/{id}` 로 취소한다.
- 우측 하단 플로팅 메뉴에서 `중보기도 신청`(`/prayer/apply`)과 `기도제목 작성`(`/modal/prayer-new`)으로 간다.
- 신청 화면은 요일·시간을 골라 `POST /api/prayer/applications`(`yoil`·`timeSlot`).
- 기도방 상세(`/prayer/[id]`)는 `GET /api/prayer/cohorts/{id}/status` 와 `GET /api/prayer/topics/board` 로 기도·응답·현황 탭을 그린다. 완료 버튼은 `POST`/`DELETE /api/prayer/cohorts/{id}/completion`. 당겨서 새로고침으로 둘 다 다시 받는다.
- 기도제목 등록은 `GET /api/prayer/categories` 로 카테고리를 받고 `POST /api/prayer/topics`(`categoryId`·`title`·`content`).
- 내 기도제목(`/prayer/request`)은 `GET /api/prayer/topics/my` 를 상태 배지 목록으로 보이고, 응답완료 요청은 `POST /api/prayer/topics/{id}/answer-request` 에 사용자가 쓴 `answerContent`(필수)를 보낸다.
- 마이페이지 `중보기도 활동` 은 이 도메인의 `GET /api/prayer/me/history` 를 쓴다.

## 데이터 타입

- 화면 모델은 `PrayerOverview`(`rooms`·`requests`), `PrayerOverviewRoom`, `PrayerRequestSummary`. DTO(`src/types/prayerApi.ts`)는 Notion 에 적힌 필드만 가지며, 화면이 쓰지 않는 nullable 필드는 `null` 을 허용한다. `PrayerApplicationDto` 는 값 타입이 페이지에 없어 `unknown` 으로 읽는다.
- 기도방 카드: `myRole` 이 `LEADER`/`MEMBER` 이고 `yoil` 1~5, `timeSlot` `AM`/`PM` 인 기수만 만든다. 일·토(0·6)는 `PrayerWeekday` 에 없어 목록에서 빠진다. `cohortName`→제목, `weekCompletedCount`→완료 인원, `completionRate`→참여율.
- 승인 대기 카드: 신청 `status === "PENDING"` 이고 이미 참여 중인 방이 아닐 때. `cohortId` 가 없으면 id 는 `application-{신청 id}`.
- 기도제목 상태: `REVIEW`/`OPEN`/`REJECTED`/`ANSWER_REQUESTED`/`ANSWERED`/`HIDDEN` → `reviewing`/`published`/`rejected`/`answerRequested`/`answered`/`hidden`. 설명은 `content`.
- 상세 요일·시간대는 현황 응답 `yoil`(0=일 … 6=토)·`timeSlot` 으로 표시하고 값이 없으면 비운다 (#307). 날짜는 `createdAt`(응답은 `answeredAt` 우선)을 "M월 D일"로, 없으면 생략한다.

## 결정 사항 (지금 유효한 것만)

- **서버가 준 값만 그린다** — 완료 인원·참여율은 서버 계약상 이번 주 기준이라 문구를 `이번 주` 로 쓴다(오늘 기준 필드 없음). 이번 주 진행 카드의 합산 비율은 새 필드 없이 참여 중 방의 `completedCount/memberCount` 합으로 계산한다.
- **상세 상단 배지는 `참여중` 과 `긴급 N건` 둘만** — 인원·완료 수는 진행 바 글자에 있다. 불러오기 전·실패 시 제목은 `기도방`, 응답 본문이 없으면 응답 상자를 그리지 않는다.
- **완료 가능 여부는 서버가 정한다** — 현황 `canComplete === false` 일 때만 완료 버튼을 막고 안내를 보인다(null 은 막지 않는다). 멤버 완료(`PRY010`) 제한도 클라이언트 역할로 거르지 않고 서버 오류를 그대로 보인다.
- **익명 작성 선택지는 두지 않는다** — 등록 API 에 익명 필드가 없다 (#304). 카테고리는 불러온 첫 항목이 기본 선택되고, 목록이 없으면 등록하지 않는다.
- **이동하는 카드에만 화살표** — 내 기도방 카드는 상세로 가므로 `기도방 보기 >` 를 두고, 내 기도제목 개별 카드는 상세가 없어 정적이다. 목록 이동은 섹션의 `전체보기` 만.
- **호출 범위** — 사용자 `/api/prayer/*` 만 호출한다. `/api/admin/prayer` 와 `GET /api/mypage/activities/prayers` 는 쓰지 않는다. 기도방 상세 `GET /api/prayer/cohorts/{id}` 는 성공 본문 필드가 Notion 에 없어 화면에 쓰지 않는다 (#135).

## 미결

- 기도방 상세의 기도제목은 기수별이 아닌 전체 게시판(`topics/board`)이다. 기수별 조회 API 대기 (#200).
- 게시판 응답의 `createdAt` 이 null 로 와 작성 시각을 못 보인다 (#219).
- 익명 작성은 등록 API 필드 대기 (#304).
- 일·토 기도방, 비성도 기도 요청, 참여 승인 정책, 푸시 알림·기도 통계는 후속 Phase.

## 코드 위치

- 화면: `app/(tabs)/prayer/`, `app/modal/prayer-new.tsx`
- 목록 렌더러: `src/components/faith/` (삶공부와 공유)
- 상세 부품: `src/components/prayer/detail/`
- 데이터: `src/services/prayer*`, `src/hooks/usePrayers.ts`, `src/types/prayer*`
- 계약 검사: `scripts/api-contract/prayer.mjs` (`npm run test:api:contract -- prayer`, `validate` 에는 없음)

## 의존성 · 관련 ADR

- common 의 queryClient · queryKeys · UI 컴포넌트, auth 의 현재 사용자(신청 화면 이름·연락처).
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
