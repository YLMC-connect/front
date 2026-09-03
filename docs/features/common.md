# common (공통 인프라)

> 마지막 갱신: 2026-09-03 (워크플로 축소, home 도메인 편입) | 담당 Phase: P1/P6 | 기록 성격: 도메인 컨텍스트

## 한 줄 요약

프로젝트 전반에서 공유하는 협업 규칙, 문서 체계, 공통 런타임/타입/설정의 기준을 관리합니다.

---

## ✅ 완료

> 지금 시스템이 어떻게 동작하는지. 날짜별 이력은 머지된 PR (`gh pr list --state merged --label common`).

- Expo SDK 55 + Dev Client 기준. 서버 데이터는 TanStack Query, 인증·UI는 Zustand. mock-first 후 `services/` 만 교체
- 본문 글꼴 Pretendard. 아이콘은 공통 `AppIcon`(Solar Linear, 선택 Bold)
- 루트 5탭 홈/나눔/동행/기도/삶공부. MY는 홈에서 숨김 route. 상세는 탭 중첩 Stack
- 화면 상단은 `safe area + 20px`. 이미지 hero overlay만 예외
- 루트 탭은 glass sticky 헤더 + `StickyHeaderScreen`. 기본 숨김은 아래 12px / 위 4px(`direction`)
- 작성 입력은 공통 `ModalFormTextInput`(primary 2px 포커스). 검색은 `SearchField`
- 숨긴 웹 route의 `0×0` layout은 탭·필터 geometry로 쓰지 않음
- API client는 기본 `{ code, message, data }` envelope. login/refresh처럼 비envelope 성공만 `format: "json"`
- 인증·나눔·동행 Swagger 계약 검사 스크립트 (`test:api:contract*`)
- PR CI 게이트는 `npm run validate`. visual 비교와 Maestro는 요청 시

---

## 주요 파일

| 경로 | 역할 |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | AI 작업 규칙 |
| `.task-flow.conf` | 도메인 목록 단일 출처 |
| `docs/INDEX.md` | 진입점. 도메인 상태표는 Issues 기반 자동생성 |
| `scripts/gen-index.sh` | INDEX 상태표 재생성 |
| `docs/MAINTENANCE.md` | 문서 드리프트 복구 |
| `src/lib/apiClient.ts` | envelope·오류·Authorization |
| `src/constants/theme.ts` / `designTokens.json` | 디자인 토큰 |
| `src/components/layout/Screen.tsx` | 공통 화면 + 상단 inset |
| `src/components/layout/StickyHeaderScreen.tsx` | 루트 탭 sticky 헤더·필터 |
| `src/components/ui/` | AppText, AppIcon, Card, 검색·작성·모션 |
| `.github/workflows/ci.yml` | PR `npm run validate` |
| `scripts/check-*-api-contract.mjs` | Swagger 계약 검사 |
| `scripts/prepare-design-artifacts.mjs` 등 | ZIP 시각 비교. **요청 시에만** |

홈 루트 화면 지도는 [home.md](home.md).

## 데이터 타입

[../../PLAN.md](../../PLAN.md) “🗃 데이터 타입 설계 > 공통” 참조. `ApiResponse<T>` 는 `src/types/api.ts`.

## 결정 사항 (지금 유효한 것만)

- **기본 검증은 `npm run validate`** — visual capture/compare 와 Maestro/`validate:full` 은 사용자가 요청하거나 디자인 번역·릴리스일 때만.
- **features `✅ 완료` 는 현재 동작** — 작업 일시는 머지된 PR description.
- **도메인 목록은 `.task-flow.conf`** — `home` 포함. INDEX 표는 이 목록 + Issues 라벨.
- **공유용 mock 웹은 공식 제품이 아님** — `export:web:mock` 정적 export. 검증 기준은 Expo Dev Client. (코드는 별도 PR)
- **API client `format: "json"` 은 opt-in** — 기본 envelope 유지. 토큰 객체를 최상위로 주는 login/refresh만 허용.
- **본문 글꼴 Pretendard / 아이콘 Solar** — 화면이 글꼴·아이콘 세트를 직접 고르지 않음.
- **UI 톤은 조용한 깔끔함** — 제목 bold, 카드 hairline, ZIP 픽셀 맞춤보다 톤 일관성.
- **화면 상단 `safe area + 20px`** — 나눔 상세 이미지 overlay만 예외.
- **작성 입력은 `ModalFormTextInput` 소유** — 화면은 값·제약만.
- **sticky 기본 숨김은 direction(12px/4px)** — hide mode를 화면이 바꿀 수 있음 (`past-inset` / `never`).
- **숨긴 route의 0 크기 layout은 무시** — 마지막 양수 geometry 유지.
- **탭 IA는 홈/나눔/동행/기도/삶공부** — MY는 홈 진입.
- **Expo Dev Client 기준** — Expo Go 아님. NativeWind Babel preset 위치 유지.
- **Mock-first** — API 없는 도메인은 service/mock 후 adapter 교체.

## 미결 / 추적

- Sentry, husky/lint-staged
- mutation/hook 테스트는 API adapter 범위와 함께 확장
- #25 Android TopBar 캡처 이상은 시각 파이프라인을 다시 돌릴 때
- mock 웹의 실제 Vercel URL은 계정 연결 후

## 의존성

- GitHub Issues / PR description 작업 추적
- Expo SDK 55, Dev Client, Reanimated 4, TanStack Query, Zustand, NativeWind, Solar icons

## 관련 ADR

- [ADR 0001 — 기술 스택](../adr/0001-tech-stack.md)
- [ADR 0002 — 백엔드 선택 보류 (Mock-first)](../adr/0002-backend-tbd.md)
- [ADR 0003 — MVP 범위는 Notion 최신 정의 우선](../adr/0003-mvp-scope-notion-first.md)
- [ADR 0004 — Notion v1 범위와 Expo Dev Client 기준](../adr/0004-notion-v1-dev-client-scope.md)
- [ADR 0005 — 모바일 E2E는 Maestro 우선](../adr/0005-mobile-e2e-maestro-first.md)
