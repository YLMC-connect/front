# YLMC Connect — 문서 지도

처음 보는 분은 [README.md](../README.md) 와 [GETTING_STARTED.md](GETTING_STARTED.md), AI 작업 규칙은 [AGENTS.md](../AGENTS.md) 를 보세요.

## 어디에 무엇이 있나

| 찾는 것                                               | 위치                                             |
| ----------------------------------------------------- | ------------------------------------------------ |
| 남은 일                                               | GitHub Issues — `gh issue list --label <도메인>` |
| 변경 이력                                             | 머지된 PR — `gh pr list --state merged`          |
| 도메인 컨텍스트(현재 동작·데이터 타입·결정 사항·미결) | [features/](features/) — `features/<도메인>.md`  |
| 앱 범위·공통 데이터 타입·정책                         | [PLAN.md](../PLAN.md)                            |
| 되돌리기 어려운 시스템 결정                           | 아래 ADR                                         |

도메인 이름은 [`.task-flow.conf`](../.task-flow.conf) 의 목록을 GitHub 라벨과 `features/` 파일 이름에 똑같이 쓴다. 새 도메인은 [features/\_template.md](features/_template.md) 를 복사해 만든다.

## ADR

- [0001 — 기술 스택](adr/0001-tech-stack.md) — Expo SDK 57 / TanStack Query / Zustand / local form validation 등 채택 근거. (수락)
- [0002 — 백엔드 선택 보류 (Mock-first)](adr/0002-backend-tbd.md) — 폐기. 모든 도메인이 실제 API 를 쓰고 runtime mock 은 #202 에서 제거.
- [0003 — MVP 범위는 Notion 최신 정의 우선](adr/0003-mvp-scope-notion-first.md) — 인증·홈·나눔·소모임·MY·이미지 선택을 MVP로, 중보기도·삶공부는 v1로. (수락)
- [0004 — Notion v1 범위와 Expo Dev Client 기준](adr/0004-notion-v1-dev-client-scope.md) — 삶공부·중보기도 v1 범위와 Dev Client 검증 기준. (수락)
- [0005 — 모바일 E2E는 Maestro 우선](adr/0005-mobile-e2e-maestro-first.md) — Dev Client 기준 탭 진입 smoke 를 Maestro 로 관리. (수락)
- [0006 — Gluestack UI 및 NativeWind 퇴역](adr/0006-retire-nativewind-gluestack.md) — 순수 React Native StyleSheet + theme.ts 체제. (수락)
- [0007 — 디자인 시스템 v2 반영](adr/0007-design-system-v2.md) — 디자인 시스템 아티팩트를 기준으로 토큰·글자·그림자를 옮긴다. (수락)

## 외부 자료

- Notion “열린문커넥트” 기획 문서 — MVP 범위와 IA의 최신 기준
- claude.ai 아티팩트 “YLMC Connect 디자인 시스템” — 토큰 v2·화면 규칙·컴포넌트 규격의 기준 ([ADR 0007](adr/0007-design-system-v2.md))
