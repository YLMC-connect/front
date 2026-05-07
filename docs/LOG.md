# 변경 이력

> 최신이 위. AI 는 작업 시작 시 **최상단 5~10건의 제목 + 결정 한 줄만** 얕게 스캔합니다. 본문 정독은 “과거 결정 추적” 트리거가 있을 때만.
>
> 한 항목 = 한 작업 단위. 변경 / 결정 / 다음 / 관련 4줄 골격.

---

## 2026-05-08

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
