# 유지보수 지침

> 마지막 갱신: 2026-09-03 (문서 의무 축소) | 대상: 사람 신규 기여자 + AI 차기 세션 둘 다

본 문서는 **시간이 지나며 문서가 실제 작업과 어긋나거나 문서끼리 모순될 때** 무엇을 진실로 삼고 어떻게 복구할지 정의합니다. 평소의 작업 중 의무는 [../AGENTS.md](../AGENTS.md) 가, 도메인별 컨텍스트는 [features/](features/) 가, 진행 상태는 **GitHub Issues** 가, 변경 감사는 **PR description / git log** 가 담당합니다.

---

## 1. 1분 요약

- **AGENTS.md** 는 “작업 1 사이클 동안” 의 의무. **본 지침서** 는 “시스템 자체의 정합성 유지 + 드리프트 발생 시 복구” 를 다룹니다.
- 진실은 **단일 출처(SSOT)** 가 갖습니다. 다른 곳에 같은 정보가 보이면 그건 “거울” 이며, 깨졌을 때는 SSOT 가 이깁니다.
- AI 가 `유지보수 해줘` / `drift check` / `docs 점검` 트리거를 받으면 §3 런북을 1 → 2 → 3 → 4 단계로 수행합니다.
- 2026-05-09 마이그레이션으로 일부 SSOT 가 외부 도구로 이전됨. 기존 항목은 [_archive/](_archive/) 보존.

---

## 2. 단일 출처(SSOT) 매트릭스

| 정보 | SSOT | 거울(허용) | 금지 |
|---|---|---|---|
| 진행 중·예정 작업 | **GitHub Issues** (label=도메인, milestone=Phase) | — | features 페이지에 진행 상태 기재 |
| 완료 결과·도메인 결정 | features/&lt;도메인&gt;.md | PR description(요약 1줄) | Issues 에 결과 본문 |
| 변경 감사 기록 | **PR description** + `git log` | — | features `✅완료` 본문에 일자별 변경 본문 복붙 |
| Phase 정의·기술 스택·데이터 타입 마스터 | [../PLAN.md](../PLAN.md) | features “데이터 타입” 섹션(요약·참조) | features 가 PLAN 과 다른 정의 보유 |
| 시스템 전반 결정 | [adr/](adr/) | features “결정 사항” 에 “ADR-000N 참조” | features 가 ADR 과 모순되는 결정 보유 |
| 도메인 상태·전체 진행률 | [INDEX.md](INDEX.md) **자동생성 영역** (Issues 데이터 기반) | features 헤더의 담당 Phase / 컨텍스트 메타 | INDEX 자동영역 손편집 |
| AI 작업 규칙 | [../AGENTS.md](../AGENTS.md) | [../CLAUDE.md](../CLAUDE.md) (Claude Code 호환본) | 다른 docs 가 AGENTS.md 규칙 재정의 |

원칙: **객관적 사실 비교(파일·git·Issues·PR 간 단순 일치)** 는 자율 복구, **정책·설계·승인 결정** 은 사용자 회부.

---

## 3. 유지보수 런북

> **트리거**: 사용자가 `유지보수 해줘`, `drift check`, `docs 점검` 등으로 호출하면 본 런북을 1 → 2 → 3 → 4 단계 순서로 수행합니다. 평소 작업의 문서 의무는 [../AGENTS.md](../AGENTS.md) — 바뀐 항목만.

### 3.0 자율 / 승인 경계표

