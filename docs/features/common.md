# common (공통 인프라)

> 마지막 갱신: 2026-07-15 | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

---

## ✅ 완료

> AI 의 Pass 0/1 에서는 본 섹션을 **스킵** 합니다. 결과물 재사용 트리거가 있을 때만 본문 정독.
> 끝난 작업의 결과만 짧게. 상세 변경 이력은 머지된 PR description (`gh pr list --state merged --label common`).

- sticky controls 구성 전환 재표시 기준 — 공통 `StickyHeaderScreen`이 선택적 reveal key 변경 시 숨김 상태와 방향 누적값을 초기화하도록 지원해 동행의 세그먼트·필터 결합 직후 메뉴를 먼저 표시하면서 다른 화면의 기존 12px/4px 정책은 유지
- 동행 소모임·봉사 카드 프레임 통일 — 동행 루트의 두 세그먼트가 화면 전용 `CompanionCard`를 공유해 96px 썸네일·16px padding/radius·경계·shadow와 정보 계층을 맞추고 도메인별 메타만 분리
- 상세 뒤로가기 surface 통일 — 나눔 이미지 hero의 흰색 RGBA·카드 그림자 예외를 제거해 일반 상세와 같은 `surface2`·1px 경계를 사용하고 공통 68×44px geometry·label·press motion을 유지
- 페이지 뒤로·화면 내부 닫기 의미 보완 — 홈에서 진입하는 MY와 인증 약관 page에 공통 `chevron-left + 뒤로`를 연결하고 약관 전문 sheet의 icon-only action을 `close + 닫기`로 보완했으며 확인 dialog의 `취소` 선택 문구는 유지
- Solar 의미·기본 action glyph 보정 — 기도 탭을 `Hearts` Linear/Bold로 표시하고 Solar에 단독 형태가 없는 추가·닫기는 공통 `AppIcon` 내부의 원 없는 2px rounded stroke로 표시해 기존 크기·색상·문구·접근성·모션을 유지
- Solar Icons 전환 — 29개 앱·공통 파일의 Material 아이콘을 공통 `AppIcon` 기반 Solar Linear/Bold SVG로 교체하고 하단 탭 선택 상태만 Bold로 강조했으며 기존 접근성 label·문구·크기·모션을 유지
- 플로팅 버튼 행동 문구 명확화 — 공통 `FloatingActionButton`의 label을 필수로 만들고 화면 텍스트와 기본 접근성 이름에 함께 사용해 나눔 `나눔하기`, 동행 `소모임 개설`, 기도 `기도제목 작성`으로 통일
- 섹션 전체보기 action 공통화 — 제목 오른쪽에 `전체보기 + chevron-right`를 표시하는 44px `SectionHeader`를 추가하고 press motion·접근성 label을 통일해 기도와 동행에서 재사용
- 뒤로가기 헤더 중앙 정렬·라벨 통일 — 공통 `TopBar`가 왼쪽 68px 뒤로 버튼과 우측 action 유무에 관계없이 제목 중심을 화면 중심에 고정하고, 전체 화면을 이전 스택으로 닫는 action은 `chevron-left + 뒤로`로 통일하되 검색·패널·dialog·sheet의 내부 닫기는 유지
- 공통 검색 입력·헤더 action 정리 — 내부 웹 outline을 제거하고 검색 surface 전체에 단일 2px focus border를 적용했으며, 검색/닫기를 아이콘+텍스트로 표시하고 검색 중에는 숨겨진 sticky control을 다시 노출
- 공통 sticky 세그먼트·필터 레이어 — 상단 타이틀과 같은 `theme.colors.bg` 72%·intensity 32 glass를 재사용하고, 아래 스크롤 숨김·짧은 위 스크롤 200ms 재표시와 동작 줄이기를 지원
- 루트 탭 glass sticky 헤더 — 홈·나눔·동행·기도·삶공부의 검색·필터·목록을 하나의 스크롤로 묶고, 기본 배경색 기반 반투명 blur 헤더를 화면 상단에 고정해 콘텐츠가 뒤로 지나가도록 적용
- 필터·세그먼트 indicator·정렬 보정 — 화면 좌우 20px 여백을 측정 track 밖으로 이동해 가변 필터 배경을 실제 칩 경계에 정렬하고, 세그먼트는 위·아래 4px 여백과 18px line-height로 수직 중앙을 맞춘 채 화면을 교체하지 않는 query 갱신으로 200ms 이동을 유지
- 카테고리 필터 이동 모션·탭별 상세 Stack 보정 — 가변 너비 `FilterChips`가 실제 항목 위치·너비까지 200ms로 이동하고, 나눔·동행·기도·삶공부 상세는 각 탭 중첩 Stack에 쌓여 뒤로가기 시 직전 목록으로 복귀하도록 정리
- 뒤로가기 구분성과 나눔·동행 카드 톤 보정 — 일반 상세의 `아이콘 + 뒤로`에 옅은 surface·1px 경계를 적용하고, 동행 전체 모임을 나눔과 같은 96px 썸네일·16px padding/radius·1px 경계·동일 shadow의 가로 카드로 맞춤
- 루트 탭·뒤로가기 상단 geometry 통일 — 홈/나눔/동행/기도/삶공부에 89px `ScreenHeader`를 적용해 제목 영역의 위·아래 여백을 20px로 맞추고, 일반 상세와 나눔 상세의 `아이콘 + 뒤로` 버튼을 `x=8`, `68x44px`로 통일하며 140ms press scale과 동작 줄이기를 적용
- 입력 배경 투명도 점검 — 반투명 alpha가 실제 입력 surface에 쓰인 나눔 상세 댓글 composer와 입력창만 투명하게 변경하고, 고정 surface 입력·상태 overlay·Skeleton은 유지
- 핵심 목록 카드 경계 복구 — 홈 활동 요약과 공통 `Card`에 흰 surface·둥근 모서리·옅은 1px 경계를 복구하고 역할형 typography·20px 여백·절제된 shadow·상태 UI는 유지
- 공통 디자인 시스템 2차 정리 — JSON 단일 소스의 semantic color·spacing·radius, 6단계 역할형 typography, layout·절제된 shadow 토큰과 `AppText`, pulse Skeleton/ListSkeleton, action 지원 Empty/Error/Success 상태를 구축하고 홈·핵심 탭·인증에 적용
- 전체 UI 정보 계층 고급화 — 홈 활동·동행 전체 모임·기도방/기도제목·삶공부 일반 과정을 flat list로 정리하고, 홈 핵심 활동·기도 오늘 진행률·삶공부 학습경로처럼 화면별 대표 요소를 유지·강화
- 홈 제외 핵심 화면 사용성 보강 — 공통 오류 상태에 선택적 재시도 액션을 추가하고 하단 탭 label 가독성, fixed FAB·composer가 있는 목록/상세의 마지막 콘텐츠 스크롤 여백을 보정
- 공통 모션 시스템 적용 — Reanimated 기반 140~220ms 모션 토큰, 동작 줄이기 대응, `MotionPressable`, 선택 적용 Card 등장, Dialog/Sheet/Toast presence 전환을 공통 UI에 반영
- 라우팅·공통 UI 유지보수 경계 정리 — 하단 5탭 metadata를 단일 설정으로 통합하고 navigator `any`를 제거했으며, 상세 action/badge, modal form section, underline tab을 역할별 공통 파일로 분리
- 탭 선택 indicator 공통화 — 하단 5탭은 이동 indicator와 선택 아이콘 pop을 사용하고, 나눔 상태 탭·동행 소모임/봉사·기도 작성 선택 탭은 공통 `SegmentedTabs` 이동 indicator를 공유
- 하단 탭 glass shell 적용 — floating 캡슐 안에 흰 tint 56%·intensity 32 blur를 적용해 배경과 구분하고, 캡슐 하단과 14px 겹치는 28px 영역에는 intensity 12 blur와 투명→흰색 46% 세로 gradient를 적용해 geometry·그림자·선택 indicator를 유지
- Expo Web 라이트 모드 충돌 해소 — NativeWind dark mode 제어 방식을 `class`로 맞춰 Gluestack의 `mode="light"` 강제 설정이 CSS interop의 `media` 정책과 충돌하지 않도록 수정
- Codex 작업 규칙 진입점 정리 — `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/INDEX.md`, `docs/MAINTENANCE.md`
- Expo SDK 55 앱 기반 생성 — `package.json`, `app.config.ts`, `eas.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`
- 공통 런타임/디자인 기반 생성 — `src/lib/queryClient.ts`, `src/lib/queryKeys.ts`, `src/lib/secureStore.ts`, `src/constants/theme.ts`, `src/components/ui/index.tsx`, `src/components/layout/Screen.tsx`
- Expo Dev Client 기반 추가 — `expo-dev-client`, `npm run start:dev-client`, `ios:dev-client`, `android:dev-client`, `eas.json` development profile
- 전역 에러 바운더리와 CI(`validate`) 추가 — `app/_layout.tsx`, `.github/workflows/ci.yml`
- 자동 테스트 게이트 추가 — `npm run validate`, Jest/RNTL smoke, Dev Client Metro smoke, Maestro v1 탭 E2E smoke
- Android Emulator 기반 Maestro smoke 실제 검증 — `maestro 2.6.0`, `Medium_Phone_API_36.1`, `com.ylmc.connect.dev`
- Android Emulator Maestro smoke 안정화 — emulator 감지 시 Metro 상태 확인은 `localhost`, Dev Client deep link는 `127.0.0.1` + `adb reverse`를 사용하고, Dev Client 안내 메뉴는 `.maestro/smoke.yml`에서 `Continue`/닫기 처리 후 앱 탭 검증으로 넘김
- `열린문커넥트.zip` 디자인 번역 1차 반영 — 홈 화면, floating tab bar, 주요 v1 탭 목록 화면, 공통 `VisualThumb`/`VisualCover`, 카드/버튼/입력/칩 터치 영역 조정
- `열린문커넥트.zip` 원본 화면 105개 라우트 매핑 — `variant` 기반 reference 화면으로 auth/home/market/group/prayer/study/me 전체 접근 경로 확보
- `열린문커넥트.zip` 원본 화면 110개 기준 갱신 — JSX inventory를 기준으로 `my-wishlist`, `notif-settings`, `support`, `inquiry`, `account`까지 포함하고 Dev Client 앱 캡처/비교 스크립트를 추가
- Dev Client Maestro smoke 시작 상태 고정 — Dev Client 안내 메뉴는 조건부로 닫고 `ylmc-connect:///` 루트 딥링크를 연 뒤 v1 탭 smoke를 실행해 이전 캡처 route/dialog 상태에 영향받지 않도록 함
- 숨김 상세 route 시각 기준 정렬 — 실제 pathname 기준으로 루트 탭에서만 floating tab bar를 표시하고, 상세/모달/확인 화면은 원본 ZIP처럼 하단 탭 여백을 제거
- 폐기된 ZIP 5탭 정보구조 재정렬 — 한때 루트 탭을 홈/나눔/소모임/동행/MY로 맞췄으나, Downloads preview 확인 후 홈/나눔/동행/기도/삶공부로 대체
- ZIP 공통 디자인 토큰/컴포넌트 정렬 — `app-tokens.css`, `halo-tokens.css`, 공통 JSX의 button/card/tab/form/dialog/sheet/toast 패턴을 `theme.ts`, 공통 UI, Screen, custom tab bar에 React Native 방식으로 반영
- ZIP TopBar/Avatar 공통 패턴 정렬 — 상세 화면 back pill은 `뒤로` label을 포함하고, Avatar는 ZIP `gradFor` 해시 팔레트와 같은 색상 기준을 사용
- ZIP `Thumb` 공통 패턴 정렬 — `VisualThumb`는 ZIP JSX처럼 icon prop이 있을 때만 아이콘을 렌더링하고, 기본 썸네일은 추상 도형만 표시
- Dev Client Maestro smoke 서버 선택 보강 — Dev Client가 `DEVELOPMENT SERVERS` 화면에 머물면 `.maestro/smoke.yml`에서 개발 서버를 먼저 선택한 뒤 v1 탭 smoke를 실행
- 디자인 viewport 기반 부분 캡처 옵션 추가 — `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1` 사용 시 Android Emulator를 1080x2160@480으로 임시 조정해 ZIP 360x720 논리 viewport에 맞춰 캡처하고, 캡처 후 원래 size/density로 복원
- ZIP frame safe-area 정렬 — `Screen`은 ZIP `phone-status` 44px frame을 기준으로 top offset을 맞추고, 하단 fixed action/tab 계열은 ZIP처럼 bottom inset 위로 과도하게 뜨지 않도록 bottom safe-area padding을 제거
- ZIP RadioSheet compact/footer 정렬 — 긴 radio 목록은 ZIP 신고 sheet처럼 20px radio mark와 12px row padding을 사용하고, sheet footer는 48px pill 버튼으로 맞춤
- RadioSheet 실제 선택 경계 추가 — 선택 callback·접근성 radio state·confirm disabled를 공통화해 디자인 reference와 실제 mutation form이 같은 sheet를 사용
- ZIP visual artifact 재생성 자동화 — `npm run test:visual:prepare`로 ZIP standalone HTML에서 110개 inventory/manifest/original PNG를 다시 만들고, full `npm run test:visual:compare`를 `screens=110`, `missing=0`으로 복구
- ZIP animated original settle 반영 — bottom sheet/toast animation이 끝난 최종 프레임을 기준으로 원본 PNG를 재생성하도록 `scripts/prepare-design-artifacts.mjs`에 `YLMC_PREPARE_RENDER_SETTLE_MS` 대기값을 추가
- Dev Client Maestro smoke 후행 메뉴 처리 보강 — 루트 딥링크 이후 늦게 표시되는 `Continue`/`Reload` developer menu도 조건부로 닫고 탭 검증을 진행
- Dev Client visual capture 메뉴 처리 보강 — design viewport override 시 입력 좌표는 `Override size`를 우선 사용하고, route 캡처 직전에 Expo Dev Client first-run menu를 짧게 dismiss해 overlay가 스크린샷에 섞이지 않도록 함
- HorizontalChips fixed row 보강 — non-scroll root screen에서도 ZIP chip row처럼 고정 높이를 유지하도록 horizontal ScrollView에 `flexGrow: 0`을 적용
- ZIP `ScreenNotifications` 구조 정렬 — 알림 reference 화면을 카드 목록이 아니라 ZIP의 `오늘`/`지난 알림` section label, unread soft row, circular icon, unread dot, `모두 읽음` top action 구조로 재구성
- ZIP `ActionBtn` compact action 정렬 — 나눔/소모임 상세 reference의 action button을 큰 원형 아이콘 카드가 아니라 ZIP의 44px inline icon+label button으로 재구성
- ZIP root overlay 패턴 정렬 — 멤버 관리처럼 list body와 Toast가 같이 있는 reference 화면은 `Screen` 기본 ScrollView에 Toast를 넣지 않고, 내부 ScrollView와 root fixed Toast layer로 분리
- ZIP bottom CTA surface 정렬 — 공통 `Button`의 Pressable style을 정적 surface로 확정해 Android Dev Client에서 배경/크기 없이 text만 보이던 bottom-flat CTA를 ZIP pill 버튼으로 복구
- auth/input 화면 부분 캡처 안정화 — route 진입 후 Dev Client dismiss 탭이 로그인/가입 버튼을 누르지 않도록 `YLMC_CAPTURE_DISMISS_AFTER_ROUTE=0` 옵션을 추가
- ZIP 홈 섹션 rhythm 정렬 — `ScreenHome` 기준 section header padding과 홈 소모임 카드 padding을 맞춰 `home` residual을 `16.96→15.42`로 낮춤
- 폐기된 ZIP 5탭 icon state 정렬 — 기존 홈/나눔/소모임/동행/MY 탭 아이콘 기준은 Downloads preview의 홈/나눔/동행/기도/삶공부 기준으로 대체
- ZIP `Thumb` proportional geometry 정렬 — 공통 `VisualThumb`의 추상 circle 위치/크기/opacity를 ZIP `Thumb` SVG 수식 기준으로 번역
- Maestro smoke ANR overlay 처리 보강 — Android Emulator가 일시적으로 `Process system isn't responding` dialog를 띄우면 `Wait`를 누른 뒤 Dev Client menu 처리와 5탭 smoke를 이어가도록 `.maestro/smoke.yml` 보강
- ZIP FAB root overlay 정렬 — 공통 `FloatingActionButton`도 정적 pill surface로 렌더링하고, FAB 사용 목록 화면은 body ScrollView와 root FAB layer를 분리해 ZIP `Phone` 구조에 맞춤
- 보수적 저장소 정리 — ZIP에서 재생성 가능한 루트 `index.html`, GitHub Issues 이관 후 남은 `.task-flow.conf`, 호출처 없는 준비 코드와 form/date-fns 의존성, 부정확해질 수 있는 RN reference 번역본을 제거하고, Downloads 원본과 peer dependency 연결 후보는 유지
- 홈 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `screens-home.jsx`의 프로필 카드, 오늘의 기도제목, 내 활동 요약 구조를 `/` route에 RN으로 직접 반영
- 알림 실제 화면 복구 — `DesignSourceScreens` placeholder 대신 Downloads `ScreenNotifications`의 오늘/지난 알림 section, unread row, circular icon, unread dot, 모두 읽음 action을 `/notifications` route에 RN으로 직접 반영
- 부정확한 reference/scaffold runtime 제거 — Downloads 원본이 확인된 화면은 실제 route로 옮기고, 원본 없는 reference route와 호출처 없는 modal/profile scaffold route를 삭제
- Downloads preview 탭 IA 재정렬 — 하단 탭을 홈/나눔/동행/기도/삶공부로 맞추고, MY는 홈 프로필 카드 진입으로 전환
- gluestack-ui Provider 적용 — `GluestackUIProvider`를 앱 루트에 연결하고, NativeWind/Tailwind 기존 설정은 유지
- 오래된 문서 정리 — GitHub Issues/PR로 이관된 archive 문서는 안내문만 남기고, PLAN.md의 폐기된 탭 설명을 최신 홈/나눔/동행/기도/삶공부 IA로 갱신
- CI lockfile 정합성 복구 — gluestack 전이 의존성의 peer 요구인 `@react-spectrum/provider@3.11.1`을 명시해 GitHub Actions의 `npm ci` 실패를 해소
- 공통 API transport 기반 추가 — 환경별 base URL, `{ code, message, data }` envelope 검증, Authorization 헤더, `ApiError` 정규화를 `src/lib/apiClient.ts`에 격리하고 단위 테스트 추가
- 공통 API 오류 문구 경계 추가 — `ApiError.code`를 도메인 메시지 표로 변환하고 네트워크/응답 형식 공통 문구와 미등록 코드 fallback을 분리
- 인증 API 계약 게이트 추가 — `scripts/check-auth-api-contract.mjs`가 Swagger의 구체 성공 DTO·회원 중복확인 `data.available`·공개 endpoint JWT 예외·security scheme 참조를 자동 확인
- 인증 401 복구 경계 추가 — 인증 요청의 동시 401을 단일 refresh로 합치고 성공 시 각 요청을 한 번만 재시도하며 공개 요청은 재발급 대상에서 제외
- 나눔 API 계약 게이트 추가 — Swagger CRUD·댓글·신고·이미지 업로드 endpoint와 목록/상세 화면 필드 누락을 `test:api:contract:market`으로 자동 판정
- OpenAPI 계약 검사 공통화 — 인증·나눔·동행 검사기의 로딩·endpoint·schema·enum·보안·제약 검사를 `openapi-contract-utils.mjs`로 통합하고 오프라인 Node 테스트를 `validate`에 포함
- 동행 API 계약 게이트 추가 — Swagger 주요 endpoint와 목록/관리 화면 필수 계약 누락을 `test:api:contract:group`으로 자동 판정
- 디자인 상태 query 분리 — Dev Client 캡처 전용 `designVariant`를 production에서 무시하고 실제 동행 segment·MY 활동 탭은 `section`·`tab` query로 분리
- faith 루트 데이터 경계 정리 — 기도·삶공부 overview를 화면 내부 fixture에서 domain mock/service/query hook으로 이동하고 공통 queryKey와 비동기 상태 처리를 적용
- 탭 smoke 관찰성 복구 — 공통 `Screen`의 선택적 `testID` 전달과 5개 루트 탭 식별자를 복원하고 삶공부 비동기 콘텐츠 기준으로 Maestro 시나리오 갱신
- 나눔·동행 조회 데이터 경계 정리 — 공통 `queryKeys`에 overview/detail/members 키를 추가하고 화면 fixture를 domain mock/service/query hook으로 이동
- Dev Client visual capture 조건부 메뉴 처리 — Android UI hierarchy로 `Continue`/`Reload`/서버 선택 overlay를 감지하고 실제 node bounds만 눌러 앱 카드·버튼 오작동 캡처를 방지

