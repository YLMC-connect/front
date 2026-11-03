# home (홈)

> 마지막 갱신: 2026-11-03 (설교·매일 큐티 신규 API 수직 연동 및 런타임 목 제거) | 담당 Phase: P5/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

로그인 성도가 앱에 들어왔을 때 프로필·오늘 기도·새벽기도·이번 주일 말씀으로 바로 이어지는 진입 허브입니다.

---

## ✅ 완료

- 홈 런타임 목데이터(`src/mocks/home.ts`) 제거 및 HTTP 단일화 — 설교/큐티 실패 시 목업으로 덮지 않고 `null`을 반환해 화면에서 해당 카드를 숨기며, 요일별 오늘의 기도 정적 문구는 `homeMapper`에서 기기 날짜 기반으로 직접 생성.
- 설교 및 매일 큐티 신규 API 연동 — 백엔드에 새로 추가된 설교 목록(`GET /api/sermons`)과 매일 큐티 목록(`GET /api/daily-qt`) 및 상세(`GET /api/daily-qt/{id}`) API를 `httpHomeDataSource`, `homeMapper`, `homeService`를 통해 홈 화면(이번 주일 말씀 유튜브 썸네일 카드, 새벽기도 말씀요약 카드) 및 새벽기도 상세 화면(`/prayer/dawn`)에 수직 연동.
- 홈 카드 레이아웃 — sticky 헤더 + 프로필 행(`내 정보 >`), 오늘 요일 기도 카드, 새벽기도 요약 카드, 이번 주일 말씀(유튜브 썸네일) 카드.
- 새벽기도 말씀요약 화면 — `/prayer/dawn` 본문·요약·적용 읽기 상세

## 주요 파일

| 경로                                  | 역할                                            |
| ------------------------------------- | ----------------------------------------------- |
| `app/(tabs)/index.tsx`                | 홈 루트 (카드형 UI)                             |
| `app/(tabs)/prayer/dawn.tsx`          | 말씀요약 상세                                   |
| `src/types/home.ts`                   | HomeOverview / Daily / Dawn / SundaySermon 타입 |
| `src/types/homeApi.ts`                | 설교 및 매일 큐티 DTO 타입                      |
| `src/services/homeHttpDataSource.ts`  | 설교/큐티 HTTP data source                      |
| `src/services/homeMapper.ts`          | DTO → 홈 뷰 모델 매퍼 및 HTML/유튜브 헬퍼       |
| `src/services/homeService.ts`         | fetch overview/dawn                             |
| `src/hooks/useHome.ts`                | TanStack Query hooks                            |
| `scripts/check-home-api-contract.mjs` | 홈 큐레이션 OpenAPI 계약 검증                   |

## 데이터 타입

`HomeOverview` = `{ dailyPrayer, dawnPrayer: HomeDawnPrayer | null, sundaySermon: HomeSundaySermon | null }` (타입에 `todos`, `progressSteps`가 공존하나 홈 화면은 `dailyPrayer`, `dawnPrayer`, `sundaySermon`을 사용).  
`HomeDailyPrayer`는 날짜·요일 라벨·제목·요약·href.  
`HomeDawnPrayer`는 시간 라벨·제목·요약·본문·href.  
`HomeSundaySermon`은 라벨(`이번 주일 말씀`)·제목·요약(본문 구절·설교자)·유튜브 썸네일 URL·영상 URL.  
프로필은 overview에 넣지 않고 `authStore.currentUser`를 사용합니다.

## 결정 사항 (최신 위)

