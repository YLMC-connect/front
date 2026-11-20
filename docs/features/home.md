# home (홈)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P5/P7

## 한 줄 요약

로그인 성도가 앱에 들어왔을 때 프로필·이번 주일 말씀·오늘의 기도·새벽기도 말씀요약으로 바로 이어지는 진입 허브입니다.

## 현재 동작

- 홈 `app/(tabs)/index.tsx`: sticky 헤더 → 프로필 행(아바타 + 이름, 오른쪽 `내 정보 >` 는 `/mypage`) → 이번 주일 말씀 → 오늘의 기도 → 새벽기도 말씀요약 카드.
- 이번 주일 말씀은 `GET /api/sermons?page=1&size=1` 첫 항목. 유튜브 썸네일 카드를 누르면 자동 재생 없이 `Linking.openURL` 로 외부 유튜브를 연다.
- 새벽기도 말씀요약은 `GET /api/daily-qt?page=1&size=1` 첫 항목. 목록에 본문이 없으면 `GET /api/daily-qt/{id}` 로 보충한다. 누르면 `/dawn?id=<id>`.
- 오늘의 기도는 `GET /api/prayer/weekday-topics?weekday=`(인증 없음, 1=월 … 7=일)로 기기 날짜 요일의 요일별 기도를 받아 노출 순서대로 모두 보인다. 항목마다 제목·요약, 기도 내용(`content`)이 있으면 눌러서 펼친다.
- 세 API 는 `Promise.allSettled` 로 함께 부르고, 하나가 실패하거나 비면 그 카드만 숨긴다. 설교·큐티가 둘 다 실패해야 오류 화면.
- 말씀요약 상세 `app/dawn.tsx`(루트 Stack): 날짜 줄 양쪽 이전·다음 버튼은 최근 목록(`GET /api/daily-qt` 30개)에서 날짜순 앞·뒤 글을 찾고, 없으면 비활성.
- `npm run test:api:contract -- home` 이 설교·큐티 OpenAPI 계약을 검사한다.

## 데이터 타입

- `HomeOverview` = `{ dailyPrayer: HomeDailyPrayer | null, dawnPrayer: HomeDawnPrayer | null, sundaySermon: HomeSundaySermon | null }`.
- `HomeDailyPrayer`: `dateLabel`·`weekdayLabel` 과 `items[]`(`id`·`title`·`summary`·`content`, 비면 빈 글자). 제목이 빈 항목은 뺀다.
- `HomeSundaySermon`: 제목은 끝에 붙은 성경 약어를 정리(`cleanSermonTitle`), 요약은 `bibleText · preacher`, 썸네일은 `youtubeUrl` 에서 뽑은 id 의 `maxresdefault.jpg`.
- `HomeDawnPrayer`: 제목은 `bibleText`(없으면 `title`), 본문은 HTML 을 텍스트로 정제(`stripHtmlToText`), 날짜는 `qtDate`, `href` 는 `/dawn?id=`.
- DTO 는 `src/types/homeApi.ts`(`SermonResponse`, `DailyQtResponse`, `PrayerWeekdayTopicResponse`). 프로필은 overview 에 넣지 않고 `authStore.currentUser` 를 쓴다.

## 결정 사항 (지금 유효한 것만)

- **홈 범위는 프로필 진입 + 주일 말씀 + 오늘 기도 + 새벽기도 요약** — 내 활동 요약·나눔/동행 미리보기는 넣지 않는다. (#109)
- **실패 시 목업으로 덮지 않는다** — 설교·큐티가 없거나 실패하면 `null` 로 두고 카드를 숨긴다. 홈 쿼리는 `staleTime: 0`, 예전 캐시가 섞이지 않게 `queryKeys.home` 에 버전 접미사를 둔다.
- **화면 표기는 "새벽기도 말씀요약"** — API 이름은 `daily-qt` 이지만 게시글 실제 내용이 새벽예배 말씀요약이라 화면 문구는 이 이름을 쓴다. (#198)
- **말씀요약은 게시글 양식에 기대지 않는다** — 평일·주말 글의 HTML 구조가 달라 특정 양식 정규식으로 쪼개지 않고, 확정 필드(`qtDate`, `bibleText`)와 정제한 단락만 쓴다.
- **말씀요약 상세는 루트 Stack(`app/dawn.tsx`)** — 기도 탭 아래에 두면 홈에서 열 때 활성 탭이 기도로 바뀌고 뒤로가기가 `/prayer` 로 가서, 마이페이지처럼 루트로 올렸다. 뒤로가기는 홈으로 돌아온다.
- **오늘의 기도는 관리자가 등록한 요일별 기도만** — 오늘 요일 항목이 없거나 불러오지 못하면 카드를 숨긴다(고정 문구로 채우지 않는다). 다른 화면으로 이동하지 않는다.

## 미결

- 오늘의 기도와 참여 중 요일 기도방 id 를 맞춰 `/prayer/[id]` 로 바로 가는 딥링크 — 매칭 기준 없음
- 새벽기도 출석 체크 API 없음
- 홈 공지 1줄 (후순위)

## 코드 위치

- 화면: `app/(tabs)/index.tsx`, `app/dawn.tsx`
- 데이터: `src/services/home*`, `src/hooks/useHome.ts`, `src/types/home*`
- 계약 검사: `scripts/api-contract/home.mjs`

## 의존성 · 관련 ADR

- auth 의 현재 사용자(`authStore`) — 프로필 행
- common 의 `queryKeys` · `queryClient` · UI 컴포넌트(`Avatar`, `StickyHeaderScreen`)
- mypage 의 `/mypage` 진입
