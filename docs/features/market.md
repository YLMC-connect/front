# market (나눔)

> 마지막 갱신: 2026-07-14 | 담당 Phase: P1/P2/P7 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

성도 간 무료 나눔 글을 등록하고 상태/댓글/신고를 관리합니다.

---

## ✅ 완료

- 나눔 sticky 탐색 control — 상태 세그먼트와 카테고리 필터를 타이틀 아래 같은 glass로 함께 고정하고, 아래 12px 스크롤에서 숨긴 뒤 위 4px에서 200ms로 재표시
- 나눔 glass sticky 헤더 — `이웃과 물건을 나누며 따뜻함을 전해요` 보조 설명을 제목 아래 표시하고 상태 탭·카테고리 필터·카드 목록을 하나의 스크롤로 묶어 기본 배경색 기반 blur 타이틀 뒤로 지나가게 적용하며 검색·FAB 위치는 유지
- 나눔 필터·상태 탭 모션·정렬 보정 — 카테고리 선택 배경의 20px 위치 오차를 제거하고 상태 query를 현재 화면에서 갱신해 `전체·나눔중·예약중·나눔완료` indicator 이동을 유지하며 상태 탭의 위·아래 여백을 4px로 통일
- 나눔 카테고리 이동 필터·상세 Stack 적용 — 가변 너비 선택 배경을 200ms로 이동하고 category query를 목록 주소에 보존하며, 상세를 나눔 탭 Stack에 push해 뒤로가기 시 같은 필터·목록으로 복귀
- 나눔 상세 뒤로가기 구분성·동행 카드 기준 동기화 — 이미지 위 `아이콘 + 뒤로`의 68x44px 대비 surface에 1px 경계를 추가하고, 나눔의 96px 썸네일·16px padding/radius·경계·shadow를 동행 전체 모임 카드의 공통 기준으로 사용
- 나눔 목록 카드·댓글 입력 배경 정리 — 상태 탭·카테고리 필터는 44px 터치 높이와 12px 구획 간격을 보장하고, 목록 항목을 흰 surface·옅은 경계·약한 그림자의 독립 카드로 통일해 행 구분선을 제거했으며, 상세 댓글 composer와 입력창은 기존 geometry를 유지한 채 배경만 투명하게 변경
- 나눔 목록 디자인 시스템 적용 — 화면/카드/보조문구 typography, 20px 화면 여백, 96px 기존 추상 썸네일, Skeleton 로딩, 행동 가능한 empty state와 오류 재시도, 절제된 FAB를 적용
- 나눔 작성·탐색 mock 흐름 연결 — 사진/카테고리/상태/제목/설명/수령 장소를 실제 입력·검증해 mock service에 저장하고 상세 이동·목록 재조회까지 연결했으며, 목록 카테고리 필터와 제목/작성자 검색을 활성화
- 나눔 상세 action·mini action과 작성 폼 section/divider 공통화 — 기존 geometry·testID·댓글 CRUD 동작을 유지하면서 공통 UI 파일로 이동
- 나눔 목록/상세/작성 화면 구현 — `app/(tabs)/market/index.tsx`, `app/(tabs)/market/[id].tsx`, `app/modal/market-new.tsx`
- 나눔 타입과 mock 데이터 구현 — `src/types/market.ts`, `src/mocks/market.ts`
- 이미지 선택/미리보기 연결 — `ImagePickerField`에서 선택한 URI를 `MarketInput.images`로 저장하고 목록/상세 썸네일에 표시
- 상태 변경, 댓글 등록, 신고 접수 mock mutation 구현
- 검색, 관심 목록, 신고 사유 선택, 활성 나눔 5개 제한, 사진 필수 검증 구현
- 나눔 목록 1차 디자인 정렬 — ZIP prototype 기준 접힌 검색, 상태 segmented tabs, category chips, compact row list, bottom-right FAB 적용
- ZIP 원본 나눔 화면 23개 상태 매핑 — 목록/상세/작성 variant를 reference 화면으로 접근 가능하게 연결
- ZIP 110개 visual inventory 재검증에 포함 — 나눔 reference 화면을 Dev Client capture/compare 대상에 유지
- 나눔 상세 원본 시각 정렬 — ZIP JSX 기준 정사각형 사진 hero, 예약중/나눔완료 overlay, 상태 안내 배너, 작성자/카테고리/액션 영역을 reference 화면에 반영
- 나눔 상세 댓글/고정 composer 정렬 — ZIP `ScreenMarketDetail` 기준 댓글 리스트, 수정/삭제/신고 mini action, 하단 glass comment composer, 멀티라인 preview card를 reference 화면에 반영
- 나눔 상세 partial visual compare 개선 — `market-detail-*` 10개 원본/앱 캡처를 재생성해 `missing=0` 확인, 대표 residual은 `done 42.63→30.38`, `status 35.99→26.25`, `delete 41.43→17.34`, `report-dup-toast 34.04→32.72`로 감소
- 나눔 상세 toast/viewport 정렬 — ZIP toast 문구와 `offset=106`을 맞추고 디자인 viewport 캡처로 재검증해 `missing=0`, `report-dup-toast 32.72→28.92`, `status 26.25→13.29`, `delete 17.34→11.62`, `done 30.38→20.54`로 감소
- 나눔 상세 safe-area/sheet geometry 정렬 — ZIP 44px status frame과 bottom action 위치 기준으로 `Screen`을 조정하고 긴 `RadioSheet` compact row를 적용해 `missing=0`, `report 18.50→11.50`, `report-dup-toast 28.92→15.73`, `done 20.54→11.17`, `status 13.29→7.51`로 감소
- 나눔 작성 원본 구조 정렬 — ZIP `ScreenMarketCreate` 기준으로 close/action topbar, 사진 레일, 7개 카테고리 chip, 제목/물품상태/상세설명 section, 안내 박스, 작성 중단 dialog, 5개 제한 toast를 reference 화면에 반영
- 나눔 작성 partial visual compare 개선 — `market-create*` 5개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `limit-toast 32.50→15.21`, `create 12.56→12.04`, `back-warn 8.76→7.63`, `create-filled/edit 14.21→14.11`로 감소
- 나눔 목록 ZIP compact row 재정렬 — ZIP `ScreenMarketList` 기준으로 카드 wrapper를 제거하고 full-width row, 86px `Thumb`, divider, 예약/완료 overlay, 8개 카테고리 chip 순서를 reference 화면에 반영
- 나눔 목록 partial visual compare 개선 — `market-list*` 6개 상태를 Android Dev Client에서 재캡처해 `missing=0` 확인, 대표 residual은 `market-list-all 20.56→15.44`, `market-list 14.24→12.27`, `market-list-reserved 10.80→8.31`, `market-list-done 12.35→7.77`로 감소
- 나눔 상세 action compact 정렬 재검증 — ZIP `ActionBtn` inline 구조를 공통 reference action에 반영한 뒤 `market-detail*` 정상 상태 10개를 재캡처해 `missing=0` 확인
- ZIP `Thumb` proportional geometry 재검증 — 공통 `VisualThumb`을 ZIP `Thumb` SVG circle 수식에 맞춘 뒤 나눔 목록/상세/작성/관심 목록 영향 화면을 Android Dev Client에서 재캡처하고 `missing=0` 확인
- 나눔 목록 FAB root overlay 정렬 — 공통 FAB를 ZIP pill surface로 복구하고 목록 20-25번을 재캡처해 `market-list-all 15.27→13.75`, `market-list 12.15→10.64`, `reserved 8.36→6.79`, `done 7.83→6.31`로 낮춤
- 나눔 상세 typography/chip/scrim 정렬 — ZIP `ScreenMarketDetail` 기준으로 overlay back, hero scrim, 작성자명, soft chip, 제목/본문 text metric, 예약 배너 색상을 맞추고 26-35번을 재캡처해 `own 14.53→9.31`, `reserved 14.15→9.36`, `other 14.46→9.34`, `composer-multiline 12.75→9.47`, `report-dup-toast 14.76→10.00`로 낮춤
- 나눔 작성 topbar/chip/control typography 정렬 — ZIP `ScreenMarketCreate` 기준으로 56px topbar rhythm, close pill, action width, chip padding/font, section label/hint/control weight를 맞추고 38-42번을 재캡처해 `limit-toast 14.99→14.62`, `create-filled 14.01→13.69`, `edit 14.01→13.70`으로 낮춤
- 나눔 목록 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketList`의 상태 탭, 카테고리 칩, 86px thumb row, 예약/완료 overlay, fixed FAB 구조를 `/market` route에 RN으로 직접 반영
- 나눔 상세 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketDetail`의 정사각형 hero, 상태 overlay/banner, 작성자/칩/본문, 액션 row, 댓글, 하단 composer 구조를 `/market/[id]` route에 RN으로 직접 반영
- 나눔 작성 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenMarketCreate`의 close/action topbar, 사진 레일, 카테고리 chip, 제목/물품상태/상세설명 section, 안내 박스를 `modal/market-new` route에 RN으로 직접 반영
- 나눔 API 계약 게이트 추가 — `npm run test:api:contract:market`으로 CRUD·댓글·신고·이미지 업로드 endpoint와 목록/상세 화면 요구 필드를 자동 검증
- 나눔 조회 데이터 경계 추가 — 목록·상세·댓글 fixture를 화면에서 `mockMarketDataSource`로 이동하고 `useMarketOverview`/`useMarketDetail` query를 통해 렌더링하며 미사용 중복 mock 목록 제거
- 댓글 CUD 수직 경계 연결 — 상세 composer와 내 댓글 action을 create/update/delete hook → service → `MarketDataSource` mutation으로 연결하고, mock 재조회 유지·Query cache 갱신·수정 취소·삭제 확인과 Android Maestro 등록/수정/삭제 흐름을 검증
- 댓글 삭제 CI flake 제거 — 1초를 넘을 수 있는 mock mutation 완료 assertion에 5초 제한을 명시하고 대상 테스트 5개 병렬 실행·전체 validate로 안정성 확인
- 게시글·댓글 신고 수직 경계 연결 — 디자인 기준 8개 사유를 선택 가능한 `RadioSheet`로 복구하고 `useReportMarketContent → marketService → MarketDataSource` mutation, 기타 상세 검증, 중복 신고 도메인 오류·toast를 Android Maestro로 검증
- 신고 디자인 variant 상태 누수 제거 — route query가 바뀔 때 report sheet/기타 입력/중복 toast를 development 전용 effect로 동기화하고 부분 시각 residual을 `10.73/10.29/13.78`로 확인
- 나눔 게시글 삭제 수직 경계 연결 — 소유 게시글 삭제를 `useDeleteMarketPost → marketService → MarketDataSource`로 연결하고 상세·목록 mock 지속성, overview/detail query 정리, 삭제 확인 후 목록 복귀를 Android Maestro로 검증
- 게시글 삭제 확인 디자인/실제 상태 통합 — 실제 삭제와 `delete-confirm` 캡처가 같은 `ConfirmDialog`를 사용하도록 분리하고 원본 문구를 적용해 해당 residual을 `19.52→16.65`로 개선

## 주요 파일 (도메인 파일 지도)

| 경로                                    | 역할                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| `app/(tabs)/market/_layout.tsx`         | 나눔 목록·상세 중첩 Stack                                        |
| `app/(tabs)/market/index.tsx`           | 나눔 목록, 상태/카테고리 필터                                    |
| `app/(tabs)/market/[id].tsx`            | 나눔 상세, 게시글 삭제, 댓글, 신고                               |
| `app/modal/market-new.tsx`              | 나눔 작성 모달                                                   |
| `src/mocks/market.ts`                   | 나눔 mock 데이터                                                 |
| `src/services/marketService.ts`         | 교체 가능한 나눔 조회·게시글 삭제·댓글 CUD·신고 data source 경계 |
| `src/hooks/useMarket.ts`                | 나눔 query와 게시글 삭제·댓글 CUD·신고 mutation hook             |
| `src/constants/domainOptions.ts`        | 나눔 카테고리/상태/신고 사유 옵션                                |
| `src/types/market.ts`                   | 나눔 타입                                                        |
| `scripts/check-market-api-contract.mjs` | 나눔 Swagger endpoint·화면 요구 필드 검사                        |

## 데이터 타입

`MarketItem`은 `images: string[]`, `status: sharing | reserved | done`, `comments`, `liked`, `condition`, `location`을 포함합니다. 화면 조회 모델 `MarketOverview`/`MarketDetail`은 목록 표시값, 작성자 소유 여부, 댓글 상태를 포함하며 API DTO mapper의 출력 경계입니다. 게시글 삭제 대상은 `MarketPostTarget`, 댓글 CUD는 `MarketCommentInput`, `MarketCommentUpdateInput`, `MarketCommentTarget`으로 게시글 ID와 댓글 ID를 구분하고 결과는 목록/상세 제거 또는 `MarketDetailComment` 삭제 tombstone으로 정규화합니다. 신고는 `MarketReportInput`에서 게시글/댓글 대상, 프런트 사유, 선택 상세를 분리하며 서버 enum이 확정되면 HTTP mapper가 코드 변환을 소유합니다. `MarketInput`은 Notion MVP 기준 사진 필수이므로 `images: string[]`를 1장 이상 받습니다.

## 결정 사항 (최신 위)

- (2026-07-14) **나눔 상태·카테고리 control은 처음부터 한 묶음으로 sticky 처리한다** — 116px 영역을 타이틀과 같은 glass로 고정하고 아래 12px 스크롤에서 숨기며 위 4px에서 200ms로 함께 재표시합니다. 최초 렌더·동작 줄이기에서는 불필요한 이동을 실행하지 않습니다.
- (2026-07-14) **나눔 상태·카테고리·목록은 glass 타이틀 아래 하나의 스크롤을 사용한다** — 타이틀은 기본 배경색 blur로 고정하고 하단 border 없이 콘텐츠가 뒤를 통과하며 검색 action과 fixed FAB는 기존 위치를 유지합니다.
- (2026-07-14) **나눔 카테고리 indicator는 padding 없는 공통 track 좌표를 사용한다** — 화면 좌우 20px 여백은 ScrollView content로 분리하고 필터와 indicator의 좌표 원점을 일치시켜 선택 배경의 20px 오프셋을 제거합니다.
- (2026-07-14) **나눔 필터·상태 query는 200ms 모션 뒤 갱신한다** — 선택 UI와 목록은 즉시 전환하고 category/status query는 indicator 이동 종료 뒤 `setParams`로 반영해 URL remount가 모션을 끊지 않으며 다른 query를 유지합니다.
- (2026-07-14) **나눔 카테고리는 이동 indicator와 route query를 함께 사용한다** — 44px 가변 너비 필터의 선택 배경은 200ms로 이동하고 `category` query는 현재 목록 route에만 반영해 상세 뒤로가기에서 선택과 결과를 복원하되 별도 방문 이력을 늘리지 않습니다.
- (2026-07-14) **나눔 전체 카드는 동행 전체 모임과 외곽 geometry를 공유한다** — 96px 썸네일, 16px padding/radius, 1px 경계, 동일 shadow와 12px 간격을 공통 기준으로 사용하며 상품 제목·작성자 정보는 나눔 도메인에 맞게 유지합니다.
- (2026-07-14) **나눔 탐색 구획은 터치 영역을 분리한다** — 상태 탭과 카테고리 필터는 각각 44px 높이를 유지하고 flex 축소를 막으며, 상태 탭-필터-첫 카드와 카드 사이는 12px 간격으로 분리해 인접 터치 영역이 겹치지 않게 합니다. 목록 카드는 흰 surface, 옅은 1px 경계, 둥근 모서리와 약한 그림자를 사용하고 행 divider는 두지 않습니다.
- (2026-07-14) **댓글 입력 영역은 배경만 투명하게 한다** — 고정 composer와 pill 입력창의 크기·위치·테두리·전송 버튼은 유지하고 배경 alpha만 제거합니다. 이미 투명한 신고 입력과 고정 surface를 쓰는 검색·작성 폼은 변경하지 않습니다.
- (2026-07-12) **부분 폐기됨: 나눔은 사진 asset 추가 없이 정보 계층만 개선한다** — 기존 `VisualThumb`와 제목·작성자/시간 계층, 이미지 작업 제외 결정은 유지하지만 flat row는 2026-07-14 카드 결정으로 대체합니다. 실제 물품 사진은 업로드/API 계약 작업에서 다룹니다.

- (2026-07-12) **나눔 작성은 API 계약 전에도 service mutation 경계를 통과한다** — 작성 화면은 fixture를 직접 변경하지 않고 `useCreateMarketPost → createMarketPost → MarketDataSource`를 사용합니다. 생성 결과는 runtime mock 목록/상세에 유지하고 실제 API 연결 시 data source/mapper만 교체합니다.

- (2026-07-11) **게시글 삭제는 작성·수정 계약과 분리해 완결된 mock 수직 흐름으로 제공한다** — 삭제는 게시글 ID와 소유권만 필요하므로 data source에서 최종 검증하고, 성공 시 overview에서 제거하고 detail query를 폐기한 뒤 나눔 목록으로 이동합니다. 작성·수정은 위치 입력과 이미지 업로드 계약이 없으므로 일부 필드를 임의로 채우지 않습니다.
- (2026-07-11) **게시글 삭제 확인은 실제 상태와 디자인 variant가 같은 공통 dialog를 사용한다** — 실제 버튼은 local state를 열고, development 전용 `delete-confirm`은 route query 변화 effect로만 같은 상태를 동기화해 production mutation을 덮지 않습니다.
- (2026-07-11) **신고 사유는 프런트 도메인 값과 서버 code를 분리한다** — 화면은 디자인 원본의 8개 사유 key를 사용하고, mock data source는 대상 단위 중복만 검증합니다. Swagger의 `targetType/reportReasonCode` enum과 오류 code가 확정되기 전에는 예시 문자열을 HTTP 값으로 추측하지 않으며 계약 gate가 두 enum을 요구합니다.
- (2026-07-11) **신고 디자인 variant는 query 변화에 맞춰 effect로 동기화한다** — 캡처 스크립트가 같은 상세 컴포넌트에서 route query만 바꾸므로 `report/report-other-input/report-dup-toast` 상태를 development 전용으로 초기화합니다. 실제 신고 mutation은 query가 변하지 않아 이 effect와 독립적입니다.
- (2026-07-11) **비동기 UI 테스트는 기능 timeout과 assertion timeout을 분리한다** — mock 지연이 CI 병렬 부하에서 Testing Library 기본 제한을 넘을 수 있으므로, 삭제 완료 상태를 확인하는 assertion에만 5초를 허용하고 production mutation 시간은 변경하지 않습니다.
- (2026-07-11) **댓글 수정은 composer를 재사용하고 삭제는 확인 후 tombstone으로 바꾼다** — 별도 편집 화면 없이 내 댓글 action이 composer의 편집 대상을 설정하며, 삭제는 네이티브 확인 이후 성공할 때만 cache와 mock 저장소를 갱신합니다. 다른 작성자의 댓글 변경은 data source에서도 거부하고 신고는 사유 선택 UI·오류 code 확정 전까지 연결하지 않습니다.
- (2026-07-11) **댓글 등록은 계약 확정 전에도 완전한 mock 수직 흐름으로 유지한다** — 화면은 data source를 직접 호출하지 않고 hook mutation만 사용하며, service는 공백 댓글을 차단하고 입력을 정규화합니다. 성공 결과는 상세 query cache에 반영하고 mock data source에도 보관해 재조회와 HTTP 교체 시 화면 소비자를 유지합니다.
- (2026-07-11) **나눔 핵심 흐름은 오류 코드가 문서화되어야 HTTP로 전환한다** — 상세·등록·수정·삭제·댓글 등록/수정/삭제·신고의 4xx/5xx code가 Swagger에 있어야 화면 메시지 표를 확정할 수 있습니다. 신고 enum 누락 2건과 오류 문서 누락 8건을 포함한 전체 누락은 38건입니다.
- (2026-07-11) **나눔 request 계약은 PLAN의 작성 필드와 화면 제한을 함께 검증한다** — 생성·수정은 제목/내용/카테고리/물품상태/장소를 필수로 요구하고 제목 30자, 내용 500자, 사진 5장과 입력 enum을 확인합니다. 현재 Swagger와 PLAN 사이의 장소 필드 충돌을 포함한 전체 누락은 28건입니다.
- (2026-07-11) **이미지 업로드도 나눔 계약 gate에 포함한다** — 게시글 `images` 필드만으로는 로컬 URI를 서버 URL로 바꿀 수 없으므로, 경로를 가정하지 않고 이미지/파일 업로드 operation을 찾아 request/200 DTO까지 확인합니다. 현재 누락은 기존 13건에 업로드 endpoint 1건을 더한 14건입니다.
- (2026-07-11) **나눔 화면은 계약 확정 전에도 mock data source를 사용한다** — HTTP DTO/enum mapper 활성화는 기존 13건 계약 gate 뒤로 유지하되, 목록·상세 화면은 `useMarket* → marketService → mockMarketDataSource`를 소비합니다. 계약 확정 후 화면이 아니라 data source만 교체합니다.
- (2026-07-10) **나눔 디자인 상태와 API 상태를 분리한다** — 목록 empty/error/status, 상세 권한·예약·완료·예외, 작성 form 상태는 `designVariant`로만 캡처하며 production에서는 무시합니다. 실제 상태는 API mapper와 query/mutation 결과로 결정합니다.
- (2026-07-10) **나눔 mapper는 화면 필수 계약 13건 해소 후 활성화한다** — 목록의 `authorName/images/keyword`, 상태·카테고리·물품상태 enum, 이미지 필수 정책, 상태 변경 endpoint가 Swagger에 없어 현재 HTTP 전환은 작성자 ID 노출·썸네일 소실·코드 추측을 유발합니다. `test:api:contract:market` 통과 전에는 기존 mock 화면을 유지합니다.
- (2026-06-27) **미사용 service/hook/card 레이어는 제거한다** — 현재 나눔 화면은 Downloads 원본을 기준으로 다시 구현할 예정이고 `MarketItemCard`, `marketService`, `useMarketItems` 호출처가 없어, 실제 API 연결 시 필요한 표면만 다시 만든다.
- (2026-06-27) **나눔 목록은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketList` 구조를 `/market` route에 직접 반영하고, 상태별 variant는 query parameter에서 필요한 범위만 해석합니다. 별도 service/hook은 실제 API 스키마 확정 전까지 만들지 않습니다.
- (2026-06-27) **나눔 상세는 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketDetail`의 기본 상세 구조를 `/market/[id]` route에 직접 반영합니다. 신고/상태 변경 sheet 같은 예외 variant는 실제 필요 시 작은 overlay로 추가합니다.
- (2026-06-27) **나눔 작성은 placeholder가 아니라 실제 RN 화면으로 렌더링한다** — Downloads `ScreenMarketCreate`의 기본 작성/입력 완료/edit/limit-toast 구조를 `modal/market-new` route에 직접 반영합니다. 실제 저장 API는 스키마 확정 전까지 붙이지 않습니다.
- (2026-05-27) **나눔 작성 topbar/control은 ZIP `ScreenMarketCreate` metric을 따른다** — 작성/수정 reference는 ZIP `phone-topbar`의 56px rhythm과 700/600/500 weight 체계를 따르고, chip은 ZIP `.chip`의 12px semibold metric으로 번역합니다.
- (2026-05-27) **나눔 상세 text/chip은 ZIP 전용 metric을 따른다** — 상세 제목은 공용 `titleText`가 아니라 ZIP `20px/700/1.35`에 맞춘 전용 style을 쓰고, 카테고리/상태 chip도 dark selected chip이 아닌 ZIP `chip soft` 톤으로 렌더링합니다.
- (2026-05-27) **나눔 목록 FAB는 ZIP fixed root layer를 따른다** — `ScreenMarketList`의 글쓰기 FAB는 list ScrollView 안 요소가 아니라 ZIP `Phone` root의 absolute pill button으로 관리합니다. 공통 `FloatingActionButton`은 정적 surface를 사용해 Android 캡처에서 pill 배경과 위치가 유지되도록 합니다.
- (2026-05-27) **나눔 thumbnail은 ZIP `Thumb` proportional geometry를 따른다** — 목록 86px thumb, 상세 360px hero, 작성/관심 목록 thumb 모두 같은 공통 `VisualThumb`를 쓰므로, circle 위치/크기/opacity는 ZIP `lib.jsx`의 `Thumb` SVG viewBox 수식을 size 비례로 번역합니다.
- (2026-05-27, 2026-07-14 폐기) **나눔 목록은 ZIP full-width row를 따른다** — row divider 구조는 사용자 확인에 따라 독립 카드 구조로 대체했습니다. 썸네일과 status overlay는 유지합니다.
- (2026-05-27) **나눔 상세 action은 ZIP `ActionBtn` inline 구조를 따른다** — 수정/삭제/상태 변경/신고/차단 action은 큰 원형 icon tile이 아니라 ZIP `screens-market.jsx`의 44px transparent inline icon+label button으로 번역합니다.
- (2026-05-27) **나눔 작성은 ZIP section form 구조를 따른다** — 작성/수정 reference는 카드형 폼이 아니라 ZIP 원본의 상단 `닫기`/등록 action, horizontal photo rail, 8px divider section, 7개 카테고리 chip, 상태 segmented button, 안내 박스를 기준으로 번역합니다.
- (2026-05-26) **나눔 상세 geometry는 ZIP phone frame 기준으로 본다** — Android native safe-area를 그대로 쓰는 대신 ZIP `phone-status` 44px와 bottom fixed composer 위치를 기준으로 맞춰야 원본 상세의 hero, 작성자, composer 위치가 일치합니다.
- (2026-05-26) **나눔 상세 toast는 ZIP `CheckToast offset={106}`을 따른다** — 하단 comment composer가 있는 나눔 상세의 중복 신고 toast는 기본 offset이 아니라 ZIP 원본처럼 bottom action area 위에 뜨도록 `offset=106`을 적용하고, 문구도 `이미 신고한 게시글입니다`로 맞춥니다.
- (2026-05-26, 2026-07-14 부분 폐기) **나눔 상세 reference는 ZIP 고정 comment composer를 따른다** — 하단 고정 위치와 멀티라인 preview card는 유지하지만 glass 배경은 제거해 composer와 입력창 모두 투명하게 표시합니다.
- (2026-05-26) **나눔 상세 hero는 ZIP `Thumb`를 직접 번역한다** — `VisualCover` 기반 wide cover 대신 ZIP의 정사각 `Thumb size=360 seed=0` 구조를 사용하고, 기본 `Thumb`에는 아이콘을 표시하지 않습니다.
- (2026-05-23) **나눔 상세는 full-bleed hero를 기준으로 한다** — 상세 reference 화면은 공통 TopBar 카드형 layout보다 ZIP 원본의 사진 hero + overlay back button + status banner 구조를 우선합니다.
- (2026-05-23) **나눔 원본 상태는 `variant` 라우트로 검증** — 현재 서비스 기반 화면을 유지하되 `?variant=...`가 있으면 ZIP 원본의 목록/상세/작성 상태를 mock-first reference 화면으로 렌더링합니다.
- (2026-05-23) **목록 검색은 상단 아이콘으로 접기** — ZIP prototype 톤에 맞춰 기본 목록은 상태/카테고리 탐색을 먼저 보이고, 검색 입력은 상단 검색 아이콘으로 펼치되 기존 검색 로직은 유지합니다.
- (2026-05-23) **나눔 카드 기본형은 compact row** — 목록 화면은 이미지 썸네일, 상태 badge, 제목/위치/시간을 한 줄 흐름으로 읽는 row를 기본으로 하고, 홈 요약 영역은 별도 2열 card grid를 사용합니다.
- (2026-05-22) **나눔은 무료 나눔만 MVP 포함** — 가격/결제는 MVP에서 제외하고 상태 변경과 댓글만 둡니다.
- (2026-05-22) **Notion 운영 정책 일부를 mock service에서 검증** — 진행 중인 내 나눔은 최대 5개, 사진은 1장 이상 필수입니다.
- (2026-05-22) **이미지는 로컬 URI 우선** — 실제 업로드 API가 없으므로 `expo-image-picker` URI를 mock 데이터에 저장해 UI 흐름을 검증합니다.

## 미결 / 추적

- Swagger 목록 작성자명·대표 이미지·검색, 상세/작성 장소, 입력·응답·신고 enum, 제목/본문/사진 제한, 이미지 필수, 상태 변경·이미지 업로드 endpoint, 핵심 흐름 오류 코드 38건 확정 필요. 장소를 백엔드 계약에 추가할지 최신 기획에서 제거할지도 명시적으로 결정해야 합니다. 단일 출처는 Issue #19이며 `npm run test:api:contract:market`으로 확인합니다.
- 신고 처리 후 블라인드/관리자 큐 정책은 API/운영 정책 확정 후 반영.
- 나눔 작성 residual은 topbar/chip/control typography 정렬 후 `market-create-limit mean=14.62`, `market-create-fill mean=13.69`, `market-edit mean=13.70`, `market-create mean=12.22`, `market-create-back mean=7.72`입니다. 빈 작성/뒤로가기 화면은 status bar/time, RN font metrics, confirm overlay geometry 차이로 소폭 상승했지만 화면군 합계는 감소했습니다.
- 나눔 목록 residual은 FAB root overlay 정렬 후 `market-list-all mean=13.75`, `market-list mean=10.64`, `market-list-reserved mean=6.79`, `market-list-done mean=6.31`입니다. 남은 차이는 native status bar/time, RN font metrics, tab bar geometry와 목록 row text metric 차이로 추적합니다.
- 나눔 상세 residual은 신고 variant 재연결 후 `market-detail-report mean=10.73`, `report-other-input mean=10.29`, `report-dup-toast mean=13.78`이며, 게시글 삭제 확인 문구·공통 dialog 연결 후 `market-detail-delete-confirm mean=16.65`입니다. 부분 캡처 compare의 missing 수치는 선택 index만 출력 폴더에 둔 결과라 전체 회귀 수치로 사용하지 않으며, 대상 PNG 존재와 residual만 확인했습니다. 남은 차이는 RN font metrics, native shadow/blur 번역, sheet/input capture 조건으로 추적합니다.

## 의존성

- common 도메인의 UI, `queryKeys`, `queryClient`, 이미지 선택 컴포넌트에 의존합니다.
- auth 도메인의 mock 현재 사용자에 의존합니다.

## 관련 ADR

- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
