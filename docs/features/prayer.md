# prayer (중보기도)

> 마지막 갱신: 2026-07-10 | 담당 Phase: P5/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도가 요일별 기도방에 참여하고 기도제목을 등록/확인/응답 기록합니다.

---

## ✅ 완료

- 중보기도 목록/상세/등록 화면 구현 — `app/(tabs)/prayer/index.tsx`, `app/(tabs)/prayer/[id].tsx`, `app/modal/prayer-new.tsx`
- 중보기도 타입, mock 데이터, 기도제목 생성 service, TanStack Query mutation hook 구현 — `src/types/prayer.ts`, `src/mocks/prayers.ts`, `src/services/prayerService.ts`, `src/hooks/usePrayers.ts`
- 요일 필터, 기도방 참여/나가기, 기도제목 등록, 기도 체크, 응답 기록 mock mutation 구현
- 중보기도 목록 1차 디자인 정렬 — ZIP prototype 기준 요일 색상 박스, 내 기도모임/다른 기도모임 분리, 기도제목 FAB 적용
- ZIP 원본 기도방 신청/기도요청 reference 라우트 추가 — `app/(tabs)/prayer/apply.tsx`, `app/(tabs)/prayer/request.tsx`
- ZIP 110개 visual inventory 재검증에 포함 — 중보기도 reference 화면을 Dev Client capture/compare 대상에 유지
- 폐기된 ZIP 5탭 정보구조 반영 — 중보기도를 `동행` 탭 기본 segment로 두던 구조는 Downloads preview 기준 `기도` 하단 탭으로 대체
- ZIP 중보기도 화면 구조 정렬 — ZIP `ScreenPrayerList`, `ScreenPrayerDetail`, `ScreenPrayerRequest` 기준으로 다른 기도모임방 flat row, 상세 underline tab/action pill, 기도요청 목록 카드를 reference 화면에 반영하고 `pray-list 15.12→13.35`, `pray-detail 14.60→12.91`, `pray-request 14.31→10.17`로 낮춤
- ZIP 중보기도 FAB root overlay 정렬 — 기도 목록/상세/요청 화면의 body ScrollView와 root FAB를 분리하고 72/73/75번을 재캡처해 `pray-list 13.32→12.28`, `pray-detail 12.91→11.84`, `pray-request 10.17→9.34`로 낮춤
- 기도 목록 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenPrayerList`의 내 기도방, 내 기도제목, 중보기도 신청 구조를 `/prayer` route에 RN으로 직접 반영
- 폐기된 중보기도 direct route 실제 화면 복구 — `/prayer` 숨김 direct route 결정은 Downloads preview 기준 `기도` 하단 탭으로 대체
- 기도방 상세 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenPrayerDetail`의 underline tab, 기도제목/응답/현황 card, 하단 기도 완료 action을 `/prayer/[id]` route에 RN으로 직접 반영
- 기도방 참여 신청 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenPrayerApply`의 요일/시간 선택, 신청자 정보, 승인 대기 안내, 하단 신청 CTA를 `/prayer/apply` route에 RN으로 직접 반영
- 내 기도제목 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenPrayerRequest`의 승인 안내, 상태 badge list, 선택 row, 응답완료 요청 CTA를 `/prayer/request` route에 RN으로 직접 반영
- Downloads preview 탭 IA 반영 — `/prayer`를 숨김 route가 아니라 하단 `기도` 탭 루트로 복구

## 주요 파일 (도메인 파일 지도)

| 경로                                           | 역할                                 |
| ---------------------------------------------- | ------------------------------------ |
| `app/(tabs)/prayer/index.tsx`                  | Downloads 하단 `기도` 탭 루트        |
| `src/components/faith/FaithSectionsScreen.tsx` | 기도 목록 공유 렌더러                |
| `app/(tabs)/prayer/[id].tsx`                   | 기도방 상세, 기도제목, 응답 기록     |
| `app/(tabs)/prayer/apply.tsx`                  | 기도방 참여 신청 요일/시간 선택 화면 |
| `app/(tabs)/prayer/request.tsx`                | 내 기도제목 요청 상태 목록           |
| `app/modal/prayer-new.tsx`                     | 기도제목 등록 모달                   |
| `src/services/prayerService.ts`                | 기도제목 생성 mock service           |
| `src/hooks/usePrayers.ts`                      | 기도제목 생성 mutation hook          |
| `src/mocks/prayers.ts`                         | 기도방/기도제목 mock 데이터          |
| `src/constants/domainOptions.ts`               | 중보기도 요일 필터 옵션              |
| `src/types/prayer.ts`                          | 중보기도 타입                        |

## 데이터 타입

`PrayerRoom`은 `weekday`, `leader`, `memberCount`, `isJoined`를 포함합니다. `PrayerTopic`은 `isAnonymous`, `prayerCount`, `hasPrayed`, `isAnswered`, `answer`를 포함합니다.

## 결정 사항 (최신 위)

