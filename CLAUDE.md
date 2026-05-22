# YLMC Connect — Claude Code 호환 작업 규칙

본 문서는 Claude Code 호환본입니다. Codex의 기준 작업 규칙은 [AGENTS.md](AGENTS.md) 입니다.
규칙 변경 시 `AGENTS.md` 와 본 파일을 함께 동기화합니다. **모든 작업에 강제력** 을 갖습니다.

---

## 작업 단위 정의

**1 작업 = 사용자 요청 1건에 대해 코드 또는 문서를 수정한 응답 1사이클.**

- 질문 답변, 읽기 전용 응답은 “작업”이 아님 → 의무 갱신 없음.
- 코드/문서를 수정한 응답은 “작업”이며 → 종료 시 4종 의무 갱신 발생.

> 본 시스템은 2026-05-09 자로 외부 도구 마이그레이션됨: TASKS.md → GitHub Issues, LOG.md → PR description, 도메인 상태표 → `scripts/gen-index.sh` 자동생성. 기존 docs 항목은 [docs/_archive/](docs/_archive/) 에 보존.

---

## 작업 시작 시 — 3단계 읽기 (의무)

### Pass 0 — 목차 스캔 (항상, ~30초)
저렴하게 “무엇이 어디에 있는지” 만 파악. 본문 정독 X.

- 작업 issue: `gh issue view <N>` — 본문 + 라벨(도메인) + 마일스톤(Phase). 사용자가 issue 번호를 안 줬으면 `gh issue list --assignee @me --state open` 으로 본인 진행 작업 확인
- [docs/INDEX.md](docs/INDEX.md) — 도메인 상태표(자동생성 영역) + 현재 Phase
- 작업 도메인 `docs/features/<도메인>.md` — 섹션 제목 + 상단 메타 (없으면 신규 생성 대상)
- 최근 PR 제목: `gh pr list --state merged --label <도메인> --limit 5` — 변경 이력 LOG 대체. **제목 + 머지 일자만** 얕게.

### Pass 1 — 정독 (항상)
실제 작업에 직결되는 부분만 본문까지.

- 작업 issue 본문 + 코멘트 (진행 작업의 단일 출처)
- 작업 도메인 features 의 **결정 사항 / 미결 / 데이터 타입 / 의존성 / 주요 파일** 섹션 본문
- (`✅ 완료` 섹션은 제목만 스캔, 본문 스킵 — 재사용 트리거 시만 정독)

> **단일 출처**: 진행 중·예정 작업은 GitHub Issues 가 단일 출처이며 features 페이지에는 진행 상태 기재 금지. features 는 도메인 컨텍스트(완료 결과·결정·타입·파일·의존성) 만 담습니다.

### Pass 2 — 트리거 시 심층 (조건부, 트리거 없으면 열지 말 것)

| 트리거 | 정독할 곳 |
|---|---|
| 신규 도메인 첫 진입 | [PLAN.md](PLAN.md) 의 해당 도메인 섹션 (1회 흡수 후 features 페이지에 거울처럼 옮김) + GitHub 라벨 생성 (`gh label create <도메인>`) |
| 데이터 타입·Phase 정의·기술 스택·보안 정책에 영향 있는 작업 | PLAN.md 관련 섹션 |
| Pass 0 의 PR 제목 스캔에서 관련 결정 의심 | `gh pr view <N>` 으로 description 본문 |
| 다른 도메인과 의존성 있는 작업 | 해당 도메인의 features 페이지 |
| 작업 도메인의 ✅ 완료된 결과물을 재사용 | 작업 도메인 features 의 `✅ 완료` 본문 |

→ Pass 2 를 수행한 경우 보고 시 **`Pass 2 열람: <대상>, 사유: <트리거>`** 한 줄을 보고 양식 위에 추가. 사용자가 토큰 비용 발생 사유를 검증할 수 있도록.

→ 본 3단 규칙은 **토큰 절감 + 이미 한 작업 재고민 방지 + 놓친 과거 결정 발견** 의 균형이 목적.

---

## 작업 종료 시 — 의무 4종 (모두 자동 수행 후 완료 보고)

| # | 갱신 대상 | 최소 형식 |
|---|---|---|
| 1 | PR description | `gh pr create --body` 로 4섹션 (변경 / 결정 / 다음 / 관련) + `Closes #<N>`. PR template 자동 채워지므로 빈 곳만 메우면 됨. PR 미생성 단계라면 description 4섹션을 포함한 commit message 본문으로 대체 |
| 2 | `docs/features/<도메인>.md` | 상단 “마지막 갱신” 갱신 + `✅ 완료` 에 결과 추가 + 결정사항 누적 + 데이터 타입·미결·주요 파일·의존성 동기화 (없으면 `_template.md` 복사로 신규 생성) |
| 3 | GitHub Issue | PR 머지 시 `Closes #<N>` 으로 자동 close. 추가 코멘트 필요 시 `gh issue comment <N>` |
| 4 | `docs/INDEX.md` | 자동생성 영역(`<!-- AUTO-GENERATED-* -->` 마커 사이) 손대지 않음. Phase / ADR 목록 / 상단 “마지막 갱신” 영향 시만 수동 편집 |