---

## 주요 파일 (도메인 파일 지도)

| 경로                                                          | 역할                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                                   | Codex가 읽는 프로젝트 작업 규칙                                                                                                                                                                                                            |
| `CLAUDE.md`                                                   | Claude Code 호환용 작업 규칙 복사본                                                                                                                                                                                                        |
| `docs/INDEX.md`                                               | 작업자용 문서 진입점과 도메인 상태표                                                                                                                                                                                                       |
| `docs/MAINTENANCE.md`                                         | 문서 드리프트 복구 런북                                                                                                                                                                                                                    |
| `scripts/gen-index.sh`                                        | GitHub Issues 기반 도메인 상태표 재생성                                                                                                                                                                                                    |
| `docs/features/common.md`                                     | common 도메인 컨텍스트                                                                                                                                                                                                                     |
| `package.json`, `package-lock.json`                           | 공통 런타임 의존성과 CI 재현 가능한 npm lockfile                                                                                                                                                                                           |
| `app/_layout.tsx`                                             | QueryClient, SafeArea, Router Provider 루트                                                                                                                                                                                                |
| `src/components/auth/AuthRouteNavigator.tsx`                  | 세션 복원 상태와 인증 여부에 따라 auth/app/modal route 접근을 분리하는 보호 navigator                                                                                                                                                      |
| `app/(tabs)/_layout.tsx`                                      | Downloads preview 기준 홈/나눔/동행/기도/삶공부 5탭 layout와 glass custom floating tab bar                                                                                                                                                 |
| `app/(tabs)/{market,group,prayer,life-study}/_layout.tsx`     | 루트 탭별 목록 위에 상세·보조 화면을 쌓고 뒤로가기 시 탭 목록으로 복귀시키는 중첩 Stack                                                                                                                                                    |
| `app/(tabs)/index.tsx`                                        | 디자인 번역 기반 홈 화면. 홈 프로필 카드에서 숨김 MY route로 진입                                                                                                                                                                          |
| `app/(tabs)/group/index.tsx`                                  | Downloads `동행` 탭 루트. 내부에서 소모임/봉사 segment 전환                                                                                                                                                                                |
| `app/(tabs)/prayer/index.tsx`                                 | Downloads `기도` 하단 탭 루트. 기도 목록 화면 렌더링                                                                                                                                                                                       |
| `app/(tabs)/life-study/index.tsx`                             | Downloads `삶공부` 하단 탭 루트. 삶공부 목록 화면 렌더링                                                                                                                                                                                   |
| `src/components/faith/FaithSectionsScreen.tsx`                | 기도/삶공부 목록의 공유 렌더러. route가 아니라 `/prayer`, `/life-study`에서 section prop으로 사용                                                                                                                                          |
| `src/components/ui/index.tsx`                                 | ZIP 토큰 기준 Button, Card, Badge, Chip, form, modal/dialog, sheet, toast, FAB 등 공통 UI                                                                                                                                                  |
| `src/components/ui/app-icon.tsx`                              | Solar Icons의 의미별 대응과 기본 Linear·선택 Bold 스타일을 관리하는 공통 아이콘 경계                                                                                                                                                       |
| `src/components/ui/section-header.tsx`                        | 섹션 제목과 선택적 `전체보기 + chevron-right` action의 배치·44px 터치 영역·press motion을 공유                                                                                                                                             |
| `src/components/ui/screen-header.tsx`                         | 루트 탭 5개 화면의 기본 배경색 glass, 89px 높이, 위·아래 20px 여백, 제목·subtitle·우측 action geometry를 통일하는 sticky 헤더                                                                                                              |
| `src/components/ui/glass-backdrop.tsx`                        | 상단 sticky 헤더와 하단 floating tab bar가 공유하며 화면별 tint 색상·투명도를 지정할 수 있는 intensity 32 blur layer                                                                                                                       |
| `src/components/layout/StickyHeaderScreen.tsx`                | 실제 safe-area까지 blur target에 포함하고 검색·필터·목록을 헤더 뒤로 통과시키며, 동일 glass의 sticky control과 스크롤 방향 숨김·200ms 재표시를 관리하는 루트 탭 공통 layout                                                                |
| `src/components/ui/search-field.tsx`                          | 검색 아이콘과 입력을 하나의 surface로 묶고 웹 focus border·공통 sticky 높이를 관리하는 검색 입력                                                                                                                                           |
| `src/components/ui/search-toggle-button.tsx`                  | 헤더의 검색/닫기 아이콘과 명시적 한글 label, press motion을 공유하는 action                                                                                                                                                                |
| `src/components/layout/TabBlurTargetContext.ts`               | 현재 루트 화면의 Android blur target ref를 하단 tab bar까지 전달                                                                                                                                                                           |
| `src/components/ui/motion.tsx`                                | Reanimated 기반 공통 press scale과 overlay presence 제어. 시스템 동작 줄이기 설정을 반영                                                                                                                                                   |
| `src/components/ui/filter-chips.tsx`                          | 가변 너비 카테고리 필터의 측정 기반 200ms 이동 indicator, press feedback, 접근성 상태 관리                                                                                                                                                 |
| `src/hooks/useMotionRouteParam.ts`                            | 필터·세그먼트 선택은 즉시 반영하고 route query는 모션 종료 후 반영해 URL 갱신 remount가 이동을 끊지 않도록 관리                                                                                                                            |
| `src/components/ui/detail-actions.tsx`                        | 나눔·동행 상세의 action/mini action 공통 구현                                                                                                                                                                                              |
| `src/components/ui/detail-badge.tsx`                          | 기도·삶공부 상세 badge geometry 공통 구현                                                                                                                                                                                                  |
| `src/components/ui/modal-form-layout.tsx`                     | 나눔·동행 작성 화면 section/divider 공통 구현                                                                                                                                                                                              |
| `src/components/ui/underline-tabs.tsx`                        | 기도 상세·MY 활동 내역 underline tab 공통 구현                                                                                                                                                                                             |
| `src/components/gluestack-ui/gluestack-ui-provider/index.tsx` | gluestack overlay/toast provider. 앱 루트에서 light mode로 사용                                                                                                                                                                            |
| `src/lib/apiClient.ts`                                        | 공통 API envelope·오류·Authorization 처리                                                                                                                                                                                                  |
| `src/lib/apiErrorMessage.ts`                                  | API 오류 코드와 도메인 사용자 문구 매핑                                                                                                                                                                                                    |
| `src/lib/authRecovery.ts`                                     | API client와 인증 session manager 사이의 refresh 연결 지점                                                                                                                                                                                 |
| `src/lib/designVariant.ts`                                    | development 전용 디자인 상태 query 해석                                                                                                                                                                                                    |
| `src/lib/secureStore.ts`                                      | access/refresh token 안전 저장                                                                                                                                                                                                             |
| `src/types/api.ts`                                            | 서버 공통 `ApiResponse<T>` 타입                                                                                                                                                                                                            |
| `src/constants/theme.ts`                                      | `열린문커넥트.zip` 기준 color, radius, font, lineHeight, weight, shadow 디자인 토큰                                                                                                                                                        |
| `src/constants/designTokens.json`                             | Tailwind와 React Native theme가 함께 읽는 color·spacing·radius 단일 소스                                                                                                                                                                   |
| `src/components/ui/app-text.tsx`                              | 6단계 역할형 typography와 semantic text tone을 적용하는 공통 텍스트                                                                                                                                                                        |
| `src/components/ui/skeleton.tsx`                              | 동작 줄이기 대응 Skeleton과 핵심 목록용 ListSkeleton                                                                                                                                                                                       |
| `jest.setup.ts`                                               | Jest mock 설정과 Expo Router/native module 테스트 어댑터                                                                                                                                                                                   |
| `src/test/renderWithClient.tsx`                               | TanStack Query 화면 테스트용 test wrapper                                                                                                                                                                                                  |
| `.github/workflows/ci.yml`                                    | PR/push `npm ci` + `npm run validate`                                                                                                                                                                                                      |
| `.github/workflows/e2e-smoke.yml`                             | 수동/release/nightly용 Maestro smoke workflow 뼈대                                                                                                                                                                                         |
| `scripts/dev-client-smoke.mjs`                                | Expo Dev Client Metro 부팅과 `/status` 응답 확인                                                                                                                                                                                           |
| `scripts/maestro-smoke.mjs`                                   | Metro 확인/부팅과 Dev Client deep link를 거쳐 Maestro smoke 실행. Android Emulator는 `localhost`/`127.0.0.1` + `adb reverse` 기준이며 ADB로 Dev Client를 먼저 연 뒤 `.maestro/smoke.yml`이 메뉴/탭 검증을 담당                             |
| `scripts/design-screen-routes.mjs`                            | ZIP JSX inventory 110개 화면을 Expo Router route와 screenshot filename으로 매핑                                                                                                                                                            |
| `scripts/prepare-design-artifacts.mjs`                        | ZIP에서 110개 visual inventory와 원본 PNG를 재생성. 기본 출력은 `/private/tmp/ylmc-golden-screens/2026-05-23`                                                                                                                              |
| `scripts/capture-design-screens.mjs`                          | Android Dev Client에서 design route 스크린샷 캡처. `YLMC_CAPTURE_INDEXES`, `YLMC_CAPTURE_RESET_EACH_ROUTE`, `YLMC_CAPTURE_ROUTE_OPEN_REPEATS`, `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT`, `YLMC_CAPTURE_DISMISS_AFTER_ROUTE`로 부분 재캡처 가능 |
| `scripts/compare-design-screens.mjs`                          | 원본/앱 스크린샷 normalized diff 생성. 원본 PNG가 단색 빈 화면이면 `originalFlat`로 표시해 JSX 기준 검토 대상으로 분리                                                                                                                     |
| `scripts/check-auth-api-contract.mjs`                         | login/refresh/signup/me 성공 DTO와 JWT 정의를 확인하는 Swagger 계약 검사                                                                                                                                                                   |
| `scripts/check-market-api-contract.mjs`                       | 나눔 CRUD·댓글·신고 및 화면 요구 필드를 확인하는 Swagger 계약 검사                                                                                                                                                                         |
| `scripts/check-group-api-contract.mjs`                        | 동행 목록·상세·내 목록·멤버/공지·참여/관리 계약을 확인하는 Swagger 계약 검사                                                                                                                                                               |
| `scripts/openapi-contract-utils.mjs`                          | 도메인별 Swagger 계약 검사 공통 유틸과 실패 수집                                                                                                                                                                                           |
| `.maestro/smoke.yml`                                          | v1 핵심 탭 진입 `testID` 기반 E2E smoke                                                                                                                                                                                                    |

