# life-study (삶공부)

> 마지막 갱신: 2026-06-27 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도가 삶공부 과정을 확인하고 신청/취소하며 수강 이력을 확인합니다.

---

## ✅ 완료

- 삶공부 목록/상세 화면 구현 — `app/(tabs)/life-study/index.tsx`, `app/(tabs)/life-study/[id].tsx`
- 삶공부 타입, mock 데이터, 목록 service, TanStack Query 목록 hook 구현 — `src/types/lifeStudy.ts`, `src/mocks/lifeStudy.ts`, `src/services/lifeStudyService.ts`, `src/hooks/useLifeStudyCourses.ts`
- 과정 상태 필터, 신청/취소 mutation, 진도/커리큘럼/수강 이력 UI 구현
- 삶공부 목록 1차 디자인 정렬 — ZIP prototype 기준 신청가능·진행중 카드, progress bar, 마감·수료 row list 적용
- ZIP 원본 삶공부 신청/수강 내역 reference 라우트 추가 — `app/(tabs)/life-study/apply.tsx`, `app/(tabs)/life-study/history.tsx`
- ZIP 110개 visual inventory 재검증에 포함 — 삶공부 reference 화면을 Dev Client capture/compare 대상에 유지
- 폐기된 ZIP 5탭 정보구조 반영 — 삶공부를 `동행` 탭 내부 segment로 두던 구조는 Downloads preview 기준 `삶공부` 하단 탭으로 대체
- ZIP 삶공부 상세 구조 정렬 — `ScreenStudyDetail` 기준으로 상세 intro, 담당 양육자 soft box, 내 수강 현황, flat curriculum rows, fixed bottom action bar를 재구성
- ZIP 삶공부 목록 구조 정렬 — `ScreenStudyList` 기준으로 신청가능/진행중 과정 제목·설명 typography를 조정하고, 마감·수료 영역을 카드 wrapper 없는 flat row list로 바꿔 `study-list mean=14.33→11.76`으로 낮춤
- 삶공부 목록 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenStudyList`의 내 학습경로, 신청 가능한 과정, 전체 과정 구조를 `/life-study` route에 RN으로 직접 반영
- 폐기된 삶공부 direct route 실제 화면 복구 — `/life-study` 숨김 direct route 결정은 Downloads preview 기준 `삶공부` 하단 탭으로 대체
- 삶공부 상세 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenStudyDetail`의 과정 정보, 신청 안내, 진행 상태, 수업·출결, 숙제, 커리큘럼, 하단 action 구조를 `/life-study/[id]` route에 RN으로 직접 반영
- 삶공부 수강 신청 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenStudyApply`의 과정 요약, 신청 정보, 신앙 연차 chip, 수강 약속, 하단 CTA를 `/life-study/apply` route에 RN으로 직접 반영
- 삶공부 수강 내역 실제 화면 복구 — PrototypeScaffold placeholder 대신 Downloads `ScreenStudyHistory`의 신청중/수강 중/추천 과정/지난 과정/수료 뱃지 섹션을 `/life-study/history` route에 RN으로 직접 반영
- Downloads preview 탭 IA 반영 — `/life-study`를 숨김 route가 아니라 하단 `삶공부` 탭 루트로 복구

## 주요 파일 (도메인 파일 지도)

| 경로                                           | 역할                                  |
| ---------------------------------------------- | ------------------------------------- |
| `app/(tabs)/life-study/index.tsx`              | Downloads 하단 `삶공부` 탭 루트       |
| `src/components/faith/FaithSectionsScreen.tsx` | 삶공부 목록 공유 렌더러               |
| `app/(tabs)/life-study/[id].tsx`               | 삶공부 상세, 신청/취소, 진도/커리큘럼 |
| `app/(tabs)/life-study/apply.tsx`              | 삶공부 수강 신청 입력 화면            |
| `app/(tabs)/life-study/history.tsx`            | 삶공부 신청/수강/지난 과정 내역 화면  |
| `src/services/lifeStudyService.ts`             | 삶공부 목록 mock service              |
| `src/hooks/useLifeStudyCourses.ts`             | 삶공부 목록 query hook                |
| `src/mocks/lifeStudy.ts`                       | 삶공부 mock 데이터                    |
| `src/constants/domainOptions.ts`               | 삶공부 상태 필터 옵션                 |
| `src/types/lifeStudy.ts`                       | 삶공부 타입                           |

## 데이터 타입

`LifeStudyCourse`는 `status`, `sessions`, `currentSession`, `capacity`, `enrolledCount`, `isEnrolled`, `isCompleted`, `curriculum`을 포함합니다. `LifeStudyHistory`는 수강 회차와 수료증 발급 여부를 포함합니다.

## 결정 사항 (최신 위)

- (2026-06-27) **삶공부는 독립 하단 탭이다** — Downloads `PREVIEW_TAB_ROUTES` 기준으로 `/life-study`는 하단 `삶공부` 탭 루트입니다. 화면 구현은 기존 삶공부 목록 renderer를 재사용하되, 내부 `중보기도/삶공부` segment는 노출하지 않습니다.
- (2026-06-27) **삶공부 수강 내역은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenStudyHistory` 구조를 `/life-study/history` route에 직접 반영합니다. 실제 수료 뱃지/수료증 데이터는 API 스키마 확정 후 연결합니다.
- (2026-06-27) **삶공부 수강 신청은 실제 RN 화면으로 렌더링한다** — Downloads `ScreenStudyApply`의 기본 form 구조를 `/life-study/apply` route에 직접 반영합니다. 신청 완료 상태와 실제 신청 API는 상태 전이 정책 확정 후 연결합니다.
- (2026-06-27) **폐기됨: 삶공부 direct route는 숨김 route** — 최신 Downloads preview 기준으로 `/life-study`는 독립 하단 탭입니다.
- (2026-06-27) **현재 호출처 없는 card/mutation/detail helper는 제거한다** — `LifeStudyCourseCard`와 미사용 상세/이력/신청 mutation hook은 route 호출처가 없어 제거하고, 현재 `history` route에서 쓰는 목록 query만 유지합니다.
- (2026-06-27) **폐기됨: 동행 삶공부 segment는 실제 RN 화면으로 렌더링한다** — 최신 Downloads preview 기준으로 삶공부는 `/life-study` 하단 탭입니다.
- (2026-06-27) **삶공부 상세는 실제 RN 화면으로 렌더링한다** — Downloads `ScreenStudyDetail` 구조를 `/life-study/[id]`에 직접 반영합니다. 별도 상세 query/helper는 실제 API 스키마가 정해질 때 추가합니다.
- (2026-05-31) **삶공부 목록 마감·수료 영역은 flat row list를 따른다** — ZIP `ScreenStudyList`는 `마감·수료` 섹션을 별도 카드로 감싸지 않고 icon + title/status + term row를 반복하므로, RN reference도 `Card/menuCard` wrapper 대신 화면 전용 flat row style을 사용합니다.
- (2026-05-27) **삶공부 상세는 ZIP `ScreenStudyDetail` 구조를 따른다** — 공통 `Card`/`Section`으로 감싼 기존 reference 구조 대신 ZIP의 내부 `phone-body` scroll, 8px divider, soft progress panel, flat curriculum rows, glass bottom action bar를 RN 방식으로 번역합니다.
- (2026-05-25) **폐기됨: 삶공부 루트 진입은 동행 탭 안에 둔다** — 최신 Downloads preview 기준으로 삶공부는 독립 하단 탭입니다.
- (2026-05-23) **ZIP 삶공부 보조 화면도 route-accessible** — 목록/상세 외 신청 확인과 수강 내역 화면을 별도 reference 라우트로 둡니다.
- (2026-05-23) **삶공부 list는 진행 카드와 이력 row로 분리** — 상태 필터는 유지하되, 진행/신청 과정은 강조 카드로, 마감·수료 이력은 compact row로 보여줍니다.
- (2026-05-22) **삶공부는 Notion v1 범위** — MVP가 아니라 v1 mock-first 화면/서비스까지 구현합니다.
- (2026-05-22) **실제 과정명은 mock/API 데이터** — 문서에 고정하지 않고 service 데이터로 표시합니다.

## 미결 / 추적

- 실제 삶공부 API 스키마, 신청 승인 방식, 수료증 표시 방식 확인 필요.
- 관리자 과정 개설/수정은 모바일 v1 범위가 아니며 후속 Phase입니다.
- `study-list` residual은 ZIP 목록 구조 정렬 후 `mean=11.76`입니다. 남은 차이는 Android status bar/time, RN font metrics, SegmentedTabs/Badge antialiasing, native shadow 번역 차이 중심으로 추적합니다.
- `study-detail` residual은 ZIP 구조 정렬 후 `20.90→9.39`까지 낮췄습니다. 남은 차이는 RN status bar/time, font metrics, blur/shadow, native bottom home indicator 번역 차이 중심으로 추적합니다.

## 의존성

- common 도메인의 UI, `queryKeys`, `queryClient`에 의존합니다.
- auth 도메인의 현재 사용자 연결은 실제 API 연결 시 필요합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