| 시나리오 | AI 단독 | 사용자 회부 |
|---|:---:|:---:|
| [4.1](#41-index-도메인-상태표-자동영역-stale) INDEX 자동영역 stale | ✅ | |
| [4.2](#42-stale-issue-진행-중인데-실제로는-멈춤) stale issue (진행 중인데 멈춤) | | ✅ (의도 확인) |
| [4.3](#43-features-데이터-타입--planmd-마스터-타입) features 타입 ≠ PLAN | △ (PLAN 이 옳을 때만 features 동기화) | ✅ (PLAN 수정 필요 시) |
| [4.4](#44-features-결정-사항--adr-결정-모순) features 결정 ↔ ADR 모순 | △ (ADR 이 옳을 때만 features 정정) | ✅ (ADR supersede 필요 시) |
| [4.5](#45-features-주요-파일--실제-파일-트리) features 파일 ≠ 실제 트리 | ✅ | |
| [4.6](#46-도메인-페이지가-없는데-issuespr-에-해당-도메인-작업-존재) 도메인 페이지 부재 | ✅ | |
| [4.7](#47-agentsmd-규칙과-실제-운영이-다름) AGENTS.md 규칙 ≠ 운영 | | ✅ (규칙 변경 승인) |

### 3.1 1단계 — 스캔 (모두 실행)

각 시나리오 탐지 명령. 결과는 작업 메모리에만 두고 다음 단계로. **사전 조건**: `gh auth status` 가 OK.

```bash
# 4.1 INDEX 자동영역 stale (마커 사이가 현재 Issues 와 일치하는지)
bash scripts/gen-index.sh
git diff --quiet docs/INDEX.md || echo "INDEX 자동영역이 stale — 재생성 필요"

# 4.5 features 주요 파일 vs 실제
ls docs/features/*.md 2>/dev/null | grep -v _template
find src -type d -maxdepth 2 2>/dev/null

# 4.3 PLAN 데이터 타입 vs features
grep -nA 5 '데이터 타입' docs/features/*.md 2>/dev/null
grep -nA 5 '데이터 타입' PLAN.md

# 4.6 도메인 페이지 부재 (src 디렉토리 ↔ features 페이지)
diff <(ls src/ 2>/dev/null | sort) <(ls docs/features/ 2>/dev/null | sed 's/.md//' | grep -v _template | sort)

# 4.4 features 결정 ↔ ADR
grep -nA 3 '결정 사항' docs/features/*.md 2>/dev/null
ls docs/adr/

# 4.2 stale issue (사용자 확인용 자료) — 7일+ 코멘트/PR 없음
gh issue list --state open --json number,title,updatedAt --jq '.[] | select((now - (.updatedAt | fromdateiso8601)) > 7*86400) | "#\(.number) \(.title) (last: \(.updatedAt[0:10]))"'

# 4.7 운영 ≠ 규칙: 최근 PR description 4섹션 누락 검사
for n in $(gh pr list --state merged --limit 10 --json number --jq '.[].number'); do
  body=$(gh pr view "$n" --json body --jq '.body')
  if ! echo "$body" | grep -q '^## 변경'; then
    echo "PR #$n 에 '## 변경' 섹션 누락"
  fi
done
```

### 3.2 2단계 — 분류

스캔 결과를 §4 의 시나리오 4.1 ~ 4.7 에 매핑. 각 항목을 **[자율]** / **[승인]** 로 표시. §3.0 의 경계표가 기준.

### 3.3 3단계 — 복구

- **[자율]** 항목: §4 해당 시나리오의 “복구” 절차 그대로 즉시 수행. 수정한 파일은 [../AGENTS.md](../AGENTS.md) 의 의무 4종(PR / features / Issue / INDEX)에 따라 갱신.
- **[승인]** 항목: 손대지 않고 다음 단계 보고에 ❓ 로 모음.

### 3.4 4단계 — 보고

런북 종료 시 사용자에게 다음 양식으로 한 번에 보고합니다.

```
유지보수 런북 결과 (YYYY-MM-DD):

[자율 복구 N건]
- 4.1: INDEX 자동영역 재생성 (auth 진행 중 1→2)
- 4.5: features/group.md 주요 파일에 src/group/hooks/useGroupList.ts 추가
- 4.6: features/auth.md 신규 생성 (src/auth 존재하나 features 부재였음)

[사용자 승인 필요 M건]
- ❓ 4.3: features/group.md 의 GroupMember.role 이 PLAN.md 와 다름 — PLAN 수정 필요?
- ❓ 4.2: Issue #42 “프로필 편집” 이 9일째 정체 — close / 보류 라벨 / 그대로 유지?

[변경 없음 K개 시나리오]
- 4.4 / 4.7: 검출 없음

docs 갱신: PR ✅ / features:<도메인> ✅ / Issue ✅ / INDEX ✅
```

---

## 3-A. 정기 점검 (런북 외, 사람 운영용)

- **매 작업 종료 시** (사람·AI 공통): [../AGENTS.md](../AGENTS.md) 의 의무 4종 + 보고 양식 (이미 강제됨).
- **주간**: 사용자가 `유지보수 해줘` 트리거로 §3 런북 호출. 월요일 권장.
- **분기 (Phase 종료 시)**: 전수 감사. PR / Issue 는 GitHub 가 무한 보존하므로 별도 아카이빙 불필요. features 가 비대해지면 도메인 분할 검토.

---

## 4. 드리프트 시나리오별 복구 절차

각 시나리오 양식: **증상 → 진실 판정 기준 → 복구 절차 → 재발 방지**.

### 4.1 INDEX 도메인 상태표 자동영역 stale

- **증상**: [INDEX.md](INDEX.md) 의 `<!-- AUTO-GENERATED-* -->` 마커 사이가 현재 GitHub Issues 와 다름. 보통 워크플로 실패·로컬 push 미반영 등.
- **진실**: GitHub Issues 의 라벨별 카운트 + features/<도메인>.md 존재 여부.
- **복구**:
  1. `bash scripts/gen-index.sh` 실행 → INDEX.md 의 마커 사이 영역 재생성
  2. `git diff` 로 변경 검토 → commit + push (워크플로가 못 한 일을 사람이 대신)
  3. GitHub Actions 의 `Auto-update INDEX` 워크플로 최근 실행 로그 확인 → 실패 사유 있으면 워크플로 수정 (별도 작업)
- **재발 방지**: 워크플로가 main push + Issues 이벤트 양쪽에 트리거되도록 유지. 스크립트 로컬 실행으로도 동일 결과 나오는지 분기 점검.

### 4.2 stale issue (진행 중인데 실제로는 멈춤)

- **증상**: `gh issue list --state open` 의 항목이 7일+ 코멘트·연결 PR 없음.
- **진실**: 사용자의 현재 의도 (확인 필요).
- **복구**: 사용자에게 1줄 확인 → 계속이면 `gh issue comment <N>` 로 진행 상태 코멘트, 중단이면 `gh issue close <N> --reason "not planned"` 또는 `보류` 라벨 추가하고 사유 코멘트.
- **재발 방지**: assignee=@me 진행 중 동시 1~2건 상한 유지. Projects 보드의 “In Progress” 컬럼이 가시화 도구.

### 4.3 features 데이터 타입 ≠ PLAN.md 마스터 타입

- **증상**: features/&lt;도메인&gt;.md 의 “데이터 타입” 섹션이 [../PLAN.md](../PLAN.md) “🗃 데이터 타입 설계” 와 다름.
- **진실**: PLAN.md (사용자 승인을 받은 마스터).
- **복구**:
  - PLAN.md 가 옳다면 → features 의 거울만 갱신 (자율).
  - features 가 옳다면 → **사용자 승인 필요한 PLAN.md 수정** 으로 승격. AGENTS.md “설계 변경 흐름” 발동: PLAN.md 수정 → 영향 features 동기화 → Issues 신규 등록 → PR description / INDEX 갱신.
- **재발 방지**: PLAN.md 변경 시 영향 features 즉시 동기화. features 의 “데이터 타입” 섹션은 가능하면 PLAN.md 의 해당 섹션을 링크만 하고 본문 복사를 최소화.

### 4.4 features 결정 사항 ↔ ADR 결정 모순

- **증상**: features 의 “결정 사항” 항목이 [adr/](adr/) 의 수락된 ADR 과 다른 결론을 갖고 있음.
- **진실**: ADR (수락된 ADR 은 features 결정보다 우위).
- **복구**:
  - ADR 이 옳다면 → features 의 모순 항목 삭제 → “ADR-000N 참조” 한 줄로 대체 (자율).
  - ADR 자체가 틀렸다면 → **새 ADR 로 supersede**. 옛 ADR 헤더 상태를 “기각 (Superseded by 000N, YYYY-MM-DD)” 으로 변경. INDEX 의 ADR 목록도 갱신. 사용자 승인 필요.
- **재발 방지**: 도메인 외 영향이 있는 결정은 처음부터 ADR 로. 모호하면 ADR 로 (사후에 features 로 강등이 반대보다 쉬움).

### 4.5 features “주요 파일” ≠ 실제 파일 트리

- **증상**: features/&lt;도메인&gt;.md 의 “주요 파일” 표가 실제 `src/<도메인>/` 트리와 다름 (누락 / 잘못된 경로 / 삭제된 파일).
- **진실**: 파일 시스템.
- **복구**: `find src/<도메인> -type f -name '*.ts*'` 로 실제 트리 재추출 → features 표 갱신. 파일 표는 “지도” 역할이므로 모든 파일을 나열할 필요는 없으며 핵심 진입점만.
- **재발 방지**: 파일 이동·삭제 작업의 작업 단위에 features 갱신 포함.

### 4.6 도메인 페이지가 없는데 Issues/PR 에 해당 도메인 작업 존재

- **증상**: `gh issue list --label <도메인>` 또는 `gh pr list --label <도메인>` 결과가 있는데 `docs/features/<도메인>.md` 없음. 또는 `src/<도메인>/` 디렉토리가 있는데 features 페이지 없음.
- **진실**: Issues / PR / 코드 트리가 작업의 존재를 증언.
- **복구**:
  1. `cp docs/features/_template.md docs/features/<도메인>.md`
  2. 헤더의 `<도메인명>` 교체 + 마지막 갱신 / 담당 Phase / 기록 성격 채움
  3. 기존 머지 PR 들 (`gh pr list --state merged --label <도메인>`) 의 description 본문에서 결정·파일을 추출하여 features 의 “결정 사항” / “주요 파일” 채움
  4. INDEX 자동영역은 다음 워크플로 실행에서 자동 반영 (또는 `bash scripts/gen-index.sh`)
- **재발 방지**: 새 도메인 첫 진입 시 `_template.md` 복사를 작업 시작 의식으로. AGENTS.md “새 도메인 작업 첫 진입” 트리거 준수 (라벨 생성도 동시).

### 4.7 AGENTS.md 규칙과 실제 운영이 다름

- **증상**: 보고 양식 누락이 반복되거나, 의무 4종이 항상 일부 ❌ 로 보고되거나, PR description 에 4섹션이 자주 누락되거나, 실제 작업 흐름이 AGENTS.md 와 다른 순서로 진행됨.
- **진실**: 사용자 의도 (확인 필요).
- **복구**:
  - 규칙이 옳다면 → 운영을 교정. 위반 사례를 PR description 의 “결정” 섹션에 “규칙 위반 정정” 으로 기록.
  - 운영이 옳다면 → 사용자 승인 후 AGENTS.md 개정 + `CLAUDE.md` 호환본 동기화 + 본 지침서의 §3.0 경계표·§4 시나리오 동시 갱신 검토.
- **재발 방지**: 규칙 위반은 보고 양식의 ❌ &lt;사유&gt; 로 즉시 가시화. 같은 ❌ 가 3회 이상 반복되면 규칙 자체를 의심. (선택) `.github/workflows/pr-check.yml` 추가하여 PR description 의 `## 변경` 섹션 누락 시 머지 차단.

---

## 5. 시스템 자체의 진화

문서 시스템 골격(템플릿·이모지·규칙) 자체를 바꿔야 할 때.

- **`features/_template.md` 변경**: 기존 features 페이지를 한꺼번에 마이그레이션하지 않습니다. 다음 그 도메인 작업이 들어왔을 때 합쳐서 갱신. 단, 헤더의 “마지막 갱신 / 담당 Phase / 기록 성격” 같은 핵심 메타가 바뀌면 즉시 전수 적용.
- **새 상태 이모지·새 섹션 추가**: [../AGENTS.md](../AGENTS.md) 의 “상태 표기” / “의무 4종” 표와 `CLAUDE.md` 호환본을 동시 갱신. 본 지침서 §2 SSOT 매트릭스도 영향 검토.
- **새 ADR 작성**: 번호 충돌 방지를 위해 `ls docs/adr/` 로 최신 번호 확인 후 `0001` 처럼 4자리 zero-pad. 작성 후 [INDEX.md](INDEX.md) 의 ADR 목록에 한 줄 추가.
- **본 지침서 §4 시나리오 추가/삭제**: §3.0 자율/승인 경계표 행도 함께 갱신. 누락 시 런북이 일관되지 않게 됨.
- **외부 도구 마이그레이션 자체의 변경** (예: GitHub → 다른 호스팅): SSOT 매트릭스의 SSOT 컬럼·런북 §3.1 명령들·§4 시나리오의 진실 판정 기준을 모두 갱신. ADR 로 영속화 권장.

---

## 6. 안티패턴

- features 에 진행 상태(🔵 진행 중) 기재 — Issues 와 충돌. 진행 상태는 GitHub Issues 단일 출처.
- PR description 4섹션을 **요약 1줄로 줄이기** — 감사 기록 손실. 변경/결정/다음/관련 4섹션 강제. 작업 본문이 작아도 “결정” 은 1줄이라도 있어야 함.
- ADR 을 도메인 내부 결정에 사용 — 거버넌스 비용 과다. 도메인 내부 결정은 features “결정 사항” 으로.
- “(변경 없음)” 생략 — 의무 4종 누락과 외형이 같아 검증 불가. 변경 없으면 명시적으로 “(변경 없음)” 표기.
- INDEX 의 자동생성 영역(`<!-- AUTO-GENERATED-* -->` 마커 사이)을 손편집 — 다음 워크플로 실행에서 덮어써짐. Phase / ADR 영역만 손편집 가능.
- features 의 “데이터 타입” 본문에 PLAN.md 정의를 통째 복사 — 양쪽이 어긋남의 발화점. 가능하면 링크 + diff 만.
- Issue 없이 코드만 푸시 → PR 에서 `Closes #` 비움 — 진행 작업 단일 출처가 깨짐. 작업 시작 시 Issue 부터.

---

## 7. 빠른 참조 카드

```bash
# 새 도메인 페이지 + 라벨
cp docs/features/_template.md docs/features/<도메인>.md
gh label create <도메인>

# 새 ADR (다음 번호로)
NEXT=$(printf '%04d' $(( $(ls docs/adr/ | grep -E '^[0-9]+' | sort -r | head -1 | cut -d- -f1 | sed 's/^0*//') + 1 )))
echo "다음 ADR 번호: $NEXT"
# docs/adr/${NEXT}-<slug>.md 작성 후 INDEX.md 의 ADR 섹션에 한 줄 추가

# 진행 작업 / 변경 이력 조회
gh issue list --state open --assignee @me
gh issue list --label <도메인>
gh pr list --state merged --limit 30
gh pr view <N>

# INDEX 도메인 상태표 수동 재생성
bash scripts/gen-index.sh

# 런북 트리거 (사용자가 던질 문구)
유지보수 해줘 / drift check / docs 점검
```

작업 종료 보고 양식 (AGENTS.md 와 동일):

```
docs 갱신: PR ✅ / features:<도메인> ✅ / Issue ✅ / INDEX ✅
```

미수행 항목은 `❌ <사유>` 로 표기. Pass 2 열람 발동 시 보고 양식 위에 한 줄 추가:

```
Pass 2 열람: <대상>, 사유: <트리거>
```
