# prayer (중보기도)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P5 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도가 요일별 기도방에 참여하고 기도제목을 등록/확인/응답 기록합니다.

---

## ✅ 완료
- 중보기도 목록/상세/등록 화면 구현 — `app/(tabs)/prayer/index.tsx`, `app/(tabs)/prayer/[id].tsx`, `app/modal/prayer-new.tsx`
- 중보기도 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/prayer.ts`, `src/mocks/prayers.ts`, `src/services/prayerService.ts`, `src/hooks/usePrayers.ts`
- 요일 필터, 기도방 참여/나가기, 기도제목 등록, 기도 체크, 응답 기록 mock mutation 구현

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/prayer/index.tsx` | 중보기도 요일방 목록 |
| `app/(tabs)/prayer/[id].tsx` | 기도방 상세, 기도제목, 응답 기록 |
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
- (2026-05-22) **중보기도는 Notion v1 범위** — MVP가 아니라 v1 mock-first 화면/서비스까지 구현합니다.
- (2026-05-22) **비회원 기도 요청은 후속 처리** — Notion에는 비성도 요청/방 참여 신청이 있으나, 모바일 v1 mock에서는 성도 앱 내부 플로우를 먼저 구현합니다.

## 미결 / 추적
- 비성도 기도 요청, 기도방 참여 승인, 익명 작성자의 서버 응답 필드 정책 확인 필요.
- 푸시 알림과 기도 통계는 후속 Phase입니다.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`에 의존합니다.
- auth 도메인의 현재 사용자에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
