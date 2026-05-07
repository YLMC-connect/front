# 작업 목록

> 마지막 갱신: 2026-05-08

본 문서는 “지금 무엇을 해야 하는가” 의 단일 출처입니다. 큰 그림은 [../PLAN.md](../PLAN.md) 의 Phase 정의, 진행 상태는 [INDEX.md](INDEX.md) 의 도메인 상태표를 보세요.

표기:
- `[P1]` 우선순위 1 (즉시) / `[P2]` 다음 / `[P3]` 여유 시
- `[<도메인>]` 작업이 속한 도메인 — common / auth / market / group / life-study / prayer

---

## 🔵 진행 중 (동시 1~2건)

(없음 — 다음 작업 시 “🔥 다음” 에서 1건을 여기로 옮깁니다.)

---

## 🔥 다음 (3~5건, 우선순위 정렬) — Phase 1 세팅 시작

- [ ] [P1] [common] `create-expo-app` 으로 프로젝트 생성 (`--template blank-typescript`) + 폴더 골격 (app/, src/, .github/workflows/) 생성
- [ ] [P1] [common] Phase 1 의존성 설치
  ```bash
  # 서버 상태 + 영속 캐시
  npx expo install @tanstack/react-query
  npm install @tanstack/react-query-persist-client @tanstack/query-async-storage-persister
  npx expo install @react-native-async-storage/async-storage
  # 네트워크 상태
  npx expo install @react-native-community/netinfo
  # 클라이언트 상태
  npm install zustand
  # 폼 + 검증
  npm install react-hook-form zod @hookform/resolvers
  # 날짜
  npm install date-fns
  # 이미지
  npx expo install expo-image expo-image-picker expo-image-manipulator
  # 보안 저장소
  npx expo install expo-secure-store
  # 알림 (Phase 7 본격 사용, 의존성만 선설치)
  npx expo install expo-notifications expo-device expo-constants
  # 모니터링
  npx expo install @sentry/react-native
  # 개발 도구
  npm install -D eslint prettier
  npm install -D jest @testing-library/react-native @types/jest jest-expo
  npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
  ```
- [ ] [P1] [common] `src/lib/queryClient.ts` — QueryClient + onlineManager + focusManager + AsyncStorage persister 연결
- [ ] [P1] [common] `src/lib/queryKeys.ts` — 도메인별 queryKey 컨벤션 (PLAN.md “🔑 queryKey 컨벤션” 그대로)
- [ ] [P1] [common] `src/lib/secureStore.ts` — 토큰 저장 유틸 (Phase 6/7 에서 사용)
- [ ] [P2] [common] `src/types/` 도메인별 분리 (common / market / group / lifeStudy / prayer)
- [ ] [P2] [common] `src/constants/theme.ts` 디자인 토큰 (WCAG AA 색상 검증)
- [ ] [P2] [common] Root layout 에 QueryClientProvider + Zustand + Sentry + 에러 바운더리 연결
- [ ] [P2] [common] Sentry 초기화 + `beforeSend` 스크러빙 (기도제목 본문·PII 제거)
- [ ] [P2] [common] 5탭 네비게이션 뼈대 (MaterialIcons)
- [ ] [P3] [common] husky + lint-staged + commitlint 설정 (커밋 전 typecheck/lint/format)
- [ ] [P3] [common] GitHub Actions typecheck/lint/test 워크플로우
- [ ] [P3] [common] Jest + RTL 설정 + 샘플 테스트 1개
- [ ] [P3] [common] `app.config.ts` + `eas.json` profiles (dev/preview/production)
- [ ] [P3] [common] ADR `0001-tech-stack.md` 작성 — 기술 스택 결정 기록

---

## 📋 백로그

Phase 2~10 의 산출물 범위와 큰 그림은 [../PLAN.md](../PLAN.md) “🚀 개발 단계 (Phase)” 표가 단일 출처입니다. 새 작업이 가시화되면 본 섹션 또는 “🔥 다음” 으로 옮겨 우선순위를 부여합니다.

- (현재 가시화된 백로그 항목 없음 — Phase 1 의 “🔥 다음” 이 모두 소진되면 Phase 2 진입)

---

## 🧊 보류 (의존성 또는 결정 대기)

(없음)
