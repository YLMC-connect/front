# 변경 이력

> 최신이 위. AI 는 작업 시작 시 **최상단 5~10건의 제목 + 결정 한 줄만** 얕게 스캔합니다. 본문 정독은 “과거 결정 추적” 트리거가 있을 때만.
>
> 한 항목 = 한 작업 단위. 변경 / 결정 / 다음 / 관련 4줄 골격.

---

## 2026-05-08

### MAINTENANCE.md §4.5 (LOG vs git log) 시나리오 삭제 — 시나리오 9 → 8 개
- 변경: `docs/MAINTENANCE.md` (§4.5 본문 삭제 + 4.6→4.5 / 4.7→4.6 / 4.8→4.7 / 4.9→4.8 재번호, §3.0 자율/승인 경계표 행 삭제 및 anchor 갱신, §3.1 스캔 명령 블록 삭제, §3.2 “4.1 ~ 4.9” → “4.1 ~ 4.8”, §3.4 보고 예시 번호 갱신, 헤더 “마지막 갱신” 사유 명시), `docs/INDEX.md` (마지막 갱신 일자 사유 갱신)
- 결정: LOG.md (AI 가 작업 단위로 갱신) 와 git log (사용자 직접 커밋 포함) 는 기록하는 이벤트의 종류가 달라 일자 분포 비교가 무의미. AI 작업만 식별하는 커밋 컨벤션이 없으면 검출 신뢰도 0 — 따라서 시나리오 자체를 제거. 자율 시나리오는 4.1/4.5/4.6/4.7 (4개), 승인 시나리오는 4.2/4.8 (2개), 양쪽 가능은 4.3/4.4 (2개)
- 다음: Phase 1 P1 — `create-expo-app` 프로젝트 생성 + 폴더 골격 ([TASKS.md](TASKS.md) “🔥 다음 > 2)”)
- 관련: [MAINTENANCE.md](MAINTENANCE.md)

### 유지보수 지침서 신설 — 드리프트 복구 런북 (`docs/MAINTENANCE.md`)
- 변경: `docs/MAINTENANCE.md` (신규, SSOT 매트릭스 + 자율/승인 경계표 + 9개 드리프트 시나리오 + 1~4단계 런북 + 안티패턴), `docs/INDEX.md` (마지막 갱신 + MAINTENANCE 진입점 한 줄 추가)
- 결정: ① CLAUDE.md 는 “작업 1 사이클 동안” 의 의무, MAINTENANCE 는 “시스템 자체 정합성 + 드리프트 복구” 로 역할 분리. ② 런북 모드 채택 — 사용자가 `유지보수 해줘` / `drift check` 트리거 한 줄로 호출하면 AI 가 1~4단계를 자율 수행 (객관적 비교는 자율, 정책·승인 결정은 사용자 회부). ③ 9개 시나리오 중 4.1/4.5/4.6/4.7/4.8 은 [자율], 4.2/4.3/4.4/4.9 는 [승인 필요]
- 다음: Phase 1 P1 — `create-expo-app` 프로젝트 생성 + 폴더 골격 ([TASKS.md](TASKS.md) “🔥 다음 > 2)”). 별도로, Phase 1 진입 직후 본 런북을 한 번 드라이런하여 명령들이 실제 동작하는지 검증
- 관련: 플랜 파일 `/Users/mingulee/.claude/plans/binary-booping-ritchie.md`, [MAINTENANCE.md](MAINTENANCE.md), [CLAUDE.md](../CLAUDE.md)

### NativeWind v4 채택 — 스타일 도구 정책 변경 (StyleSheet → NativeWind className 우선)
- 변경: `PLAN.md` (기술 스택 표 스타일 행 교체, 호환성 표에 NativeWind 4 게이트 행 추가, 폴더 구조에 `tailwind.config.js`/`babel.config.js`/`metro.config.js`/`global.css`/`nativewind-env.d.ts` 추가, theme.ts 주석에 “tailwind.config 가 import 하는 단일 출처” 명시, 변경 이력 한 줄), `docs/adr/0001-tech-stack.md` (스타일 섹션 신설 + “초기 보류 후 채택의 사유” + 기각 대안에서 NativeWind 행 제거 + 새 기각 후보 “tailwind.config 단일 출처(theme.ts 폐기)” 추가 + 영향 섹션에 토큰 단일 출처 원칙), `docs/TASKS.md` (의존성 묶음 D 신설 — A→B→D→C 순서, NativeWind 셋업 8 단계 + 4 게이트 검증 작업, theme.ts 임시 토큰 P1 / 본격 토큰 P2, prettier-plugin-tailwindcss 추가), `docs/INDEX.md` (마지막 갱신 + ADR 0001 한 줄 갱신)
- 결정: ① 스타일 도구를 NativeWind v4 + StyleSheet(예외) 로 전환. ② 디자인 토큰 단일 출처는 `src/constants/theme.ts`, `tailwind.config.js` 가 require 로 import (반대 방향 동기화 금지). ③ 의존성 설치 순서를 A → B → D(NativeWind) → C(dev-tools) 로 — typecheck 게이트 활성화 시 nativewind-env.d.ts 가 이미 존재해야 className 타입이 통과하므로
- 다음: Phase 1 P1 — `create-expo-app` 으로 프로젝트 생성 + 폴더 골격 ([TASKS.md](TASKS.md) “🔥 다음 > 2) 프로젝트 골격”). 의존성 설치 시 묶음 D 단계에서 NativeWind 4 게이트 검증 필수
- 관련: [adr/0001-tech-stack.md](adr/0001-tech-stack.md), [PLAN.md “⚠️ 버전 호환성 주의사항”](../PLAN.md), [TASKS.md “🔥 다음 > 5)~6)”](TASKS.md)

