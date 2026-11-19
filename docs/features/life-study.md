# life-study (삶공부)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P5/P7

## 한 줄 요약

성도가 삶공부 과정과 지금 신청 가능한 기수를 확인하고 수강 신청하며, 자신의 수료 기록을 확인합니다.

## 현재 동작

- 하단 `삶공부` 탭 루트(`/life-study`)는 학습경로(필수 과정 진행), 지금 신청 가능한 과정, 전체 과정을 한 스크롤로 보여준다. 당겨서 새로고침을 지원한다.
- overview 는 `GET /api/life-study`(전체 과정), `GET /api/life-study/cohorts`(신청 가능 기수), `GET /api/life-study/completions`(내 수료)를 함께 불러 합친다. 하나가 실패해도 나머지로 화면을 만든다.
- 과정 카드를 누르면 `/life-study/[id]` 상세로 push 된다. 신청 가능 과정 카드는 `?cohortId=` 를 함께 넘긴다. 상세·신청 화면은 삶공부 탭 Stack 에 쌓이고 뒤로가기로 목록에 돌아간다.
- 상세는 기수 상세 `GET /api/life-study/cohorts/{id}` 로 신청 여부(`applied`)를, 과정 상세 `GET /api/life-study/{id}` 의 `lessons[]` 로 커리큘럼을 그린다. 과정이 없거나 커리큘럼이 비면 공통 `<Empty />` 를 보여준다.
- 모집 중인 기수가 있을 때만 하단 `[수강 신청하기]` 가 보이고, 이미 신청했으면 비활성 상태로 "이미 수강 신청한 과정이에요" 를 보여준다.
- 수강 신청(`/life-study/apply`)은 `POST /api/life-study/cohorts/{cohortId}/attend` 로 `userYear`·`userFaithYears`·`userPart` 를 보낸다. 생년·신앙 연차·수강 약속은 빈 값/미동의로 시작해 사용자가 직접 고른다.
- 내 수료 기록은 마이페이지 `/mypage/life-study-history`(mypage 도메인)에서 본다. `/life-study/history` 는 `GET /api/life-study/completions` 의 과정 이름·`completedAt` 만 그리는 화면으로 남아 있으나 진입 링크가 없다.

## 데이터 타입

- 화면 모델은 `LifeStudyOverview { path, openCourses, courses }`. 과정 항목은 `LifeStudyOverviewCourse`(`id`, `cohortId?`, `kind: required | optional`, `weekCount`, `status?` 등).
- 과정 상태 매핑: 전체 과정(`courses`)은 내 수료 기록에 그 과정 ID 의 `completedAt` 이 있으면 `completed`, 없으면 `pending`(화면 "대기")이다. `recommended`("추천")는 신청 가능 기수(`openCourses`)에만 붙는다. 신청 가능 카드는 상태 대신 "신청 기간" 배지를 보인다.
- 학습경로 `path` 는 `required: true` 과정 수와 그중 수료한 수로 계산하고, 다음 추천은 아직 수료하지 않은 첫 필수 과정이다. 전체 과정 응답이 없으면 비운다.
- 기수 → 과정 매핑: 신청 가능 과정의 `id` 는 기수의 `lifeStudyId`, `cohortId` 는 기수 `id`. 정원은 `userNum`, 신청 인원은 `appliedCount`, 신청 기간은 `startDate ~ endDate`.
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

## 미결

- (없음) — 열린 `life-study` Issue 없음. 수업일 원소·출석부 하위 필드·신청 승인·수료증은 사용자 계약에 없어 서버 계약이 생기면 다시 본다.

## 코드 위치

- 화면: `app/(tabs)/life-study/`
- 목록 렌더러: `src/components/faith/` (기도와 공유), 상세 부품: `src/components/life-study/detail/`
- 데이터: `src/services/lifeStudy*`, `src/hooks/useLifeStudyCourses.ts`, `src/types/lifeStudy*`
- 계약 검사: `scripts/api-contract/life-study.mjs`

## 의존성 · 관련 ADR

- common 의 UI 컴포넌트, `queryKeys`, `queryClient`, `apiClient`
- auth 의 역할 판별, mypage 의 수강 내역 화면
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