> “변경 없음” 인 항목도 명시적으로 “(변경 없음)” 으로 표기. 예외 없음 — 일관성을 위해 기록 자체를 생략하지 않습니다.

## 작업 종료 시 — 조건부

- **새 ADR 결정 발생** → `docs/adr/000N-<제목>.md` 작성 + INDEX 의 ADR 목록에 한 줄 추가
- **PLAN.md 의 데이터 타입 / Phase 정의 / 정책 자체 변경** → PLAN.md 도 함께 수정 + 영향 받는 features 페이지의 “데이터 타입” 섹션 갱신
- **새 도메인 작업 첫 진입** → `docs/features/_template.md` 복사로 `docs/features/<도메인>.md` 신규 생성 + GitHub 라벨 생성 (`gh label create <도메인>`)

### ADR vs features 결정 사항 — 어디에 기록하나
- **ADR (`docs/adr/`)**: 되돌리기 어려움 + 여러 도메인/시스템 영향. 예: 실시간 인프라 선택, 백엔드 스토리지, 인증 방식 변경
- **features 의 결정 사항**: 도메인 내부 결정. 예: cursor 형식, 모달 폼 구조, 특정 hook 의 옵션
- 모호하면 ADR 로. 사후에 “ADR 까지는 아니었다” 고 판단되면 features 로 옮기는 게 반대보다 쉬움.

---

## 설계 변경 흐름 (하향식: PLAN.md → Issues)

새 기능 / 데이터 타입 변경 / 정책 변경처럼 **설계가 시작점** 인 변경은 코드 작업과 별개의 흐름입니다. 본 흐름 자체가 1 작업이며 의무 4종 갱신이 발생합니다.

1. **PLAN.md 수정** — 사용자 승인 필수. 끝의 “변경 이력” 에 명세 마일스톤 한 줄
2. **영향 도메인 features 페이지 갱신** — “데이터 타입” + “결정 사항” 누적. 영향 도메인이 여러 개면 모두
3. **GitHub Issues 신규 등록** — `gh issue create --label <도메인> --milestone "Phase N" --title "..."`. 새 Phase 가 생기면 PLAN.md 의 Phase 표에 행 추가 + GitHub Milestone 생성
4. **PR description / INDEX 갱신** — 본 작업의 PR description 4섹션 작성 + INDEX 자동 갱신 (Phase / ADR 영향 시만 수동)

> 보고 양식의 `features:<도메인>` 부분은 다중 도메인 영향 시 `features:market+group` 처럼 표기.

---

## 보고 양식 (강제)

작업 완료를 사용자에게 알릴 때 마지막 줄에 다음 한 줄을 **반드시** 포함합니다.

```
docs 갱신: PR ✅ / features:<도메인> ✅ / Issue ✅ / INDEX ✅
```

미수행 항목은 `❌ <사유>` 로 표기. 누락 시 사용자가 한눈에 검증할 수 있게 합니다.

Pass 2 를 발동한 경우 보고 양식 바로 위에 한 줄 추가:
```
Pass 2 열람: <대상 파일/섹션>, 사유: <트리거>
```

---

## 설계 기준 문서

[PLAN.md](PLAN.md) — 변경 빈도 낮음. 수정 전 사용자 승인 필수. 평소엔 features 페이지의 “데이터 타입” 섹션이 PLAN.md 의 핵심을 거울처럼 담고 있어 PLAN.md 직접 열람은 Pass 2 트리거 시에만.

## 변경 이력 / 작업 이력 조회

- 변경 이력 (LOG 대체): `gh pr list --state merged --limit 30` / 본문 `gh pr view <N>`
- 진행 작업 (TASKS 대체): `gh issue list --state open` / 본인 작업 `--assignee @me`
- 도메인 필터: `--label <도메인>` 추가

기존 항목은 [docs/_archive/](docs/_archive/) 에 보존.

---

## 외부 사용자 글로벌 규칙과의 관계

사용자 글로벌 `~/.claude/CLAUDE.md` 에 한국어/존댓말, “이해→질문→계획→구현→검증” 등 일반 협업 규칙이 있습니다. 본 프로젝트 CLAUDE.md 는 그 위에 **YLMC Connect 고유의 문서 갱신 의무** 만 추가합니다. 충돌 시 글로벌 규칙이 일반 동작을, 본 문서가 문서 갱신 의무를 각각 담당합니다.