### ADR 0001/0002 작성 + Phase 1 의존성 설치 3 묶음 분할 — Phase 1 진입 안전화
- 변경: `docs/adr/0001-tech-stack.md` (신규, Expo SDK 55 + TanStack Query + Zustand + zod 등 채택 근거 영속화), `docs/adr/0002-backend-tbd.md` (신규, Phase 5 종료까지 백엔드 결정 보류 + services/ 격리 원칙), `docs/TASKS.md` (의존성 설치를 묶음 A/B/C 로 분할 + 각 묶음 후 expo-doctor/expo start 스모크 + husky 게이트를 P3→P1 로 승격), `docs/INDEX.md` (마지막 갱신 + ADR 섹션에 0001/0002 등재)
- 결정: ① 기술 스택의 “왜” 를 PLAN.md 표 위에 ADR 로 영속화. ② 백엔드 결정은 “보류” 자체를 ADR 로 명시 (Phase 5 종료가 보류 해제 트리거). ③ RN/Expo 생태계의 New Architecture 비호환 위험을 분산하기 위해 의존성 설치를 한 작업 → 3 묶음으로 분할. ④ 첫 도메인 작업 진입 전에 typecheck 게이트가 작동하도록 husky 를 P1 로 승격
- 다음: Phase 1 P1 — `create-expo-app` 으로 프로젝트 생성 + 폴더 골격 ([TASKS.md](TASKS.md) “🔥 다음 > 2) 프로젝트 골격”)
- 관련: [adr/0001-tech-stack.md](adr/0001-tech-stack.md), [adr/0002-backend-tbd.md](adr/0002-backend-tbd.md)

### 문서 시스템 중복 제거 + 설계 변경 흐름 명문화 — 단일 출처 정렬
- 변경: `docs/features/_template.md` (🔵 진행중/⬜ 예정 + 파일표 상태 컬럼 제거), `docs/TASKS.md` (백로그 PLAN 참조로 압축), `CLAUDE.md` (Pass 1 갱신 + 의무 4종 features 항목 갱신 + ADR vs features 기준 + 설계 변경 흐름(하향식) 신설), `docs/INDEX.md` (라우팅 안내 갱신), `PLAN.md` (변경 이력 의미 명시)
- 결정: 단일 출처 분리 — **진행 상태=TASKS.md, 도메인 컨텍스트=features, 설계 명세=PLAN.md, 감사=LOG.md**. 같은 정보 두 곳 금지. 설계 변경은 하향식 흐름(PLAN→features→TASKS→LOG/INDEX)으로 명문화
- 다음: Phase 1 P1 1번 — `create-expo-app` 으로 프로젝트 생성 + 폴더 골격
- 관련: (변경 없음)

### PLAN.md Phase 섹션 표로 압축 — TASKS.md 와 진행 상태 일원화
- 변경: `PLAN.md` 의 “🚀 개발 단계 (Phase)” 100여 개 체크박스를 Phase 단위 큰 그림 표로 교체. 의존성 설치 명령 블록은 `docs/TASKS.md` 로 이전 보존
- 결정: 옵션 A 채택 — PLAN.md = 설계 명세 + Phase 큰 그림, TASKS.md = 진행 상태 단일 출처. 중복으로 인한 stale 위험 제거
- 다음: Phase 1 P1 1번 — `create-expo-app` 으로 프로젝트 생성 + 폴더 골격
- 관련: (변경 없음)

### docs 시스템 구축 — 토큰-효율 + 사람-친화 4계층 문서 골격
- 변경: `README.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/TASKS.md`, `docs/LOG.md`(본 파일), `docs/features/_template.md`, `docs/adr/.gitkeep` 신규 생성
- 결정: 4계층 정보 피라미드(README → INDEX → features/TASKS → LOG/PLAN), 도메인 페이지 ✅완료/🔵진행중/⬜예정 3단 분리, AI 3단계 읽기(Pass 0/1/2), 자동 관리 강제는 CLAUDE.md 의무 규칙 + 보고 양식 두 축으로 (Stop hook 미채택)
- 다음: Phase 1 세팅 시작 — `create-expo-app` 으로 프로젝트 생성 + 의존성 설치 ([TASKS.md](TASKS.md) 의 “🔥 다음” P1 1번)
- 관련: 플랜 파일 `/Users/mingulee/.claude/plans/enchanted-honking-starfish.md`
