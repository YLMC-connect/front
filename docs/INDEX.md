# YLMC Connect — 인덱스

> 마지막 갱신: 2026-05-09 (협업 대비 외부 도구 마이그레이션 — TASKS→Issues / LOG→PR description / 도메인 상태표 자동생성) | 현재 Phase: 1 — 프로젝트 초기 세팅 (진입 직전)

본 문서는 **작업자 5분용 진입점** 입니다. 외부인은 [README.md](../README.md) 부터, AI 작업 규칙은 [CLAUDE.md](../CLAUDE.md) 를 참고하세요. 문서 시스템이 어긋났을 때의 복구 절차는 [MAINTENANCE.md](MAINTENANCE.md).

---

## 프로젝트 흐름 한눈에

```
[✅ Phase 0 기획·문서] → [⬜ Phase 1 세팅] → [⬜ Phase 2 장터] →
[⬜ Phase 3 소모임] → [⬜ Phase 4 삶공부] → [⬜ Phase 5 기도] →
[⬜ Phase 6 인증] → [⬜ Phase 7 백엔드] → [⬜ Phase 8 채팅] →
[⬜ Phase 9 분석] → [⬜ Phase 10 a11y/성능]
```

각 Phase 의 상세 정의는 [PLAN.md](../PLAN.md) 의 “🚀 개발 단계 (Phase)” 섹션.

---

## 도메인 상태표

<!-- AUTO-GENERATED-START: domain-status -->

| 도메인 | 진행 중 | 완료 | 마지막 갱신 | 상세 |
|---|---|---|---|---|
| common (공통 인프라) | 1 | 2 | 2026-05-22 | (미생성) |
| auth (인증) | 1 | 2 | 2026-05-22 | (미생성) |
| market (나눔장터) | 0 | 2 | 2026-05-22 | (미생성) |
| group (소모임) | 0 | 2 | 2026-05-22 | (미생성) |
| life-study (삶공부) | 0 | 2 | 2026-05-22 | (미생성) |
| prayer (중보기도) | 0 | 2 | 2026-05-22 | (미생성) |

<!-- AUTO-GENERATED-END: domain-status -->

> 본 표는 GitHub Issues 데이터로 자동 생성됩니다 (라벨 = 도메인). 손으로 편집하지 마세요. 갱신 스크립트: [`scripts/gen-index.sh`](../scripts/gen-index.sh), 자동 실행: [`.github/workflows/update-index.yml`](../.github/workflows/update-index.yml).
> 도메인 페이지는 해당 도메인 작업에 처음 진입할 때 [features/_template.md](features/_template.md) 를 복사해 생성합니다.

---

## 작업 라우팅 (AI 의 3단계 읽기)

**Pass 0 — 목차 스캔 (항상)**
- 작업 issue 본문: `gh issue view <N>` *(진행 작업의 단일 출처)*
- 본 INDEX 의 도메인 상태표 (자동 생성) + 현재 Phase
- 작업 도메인 features 페이지의 섹션 제목들 + 상단 메타
- 최근 PR 제목: `gh pr list --state merged --label <도메인> --limit 5` (변경 이력 LOG 대체)

**Pass 1 — 정독 (항상)**
- 작업 issue 본문 + 코멘트
- 작업 도메인 features 의 **결정 사항 / 미결 / 데이터 타입 / 의존성 / 주요 파일** 섹션 본문 *(도메인 컨텍스트)*

**Pass 2 — 트리거 시 심층 (조건부)**
| 트리거 | 정독할 곳 |
|---|---|
| 신규 도메인 첫 진입 | [PLAN.md](../PLAN.md) 의 해당 도메인 섹션 (1회) + GitHub 라벨 생성 |
| 데이터 타입·Phase·보안·기술스택 영향 작업 | PLAN.md 관련 섹션 |
| Pass 0 의 PR 제목 스캔에서 관련 결정 의심 | `gh pr view <N>` 으로 description 본문 |
| 다른 도메인과 의존성 | 해당 도메인 features 페이지 |
| 완료된 결과물을 재사용 | 작업 도메인 features 의 `✅ 완료` 본문 |

상세 규칙은 [../CLAUDE.md](../CLAUDE.md).

---

## ADR

- [0001 — 기술 스택](adr/0001-tech-stack.md) — Expo SDK 55 / TanStack Query / Zustand / zod / NativeWind v4 등 채택 근거. (수락, 2026-05-08; 스타일 항목 갱신 2026-05-08)
- [0002 — 백엔드 선택 보류 (Mock-first)](adr/0002-backend-tbd.md) — Phase 5 종료까지 백엔드 플랫폼 결정 보류, services/ 격리로 무관 진행. (수락, 2026-05-08)

---

## 외부 자료

(Figma, Notion 등 추가 시 기재.)