- (2026-07-10) **기도 상세 디자인 상태는 development 전용이다** — 기도 완료·empty·현황·응답 캡처는 `designVariant`만 사용하고 production에서는 무시합니다. 실제 상태는 mock/API service 결과가 결정합니다.
- (2026-06-27) **기도는 독립 하단 탭이다** — Downloads `PREVIEW_TAB_ROUTES` 기준으로 `/prayer`는 하단 `기도` 탭 루트입니다. 화면 구현은 기존 기도 목록 renderer를 재사용하되, 내부 `중보기도/삶공부` segment는 노출하지 않습니다.
- (2026-06-27) **내 기도제목은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenPrayerRequest` 구조를 `/prayer/request` route에 직접 반영합니다. 실제 응답완료 요청 API는 기도제목 상태 전이 정책 확정 후 연결합니다.
- (2026-06-27) **기도방 참여 신청은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenPrayerApply` 구조를 `/prayer/apply` route에 직접 반영합니다. 실제 신청 API와 중복 신청 제한은 승인 정책 확정 후 연결합니다.
- (2026-06-27) **현재 호출처 없는 card/query helper는 제거한다** — `PrayerRoomCard`와 미사용 기도방 query/참여/응답 mutation helper는 route 호출처가 없어 제거하고, 현재 작성 모달에서 쓰는 기도제목 생성 mutation만 유지합니다.
- (2026-06-27) **폐기됨: 동행 기본 segment는 실제 RN 화면으로 렌더링한다** — 최신 Downloads preview 기준으로 중보기도는 `/prayer` 하단 탭입니다.
- (2026-06-27) **기도방 상세는 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenPrayerDetail`의 기본 기도/응답/현황 구조를 `/prayer/[id]` route에 직접 반영합니다. 팀장 격려/empty 상세 variant는 필요한 시점에 작은 분기만 추가합니다.
- (2026-05-27) **중보기도 FAB는 ZIP root fixed action으로 둔다** — 기도방 목록/상세/요청의 작성 FAB는 스크롤 본문 안에 포함하지 않고 ZIP `Phone` root layer 기준으로 둡니다. 본문은 내부 ScrollView로 두어 FAB 위치가 tab bar와 독립적으로 유지되게 합니다.
- (2026-05-27) **기도요청은 ZIP 목록 화면을 따른다** — `/prayer/request` reference는 입력 폼이 아니라 ZIP `ScreenPrayerRequest`처럼 전체/내 요청/응답됨 segmented tabs와 기도 요청 카드 목록, FAB를 표시합니다. 기도 제목 작성 폼은 별도 작성 화면 패턴으로 분리합니다.
- (2026-05-27) **기도방 상세 tab은 underline 구조를 따른다** — `ScreenPrayerDetail`은 공통 segmented pill이 아니라 ZIP `UnderlineTabs`처럼 하단 선으로 현재 tab을 표시합니다. 카드 안의 `함께 기도`와 `응답완료`도 full button이 아닌 compact pill action으로 둡니다.
- (2026-05-27) **다른 기도모임방은 flat row list로 둔다** — 중보기도 목록의 미가입 방은 하나의 카드로 묶지 않고 ZIP처럼 full-width flat row와 soft 참여 pill을 사용합니다.
- (2026-05-25) **폐기됨: 중보기도 루트 진입은 동행 탭 기본 segment로 둔다** — 최신 Downloads preview 기준으로 중보기도는 독립 하단 탭입니다.
- (2026-05-23) **ZIP 중보기도 보조 화면도 route-accessible** — 기도방 신청과 기도요청 화면을 mock-first reference 라우트로 두고, 실제 승인/비성도 정책은 후속 API 결정에 맡깁니다.
- (2026-05-23) **기도방 list는 내 방과 참여 가능 방을 분리** — 동일한 요일 필터 안에서 가입 중인 방과 다른 기도모임방을 나눠 보여주며, 작성 액션은 floating FAB로 둡니다.
- (2026-05-22) **중보기도는 Notion v1 범위** — MVP가 아니라 v1 mock-first 화면/서비스까지 구현합니다.
- (2026-05-22) **비회원 기도 요청은 후속 처리** — Notion에는 비성도 요청/방 참여 신청이 있으나, 모바일 v1 mock에서는 성도 앱 내부 플로우를 먼저 구현합니다.

## 미결 / 추적

- 비성도 기도 요청, 기도방 참여 승인, 익명 작성자의 서버 응답 필드 정책 확인 필요.
- 푸시 알림과 기도 통계는 후속 Phase입니다.
- 2026-05-27 ZIP FAB root overlay 정렬 후 중보기도 residual은 `pray-list mean=12.28`, `pray-detail mean=11.84`, `pray-request mean=9.34`입니다. 남은 차이는 Android native status bar/time, RN 한글 font metrics, tab/FAB shadow 번역 차이로 분리 추적합니다.

## 의존성

- common 도메인의 UI, `queryKeys`, `queryClient`에 의존합니다.
- auth 도메인의 현재 사용자에 의존합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
