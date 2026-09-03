# YLMC Connect — Codex 작업 규칙

본 문서는 Codex가 저장소 지침으로 읽는 `AGENTS.md` 입니다. **모든 작업에 강제력** 을 갖습니다.
Claude Code 호환본은 [CLAUDE.md](CLAUDE.md) 이며, 규칙 변경 시 두 파일을 함께 동기화합니다.

---

## 작업 단위 정의

**1 작업 = 사용자 요청 1건에 대해 코드 또는 문서를 수정한 응답 1사이클.**

- 질문 답변, 읽기 전용 응답은 “작업”이 아님 → 의무 갱신 없음.
- 코드/문서를 수정한 응답은 “작업”이며 → 아래 종료 의무를 따른다.
- **한 브랜치/PR에는 한 가지 일만 둔다.** 동행 HTTP와 홈 UI처럼 다른 일은 이슈·브랜치·PR을 가른다.

> 본 시스템은 2026-05-09 자로 외부 도구 마이그레이션됨: TASKS.md → GitHub Issues, LOG.md → PR description, 도메인 상태표 → `scripts/gen-index.sh` 자동생성. 기존 docs 항목은 [docs/_archive/](docs/_archive/) 에 보존.

---

## 작업 시작 시 — 3단계 읽기

### Pass 0 — 목차 스캔 (항상, 짧게)
본문 정독 X. 작은 수정은 이슈 제목 + 도메인 features 헤더만으로 충분하다.

- 작업 issue가 있으면 `gh issue view <N>` — 제목·라벨·마일스톤. 없으면 만들지 않고 진행하지 말 것(새 일이면 Issue 먼저).
- 작업 도메인 `docs/features/<도메인>.md` — 상단 메타 + 섹션 제목
- [docs/INDEX.md](docs/INDEX.md) 현재 Phase — 한눈만

최근 머지 PR 목록은 Pass 0에서 돌리지 않는다. 제목만 보고 관련 결정이 의심될 때 Pass 2.

### Pass 1 — 정독 (항상)
실제 작업에 직결되는 부분만 본문까지.

- 작업 issue 본문 + 코멘트 (진행 작업의 단일 출처)
- 작업 도메인 features 의 **결정 사항 / 미결 / 데이터 타입 / 의존성 / 주요 파일**
- (`✅ 완료` 는 현재 동작 요약이다. 재사용이 필요할 때만 본문 정독)

> **단일 출처**: 진행 중·예정 작업은 GitHub Issues. features 에는 진행 상태를 적지 않는다. features 는 도메인 컨텍스트(현재 동작·결정·타입·파일·의존성) 만 담는다.

### Pass 2 — 트리거 시 심층 (조건부, 트리거 없으면 열지 말 것)

| 트리거 | 정독할 곳 |
|---|---|
| 신규 도메인 첫 진입 | [PLAN.md](PLAN.md) 의 해당 도메인 섹션 (1회 흡수 후 features 페이지에 거울처럼 옮김) + GitHub 라벨 생성 (`gh label create <도메인>`) + `.task-flow.conf` 의 `DOMAINS` |
| 데이터 타입·Phase 정의·기술 스택·보안 정책에 영향 있는 작업 | PLAN.md 관련 섹션 |
| 관련 결정이 의심될 때 | `gh pr view <N>` 으로 description 본문 |
| 다른 도메인과 의존성 있는 작업 | 해당 도메인의 features 페이지 |
| 작업 도메인의 ✅ 완료된 결과물을 재사용 | 작업 도메인 features 의 `✅ 완료` 본문 |

→ Pass 2 를 수행한 경우 보고 시 **`Pass 2 열람: <대상>, 사유: <트리거>`** 한 줄을 보고 양식 위에 추가.

---

## 검증

기본 게이트는 **`npm run validate`** (typecheck + lint + format + test) 다.

- `test:visual:*`, `test:e2e:smoke`, `validate:full` 은 사용자가 요청하거나 디자인 번역·릴리스를 할 때만 돌린다.
- PR CI도 `validate` 만 돌린다.

---

## 작업 종료 시 — 문서 의무 (해당할 때만)

