# home (홈)

> 마지막 갱신: 2026-09-03 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

로그인 성도가 **오늘 무엇을 하면 되는지** 한눈에 보는 요약 허브입니다.

---

## ✅ 완료

- 홈 요약형 레이아웃 — **헤더 없음**. 상단 풀블리드 히어로(크림 페이드) + **상단 라운드 크림 시트(`bg`)** + 경계 진행(흰 카드, 카운트+바만 / 말씀·기도 라벨 없음). 할 일 제목 없이 항목 나열. 게임 리워드 없음
- 히어로 모션 — `hero-banner.jpg` + Reanimated idle float. 정식 Lottie 교체 가능
- 오늘 할 일 로컬 완료 — AsyncStorage 날짜 키로 말씀/기도 완료 (`useHomeTodayProgress`)
- **내 정보는 히어로 안쪽** (우상단 칩) → MY, 짧은 인사(성 제외 이름)
- 히어로 카피 없음 — 인사·날짜·멘트 제거. 우상단 **내 정보** 칩만
- 홈 overview mock 경계 — todos/progressSteps 포함
- 새벽기도 말씀요약 상세 `/prayer/dawn`

## 주요 파일

| 경로 | 역할 |
|---|---|
| `app/(tabs)/index.tsx` | 홈 루트 (요약 UI) |
| `assets/home/*` | 히어로 배너·하늘 이미지 |
| `src/components/home/HomeHeroVisual.tsx` | 배너 + idle 모션 + 페이드 |
| `src/hooks/useHomeTodayProgress.ts` | 오늘 할 일 로컬 완료 |
| `src/types/home.ts` | HomeOverview / Todo / Progress |
| `src/mocks/home.ts` | 요일 기도·말씀·todos mock |
| `src/services/homeService.ts` | fetch overview/dawn |
| `src/hooks/useHome.ts` | query hooks |
| `app/(tabs)/prayer/dawn.tsx` | 말씀요약 상세 |

## 데이터 타입

`HomeOverview` = `{ dailyPrayer, dawnPrayer, todos, progressSteps }`.  
프로필은 `authStore.currentUser`. 완료 상태는 날짜별 로컬 저장.

## 결정 사항 (최신 위)

- (2026-07-25) **홈 바탕은 앱 크림 `bg`** — 시트·페이드·스크롤 모두 크림. 오늘 진행 카드만 surface 흰 대비.
- (2026-07-25) **히어로 모션** — 1차는 Reanimated float + `hero-banner.jpg`. 임시 벡터 Lottie(흰 원) 제거. 정식 Lottie 에셋 오면 교체.
- (2026-07-25) **홈 화면 헤더 없음** — “열린문 커넥트” 타이틀 바 제거. safe-area만 적용.
- (2026-07-25) **1차 할 일은 새벽 말씀·오늘 기도 2개** — 버튼 보기/기도, 탭 시 완료 표시 후 이동.
- (2026-07-25) **MY는 히어로 안 칩** — 아바타(성 제외 이름) + “내 정보”.
- (2026-07-25) **새벽 블록은 말씀요약** — 참여 안내 아님.

## 미결 / 추적

- 고퀄 캐릭터 Lottie(디자인 툴 내보내기) 확보 시 히어로 모션 교체
- 기도방 딥링크, 일자별 말씀 API
- 할 일 3번째(공지/모임) 선택 확장

## 의존성

- auth store, prayer routes, AsyncStorage
