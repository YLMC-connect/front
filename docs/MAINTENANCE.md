# 유지보수 지침

> 마지막 갱신: 2026-05-08 (§4.5 LOG vs git log 시나리오 삭제 — 사용자 직접 커밋이 노이즈가 되어 검출 신뢰도 낮음. 시나리오 9 → 8 개) | 대상: 사람 신규 기여자 + AI 차기 세션 둘 다

본 문서는 **시간이 지나며 문서가 실제 작업과 어긋나거나 문서끼리 모순될 때** 무엇을 진실로 삼고 어떻게 복구할지 정의합니다. 평소의 작업 중 의무는 [../CLAUDE.md](../CLAUDE.md) 가, 도메인별 컨텍스트는 [features/](features/) 가, 진행 상태는 [TASKS.md](TASKS.md) 가, 변경 감사는 [LOG.md](LOG.md) 가 담당합니다.

---

## 1. 1분 요약

- **CLAUDE.md** 는 “작업 1 사이클 동안” 의 의무. **본 지침서** 는 “시스템 자체의 정합성 유지 + 드리프트 발생 시 복구” 를 다룹니다.
- 진실은 **단일 출처(SSOT)** 가 갖습니다. 다른 곳에 같은 정보가 보이면 그건 “거울” 이며, 깨졌을 때는 SSOT 가 이깁니다.
- AI 가 `유지보수 해줘` / `drift check` / `docs 점검` 트리거를 받으면 §3 런북을 1 → 2 → 3 → 4 단계로 수행합니다.

---

## 2. 단일 출처(SSOT) 매트릭스

| 정보 | SSOT | 거울(허용) | 금지 |
|---|---|---|---|
| 진행 중·예정 작업 | [TASKS.md](TASKS.md) | — | features 페이지에 진행 상태 기재 |
| 완료 결과·도메인 결정 | features/&lt;도메인&gt;.md | LOG.md(요약 1줄) | TASKS.md 에 결과 본문 |
| 변경 감사 기록 | [LOG.md](LOG.md) | — | features `✅완료` 본문에 일자별 LOG 복붙 |
| Phase 정의·기술 스택·데이터 타입 마스터 | [../PLAN.md](../PLAN.md) | features “데이터 타입” 섹션(요약·참조) | features 가 PLAN 과 다른 정의 보유 |
| 시스템 전반 결정 | [adr/](adr/) | features “결정 사항” 에 “ADR-000N 참조” | features 가 ADR 과 모순되는 결정 보유 |
| 도메인 상태·전체 진행률 | [INDEX.md](INDEX.md) | features 헤더 한 줄 | INDEX 와 features 헤더 상태 불일치 |
| AI 작업 규칙 | [../CLAUDE.md](../CLAUDE.md) | — | 다른 docs 가 CLAUDE.md 규칙 재정의 |

원칙: **객관적 사실 비교(파일·git·문서 간 단순 일치)** 는 자율 복구, **정책·설계·승인 결정** 은 사용자 회부.

---

## 3. 유지보수 런북

> **트리거**: 사용자가 `유지보수 해줘`, `drift check`, `docs 점검` 등으로 호출하면 본 런북을 1 → 2 → 3 → 4 단계 순서로 수행합니다. 트리거 없이는 평소 작업의 [../CLAUDE.md](../CLAUDE.md) 의무 4종 갱신만 하면 됩니다.

### 3.0 자율 / 승인 경계표

