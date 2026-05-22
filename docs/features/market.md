# market (나눔)

> 마지막 갱신: 2026-05-23 | 담당 Phase: P1/P2 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약
성도 간 무료 나눔 글을 등록하고 상태/댓글/신고를 관리합니다.

---

## ✅ 완료
- 나눔 목록/상세/작성 화면 구현 — `app/(tabs)/market/index.tsx`, `app/(tabs)/market/[id].tsx`, `app/modal/market-new.tsx`
- 나눔 타입, mock 데이터, service, TanStack Query hook 구현 — `src/types/market.ts`, `src/mocks/market.ts`, `src/services/marketService.ts`, `src/hooks/useMarketItems.ts`
- 이미지 선택/미리보기 연결 — `ImagePickerField`에서 선택한 URI를 `MarketInput.images`로 저장하고 목록/상세 썸네일에 표시
- 상태 변경, 댓글 등록, 신고 접수 mock mutation 구현
- 검색, 관심 목록, 신고 사유 선택, 활성 나눔 5개 제한, 사진 필수 검증 구현

## 주요 파일 (도메인 파일 지도)

| 경로 | 역할 |
|---|---|
| `app/(tabs)/market/index.tsx` | 나눔 목록, 상태/카테고리 필터 |
| `app/(tabs)/market/[id].tsx` | 나눔 상세, 상태 변경, 댓글, 신고 |
| `app/modal/market-new.tsx` | 나눔 작성 모달 |
| `src/components/market/MarketItemCard.tsx` | 나눔 카드 |
| `src/services/marketService.ts` | 나눔 mock service |
| `src/hooks/useMarketItems.ts` | 나눔 query/mutation hook |
| `src/mocks/market.ts` | 나눔 mock 데이터 |
| `src/constants/domainOptions.ts` | 나눔 카테고리/상태/신고 사유 옵션 |
| `src/types/market.ts` | 나눔 타입 |

## 데이터 타입
`MarketItem`은 `images: string[]`, `status: sharing | reserved | done`, `comments`, `liked`, `condition`, `location`을 포함합니다. `MarketInput`은 Notion MVP 기준 사진 필수이므로 `images: string[]`를 1장 이상 받습니다.

## 결정 사항 (최신 위)
- (2026-05-22) **나눔은 무료 나눔만 MVP 포함** — 가격/결제는 MVP에서 제외하고 상태 변경과 댓글만 둡니다.
- (2026-05-22) **Notion 운영 정책 일부를 mock service에서 검증** — 진행 중인 내 나눔은 최대 5개, 사진은 1장 이상 필수입니다.
- (2026-05-22) **이미지는 로컬 URI 우선** — 실제 업로드 API가 없으므로 `expo-image-picker` URI를 mock 데이터에 저장해 UI 흐름을 검증합니다.

## 미결 / 추적
- 실제 나눔 API 스키마, 이미지 업로드 방식, 페이지네이션 방식 확인 필요.
- 신고 처리 후 블라인드/관리자 큐 정책은 API/운영 정책 확정 후 반영.

## 의존성
- common 도메인의 UI, `queryKeys`, `queryClient`, 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