- (2026-11-03) **새벽기도 말씀요약 홈 카드·상세 화면 양식 무관(Format-Agnostic) 레이아웃 개편** — 게시글마다 평일 요약/주말 성경 본문 등 HTML 구조가 달라지는 점을 고려해 특정 양식 정규식 분리에 의존하지 않고 확정 필드(`qtDate`, `bibleText`)와 정제된 단락 리더로 구조화한다. 홈 카드는 상단 책 아이콘 배지 + `새벽기도 말씀요약 · M월 D일 (요일)`, 성경 본문 타이틀(`bibleText`), 중복 머리말(`본문말씀:`, `찬송:`)을 제외한 본문 첫 2줄 미리보기만 표시해 날짜·구절 중복을 제거한다. 상세 화면(`/prayer/dawn`)은 상단 히어로 요약 카드(아이콘 배지 + 날짜·요일 + 성경 본문 타이틀)와 하단 단락별 아티클 리더 카드로 분리하고, 주말 `<ul><li><div>절</div><div>말씀</div></li></ul>` 구조도 `1. 말씀` 한 줄로 이어 붙여 가독성을 높인다.

- (2026-11-03) **런타임 목데이터(`src/mocks/home.ts`) 제거 및 홈 쿼리 키 분리** — `dawnPrayer`, `sundaySermon` 조회 실패 또는 빈 목록일 때 목업 데이터로 폴백하지 않고 `null`을 반환하여 홈 화면에서 해당 카드를 조건부 렌더링하며, API 경로명은 `/api/daily-qt`이나 실제 게시글 본문 성격이 `<새벽예배 말씀요약>`이므로 화면 표기는 **새벽기도 말씀요약**(`새벽기도 말씀요약 · M월 D일`, `말씀요약 더 보기`, 상세 헤더 `새벽기도 말씀요약`)을 유지한다. 또한 이전 메모리/로컬 캐시에 남아 있던 목업 설교가 노출되지 않도록 `queryKeys.home` 키를 갱신하고 `staleTime: 0`을 적용한다.

- (2026-11-03) **설교(`GET /api/sermons`) 및 매일 큐티(`GET /api/daily-qt`, `GET /api/daily-qt/{id}`) 신규 API 수직 연동** — 백엔드에서 크롤링/수집하여 제공하는 주일 설교와 매일 큐티를 조회하여 홈 화면에 실제 주일 설교(제목, 본문, 설교자, 유튜브 영상 썸네일/링크) 및 새벽기도 말씀요약(성경본문, 날짜, HTML 정제 본문)을 바인딩. `Promise.allSettled`를 통해 일부 엔드포인트 실패 시에도 나머지 카드를 안전하게 렌더링하고, `/prayer/dawn` 상세 화면에서 id 기반 개별 큐티 조회를 지원. Issue #198.

- (2026-10-28) **새벽기도 말씀요약 카드 내부 패딩 복원** — 주일 말씀 썸네일 전면 배치 작업 당시 공통 `dawnCard`에서 제거되었던 내부 여백을 새벽기도 카드(`dawnPrayer`) 텍스트 영역에 `sermonContent`(패딩 16px)로 래핑하여 글씨가 카드 좌우 테두리에 붙는 현상 해결.

- (2026-10-28) **홈 화면 compact sticky 헤더 적용 및 상하 여백 최적화** — 부제목이 없는 홈 화면 특성에 맞춰 `StickyHeaderScreen`과 `ScreenHeader`에 `compact` 옵션을 적용. 부제목용으로 과도하게 잡혀 있던 헤더 높이(89px → 60px)와 상하 패딩(20px → 15px)을 줄여 메인 타이틀(“열린문 커넥트”) 위아래의 불필요한 잉여 여백을 해소하고 본문과의 간격을 정돈함.

- (2026-10-27) **홈 상단 첫 번째 카드로 ‘이번 주일 말씀’ 유튜브 썸네일 카드(`sundaySermon`) 배치** — 프로필 행 바로 아래 최상단에 이번 주일 말씀 카드를 배치하고, 기존 새벽 말씀 카드(`dawnCard`)와 동일한 외곽 카드 스타일(`surface` 배경 + `line` 테두리)과 상단 타이포 위계(`이번 주일 말씀` → 설교 제목 → 본문·설교자 요약)를 유지하되, 정적 16:9 유튜브 썸네일과 재생 아이콘 배지를 배치하고 탭 시 자동 재생 없이 `Linking.openURL`로 외부 유튜브 영상을 연다.

