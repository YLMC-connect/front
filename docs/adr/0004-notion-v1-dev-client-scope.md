# ADR 0004 — Notion v1 범위와 Expo Dev Client 기준

- 상태: 수락
- 날짜: 2026-05-22

## 맥락

Notion “열린문커넥트” 기획 문서가 MVP와 v1 범위를 다시 정의했다. 로컬 PLAN.md의 이전 범위와 충돌할 때는 Notion을 최신 기준으로 삼아야 한다.

## 결정

- MVP 범위는 회원가입/로그인, 홈, 나눔, 소모임, MY, 신고/관리자 안전 처리, 이미지 선택/미리보기로 유지한다.
- v1 범위는 삶공부와 중보기도를 포함한다.
- 비밀번호 찾기, 가입코드, 사용자 차단, 교회 공지/푸시, 실제 파일 업로드는 후속 Phase로 둔다.
- Expo Go가 아니라 `expo-dev-client` 기반 development build와 `expo start --dev-client`를 모바일 검증 기준으로 삼는다.
- 실제 API가 없는 기능은 fetch를 직접 호출하지 않고 mock service와 TanStack Query hook으로 구현한다.

## 결과

- PLAN.md의 Phase 1~5는 MVP/v1 mock-first 구현 범위로 정합화한다.
- Phase 6은 Swagger에서 확인된 인증 API adapter 준비와 실제 API 연결 전 검증 단계로 둔다.
- 디자인은 `/Users/mingulee/Downloads/열린문커넥트.zip`의 app token과 화면 톤을 우선한다.
