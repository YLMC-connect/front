# YLMC Connect

> 우리 교회(YLMC) 성도를 서로 이어주는 모바일 앱

## 무엇을 만드나

**나눔장터 · 소모임 · 삶공부 · 중보기도** — 4개 핵심 기능을 한 앱에서.
React Native + Expo (SDK 55, New Architecture) 기반, Mock 데이터로 시작해 백엔드 연결로 점진 전환합니다.

## 진행 상태

```
[✅ Phase 0 기획] → [⬜ Phase 1 세팅] → [⬜ Phase 2~10]
```

자세한 진행 상태와 도메인별 상태표: [docs/INDEX.md](docs/INDEX.md)

## 문서 지도

- 처음 보는 분: [docs/INDEX.md](docs/INDEX.md) 부터 — 5분에 전체 흐름 파악
- 설계 기준 문서: [PLAN.md](PLAN.md) — 기술 스택, 데이터 타입, Phase 정의
- 진행 작업: GitHub Issues — `gh issue list --state open` (label = 도메인). 기존 항목 보존: [docs/_archive/TASKS.md](docs/_archive/TASKS.md)
- 변경 이력: 머지된 PR description — `gh pr list --state merged --limit 30`. 기존 항목 보존: [docs/_archive/LOG.md](docs/_archive/LOG.md)
- AI 작업 규칙: [CLAUDE.md](CLAUDE.md) — Claude Code 동작 규약
- 유지보수 / 드리프트 복구: [docs/MAINTENANCE.md](docs/MAINTENANCE.md)

## 기술 스택 (요약)

Expo SDK 55 · React Native 0.83 · TypeScript · Expo Router v7 · TanStack Query · Zustand · react-hook-form + zod · MaterialIcons · Sentry. 상세는 [PLAN.md](PLAN.md) 의 “🛠 기술 스택”.
