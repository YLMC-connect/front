# market (나눔)

> 기록 성격: 도메인 컨텍스트 | 담당 Phase: P1/P2/P7

## 한 줄 요약

성도끼리 물건을 무료로 나누는 글을 올리고, 상태를 바꾸고, 댓글로 이야기합니다.

## 현재 동작

- 나눔 탭(`/market`)은 `전체 / 나눔중 / 내 나눔` 세그먼트와 카테고리 필터, 무한 스크롤 목록이다. 당겨서 새로고침을 지원하고, 우측 하단 `나눔하기` FAB 로 작성 화면(`/modal/market-new`)에 간다.
- 목록은 `GET /api/share`(`lastId`·`size` 커서, 선택 시 `categoryCode`), 내 나눔은 `GET /api/share/my` 로 받는다. 카테고리별로 목록 캐시를 따로 둔다.
- 상세(`/market/[id]`)는 나눔 탭 Stack 에 push 되며 `GET /api/share/{id}` 와 `GET /api/share/{id}/comments` 를 함께 부른다. 사진이 여러 장이면 가로로 넘겨 본다.
- 작성자는 상세에서 수정·삭제(`DELETE /api/share/{id}`)와 상태 변경(`PUT /api/share/{id}/status`, 시트에서 나눔중·예약중·나눔완료 선택)을 할 수 있다. (#247)
- 댓글은 `POST /api/share/{id}/comments`, `PUT`·`DELETE /api/share/comments/{commentId}`. 수정은 하단 입력창을 재사용하고, 삭제는 확인 후 진행한다.
- 작성은 `POST /api/share` multipart(제목·내용·카테고리·물품 상태·수령 장소·사진), 수정은 `PUT /api/share/{id}`. 수정 화면은 상세 조회 결과로 값을 채우고, 수정 여부는 `id` 파라미터로 정한다.
- 신고 UI 와 HTTP 신고는 연결돼 있지 않다. 신고 요청 코드도 두지 않는다(아래 미결).

## 데이터 타입

- 화면 모델: 목록 `MarketOverviewItem`(`thumbnailUrl?`, `status`, `category`, `authorName`, `isMine`), 상세 `MarketDetail`(`images?`, `imageItems?`, `location?`, `comments`). 작성 입력 `MarketInput`, 수정 입력 `MarketUpdateInput`.
- 상태 `SHARE_STATUS`: AVAILABLE → `sharing`, RESERVED → `reserved`, COMPLETED → `done`. 물품 상태 `SHARE_ITEM_STATUS`: NEW/USED/DAMAGED → 새것/사용감 있음/파손 있음. 카테고리 7개 코드는 `src/services/marketMapper.ts` 에 고정돼 있다(#312).
- 목록 DTO 에는 `authorName`·사진 배열이 없다. 목록 작성자 칸은 `authorId` 를 쓰고, 썸네일 URL 이 없으면 `thumbSeed` 기반 `VisualThumb` 를 그린다. 상세는 `authorName` 이 있으면 쓴다.
- `isMine` 은 `authorId === 현재 사용자 id`. `GET /api/share/my` 결과는 모두 `isMine: true`.
- 상대 경로 사진 URL 은 `readApiUrl()` origin 을 붙여 해석한다. DTO 는 `src/types/marketApi.ts`, 화면 모델은 `src/types/market.ts`.

## 결정 사항 (지금 유효한 것만)

- **`나눔중` 은 나눔중+예약중을 화면에서 거른다** — 서버 상태값 하나로 거를 수 없어서다. 받은 페이지에 맞는 글이 없으면 다음 페이지를 이어 받아 빈 화면을 잘못 띄우지 않는다. 예약중 글은 배지·overlay 로 구분한다.
- **내 나눔은 `GET /api/share/my` 로 조회한다** — 전체 목록의 `isMine` 필터가 아니라 전용 엔드포인트에 커서와 카테고리만 보낸다. 상태는 보내지 않아 세 상태를 함께 본다. (#195)
- **수정 시 사진은 `keepImageIds` 로 유지한다** — 남은 서버 사진 id 를 순서대로 보내고, 목록에 없는 서버 사진은 서버가 지운다. 새 사진이 있으면 multipart, 없으면 JSON 으로 보낸다. (#299)
- **수령 장소(`location`)는 등록·수정 모두 보낸다** (#295)
- **사진은 업로드 직전 긴 변 1600px·JPEG 0.8 로 줄인다** — `resizeImageForUpload`(`expo-image-manipulator`)로 변환하고 실패하면 원본을 올린다. 피커는 quality 기본값(1)이라 압축은 이 한 번뿐이다.
- **사진은 1장 이상 필수, 최대 5장** — Notion 운영 정책. 제목 30자, 상세 설명 5~500자.
- **신고는 HTTP 로 보내지 않는다** — 신고 사유 `reportReasonCode` enum 이 공통 코드·Swagger 에 없어 예시 문자열로 추측하지 않는다. 프런트 사유 key 와 서버 code 는 분리해 두고, enum 이 정해지면 mapper 가 변환한다.
- **무료 나눔만 다룬다** — 가격·결제는 범위 밖이다.
- **상세 배지 색은 뜻으로 고른다** — 상태 배지는 나눔중 success · 예약중 warning · 나눔완료 neutral, 그 뒤 카테고리 info · 물품 상태 neutral.
- **작성·수정 폼만 섹션마다 흰 카드에 담는다** — 순서는 사진 → 제목 → 카테고리 → 물품 상태 → 상세 설명 → 수령 장소. 다른 작성 화면(기도제목·소모임 개설 등)은 카드 없이 둔다.
- **디자인 미리보기는 개발 빌드 전용** — 목록·상세·작성의 시안 상태는 `designVariant` 로만 열고 `__DEV__` 에서만 읽는다. 실제 상태는 API 와 query 결과가 정한다.

## 미결

- 나눔 카테고리 목록이 하드코딩돼 있다 — 사용자용 카테고리 목록 API 필요. #312
- 사진 업로드 후 이미지 URL 404 — 백엔드 정적 파일 서빙 확인 필요. #217
- 신고 사유 enum·신고 후 블라인드/관리자 큐 정책이 정해지지 않아 신고를 연결하지 못한다.

## 코드 위치

- 화면: `app/(tabs)/market/`, 작성·수정: `app/modal/market-new.tsx`
- 상세 부품: `src/components/market/detail/`
- 데이터: `src/services/market*`, `src/hooks/useMarket.ts`, `src/types/market*`
- 사진 축소: `src/lib/resizeImage.ts`, 계약 검사: `scripts/api-contract/market.mjs` (`npm run test:api:contract -- market`)

## 의존성 · 관련 ADR

- common 의 UI 컴포넌트(이미지 선택 포함), `queryKeys`, `queryClient`, `apiClient`
- auth 의 현재 사용자(`isMine` 계산)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
