# 변경 이력

> 최신이 위. AI 는 작업 시작 시 **최상단 5~10건의 제목 + 결정 한 줄만** 얕게 스캔합니다. 본문 정독은 “과거 결정 추적” 트리거가 있을 때만.
>
> 한 항목 = 한 작업 단위. 변경 / 결정 / 다음 / 관련 4줄 골격.

---

## 2026-05-08

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