- (2026-10-27) **홈 상단 프로필 행을 좌측 `아바타 + 이름`, 우측 알약 없는 `내 정보 >` 텍스트 링크로 단순화** — 시간대별 인삿말과 보조 문구를 제거하고, 좌측에 사용자 아바타와 이름을 나란히 배치하며 우측 `내 정보` 버튼은 알약 테두리·배경을 걷어낸 텍스트+화살표 형태로 정리한다.
- (2026-10-27) **홈 상단 인삿말 영역의 외곽 카드 박스를 제거하고 배경 위 타이포그래피로 배치** — `greetingCard`의 흰색 배경·테두리를 걷어내어 ‘박스 인 박스’ 답답함을 해소하고, 우측 `내 정보` 아바타 버튼과 하단 두 기도 카드(`dailyCard`, `dawnCard`)의 위계를 살리며 `dailyCard` 우하단 장식 원(`dailyOrb`)을 제거해 깔끔한 단색 카드로 정리한다.
- (2026-10-10) **내 정보 진입을 헤더에서 인삿말 카드(`greetingCard`)로 통합하고 카드 간격을 화면 좌우 패딩과 통일** — StickyHeaderScreen의 헤더 right 버튼에서 본문 상단 인삿말 카드 우측 아바타 칩으로 통합하여 단일 카드로 구성하고, 카드 간격(`gap`)을 화면 좌우 패딩(`theme.layout.screenX` = 20px)으로 맞춤. Issue #163.
- (2026-10-09) **홈 화면을 카드형 레이아웃(PR #111)으로 복원한다** — 히어로 배너·진행 카드 대신 StickyHeaderScreen 상단 헤더(“열린문 커넥트”, “내 정보” 칩), 인삿말, 오늘의 기도 카드(`dailyCard`), 새벽 말씀 카드(`dawnCard`) 3칸으로 복원한다. Issue #139.
- (2026-07-25) **홈 1차 범위는 프로필 진입 + 오늘 기도 + 새벽기도 요약만 둔다** — 내 활동 요약·나눔/동행 미리보기는 넣지 않습니다. Issue #109.
- (2026-07-25) **MY 진입은 sticky 헤더 `아바타 + 내 정보 + chevron` 칩으로 한다** — 라벨 문구는 항상 “내 정보”. accessibilityLabel=`내 정보`.
- (2026-07-25) **아바타 원 안에는 이름 전체(성 제외)를 넣는다** — `getGivenName`: 이민구→**민구**, 김은혜→**은혜**. 첫 글자 이니셜만이 아니다.
- (2026-07-25) **오늘의 기도 카드는 앱 primary 톤을 쓴다** — 별도 올리브 그린이 아니라 `theme.colors.primary` + primary shadow로 브랜드 색과 맞춥니다.
- (2026-07-25) **오늘 기도는 기기 로컬 날짜의 요일로 mock 문구를 고른다** — mon~sun 각각 고정 copy. 이동은 우선 `/prayer`. 토·일은 주말용 문구를 둡니다.
- (2026-07-25) **새벽기도 블록은 ‘말씀요약’이다** — 참여 안내가 아니라 오늘 새벽 본문·한 줄 요약·적용을 보여 주고 `/prayer/dawn`에서 전문을 읽습니다.

## 미결 / 추적

- 오늘 기도와 참여 중 요일 기도방 id 매칭 후 `/prayer/[id]` 딥링크
- 새벽기도 날짜별 본문·출석 체크 API
- 홈 공지 1줄 (후순위)

## 의존성

- auth store (`Member`)
- prayer 탭 route (`/prayer`, `/prayer/dawn`)
