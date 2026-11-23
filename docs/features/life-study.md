# life-study (삶공부)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P5/P7

## 한 줄 요약

성도가 삶공부 과정과 지금 신청 가능한 기수를 확인하고 수강 신청하며, 자신의 수료 기록을 확인합니다.

## 현재 동작

- 하단 `삶공부` 탭 루트(`/life-study`)는 세그먼트 3개(신청 가능 · 전체 과정 · 내 수강)로 나뉜다. 신청 가능·전체 과정 위에는 필수 과정 진행 카드(수료 수, 막대, 다음 추천, `수강 내역 ›` 링크)가 있다. 탭을 다시 누르면 신청 가능으로 돌아간다. 당겨서 새로고침을 지원한다.
- 과정 목록은 썸네일 없이 구분선으로 나눈 줄이다: 구분(필수/선택 과정) · 이름 · `N주 · 강사` · 신청 가능은 `신청 MM.DD까지`와 `신청/정원명`, 전체 과정은 수료한 과정을 흐리게 하고 "수료했어요".
- overview 는 `GET /api/life-study`(전체 과정), `GET /api/life-study/cohorts`(신청 가능 기수), `GET /api/life-study/completions`(내 수료)를 함께 불러 합친다. 하나가 실패해도 나머지로 화면을 만든다.
- 내 수강은 마이페이지 수강 내역 `GET /api/mypage/activities/life-studies` 를 신청 중 · 수강 중 · 수료로 나눠 보여 준다. 마이페이지 `/mypage/life-study-history` 와 같은 캐시를 쓴다.
- 과정 줄을 누르면 `/life-study/[id]` 상세로 push 된다. 신청 가능 줄은 `?cohortId=` 를 함께 넘긴다. 상세·신청 화면은 삶공부 탭 Stack 에 쌓이고 뒤로가기로 목록에 돌아간다.
- 상세는 구분선으로 나눈 정보 줄(강사 · 일정 · 장소 · 정원 · 교재)과 안내 상자(신청 기간 · 대상 · 조건), `N주차` 커리큘럼을 그린다. 일정은 개강일(`lifeStudyDate`)과 수업 요일(`yoil`, 0=일 ~ 6=토)로 만든다. 기수 상세 `GET /api/life-study/cohorts/{id}` 로 신청 여부(`applied`)를, 과정 상세 `GET /api/life-study/{id}` 의 `lessons[]` 로 커리큘럼을 그린다. 과정이 없거나 커리큘럼이 비면 공통 `<Empty />` 를 보여준다.
- 모집 중인 기수가 있을 때만 하단 `[수강 신청하기]` 가 보이고, 그 위에 `MM.DD 마감 · N자리 남았어요`(신청 종료일 `endDate`, 정원 − 신청 인원)를 적는다. 이미 신청했으면 비활성 상태로 "이미 수강 신청한 과정이에요" 를 보여준다.
- 수강 신청(`/life-study/apply`)은 `POST /api/life-study/cohorts/{cohortId}/attend` 에 빈 바디 `{}` 를 보낸다. 서버에서 `userYear`·`userFaithYears`·`userPart` 가 선택 항목이 되어 앱은 이 입력을 받지 않는다. 화면은 안내 상자 · 과정 요약 · 신청자(회원 정보, 바꾸려면 프로필 수정) · 수강 약속 동의 카드이며 미동의로 시작한다. 신청에 성공하면 상세로 돌아가 "수강 신청했어요" 토스트를 보인다.
- 내 수료 기록은 마이페이지 `/mypage/life-study-history`(mypage 도메인)에서 본다. 비어 있으면 `과정 보기` 로 삶공부 탭에 간다.

## 데이터 타입

