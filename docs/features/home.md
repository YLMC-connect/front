# home (홈)

> 마지막 갱신: 2026-07-25 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

로그인 성도가 앱에 들어왔을 때 프로필·오늘 기도·새벽기도로 바로 이어지는 진입 허브입니다.

---

## ✅ 완료

- 홈 3블록 리팩토링 — sticky 헤더 아바타→MY, 오늘 요일 기도 카드, 새벽기도 요약 카드. 내 활동 요약 제거
- 홈 overview mock 경계 — `types/home` · `mocks/home` · `homeService` · `useHome` · `queryKeys.home.overview/dawn`
- 새벽기도 말씀요약 화면 — `/prayer/dawn` 본문·요약·적용 읽기 상세

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/index.tsx` | 홈 루트 |
| `app/(tabs)/prayer/dawn.tsx` | 새벽기도 안내 상세 |
| `src/types/home.ts` | HomeOverview / Daily / Dawn 타입 |
| `src/mocks/home.ts` | 요일별 기도 문구·새벽기도 mock |
| `src/services/homeService.ts` | fetchHomeOverview / fetchDawnPrayerDetail |
| `src/hooks/useHome.ts` | TanStack Query hooks |

## 데이터 타입

`HomeOverview` = `{ dailyPrayer, dawnPrayer }`.  
`HomeDailyPrayer`는 날짜·요일 라벨·제목·요약·href.  
`HomeDawnPrayer`는 시간 라벨·제목·요약·본문·href.  
프로필은 overview에 넣지 않고 `authStore.currentUser`를 사용합니다.

## 결정 사항 (최신 위)

- (2026-07-25) **홈 1차 범위는 프로필 진입 + 오늘 기도 + 새벽기도 요약만 둔다** — 내 활동 요약·나눔/동행 미리보기는 넣지 않습니다. Issue #109.
- (2026-07-25) **MY 진입은 sticky 헤더 `아바타 + 내 정보 + chevron` 칩으로 한다** — 라벨 문구는 항상 “내 정보”. accessibilityLabel=`내 정보`.
- (2026-07-25) **아바타 원 안에는 이름 전체(성 제외)를 넣는다** — `getGivenName`: 이민구→**민구**, 김은혜→**은혜**. 첫 글자 이니셜만이 아니다.
- (2026-07-25) **오늘의 기도 카드는 앱 primary 톤을 쓴다** — 별도 올리브 그린(`#516B4A`)이 아니라 `theme.colors.primary` + primary shadow로 브랜드 색과 맞춥니다.
- (2026-07-25) **오늘 기도는 기기 로컬 날짜의 요일로 mock 문구를 고른다** — mon~sun 각각 고정 copy. 이동은 우선 `/prayer`. 토·일은 주말용 문구를 둡니다.
- (2026-07-25) **새벽기도 블록은 ‘말씀요약’이다** — 참여 안내가 아니라 오늘 새벽 본문·한 줄 요약·적용을 보여 주고 `/prayer/dawn`에서 전문을 읽습니다. 실제 일자별 말씀 API는 후속.

## 미결 / 추적

- 오늘 기도와 참여 중 요일 기도방 id 매칭 후 `/prayer/[id]` 딥링크
- 새벽기도 날짜별 본문·출석 체크 API
- 홈 공지 1줄 (후순위)

## 의존성

- auth store (`Member`)
- prayer 탭 route (`/prayer`, `/prayer/dawn`)

## 관련 ADR

- (해당 없음)