| 시나리오 | AI 단독 | 사용자 회부 |
|---|:---:|:---:|
| [4.1](#41-index-도메인-상태--실제-코드-진척) INDEX 상태 ≠ 코드 진척 | ✅ | |
| [4.2](#42-tasks-진행-중-이-실제로는-멈춘-작업) TASKS “진행 중” 멈춤 | | ✅ (의도 확인) |
| [4.3](#43-features-데이터-타입--planmd-마스터-타입) features 타입 ≠ PLAN | △ (PLAN 이 옳을 때만 features 동기화) | ✅ (PLAN 수정 필요 시) |
| [4.4](#44-features-결정-사항--adr-결정-모순) features 결정 ↔ ADR 모순 | △ (ADR 이 옳을 때만 features 정정) | ✅ (ADR supersede 필요 시) |
| [4.5](#45-features-주요-파일--실제-파일-트리) features 파일 ≠ 실제 트리 | ✅ | |
| [4.6](#46-features-완료-와-tasks-완료-중복) features ✅완료 ↔ TASKS ✅완료 중복 | ✅ | |
| [4.7](#47-도메인-페이지가-없는데-작업이-진행됨) 도메인 페이지 부재 | ✅ | |
| [4.8](#48-claudemd-규칙과-실제-운영이-다름) CLAUDE.md 규칙 ≠ 운영 | | ✅ (규칙 변경 승인) |

### 3.1 1단계 — 스캔 (모두 실행)

각 시나리오 탐지 명령. 결과는 작업 메모리에만 두고 다음 단계로.

```bash
# 4.1 INDEX vs 코드 진척
grep -A 20 '도메인 상태표' docs/INDEX.md
git log --since="14 days ago" --name-only --pretty=format: | sort -u | grep '^src/' | cut -d/ -f1-2 | sort -u

# 4.5 features 주요 파일 vs 실제
ls docs/features/*.md | grep -v _template
find src -type d -maxdepth 2 2>/dev/null

# 4.3 PLAN 데이터 타입 vs features
grep -nA 5 '데이터 타입' docs/features/*.md
grep -nA 5 '데이터 타입' PLAN.md

# 4.6 ✅완료 중복
grep -l '✅' docs/features/*.md
grep -nA 3 '✅' docs/TASKS.md

# 4.7 도메인 페이지 부재 (src 디렉토리 ↔ features 페이지)
diff <(ls src/ 2>/dev/null | sort) <(ls docs/features/ | sed 's/.md//' | grep -v _template | sort)

# 4.4 features 결정 ↔ ADR
grep -nA 3 '결정 사항' docs/features/*.md
ls docs/adr/

# 4.2 TASKS 진행 중 정체 — 사용자 확인용 자료
grep -A 20 '🔵 진행 중' docs/TASKS.md
git log --since="7 days ago" --oneline
```

### 3.2 2단계 — 분류

스캔 결과를 §4 의 시나리오 4.1 ~ 4.8 에 매핑. 각 항목을 **[자율]** / **[승인]** 로 표시. §3.0 의 경계표가 기준.

### 3.3 3단계 — 복구

- **[자율]** 항목: §4 해당 시나리오의 “복구” 절차 그대로 즉시 수행. 수정한 파일은 [../CLAUDE.md](../CLAUDE.md) 의 의무 4종(LOG / TASKS / features / INDEX)에 따라 갱신.
- **[승인]** 항목: 손대지 않고 다음 단계 보고에 ❓ 로 모음.

### 3.4 4단계 — 보고

런북 종료 시 사용자에게 다음 양식으로 한 번에 보고합니다.

```
유지보수 런북 결과 (YYYY-MM-DD):

[자율 복구 N건]
- 4.1: INDEX 의 market 도메인 진행률 30→45% 갱신
- 4.5: features/group.md 주요 파일에 src/group/hooks/useGroupList.ts 추가
- 4.6: TASKS.md ✅완료 본문 features/auth.md 로 이관

[사용자 승인 필요 M건]
- ❓ 4.3: features/group.md 의 GroupMember.role 이 PLAN.md 와 다름 — PLAN 수정 필요?
- ❓ 4.2: TASKS "🔵 진행 중" 의 "프로필 편집" 이 5일째 정체 — 보류로 이동?

[변경 없음 K개 시나리오]
- 4.4 / 4.7 / 4.8: 검출 없음

docs 갱신: LOG ✅ / TASKS ✅ / features:<도메인> ✅ / INDEX ✅
```

---

## 3-A. 정기 점검 (런북 외, 사람 운영용)

- **매 작업 종료 시** (사람·AI 공통): [../CLAUDE.md](../CLAUDE.md) 의 의무 4종 + 보고 양식 (이미 강제됨).
- **주간**: 사용자가 `유지보수 해줘` 트리거로 §3 런북 호출. 월요일 권장.
- **분기 (Phase 종료 시)**: 전수 감사 + LOG 비대화 시 `docs/log-archive/LOG-YYYY-Q?.md` 로 아카이빙. 아카이빙 후 LOG.md 본문은 분기 시작 이후 항목만 남깁니다.

---

## 4. 드리프트 시나리오별 복구 절차

각 시나리오 양식: **증상 → 진실 판정 기준 → 복구 절차 → 재발 방지**.

### 4.1 INDEX 도메인 상태 ≠ 실제 코드 진척

- **증상**: [INDEX.md](INDEX.md) 의 도메인 상태표가 ⬜ 예정인데 `src/<도메인>/` 에 코드가 존재. 또는 진행률이 features 헤더와 다름.
- **진실**: 코드 + git log.
- **복구**:
  1. 해당 도메인 features 페이지의 “주요 파일” 섹션을 `find src/<도메인> -type f` 결과와 대조하여 갱신
  2. features 헤더의 “마지막 갱신 / 상태 / 진행률” 갱신
  3. INDEX.md 의 도메인 상태표 행 갱신 (상태 / 진행률 / 마지막 갱신)
  4. LOG.md 최상단에 “정정” 항목 1건 (변경 / 결정=“(정정)” / 다음 / 관련)
- **재발 방지**: 작업 종료 시 features 헤더 ↔ INDEX 행 동시 갱신을 의무 4종에서 누락 점검.

### 4.2 TASKS “🔵 진행 중” 이 실제로는 멈춘 작업

- **증상**: [TASKS.md](TASKS.md) 의 “🔵 진행 중” 항목이 7일 이상 git log 에 흔적 없음.
- **진실**: 사용자의 현재 의도 (확인 필요).
- **복구**: 사용자에게 1줄 확인 → 계속이면 그대로, 중단이면 🧊 보류 또는 📋 백로그로 이동하고 사유 명시. LOG 에 이동 항목 기록.
- **재발 방지**: “🔵 진행 중” 동시 1~2건 상한 유지.

### 4.3 features 데이터 타입 ≠ PLAN.md 마스터 타입

- **증상**: features/&lt;도메인&gt;.md 의 “데이터 타입” 섹션이 [../PLAN.md](../PLAN.md) “🗃 데이터 타입 설계” 와 다름.
- **진실**: PLAN.md (사용자 승인을 받은 마스터).
- **복구**:
  - PLAN.md 가 옳다면 → features 의 거울만 갱신 (자율).
  - features 가 옳다면 → **사용자 승인 필요한 PLAN.md 수정** 으로 승격. CLAUDE.md “설계 변경 흐름” 발동: PLAN.md 수정 → 영향 features 동기화 → TASKS 작업 등록 → LOG/INDEX 갱신.
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

### 4.6 features `✅완료` 와 TASKS `✅완료` 중복

- **증상**: 같은 완료 결과 본문이 features `✅완료` 와 TASKS 양쪽에 존재.
- **진실**: features 가 SSOT.
- **복구**: TASKS 의 ✅완료 항목은 짧게(체크 + 한 줄)만 두거나 곧 정리(아카이브). 본문은 features 에만 둠. TASKS 에는 “(features/&lt;도메인&gt;.md 참조)” 로 대체.
- **재발 방지**: TASKS 는 “할 일” 만, features 는 “한 일 + 결정” 만. 작업 완료 시 TASKS 에 `[x]` 만 찍고 결과 본문은 features 로.

### 4.7 도메인 페이지가 없는데 작업이 진행됨

- **증상**: `src/<도메인>/` 디렉토리는 있는데 `docs/features/<도메인>.md` 없음. 또는 LOG / TASKS 에 해당 도메인 작업이 있는데 features 페이지 없음.
- **진실**: TASKS / LOG 가 작업의 존재를 증언.
- **복구**:
  1. `cp docs/features/_template.md docs/features/<도메인>.md`
  2. 헤더의 `<도메인명>` 교체 + 마지막 갱신 / 상태 / 진행률 채움
  3. 기존 LOG 항목들에서 결정·파일을 추출하여 features 의 “결정 사항” / “주요 파일” 채움
  4. INDEX 의 도메인 상태표 갱신
- **재발 방지**: 새 도메인 첫 진입 시 `_template.md` 복사를 작업 시작 의식으로. CLAUDE.md “새 도메인 작업 첫 진입” 트리거 준수.

### 4.8 CLAUDE.md 규칙과 실제 운영이 다름

- **증상**: 보고 양식 누락이 반복되거나, 의무 4종이 항상 일부 ❌ 로 보고되거나, 실제 작업 흐름이 CLAUDE.md 와 다른 순서로 진행됨.
- **진실**: 사용자 의도 (확인 필요).
- **복구**:
  - 규칙이 옳다면 → 운영을 교정. AI 세션에서 위반 사례를 LOG 에 “규칙 위반 정정” 으로 기록.
  - 운영이 옳다면 → 사용자 승인 후 CLAUDE.md 개정 + LOG 에 “규칙 변경” 항목. 본 지침서의 §3.0 경계표도 동시 갱신 검토.
- **재발 방지**: 규칙 위반은 보고 양식의 ❌ &lt;사유&gt; 로 즉시 가시화. 같은 ❌ 가 3회 이상 반복되면 규칙 자체를 의심.

---

## 5. 시스템 자체의 진화

문서 시스템 골격(템플릿·이모지·규칙) 자체를 바꿔야 할 때.

- **`features/_template.md` 변경**: 기존 features 페이지를 한꺼번에 마이그레이션하지 않습니다. 다음 그 도메인 작업이 들어왔을 때 합쳐서 갱신. 단, 헤더의 “마지막 갱신 / 상태 / 진행률” 같은 핵심 메타가 바뀌면 즉시 전수 적용.
- **새 상태 이모지·새 섹션 추가**: [../CLAUDE.md](../CLAUDE.md) 의 “상태 표기” / “의무 4종” 표를 동시 갱신. 본 지침서 §2 SSOT 매트릭스도 영향 검토.
- **새 ADR 작성**: 번호 충돌 방지를 위해 `ls docs/adr/` 로 최신 번호 확인 후 `0001` 처럼 4자리 zero-pad. 작성 후 [INDEX.md](INDEX.md) 의 ADR 목록에 한 줄 추가.
- **본 지침서 §4 시나리오 추가/삭제**: §3.0 자율/승인 경계표 행도 함께 갱신. 누락 시 런북이 일관되지 않게 됨.

---

## 6. 안티패턴

- features 에 진행 상태(🔵 진행 중) 기재 — TASKS 와 충돌. 진행 상태는 TASKS 단일 출처.
- LOG 에 코드 본문·diff 복붙 — 감사 기록이 아닌 백업이 되며 본문 정독 비용 증가. LOG 는 4줄 골격 유지.
- ADR 을 도메인 내부 결정에 사용 — 거버넌스 비용 과다. 도메인 내부 결정은 features “결정 사항” 으로.
- “(변경 없음)” 생략 — 의무 4종 누락과 외형이 같아 검증 불가. 변경 없으면 명시적으로 “(변경 없음)” 표기.
- TASKS 백로그를 PLAN Phase 와 동기화 안 함 — 둘 다 신뢰를 잃음. PLAN Phase 가 변하면 TASKS 백로그도 즉시 갱신.
- features 의 “데이터 타입” 본문에 PLAN.md 정의를 통째 복사 — 양쪽이 어긋남의 발화점. 가능하면 링크 + diff 만.

---

## 7. 빠른 참조 카드

```bash
# 새 도메인 페이지
cp docs/features/_template.md docs/features/<도메인>.md

# 새 ADR (다음 번호로)
NEXT=$(printf '%04d' $(( $(ls docs/adr/ | grep -E '^[0-9]+' | sort -r | head -1 | cut -d- -f1 | sed 's/^0*//') + 1 )))
echo "다음 ADR 번호: $NEXT"
# docs/adr/${NEXT}-<slug>.md 작성 후 INDEX.md 의 ADR 섹션에 한 줄 추가

# 런북 트리거 (사용자가 던질 문구)
유지보수 해줘 / drift check / docs 점검
```

작업 종료 보고 양식 (CLAUDE.md 와 동일):

```
docs 갱신: LOG ✅ / TASKS ✅ / features:<도메인> ✅ / INDEX ✅
```

미수행 항목은 `❌ <사유>` 로 표기. Pass 2 열람 발동 시 보고 양식 위에 한 줄 추가:

```
Pass 2 열람: <대상>, 사유: <트리거>
```
