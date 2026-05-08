# YLMC Connect — 인덱스

> 마지막 갱신: 2026-05-08 ([MAINTENANCE.md](MAINTENANCE.md) §4.5 시나리오 삭제 — 시나리오 9→8 개) | 현재 Phase: 1 — 프로젝트 초기 세팅 (진입 직전)

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

| 도메인 | 상태 | 진행률 | 마지막 갱신 | 상세 |
|---|---|---|---|---|
| common (공통 인프라) | ⬜ 예정 | 0% | — | (미생성) |
| auth (인증) | ⬜ 예정 | 0% | — | (미생성) |
| market (나눔장터) | ⬜ 예정 | 0% | — | (미생성) |
| group (소모임) | ⬜ 예정 | 0% | — | (미생성) |
| life-study (삶공부) | ⬜ 예정 | 0% | — | (미생성) |
| prayer (중보기도) | ⬜ 예정 | 0% | — | (미생성) |

> 도메인 페이지는 해당 도메인 작업에 처음 진입할 때 [features/_template.md](features/_template.md) 를 복사해 생성합니다.

---

## 작업 라우팅 (AI 의 3단계 읽기)

**Pass 0 — 목차 스캔 (항상)**
- 본 INDEX 의 도메인 상태표 + 현재 Phase
- [TASKS.md](TASKS.md) 의 “🔵 진행 중” 섹션
- 작업 도메인 features 페이지의 섹션 제목들 + 상단 메타
- [LOG.md](LOG.md) 최근 5~10건의 **제목 + 결정 한 줄만**

**Pass 1 — 정독 (항상)**
- TASKS “진행 중” 1건 본문 *(진행/예정 작업의 단일 출처)*
- 작업 도메인 features 의 **결정 사항 / 미결 / 데이터 타입 / 의존성 / 주요 파일** 섹션 본문 *(도메인 컨텍스트)*

**Pass 2 — 트리거 시 심층 (조건부)**
| 트리거 | 정독할 곳 |
|---|---|
| 신규 도메인 첫 진입 | [PLAN.md](../PLAN.md) 의 해당 도메인 섹션 (1회) |
| 데이터 타입·Phase·보안·기술스택 영향 작업 | PLAN.md 관련 섹션 |
| Pass 0 의 LOG 스캔에서 관련 결정 의심 | LOG.md 본문 거슬러 검색 |
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
