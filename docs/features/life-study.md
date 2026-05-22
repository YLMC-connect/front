# life-study (삶공부)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도가 삶공부 과정을 확인하고 신청/취소하며 수강 이력을 확인합니다.

---

## ✅ 완료
- 삶공부 목록/상세 화면 구현 — `app/(tabs)/life-study/index.tsx`, `app/(tabs)/life-study/[id].tsx`
- 삶공부 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/lifeStudy.ts`, `src/mocks/lifeStudy.ts`, `src/services/lifeStudyService.ts`, `src/hooks/useLifeStudyCourses.ts`
- 과정 상태 필터, 신청/취소 mutation, 진도/커리큘럼/수강 이력 UI 구현
- 삶공부 목록 1차 디자인 정렬 — ZIP prototype 기준 신청가능·진행중 카드, progress bar, 마감·수료 row list 적용

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/life-study/index.tsx` | 삶공부 목록, 상태 필터, 내 수강 이력 |
| `app/(tabs)/life-study/[id].tsx` | 삶공부 상세, 신청/취소, 진도/커리큘럼 |
| `src/components/lifeStudy/LifeStudyCourseCard.tsx` | 삶공부 과정 카드 |
| `src/services/lifeStudyService.ts` | 삶공부 mock service |
| `src/hooks/useLifeStudyCourses.ts` | 삶공부 query/mutation hook |
| `src/mocks/lifeStudy.ts` | 삶공부 mock 데이터 |
| `src/constants/domainOptions.ts` | 삶공부 상태 필터 옵션 |
| `src/types/lifeStudy.ts` | 삶공부 타입 |

## 데이터 타입
`LifeStudyCourse`는 `status`, `sessions`, `currentSession`, `capacity`, `enrolledCount`, `isEnrolled`, `isCompleted`, `curriculum`을 포함합니다. `LifeStudyHistory`는 수강 회차와 수료증 발급 여부를 포함합니다.

## 결정 사항 (최신 위)
- (2026-05-23) **삶공부 list는 진행 카드와 이력 row로 분리** — 상태 필터는 유지하되, 진행/신청 과정은 강조 카드로, 마감·수료 이력은 compact row로 보여줍니다.
- (2026-05-22) **삶공부는 Notion v1 범위** — MVP가 아니라 v1 mock-first 화면/서비스까지 구현합니다.
- (2026-05-22) **실제 과정명은 mock/API 데이터** — 문서에 고정하지 않고 service 데이터로 표시합니다.

## 미결 / 추적
- 실제 삶공부 API 스키마, 신청 승인 방식, 수료증 표시 방식 확인 필요.
- 관리자 과정 개설/수정은 모바일 v1 범위가 아니며 후속 Phase입니다.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`에 의존합니다.
- auth 도메인의 현재 사용자 연결은 실제 API 연결 시 필요합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