| # | 갱신 대상 | 언제 |
|---|---|---|
| 1 | PR description | PR을 열거나 갱신할 때. 4섹션(변경 / 결정 / 다음 / 관련) + `Closes #<N>`. PR이 아직이면 커밋 본문에 같은 4섹션 |
| 2 | `docs/features/<도메인>.md` | **현재 동작·결정·타입·파일 지도가 바뀔 때만.** `✅ 완료` 는 지금 시스템이 어떻게 동작하는지. 날짜별 작업 이력을 쌓지 않는다. 이력은 머지된 PR |
| 3 | GitHub Issue | `Closes #<N>` 이면 충분. 코멘트는 예외·범위 변경이 있을 때만 |
| 4 | `docs/INDEX.md` | **손대지 않음.** 자동생성 영역은 Action/`scripts/gen-index.sh`. Phase / ADR 목록이 바뀔 때만 수동 |

바뀌지 않은 항목은 보고에서 생략한다. “(변경 없음)”을 적지 않는다.

## 작업 종료 시 — 조건부

- **새 ADR 결정 발생** → `docs/adr/000N-<제목>.md` 작성 + INDEX 의 ADR 목록에 한 줄 추가
- **PLAN.md 의 데이터 타입 / Phase 정의 / 정책 자체 변경** → PLAN.md 도 함께 수정 + 영향 받는 features 페이지의 “데이터 타입” 섹션 갱신. PLAN 수정은 사용자 승인 필수
- **새 도메인 작업 첫 진입** → `docs/features/_template.md` 복사로 `docs/features/<도메인>.md` 신규 생성 + `gh label create <도메인>` + `.task-flow.conf` 의 `DOMAINS` 에 추가

### ADR vs features 결정 사항 — 어디에 기록하나
- **ADR (`docs/adr/`)**: 되돌리기 어려움 + 여러 도메인/시스템 영향
- **features 의 결정 사항**: 도메인 내부 결정. 지금도 유효한 것만 남긴다
- 모호하면 ADR 로

---

## 설계 변경 흐름 (하향식: PLAN.md → Issues)

새 기능 / 데이터 타입 변경 / 정책 변경처럼 **설계가 시작점** 인 변경은 코드 작업과 별개다.

1. **PLAN.md 수정** — 사용자 승인 필수. 끝의 “변경 이력” 에 명세 마일스톤 한 줄
2. **영향 도메인 features 페이지 갱신** — “데이터 타입” + 지금 유효한 “결정 사항”
3. **GitHub Issues 신규 등록** — `gh issue create --label <도메인> --milestone "Phase N" --title "..."`. 새 Phase 가 생기면 PLAN.md 의 Phase 표에 행 추가 + GitHub Milestone 생성
4. **PR description** — 4섹션. INDEX 는 Action 이 갱신

---

## 보고 양식

작업 완료를 알릴 때, **실제로 손본 항목만** 한 줄로 적는다.

```
docs 갱신: PR ✅ / features:<도메인> ✅ / Issue ✅
```

안 한 항목은 빼거나 `❌ <사유>`. INDEX 는 Phase/ADR 을 손봤을 때만 넣는다.

Pass 2 를 발동한 경우 바로 위에:
```
Pass 2 열람: <대상 파일/섹션>, 사유: <트리거>
```

---

## 설계 기준 문서

[PLAN.md](PLAN.md) — 변경 빈도 낮음. 수정 전 사용자 승인 필수. 평소엔 features 페이지의 “데이터 타입” 섹션이 PLAN.md 의 핵심을 거울처럼 담고 있어 PLAN.md 직접 열람은 Pass 2 트리거 시에만.

도메인 목록의 단일 출처는 [`.task-flow.conf`](.task-flow.conf) 다.

## 변경 이력 / 작업 이력 조회

- 변경 이력: `gh pr list --state merged --limit 30` / 본문 `gh pr view <N>`
- 진행 작업: `gh issue list --state open` / 본인 작업 `--assignee @me`
- 도메인 필터: `--label <도메인>` 추가

기존 항목은 [docs/_archive/](docs/_archive/) 에 보존.

---

## 외부 사용자 글로벌 규칙과의 관계

사용자 글로벌 `~/.Codex/AGENTS.md` 에 한국어/존댓말, “이해→질문→계획→구현→검증” 등 일반 협업 규칙이 있습니다. 본 프로젝트 AGENTS.md 는 그 위에 **YLMC Connect 고유의 문서 갱신 의무** 만 추가합니다. 충돌 시 글로벌 규칙이 일반 동작을, 본 문서가 문서 갱신 의무를 각각 담당합니다.
