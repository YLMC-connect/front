# prayer (중보기도)

> 마지막 갱신: 2026-05-27 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도가 요일별 기도방에 참여하고 기도제목을 등록/확인/응답 기록합니다.

---

## ✅ 완료
- 중보기도 목록/상세/등록 화면 구현 — `app/(tabs)/prayer/index.tsx`, `app/(tabs)/prayer/[id].tsx`, `app/modal/prayer-new.tsx`
- 중보기도 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/prayer.ts`, `src/mocks/prayers.ts`, `src/services/prayerService.ts`, `src/hooks/usePrayers.ts`
- 요일 필터, 기도방 참여/나가기, 기도제목 등록, 기도 체크, 응답 기록 mock mutation 구현
- 중보기도 목록 1차 디자인 정렬 — ZIP prototype 기준 요일 색상 박스, 내 기도모임/다른 기도모임 분리, 기도제목 FAB 적용
- ZIP 원본 기도방 신청/기도요청 reference 라우트 추가 — `app/(tabs)/prayer/apply.tsx`, `app/(tabs)/prayer/request.tsx`
- ZIP 110개 visual inventory 재검증에 포함 — 중보기도 reference 화면을 Dev Client capture/compare 대상에 유지
- ZIP 5탭 정보구조 반영 — 중보기도 목록은 `app/(tabs)/faith/index.tsx`의 `동행` 탭 기본 segment로 진입
- ZIP 중보기도 화면 구조 정렬 — ZIP `ScreenPrayerList`, `ScreenPrayerDetail`, `ScreenPrayerRequest` 기준으로 다른 기도모임방 flat row, 상세 underline tab/action pill, 기도요청 목록 카드를 reference 화면에 반영하고 `pray-list 15.12→13.35`, `pray-detail 14.60→12.91`, `pray-request 14.31→10.17`로 낮춤

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/faith/index.tsx` | ZIP 기준 `동행` 탭에서 중보기도 기본 segment 제공 |
| `app/(tabs)/prayer/index.tsx` | 숨김 direct route. 중보기도 요일방 reference 화면 |
| `app/(tabs)/prayer/[id].tsx` | 기도방 상세, 기도제목, 응답 기록 |
| `app/(tabs)/prayer/apply.tsx` | ZIP 원본 기도방 신청 reference 화면 |
| `app/(tabs)/prayer/request.tsx` | ZIP 원본 기도요청 reference 화면 |
| `app/modal/prayer-new.tsx` | 기도제목 등록 모달 |
| `src/components/prayer/PrayerRoomCard.tsx` | 기도방 카드 |
| `src/services/prayerService.ts` | 중보기도 mock service |
| `src/hooks/usePrayers.ts` | 중보기도 query/mutation hook |
| `src/mocks/prayers.ts` | 기도방/기도제목 mock 데이터 |
| `src/constants/domainOptions.ts` | 중보기도 요일 필터 옵션 |
| `src/types/prayer.ts` | 중보기도 타입 |

## 데이터 타입
`PrayerRoom`은 `weekday`, `leader`, `memberCount`, `isJoined`를 포함합니다. `PrayerTopic`은 `isAnonymous`, `prayerCount`, `hasPrayed`, `isAnswered`, `answer`를 포함합니다.

## 결정 사항 (최신 위)
- (2026-05-27) **기도요청은 ZIP 목록 화면을 따른다** — `/prayer/request` reference는 입력 폼이 아니라 ZIP `ScreenPrayerRequest`처럼 전체/내 요청/응답됨 segmented tabs와 기도 요청 카드 목록, FAB를 표시합니다. 기도 제목 작성 폼은 별도 작성 화면 패턴으로 분리합니다.
- (2026-05-27) **기도방 상세 tab은 underline 구조를 따른다** — `ScreenPrayerDetail`은 공통 segmented pill이 아니라 ZIP `UnderlineTabs`처럼 하단 선으로 현재 tab을 표시합니다. 카드 안의 `함께 기도`와 `응답완료`도 full button이 아닌 compact pill action으로 둡니다.
- (2026-05-27) **다른 기도모임방은 flat row list로 둔다** — 중보기도 목록의 미가입 방은 하나의 카드로 묶지 않고 ZIP처럼 full-width flat row와 soft 참여 pill을 사용합니다.
- (2026-05-25) **중보기도 루트 진입은 동행 탭 기본 segment로 둔다** — ZIP 기준 5탭 구조를 우선해 중보기도는 독립 하단 탭이 아니라 `동행` 탭의 기본 segment로 진입합니다. 기존 `/prayer` route는 상세/딥링크/캡처 호환용 숨김 route로 유지합니다.
- (2026-05-23) **ZIP 중보기도 보조 화면도 route-accessible** — 기도방 신청과 기도요청 화면을 mock-first reference 라우트로 두고, 실제 승인/비성도 정책은 후속 API 결정에 맡깁니다.
- (2026-05-23) **기도방 list는 내 방과 참여 가능 방을 분리** — 동일한 요일 필터 안에서 가입 중인 방과 다른 기도모임방을 나눠 보여주며, 작성 액션은 floating FAB로 둡니다.
- (2026-05-22) **중보기도는 Notion v1 범위** — MVP가 아니라 v1 mock-first 화면/서비스까지 구현합니다.
- (2026-05-22) **비회원 기도 요청은 후속 처리** — Notion에는 비성도 요청/방 참여 신청이 있으나, 모바일 v1 mock에서는 성도 앱 내부 플로우를 먼저 구현합니다.

## 미결 / 추적
- 비성도 기도 요청, 기도방 참여 승인, 익명 작성자의 서버 응답 필드 정책 확인 필요.
- 푸시 알림과 기도 통계는 후속 Phase입니다.
- 2026-05-27 ZIP 구조 정렬 후 중보기도 residual은 `pray-list mean=13.35`, `pray-detail mean=12.91`, `pray-request mean=10.17`입니다. 남은 차이는 Android native status bar/time, RN 한글 font metrics, 실제 tab/FAB 그림자 번역 차이로 분리 추적합니다.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`에 의존합니다.
- auth 도메인의 현재 사용자에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