## 데이터 타입

[../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통” 참조.

## 결정 사항 (최신 위)

- (2026-07-15) **sticky controls의 내용 구성이 바뀌면 화면이 명시한 시점에 다시 표시할 수 있다** — 공통 기본 방향 정책은 아래 12px 숨김·위 4px 재표시로 유지하고, 선택적 reveal key가 바뀔 때만 숨김 상태와 누적 거리를 초기화합니다. 동행처럼 스크롤 중 control 높이와 내용이 함께 바뀌는 화면이 이전 하강량을 새 구성에 이어받지 않도록 사용합니다.
- (2026-07-15) **같은 화면의 동급 목록 카드는 외곽 프레임을 공유하고 메타만 분리한다** — 동행의 전체 소모임·봉사는 같은 `CompanionCard`로 썸네일·surface·경계·shadow·텍스트 위치를 공유하며 카테고리/일정, 인원/참여 인원처럼 도메인 정보만 props로 구분합니다. 내 소모임 가로 cover 카드는 역할이 달라 기존 구조를 유지합니다.
- (2026-07-15) **상세 뒤로가기 surface는 배경 이미지 유무와 관계없이 `surface2`로 통일한다** — 일반 상세와 나눔 이미지 hero 모두 1px `line` 경계와 `surface2`를 사용하며, 이미지 위 전용 흰색 RGBA·카드 그림자 예외는 사용하지 않습니다. `chevron-left + 뒤로`, 68×44px geometry와 press motion은 유지합니다.
- (2026-07-15) **중보기도 탭은 Solar `Hearts`를 사용한다** — 기존 `HeartShine`보다 중보기도의 함께하는 의미가 직접 드러나는 `Hearts`로 교체하며 기본 `Linear`·선택 `Bold`, 기존 크기·색상·접근성·탭 모션은 유지합니다.
- (2026-07-15, 기도 아이콘 선택만 폐기) **기도 탭은 `HeartShine`, 기본 추가·닫기는 외곽선 없는 glyph를 사용한다** — 기도 아이콘은 후속 결정으로 `Hearts`가 대체했습니다. Solar 패키지에 원·사각형 없는 단독 추가·닫기가 없어 이 두 형태만 `AppIcon` 내부의 24px viewBox·2px round stroke SVG로 보완하며 화면의 아이콘 크기·색상·label·접근성·터치 영역은 유지합니다.
- (2026-07-15) **앱 아이콘은 공통 `AppIcon`을 통해 Solar Icons로 렌더링한다** — 기본 아이콘은 `Linear`, 하단 탭의 선택 상태는 `Bold`를 사용하고 화면은 Solar 패키지를 직접 참조하지 않습니다. 기존 아이콘 의미·크기·색상과 `뒤로`·`검색/닫기`·FAB의 한글 label, 접근성 이름, press motion은 유지하며 미사용 `@expo/vector-icons` 직접 의존성은 제거합니다.
- (2026-07-15) **플로팅 버튼은 대상만이 아니라 실행 행동을 label로 표시한다** — `FloatingActionButton`의 label은 필수이며 화면 텍스트와 접근성 이름의 기본값을 함께 담당합니다. 나눔은 `나눔하기`, 동행은 `소모임 개설`, 기도는 `기도제목 작성`을 사용하고 기존 아이콘·위치·라우팅은 유지합니다.
- (2026-07-14) **섹션 전체보기는 제목 오른쪽의 공통 action으로 표시한다** — 독립된 큰 버튼 대신 `SectionHeader`의 `전체보기 + chevron-right`를 사용하고 최소 44px 터치 영역, 140ms press motion, `<섹션명> 전체보기` 접근성 label을 공유합니다. 작성·신청처럼 주요 행동을 시작하는 CTA는 이 규칙에 포함하지 않습니다.
- (2026-07-14, 2026-07-15 보완) **전체 화면의 이전 경로 이동은 `뒤로`, 현재 화면 내부 UI 해제는 `닫기`로 구분한다** — `TopBar back`의 label은 `chevron-left + 뒤로`로 고정하고 제목은 좌우 88px 안전 영역 안에서 화면 정중앙에 둡니다. 검색·펼침 목록·패널·sheet처럼 현재 화면의 일부만 해제하는 action은 `close + 닫기`를 사용하며, 확인 dialog의 `취소`는 선택을 철회하는 별도 의미로 유지합니다.
- (2026-07-14) **검색 포커스와 명시적 검색 action은 공통 UI가 소유한다** — 웹 기본 TextInput outline은 끄고 아이콘을 포함한 바깥 surface에 단일 2px border만 표시합니다. 루트 검색 action은 `검색/닫기` 아이콘과 한글 label을 함께 사용하고, 검색이 열린 동안에는 스크롤로 숨었던 sticky control을 다시 표시해 입력창 접근을 보장합니다.
- (2026-07-14) **상단 sticky control은 타이틀과 같은 glass와 방향형 노출 정책을 공유한다** — 나눔·동행의 세그먼트·필터 영역은 `theme.colors.bg` 72%와 intensity 32를 사용하고, 아래 12px 스크롤에서 숨은 뒤 위 4px에서 200ms로 재표시합니다. 동작 줄이기에서는 위치 전환을 즉시 반영합니다.
- (2026-07-14) **모든 루트 탭 sticky 헤더는 기본 배경색 glass를 사용한다** — 홈·나눔·동행·기도·삶공부는 `theme.colors.bg`를 72%로 덧입힌 32 intensity blur를 공유하고 흰색 surface나 하단 border는 사용하지 않습니다. 웹은 위·아래 20px 여백과 89px 헤더, 네이티브는 실제 safe-area를 추가하며 검색·필터·목록은 하나의 스크롤로 헤더 뒤를 통과합니다.
- (2026-07-14) **필터 화면 여백과 indicator 좌표 track을 분리하고 세그먼트 탭을 수직 중앙에 둔다** — `FilterChips`의 좌우 20px 화면 여백은 ScrollView content가 담당하고, 항목 측정과 absolute indicator는 padding이 없는 같은 track을 기준으로 삼아 웹·네이티브 좌표 원점 차이를 제거합니다. 공통 `SegmentedTabs`는 44px 바깥 높이 안에 36px 탭을 두어 위·아래 4px를 같게 하고 텍스트 line-height를 18px로 고정합니다.
- (2026-07-14) **필터·세그먼트 query는 모션 종료 후 현재 route에 반영한다** — 나눔·동행 선택 상태는 즉시 바꾸고 200ms 뒤 `setParams`로 query를 갱신해 URL remount가 indicator 이동을 끊지 않게 합니다. 빠른 반복 입력은 이전 예약을 취소하고 마지막 선택만 반영하며 동작 줄이기에서는 즉시 반영합니다.
- (2026-07-14) **가변 너비 카테고리 필터도 하나의 이동 indicator를 공유한다** — 나눔·동행 필터는 각 항목의 실제 `x/width`를 측정해 200ms로 선택 배경을 이동하고 140ms press feedback과 동작 줄이기 설정을 따릅니다. 최초 배치와 같은 항목 재선택은 이동·콜백을 반복하지 않습니다.
- (2026-07-14) **하단 루트 탭의 상세·보조 화면은 탭별 중첩 Stack에 둔다** — 나눔·동행·기도·삶공부의 목록 경로는 하단 탭으로 유지하고 하위 상세는 해당 탭 Stack에 push합니다. 상세 back은 직전 목록을 pop하며 하단 탭·상태 segment는 불필요한 방문 이력을 쌓지 않습니다.
- (2026-07-14) **루트 탭은 고정 geometry의 공통 `ScreenHeader`를 사용한다** — 홈/나눔/동행/기도/삶공부 헤더는 웹에서 89px 높이와 좌측 20px·위아래 20px 기준을 사용하고, 네이티브에서는 실제 safe-area를 위에 더합니다. title/subtitle 묶음과 우측 검색 action은 남는 공간 안에서 수직 중앙에 두고 본문 시작점을 동일하게 유지합니다.
- (2026-07-14, 2026-07-15 흰 surface 예외 폐기) **뒤로가기는 아이콘과 한글 label, 구분 가능한 surface를 함께 표시한다** — 50~60대 사용자가 기능을 바로 인지할 수 있도록 `chevron-left + 뒤로`를 유지하고 `surface2`와 1px 경계를 사용합니다. 일반·이미지 상세 모두 화면 기준 `x=8`, `68x44px`와 `MotionPressable`의 140ms·0.97 press scale을 공유하며 동작 줄이기 설정을 따릅니다.
- (2026-07-14) **나눔과 동행의 전체 탐색 카드는 같은 외곽 규칙을 사용한다** — 두 화면 모두 96px 썸네일, 16px padding/radius, 1px 경계, 동일 shadow와 12px 목록 간격을 사용합니다. 도메인 정보 차이로 카드 높이는 소폭 달라도 내 소모임 가로 영역과 상태·인원 정보는 유지합니다.
- (2026-07-14) **입력 배경의 alpha 제거는 반투명 surface에만 적용한다** — 나눔 댓글처럼 alpha 배경을 쓰는 입력은 투명하게 만들되, 검색·작성 폼의 고정 surface와 입력이 아닌 overlay·Skeleton opacity는 변경하지 않습니다.
- (2026-07-14) **탭 루트의 주요 탐색 항목은 카드 경계를 유지한다** — 홈 활동·나눔·동행 전체 모임·기도방/기도제목·삶공부 전체 과정은 흰 surface, 둥근 모서리, 옅은 border와 약한 shadow를 사용합니다.
- (2026-07-12, 2026-07-14 폐기) **나눔처럼 이미지 중심인 기존 row list는 유지한다** — 나눔 목록도 사용자 확인에 따라 독립 카드 경계로 통일했습니다.
- (2026-07-12) **텍스트는 크기 이름보다 화면 역할로 사용한다** — `display / screenTitle / sectionTitle / cardTitle / body / caption` 6단계만 공통 기준으로 두고 `AppText`가 semantic tone을 함께 적용합니다. Button·badge처럼 컴포넌트 자체 역할이 있는 텍스트는 해당 공통 컴포넌트가 관리합니다.
- (2026-07-12) **Tailwind와 RN theme의 기초 토큰은 JSON 단일 소스를 공유한다** — color·spacing·radius는 `designTokens.json`을 두 설정이 직접 읽고, typography·layout·shadow·motion은 타입이 필요한 `theme.ts`가 관리합니다.
- (2026-07-12) **부분 폐기됨: 반복 정보는 flat list, 핵심 정보만 surface card로 강조한다** — 나눔처럼 이미지 중심인 기존 row list에는 유지하지만 홈 활동·동행 전체 모임·기도방/기도제목·삶공부 전체 과정에는 적용하지 않습니다. 카드가 필요할 때도 border와 shadow는 약하게 사용합니다.
- (2026-07-12) **루트·작성 화면의 기본 수평 여백은 20px이다** — 화면 섹션 28~32px, card padding 16px, 제목-설명 8px, 목록 12px을 `theme.layout` 기준으로 사용합니다. 제공 ZIP과 부분 캡처 geometry가 고정된 기존 상세·overlay 화면은 공통 TopBar/상태 UI만 상속하고 화면 전용 간격을 유지합니다.
- (2026-07-12) **이미지 asset 개선은 이번 디자인 시스템 범위에서 제외한다** — 사용자 요청에 따라 기존 `VisualThumb`/`VisualCover`를 유지하며 사진 생성·추가와 API 이미지 계약 변경은 수행하지 않습니다.

- (2026-07-12) **고정 overlay 화면은 마지막 콘텐츠가 완전히 위로 스크롤되어야 한다** — FAB·하단 탭·댓글 composer의 위치는 유지하되 내부 ScrollView의 bottom padding으로 최종 카드와 입력 영역이 가려지지 않게 합니다. 오류 상태는 query가 refetch를 제공할 때만 `다시 시도`를 노출합니다.

- (2026-07-12) **앱 색상 모드는 라이트로 고정한다** — `GluestackUIProvider mode="light"`를 유지하고 Tailwind의 `darkMode: "class"`는 수동 모드 제어 허용에만 사용합니다. 다크 테마나 시스템 모드 전환은 추가하지 않습니다.
- (2026-07-12, 2026-07-14 변경) **하단 탭은 캡슐 중심의 흰 glass와 gradient 하단 blur를 사용한다** — 사용자 후속 요청에 따라 불투명 흰 배경과 기본 배경색 tint 결정을 폐기합니다. floating 캡슐은 흰 tint 56%·intensity 32 blur·90% border로 구분하고, 캡슐 하단과 14px 겹치는 28px 영역에는 intensity 12 blur와 투명→흰색 46% 세로 gradient를 사용해 딱딱한 수평 경계를 제거합니다. geometry·그림자·선택 indicator는 유지하며 Android는 현재 루트 화면의 `BlurTargetView` ref를 context로 전달합니다.
- (2026-07-12) **짧은 상호작용 모션은 공통 토큰과 Reanimated로 관리한다** — 140~220ms 범위의 press/선택/overlay 전환을 사용하고 시스템 동작 줄이기 설정에서는 이동·확대를 생략합니다. 화면별 카드·목록 등장 효과는 자동 적용하지 않고 명시적으로 선택합니다.
- (2026-07-12) **화면 내부 선택 탭은 공통 `SegmentedTabs`를 사용한다** — 나눔의 전체/나눔중/예약중/나눔완료와 동행의 소모임/봉사, 기도 작성의 작성자 표시를 같은 이동 indicator와 접근성 상태로 관리합니다.
- (2026-07-11) **RadioSheet는 표시 전용과 제어형 입력을 모두 지원한다** — `onValueChange`가 있으면 option을 접근 가능한 radio Pressable로 렌더링하고, 없으면 기존 reference 표시 동작을 유지합니다. 비동기/필수 입력 상태는 `confirmDisabled`로 footer에서 차단합니다.
- (2026-07-11) **visual capture는 Dev Client overlay node만 조작한다** — route 진입 후 고정 좌표를 블라인드 탭하지 않고 UI hierarchy에서 overlay label과 bounds를 찾을 때만 탭합니다. 앱 화면이면 즉시 캡처 단계로 넘어가 비동기 목록 카드나 CTA가 눌리지 않게 합니다.
- (2026-07-11) **계약 gate는 envelope 내부 필드도 검증한다** — endpoint와 응답 `$ref` 존재만으로 통과시키지 않고, 화면 흐름이 의존하는 `data.available`처럼 필수 성공 필드는 공통 OpenAPI 유틸이 실제 schema property까지 확인합니다.
- (2026-07-11) **계약 gate는 request 제약도 화면 규칙과 대조한다** — required/property뿐 아니라 `minLength/maxLength`, `minimum/maximum`, `maxItems`, enum을 검증해 프런트 validator와 서버 DTO가 서로 다른 규칙을 갖지 않게 합니다.
- (2026-07-11) **상태 변경 API는 오류 코드 문서화를 계약으로 요구한다** — 4xx/5xx response description에 식별 가능한 코드를 요구하고, 화면은 서버 message 대신 code 기반 도메인 문구를 사용합니다.
- (2026-07-11) **실제 API 대기 중에도 조회 화면은 data source 경계를 지킨다** — Swagger DTO를 추측하는 HTTP mapper는 계약 검사 통과 전까지 만들지 않지만, 화면은 fixture를 직접 소유하지 않고 `screen → hook → service → data source` 흐름을 사용합니다. HTTP 전환은 data source 구현 교체로 제한합니다.
- (2026-07-10) **디자인 상태는 production 데이터 상태를 덮지 않는다** — visual capture는 `designVariant`만 사용하고 `readDesignVariant`가 development에서만 값을 반환합니다. 실제 탐색 상태는 `section`, `tab`처럼 의미 있는 query로 분리하며 서버 오류·권한·완료 상태는 향후 service/domain model에서 결정합니다.
- (2026-07-12) **라우팅 metadata와 반복 UI는 단일 소스를 사용한다** — 하단 탭의 이름·href·icon·testID는 `rootTabs` 한 곳에서 생성하고, 화면 geometry가 같은 action/badge/form section/underline tab은 역할별 공통 파일로 관리합니다. 기존 `src/components/ui` 진입점은 re-export로 호환성을 유지합니다.
- (2026-07-10) **계약 검사 엔진과 도메인 요구 목록을 분리한다** — OpenAPI 로딩과 공통 규칙은 `openapi-contract-utils.mjs`, 인증·나눔·동행의 필수 endpoint/필드는 각 checker가 소유합니다. 공통 엔진과 디자인 라우트는 네트워크 없이 `test:scripts`로 CI 검증합니다.
- (2026-07-10) **401 재발급은 API client 인스턴스별 single-flight로 처리한다** — 동시에 만료된 여러 인증 요청은 refresh Promise 하나를 공유하고 성공 후 각 원 요청을 최대 한 번만 재시도합니다. `auth: false` 공개 요청의 401은 로그인 실패이므로 refresh하지 않습니다.
- (2026-07-10) **공통 API client는 transport 책임만 가진다** — base URL, envelope, 오류, Authorization을 공통화하되 API DTO를 화면 모델로 직접 노출하지 않습니다. 도메인별 service/mapper가 서버 필드와 화면 모델의 차이를 흡수합니다.
- (2026-07-10) **Swagger 계약 검사는 확정 전 일반 CI와 분리한다** — 인증 성공 DTO와 JWT 정의가 미완성인 동안 `test:api:contract`는 별도 명령으로 누락을 가시화합니다. 백엔드 계약 확정 후 통과 상태가 되면 CI 게이트 포함 여부를 결정합니다.
- (2026-07-10) **루트 탭 E2E 식별자는 `Screen`이 전달한다** — 화면별 wrapper를 추가하지 않고 공통 `Screen`의 선택적 `testID`를 사용합니다. smoke는 화면 진입 식별자와 비동기 데이터가 렌더링된 현재 IA 문구를 함께 검증합니다.
- (2026-07-10) **mock-first 화면도 service/query 경계를 지킨다** — 실제 사용자 API가 없는 도메인도 화면이 fixture를 직접 소유하지 않고 `screen → hook → service → mock` 흐름을 사용합니다. API 추가 시 화면이 아니라 service/mapper를 교체합니다.
- (2026-07-10) **CI의 peer dependency 요구는 lockfile 우회 없이 명시한다** — gluestack 전이 의존성이 요구하는 `@react-spectrum/provider@3.11.1`을 직접 고정합니다. `npm ci --legacy-peer-deps`로 검증을 약화하지 않고 Node 20.19.4/npm 10.8.2 기준 깨끗한 설치를 유지합니다.
- (2026-06-29) **archive 문서는 이관 안내만 유지한다** — 작업 목록은 GitHub Issues, 변경 이력은 PR description이 단일 출처이므로 `docs/_archive/LOG.md`와 `docs/_archive/TASKS.md`는 긴 과거 본문 대신 조회 안내만 둡니다.
- (2026-06-27) **탭 IA는 Downloads preview 기준을 따른다** — 하단 탭은 `홈/나눔/동행/기도/삶공부`입니다. `MY`는 하단 탭에서 제거하고 홈 상단 `내 정보 보기` 카드로 진입합니다. `동행` 탭 내부는 Downloads `ScreenGroupList`/`ScreenServiceList`처럼 `소모임/봉사` segment를 둡니다.
- (2026-06-27) **부정확한 reference/scaffold runtime은 제거한다** — Downloads 최신 원본이 확인된 화면은 실제 RN route로 옮기고, 원본이 확인되지 않는 reference route나 호출처 없는 modal/profile scaffold route는 유지하지 않습니다.
- (2026-06-27) **디자인 기준은 Downloads 원본 하나로 둔다** — `/Users/mingulee/Downloads/열린문커넥트.zip`과 압축 해제 폴더를 디자인 단일 기준으로 사용합니다. RN으로 옮긴 `OriginalMockScreens`와 임시 reference 안내 화면은 최신 원본과 어긋날 수 있어 제거합니다.
- (2026-06-27) **주요 화면은 placeholder가 아니라 실제 RN 화면으로 되돌린다** — Downloads 원본을 확인하라는 안내 화면은 임시 연결용이며, 구현 대상 route는 원본 JSX/token을 기준으로 실제 앱 화면을 직접 렌더링합니다. 홈 route부터 `screens-home.jsx` 구조를 RN으로 반영합니다.
- (2026-06-27) **알림 route도 실제 RN 화면으로 렌더링한다** — Downloads `ScreenNotifications` 구조를 `/notifications`에 직접 반영하고, reference export는 제거합니다.
- (2026-06-27) **gluestack-ui는 Provider부터 적용한다** — `GluestackUIProvider`를 앱 루트에 연결합니다. NativeWind v4/Tailwind v3 기존 설정과 Downloads 디자인 토큰은 유지하며, 개별 컴포넌트는 화면에 직접 흩뿌리지 않고 공통 UI 계층에서 필요한 것만 흡수합니다.
- (2026-06-27) **폐기됨: 루트 탭 홈/나눔/소모임/동행/MY** — Downloads `PREVIEW_TAB_ROUTES` 확인 결과 실제 기준은 홈/나눔/동행/기도/삶공부이며, 이 결정은 위 최신 결정으로 대체합니다.
- (2026-05-27) **FAB도 ZIP root overlay surface로 관리한다** — `FloatingActionButton`은 공통 `Button`과 같이 정적 Pressable surface를 사용해 Android Dev Client 캡처에서 배경/크기 누락을 막습니다. `Screen` scroll content 안에 FAB를 두면 ZIP `Phone`의 fixed root layer와 달라지므로 FAB가 있는 reference 화면은 `Screen scroll={false}` + 내부 ScrollView + root FAB 구조로 둡니다.
- (2026-05-27) **폐기됨: 기도/삶공부를 동행 내부에 둔다** — 최신 Downloads preview에서는 기도와 삶공부가 독립 하단 탭입니다. 동행 내부 segment는 소모임/봉사만 유지합니다.
- (2026-05-27) **`VisualThumb` circle geometry는 ZIP SVG 수식을 비율로 번역한다** — ZIP `Thumb`는 100x100 viewBox에서 큰 circle `r=32 opacity=.35`, 작은 circle `r=22 opacity=.22`를 seed 기반 center로 배치합니다. RN `VisualThumb`도 size prop에 비례해 같은 center/diameter/opacity를 계산하고, fixed 58/38px orb는 사용하지 않습니다.
- (2026-05-27) **Maestro smoke는 Android 시스템 ANR dialog를 환경 overlay로 처리한다** — Dev Client가 정상 앱 화면을 띄운 뒤에도 Emulator가 `Process system isn't responding` dialog를 일시 표시할 수 있으므로, smoke flow는 해당 dialog에서 `Wait`를 누르고 기존 Dev Client `Continue`/`Reload` 처리로 복귀합니다. 이 처리는 앱 기능 검증 대상이 아니라 테스트 환경 안정화입니다.
- (2026-05-27) **홈 section header는 ZIP `.sec-head` rhythm을 따른다** — 공통 `Section`은 다른 화면의 밀도를 유지하고, 홈 reference 화면만 ZIP `ScreenHome`의 `padding: 16px 18px 8px` section header와 14px 소모임 카드 padding을 별도 wrapper로 번역합니다.
- (2026-05-27) **공통 Button은 정적 Pressable surface로 렌더링한다** — Android Dev Client에서 Pressable style callback이 bottom-flat CTA의 배경/크기 surface를 누락시키는 캡처가 확인되어, ZIP pill 버튼 재현을 우선해 `Button`은 정적 style로 렌더링합니다. pressed opacity보다 ZIP의 button surface 유지가 우선입니다.
- (2026-05-27) **auth/input visual capture는 route 이후 dismiss 탭을 끌 수 있다** — 로그인 화면처럼 fixed 좌표 dismiss가 화면 CTA를 누를 수 있는 route는 `YLMC_CAPTURE_DISMISS_AFTER_ROUTE=0`으로 route 진입 후 dismiss 탭을 생략합니다. 기본값은 기존처럼 dismiss를 수행해 Dev Client overlay 혼입을 막습니다.
- (2026-05-27) **visual capture 입력 좌표는 override viewport 기준을 우선한다** — `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1`은 Android `wm size` override를 적용하므로, tap helper가 Physical size만 읽으면 Dev Client `Continue` 버튼 아래를 누르게 됩니다. 캡처 스크립트는 `Override size`를 우선 읽고 route 캡처 직전에도 짧게 Dev Client 메뉴를 닫습니다.
- (2026-05-27) **horizontal chip row는 non-scroll 화면에서도 높이를 고정한다** — `HorizontalChips`가 non-scroll `Screen`에서 남는 flex height를 먹으면 ZIP의 얇은 chip row가 세로로 늘어나므로, 공통 ScrollView에 `flexGrow: 0`을 둡니다.
- (2026-05-27) **알림 화면은 ZIP sectioned flat list를 우선한다** — 현재 앱의 카드형 알림 목록은 기준이 아니며, `screens-extra-home.jsx`의 `ScreenNotifications`처럼 `오늘`/`지난 알림` section과 unread row 배경, 38px circular icon, 6px unread dot, `모두 읽음` text action을 RN reference 화면에 번역합니다.
- (2026-05-27) **상세 action은 ZIP `ActionBtn` inline 구조를 따른다** — 나눔/소모임 상세 action은 별도 원형 icon tile이 아니라 `screens-market.jsx`/`screens-group.jsx`의 `ActionBtn`처럼 44px 높이, transparent background, icon+label inline button으로 번역합니다.
- (2026-05-27) **Toast overlay는 ZIP `Phone` root layer에 맞춘다** — `Screen` 기본 ScrollView 안에 `Toast`를 넣으면 긴 list 화면에서 toast가 viewport 밖으로 밀리므로, ZIP `CheckToast`처럼 root fixed layer에 놓이도록 화면 body를 내부 ScrollView로 분리합니다.
- (2026-05-27) **Maestro smoke는 루트 딥링크 이후 Dev Client 메뉴도 닫는다** — Expo Dev Client developer menu가 앱 루트 로딩 뒤 늦게 표시되면 `tab-home`을 가려 false negative가 발생하므로, `.maestro/smoke.yml`은 `openLink` 이후에도 `Continue`/`Reload`를 한 번 더 조건부 처리합니다.
- (2026-05-27) **ZIP 원본 캡처는 animation settle 이후 저장한다** — `BottomSheet`, `TermsSheet`, toast처럼 ZIP JSX가 CSS animation을 쓰는 화면은 렌더 직후 2 rAF만 기다리면 중간 프레임이 원본 PNG로 저장됩니다. `test:visual:prepare`는 기본 320ms settle 이후 캡처하며, 필요 시 `YLMC_PREPARE_RENDER_SETTLE_MS`로 조정합니다.
- (2026-05-26) **visual compare 원본은 ZIP에서 재생성한다** — `/private/tmp` 산출물이 정리되면 기본 `npm run test:visual:compare`가 inventory 없이 실패하므로, `test:visual:prepare`가 ZIP `app.jsx` artboard 105개와 extra MY 5개를 합쳐 110개 inventory/manifest를 만들고, standalone HTML을 headless Chrome으로 렌더링해 원본 PNG를 재생성합니다.
- (2026-05-26) **`Screen` safe-area는 ZIP phone frame을 기준으로 번역한다** — Android native status inset(약 24dp)을 그대로 쓰면 ZIP의 44px `phone-status`보다 콘텐츠가 위로 붙고, bottom inset을 적용하면 comment composer가 ZIP보다 위로 뜹니다. `Screen`은 top을 최소 44dp로 보정하고 bottom inset은 fixed action geometry에 포함하지 않습니다.
- (2026-05-26) **긴 `RadioSheet`는 compact row를 사용한다** — 신고처럼 항목이 많은 bottom sheet는 ZIP `ReportSheet`와 같이 20px radio mark, 12px row padding, 48px footer pill 버튼을 사용합니다. 짧은 상태 변경 sheet는 기존 generic rhythm을 유지합니다.
- (2026-05-26) **visual capture는 필요 시 ZIP 논리 viewport에 맞춘다** — Android Emulator 기본 해상도(1080x2400@420)는 ZIP 원본 360x720과 논리 viewport가 달라 layout diff를 키우므로, 부분 visual compare에서는 `YLMC_CAPTURE_MATCH_DESIGN_VIEWPORT=1`로 1080x2160@480을 임시 적용해 360x720dp 기준에 맞춥니다. 스크립트는 캡처 후 원래 `wm size/density`를 복원합니다.
- (2026-05-26) **`VisualThumb` 기본형은 ZIP `Thumb`처럼 icon-less** — ZIP 공통 JSX의 `Thumb`는 `icon`을 넘긴 경우에만 아이콘을 표시하므로, RN `VisualThumb`도 기본 `redeem` 아이콘을 제거하고 호출부가 명시적으로 요청할 때만 아이콘을 렌더링합니다.
- (2026-05-26) **Dev Client smoke는 서버 선택 화면도 조건부 처리한다** — Android Emulator에서 앱 상태를 clear하면 Expo Dev Client가 `DEVELOPMENT SERVERS` 화면에 남을 수 있으므로, `.maestro/smoke.yml`은 해당 화면이 보일 때 개발 서버 row를 탭하고 `Reload` 메뉴를 닫은 뒤 앱 루트 딥링크 검증을 진행합니다.
- (2026-05-25) **공통 UI 토큰은 ZIP app-level tokens를 우선 번역한다** — `app-tokens.css`의 primary/surface/ink/line/radius/shadow/type, `halo-tokens.css`의 glass/elevation/type 기준을 `theme.ts`에 반영하고, Button/Card/Badge/Chip/SegmentedTabs/TopBar/Dialog/Sheet/Toast/FAB/Input은 화면별 땜질보다 공통 컴포넌트에서 먼저 맞춥니다. RN에서 직접 표현이 어려운 CSS blur/box-shadow는 `borderColor`, `shadow*`, `elevation` 조합으로 번역합니다.
- (2026-05-25, 2026-07-14 부분 폐기, 2026-07-15 surface 예외 폐기) **상세 TopBar와 Avatar는 ZIP 공통 JSX를 따른다** — `뒤로` label과 `Avatar` 팔레트는 유지하지만, 상세 뒤로가기 surface는 배경 이미지 유무와 관계없이 공통 `surface2`를 사용합니다.
- (2026-05-25) **폐기됨: 탭 구조는 ZIP 5탭 기준으로 한다** — 루트 탭 홈/나눔/소모임/동행/MY와 기도/삶공부 동행 segment 결정은 Downloads preview 확인 후 폐기했습니다.
- (2026-05-23) **시각 검증은 JSX + Dev Client 캡처를 함께 본다** — ZIP의 JSX를 화면 구조/컴포넌트 원천으로 보고, 스크린샷은 실제 렌더링 확인용으로 사용합니다. 원본 PNG가 단색 빈 화면이면 `compare` report의 `originalFlat`를 근거로 pixel diff를 품질 판단에서 제외하고 JSX 소스를 우선합니다.
- (2026-05-23) **루트 탭과 숨김 route의 하단 여백을 분리한다** — Expo Router tabs state는 상세 route에서도 루트 탭을 유지할 수 있으므로, floating tab bar와 `Screen` 하단 padding은 `usePathname()`의 실제 path 기준으로 적용합니다.
- (2026-05-23) **Maestro smoke는 루트 route에서 시작한다** — Dev Client가 이전 deep link route나 confirm dialog를 복원할 수 있으므로, smoke flow는 안내 메뉴를 조건부로 닫은 뒤 `ylmc-connect:///`를 열어 홈 탭부터 검증합니다.
- (2026-05-23) **ZIP 화면 기준은 110개** — `/Users/mingulee/Downloads/열린문커넥트.zip` 최신 inventory 기준 구현 대상은 110개 화면/상태입니다. 채팅/v2는 제외하되, ZIP 안에 있는 v1 화면은 route와 screenshot capture 대상으로 둡니다.
- (2026-05-23) **ZIP에 있는 화면은 모두 구현 대상으로 본다** — 제품 기본 플로우와 별개로, `/Users/mingulee/Downloads/열린문커넥트.zip`의 110개 화면/상태는 `variant` 라우트로 접근 가능해야 하며 누락 화면을 임의 제외하지 않습니다.
- (2026-05-23) **Android Emulator E2E URL 분리** — Maestro smoke에서 Android Emulator가 감지되면 Metro 상태 확인은 host의 `localhost:8081`을 보고, Dev Client 앱에는 `adb reverse`가 동작하는 `127.0.0.1:8081` URL을 전달합니다. Dev Client 안내 메뉴는 앱 기능 검증 대상이 아니므로 `.maestro/smoke.yml`에서 `Continue`와 닫기 동작만 처리한 뒤 v1 탭 `testID` 검증으로 넘어갑니다.
- (2026-05-23) **디자인 ZIP은 RN 번역 기준으로 사용** — `열린문커넥트.zip`의 CSS/JSX를 직접 이식하지 않고, 색상·간격·카드·버튼·탭·폼 톤을 Expo React Native 컴포넌트로 번역합니다.
- (2026-05-23, 2026-05-25 폐기) **탭 구조는 PLAN/Notion v1 기준 유지** — ZIP prototype의 5탭보다 6탭을 우선하던 결정은 제공 디자인 산출물을 최우선 기준으로 재정의하면서 폐기했습니다.
- (2026-05-22) **Codex 작업 규칙 SSOT** — Codex는 `AGENTS.md`를 기준으로 읽고, `CLAUDE.md`는 Claude Code 호환본으로 유지합니다. 문서 링크는 `AGENTS.md`를 우선 가리킵니다.
- (2026-05-23) **PR 자동 검증 게이트** — `npm run validate`는 `typecheck`, `lint`, `format:check`, `test`를 묶고, GitHub Actions PR CI는 `npm ci` 후 `npm run validate`를 실행합니다.
- (2026-05-23) **Jest/RNTL smoke 우선 적용** — v1 mock-first 범위에서는 공통 UI, 도메인 옵션, 핵심 탭 화면 렌더링을 먼저 자동화하고 실제 API/푸시/업로드 스토리지는 제외합니다.
- (2026-05-23) **NativeWind Babel 설정** — `nativewind/babel`은 Babel plugin 위치가 아니라 preset 위치에 둡니다. plugin 위치에 두면 Metro 번들링에서 `.plugins is not a valid Plugin property`로 실패합니다.
- (2026-05-23) **Expo Router 탭 이름** — Expo Router v7 탭 screen name은 실제 route인 `market/index`, `group/index` 등을 사용하고 상세 route는 `href: null`로 탭에서 숨깁니다.
- (2026-05-22) **Expo Dev Client 기준** — Expo Go가 아니라 development build와 `expo start --dev-client`를 검증 기준으로 둡니다.
- (2026-05-23) **모바일 E2E는 Maestro 우선** — Expo Dev Client가 설치된 Simulator/Emulator에서 `scripts/maestro-smoke.mjs`가 LAN Metro를 확인/부팅하고 deep link를 열어, `.maestro/smoke.yml`로 v1 핵심 탭 진입을 `testID` 기준으로 확인합니다.
- (2026-05-22) **Mock-first 앱 기반** — 실제 API가 없는 도메인은 TanStack Query hook과 service/mock 레이어를 먼저 만들고, 실제 API 연결 시 service만 교체합니다.
- (2026-05-22) **이미지 선택은 MVP 포함** — 실제 업로드는 제외하지만 `expo-image-picker` 기반 로컬 선택/미리보기는 공통 UI로 제공합니다.

## 미결 / 추적

- `AGENTS.md` 와 `CLAUDE.md` 의 수동 동기화 부담을 줄일 자동 검증 여부는 추후 필요 시 결정합니다.
- Sentry SDK 설치/초기화, husky/lint-staged는 후속 작업입니다.
- Jest/RNTL은 smoke 범위부터 적용했습니다. 서비스 mutation, hook edge case, 상세/작성 화면 테스트는 Phase 6 이후 API adapter 범위와 함께 확장합니다.
- Codex 기본 샌드박스에서는 `expo start --dev-client --port 8081 --localhost`가 `Starting project...` 이후 8081에 바인딩되지 않을 수 있습니다. 샌드박스 밖 로컬 권한에서는 `npm run test:dev-client:smoke`로 `/status` 응답을 확인했습니다.
- Maestro CLI `2.6.0`은 Homebrew tap(`mobile-dev-inc/tap`)으로 설치되어 있으며, Android Emulator `Medium_Phone_API_36.1`에서 `npm run test:e2e:smoke` 통과 이력이 있습니다. 현재 smoke 기준은 홈/나눔/동행/기도/삶공부 탭 진입입니다.
- 제공 ZIP 110개 화면은 `test:visual:prepare` → Dev Client full capture/partial recapture → `test:visual:compare`로 검증하며 현재 비교 리포트 기준 `screens=110`, `missing=0`, `originalFlat=0`입니다. 남은 residual diff는 상태바/SafeArea, React Native 폰트·모달 번역 차이와 실제 UI 차이를 분리해 추적합니다.
- 2026-05-27 ZIP FAB root overlay 정렬 후 비교 리포트는 `screens=110`, `missing=0`입니다. 대표 residual은 `market-list-all 15.27→13.75`, `group-list 11.61→10.21`, `pray-list 13.32→12.28`, `pray-request 10.17→9.34`로 낮췄습니다. 남은 상위 residual은 `splash`, `me-privacy`, `home`, market detail/create 계열입니다.

## 의존성

- GitHub Issues / PR description 기반 작업 추적 규칙에 의존합니다.
- Expo SDK 55, Expo Dev Client, Reanimated 4, TanStack Query, Zustand, NativeWind, `@solar-icons/react-native`, `react-native-svg`, `expo-image-picker`, `expo-image`, `@react-spectrum/provider@3.11.1`에 의존합니다.

## 관련 ADR

- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
