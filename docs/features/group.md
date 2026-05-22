# group (소모임)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P1/P3 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도가 소모임을 탐색하고 참여하거나 새 모임을 개설할 수 있게 합니다.

---

## ✅ 완료
- 소모임 목록/상세/개설 화면 구현 — `app/(tabs)/group/index.tsx`, `app/(tabs)/group/[id].tsx`, `app/modal/group-new.tsx`
- 소모임 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/group.ts`, `src/mocks/groups.ts`, `src/services/groupService.ts`, `src/hooks/useGroups.ts`
- 대표 이미지 선택/미리보기 연결 — `GroupInput.coverImage`를 카드/상세 cover에 표시
- 참여, 탈퇴, 공지 작성, 멤버 목록 mock mutation 구현
- 검색, 모집/참여/관심 필터, 관심 소모임, 정원 마감 제한, 소모임장 탈퇴 제한, 멤버 내보내기 mock 구현

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/group/index.tsx` | 소모임 목록, 카테고리 필터 |
| `app/(tabs)/group/[id].tsx` | 소모임 상세, 참여/탈퇴, 공지, 멤버 |
| `app/modal/group-new.tsx` | 소모임 개설 모달 |
| `src/components/group/GroupCard.tsx` | 소모임 카드 |
| `src/services/groupService.ts` | 소모임 mock service |
| `src/hooks/useGroups.ts` | 소모임 query/mutation hook |
| `src/mocks/groups.ts` | 소모임 mock 데이터 |
| `src/constants/domainOptions.ts` | 소모임 카테고리/상태 필터 옵션 |
| `src/types/group.ts` | 소모임 타입 |

## 데이터 타입
`Group`은 `coverImage?: string`, `leader`, `members`, `maxMembers`, `schedule`, `status`, `isJoined`, `isFavorite`, `notices`를 포함합니다. 카테고리는 성경공부·예배/기도모임/봉사/취미·문화/운동·건강/목장/선교/카풀/기타를 사용합니다.

## 결정 사항 (최신 위)
- (2026-05-22) **카풀은 소모임 카테고리로 포함** — Notion MVP 정의에 따라 별도 도메인이 아니라 소모임 카테고리로 처리합니다.
- (2026-05-22) **멤버 정책은 mock-first** — 최소 2명, 정원 초과 방지, 소모임장 탈퇴 제한을 mock service에서 먼저 검증합니다.
- (2026-05-22) **공지/멤버 관리는 mock UI까지** — 운영자 권한과 실제 멤버 관리 API는 후속 Phase에서 확정합니다.

## 미결 / 추적
- 참여 신청이 즉시 참여인지 승인 대기인지 운영 정책 확인 필요.
- 공지 작성 권한과 소모임장/관리자 권한 모델 확인 필요.
- 강제 내보내기 이의 제기/복구 플로우는 실제 API와 운영 정책 확정 후 반영.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`, 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