- 화면 모델은 `LifeStudyOverview { path, openCourses, courses }`. 과정 항목은 `LifeStudyOverviewCourse`(`id`, `cohortId?`, `kind: required | optional`, `weekCount`, `status?` 등).
- 과정 상태 매핑: 전체 과정(`courses`)은 내 수료 기록에 그 과정 ID 의 `completedAt` 이 있으면 `completed`, 없으면 `pending`(상세 배지 "미수료")이다. `recommended`("추천")는 신청 가능 기수(`openCourses`)에만 붙는다. 신청 가능 카드는 상태 대신 "신청 기간" 배지를 보인다.
- 학습경로 `path` 는 `required: true` 과정 수와 그중 수료한 수로 계산하고, 다음 추천은 아직 수료하지 않은 첫 필수 과정이다. 전체 과정 응답이 없으면 비운다.
- 기수 → 과정 매핑: 신청 가능 과정의 `id` 는 기수의 `lifeStudyId`, `cohortId` 는 기수 `id`. 정원은 `userNum`, 신청 인원은 `appliedCount`, 신청 기간은 `startDate ~ endDate`(마감일 `applicationEndDate` = `endDate`), 개강일은 `lifeStudyDate`, 수업 요일은 `yoil`.
- `totalClassCount` 는 휴강을 뺀 정규 수업 횟수라 주 수(`weekCount`)로 쓰지 않는다. `attendCount` 는 출석 횟수라 현재 회차·수강 회차로 쓰지 않는다.
- API DTO 는 `src/types/lifeStudyApi.ts`, 화면 모델은 `src/types/lifeStudy.ts`.

## 결정 사항 (지금 유효한 것만)

- **신청은 '지금 신청 가능한 과정'에서만 시작한다** — 과정 구분 없이 신청 화면으로 가던 플로팅 버튼은 없앴다. 요청한 기수가 신청 가능 목록에 없으면 다른 기수로 대신 신청하지 않고 "신청할 수 없는 과정이에요" 를 보인다.
- **신청 폼에 동기 입력란이 없다** — API 에 신청 동기 필드가 없어서다.
- **커리큘럼은 과정 단위 API 로 그린다** — 모집 중인 기수가 없어도 보이도록 `GET /api/life-study/{id}` 의 `lessons[]` 를 쓴다. 주차별 날짜·완료 여부는 API 에 없어 그리지 않는다. (#199)
- **API 에 없는 값은 지어내지 않는다** — 수업일 `classes[]` 원소, 출석부 하위 필드, 수료증 발급 여부는 계약에 없어 화면·타입에 두지 않는다.
- **출석·수료 관리 API 는 연결하지 않는다** — 출석부·수료 명단 조회·수정 API(`team_leader`, `MANAGER_LIFESTUDY`, `ADMIN`)는 쓰는 화면이 없어 프런트 코드에 두지 않는다. 연결할 때 권한 오류(`LST013`·`LST017` 등)는 서버가 판단한 그대로 전달하고 클라이언트 역할로 미리 거르지 않는다.
- **모바일은 사용자용 화면만 둔다** — `/api/admin` 은 호출하지 않는다. (#128)
- **상세는 서버 데이터만** — route id 가 없거나 맞는 과정이 없으면 "과정 정보를 찾을 수 없어요" 빈 상태를 그린다. 고정 시안 문구는 두지 않는다.
- **API 계약 검사는 별도 명령** — `npm run test:api:contract -- life-study` 로 돌리며 `npm run validate` 에는 넣지 않는다.

- **삶공부에는 사진이 없다** — 서버에 이미지 필드가 없어 목록·상세·신청 모두 썸네일 자리를 두지 않는다(동행과 같음). 캔버스의 사진 hero·썸네일은 그리지 않는다.
- **목록에 승인 대기·수강 중 표시를 두지 않는다** — 기수 목록 응답에 내 신청 상태가 없다. 내 상태는 `내 수강` 세그먼트에서 본다.
- **수업 시간은 그리지 않는다** — API 에 시간 필드가 없어 일정은 개강일·요일·주 수만 쓴다.

## 미결

- (없음) — 열린 `life-study` Issue 없음. 수업일 원소·출석부 하위 필드·신청 승인·수료증은 사용자 계약에 없어 서버 계약이 생기면 다시 본다.

## 코드 위치

- 화면: `app/(tabs)/life-study/`
- 목록: `src/components/life-study/LifeStudyListScreen.tsx`, 표시 도우미: `lifeStudyFormat.ts`, 상세 부품: `src/components/life-study/detail/`
- 데이터: `src/services/lifeStudy*`, `src/hooks/useLifeStudyCourses.ts`, `src/types/lifeStudy*`
- 계약 검사: `scripts/api-contract/life-study.mjs`

## 의존성 · 관련 ADR

- common 의 UI 컴포넌트, `queryKeys`, `queryClient`, `apiClient`
- auth 의 역할 판별, mypage 의 수강 내역 화면
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
