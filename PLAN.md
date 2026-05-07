# YLMC Connect — 프로젝트 기획 문서

> 우리 교회(YLMC) 성도를 서로 이어주는 커뮤니티 앱  
> 최종 수정: 2026-05-07

---

## 📌 앱 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | YLMC Connect |
| 플랫폼 | iOS / Android (크로스플랫폼) |
| 대상 | YLMC 교회 성도 |
| 목적 | 성도 간 연결 — 나눔, 소모임, 교육, 기도 |

---

## 🛠 기술 스택

| 항목 | 선택 | 버전 | 비고 |
|------|------|------|------|
| Expo SDK | React Native + Expo | `^55.0.0` | React Native 0.83 · React 19.2 · New Architecture 기본 |
| 라우팅 | Expo Router | `^55.0.x` (v7) | 파일 기반 라우팅, SDK와 함께 설치됨 |
| 서버 상태 | TanStack Query | `^5.100.x` | 비동기 페칭, 캐싱, 동기화 — React Native 공식 지원 |
| 클라이언트 상태 | Zustand | `^5.0.x` | auth·UI 상태만 담당 (React 18+ 필요) |
| 스타일 | StyleSheet (Custom Design System) | — | theme.ts 기반 디자인 토큰 |
| 언어 | TypeScript | `~5.8.x` | strict 모드 |
| 폼 유효성 | react-hook-form | `^7.71.x` | |
| 스키마 검증 | zod | `^4.x` | @hookform/resolvers `^5.2.x` 함께 사용 |
| 아이콘 | @expo/vector-icons / MaterialIcons | Expo 내장 | Google Material Icons |
| 날짜 | date-fns | `^4.x` | 경량 날짜 처리 |
| 이미지 | expo-image | Expo 내장 | 성능 최적화 이미지 |

> **백엔드 없이 시작** — Mock 데이터 + TanStack Query로 개발 후, API 연결 시 `services/` 레이어만 교체  
> **상태 분리 원칙** — 서버 데이터(목록·상세)는 TanStack Query, 인증·UI 상태는 Zustand  
> **New Architecture 전용** — Expo SDK 55부터 Legacy Architecture 완전 제거. 서드파티 라이브러리 선택 시 New Architecture 지원 여부 확인 필수

### ⚠️ 버전 호환성 주의사항

| 패키지 | 주의사항 |
|--------|---------|
| zod v4 + @hookform/resolvers | TypeScript 타입 추론 이슈 → `@hookform/resolvers ^5.2.2` 필수 |
| Expo Router v7 | SDK 55와 함께 배포됨, `expo-router` 별도 버전 고정 불필요 |
| TanStack Query (React Native) | `onlineManager`, `focusManager` React Native 설정 필요 |
| Zustand v5 | React 18 미만 미지원 (Expo SDK 55 = React 19.2 이므로 문제없음) |

---

## 🗂 핵심 기능

### 🛒 나눔장터
> 성도 간 중고 거래 / 무료 나눔 (당근마켓 참고)

| 화면 | 설명 | 주요 액션 |
|------|------|---------|
| 목록 | 카테고리 필터 + 검색 | 카테고리 선택, 검색어 입력 |
| 상세 | 이미지 슬라이더, 판매자 정보 | 채팅하기, 찜하기 |
| 글쓰기 (모달) | 제목·가격·카테고리·사진 입력 | 등록하기 |
| 내 글 관리 | 거래 상태 변경 | 예약중 / 거래완료 변경 |

### 👥 소모임
> 모임 개설, 참여, 일정 관리

| 화면 | 설명 | 주요 액션 |
|------|------|---------|
| 목록 | 카테고리 필터 + 인원수 | 카테고리 탭 전환 |
| 상세 | 모임 정보, 멤버 목록, 일정 | 참여하기 / 탈퇴하기 |
| 개설 (모달) | 이름·카테고리·정원·일정·장소 입력 | 개설하기 |

### 📖 삶공부
> 교회 과정 신청 + 수강 이력 관리

| 화면 | 설명 | 주요 액션 |
|------|------|---------|
| 과정 목록 | 진행예정 / 진행중 / 완료 탭 | 상태별 필터 |
| 과정 상세 | 회차·강사·일정·신청 현황 | 신청하기 / 신청 취소 |
| 내 이력 | 수강한 과정 + 수료증 여부 | 수료증 확인 |

### 🙏 중보기도
> 기도제목 올리기 + 공동 기도하기

| 화면 | 설명 | 주요 액션 |
|------|------|---------|
| 목록 | 최신순, 만료 임박 표시 | 스크롤 |
| 상세 | 기도제목 내용 + 기도한 사람 수 | 기도하기 (카운트 +1) |
| 등록 (모달) | 제목·내용·익명 여부·만료일 | 등록하기 |

---

## 📁 폴더 구조

```
ylmc-front/
├── app/                          # Expo Router — 라우팅 핵심
│   ├── _layout.tsx               # Root layout (폰트, 테마, Provider)
│   ├── (auth)/                   # 인증 그룹
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # 메인 탭 네비게이션
│   │   ├── _layout.tsx           # 탭바 정의
│   │   ├── index.tsx             # 홈 (공지 + 피드)
│   │   ├── market/
│   │   │   ├── index.tsx         # 나눔장터 목록
│   │   │   └── [id].tsx          # 상세
│   │   ├── group/
│   │   │   ├── index.tsx         # 소모임 목록
│   │   │   └── [id].tsx          # 상세
│   │   ├── life-study/
│   │   │   ├── index.tsx         # 삶공부 목록
│   │   │   └── [id].tsx          # 상세
│   │   └── prayer/
│   │       ├── index.tsx         # 기도제목 목록
│   │       └── [id].tsx          # 상세
│   └── modal/                    # 전체화면 모달
│       ├── market-new.tsx        # 장터 글쓰기
│       ├── group-new.tsx         # 소모임 개설
│       └── prayer-new.tsx        # 기도제목 등록
│
├── src/
│   ├── components/               # 재사용 컴포넌트
│   │   ├── ui/                   # 기본 원자 단위 (Button, Card, Badge, Avatar...)
│   │   ├── market/
│   │   ├── group/
│   │   ├── life-study/
│   │   └── prayer/
│   │
│   ├── store/                    # Zustand — 클라이언트 상태만
│   │   └── authStore.ts          # Mock 유저 / 로그인 상태
│   │
│   ├── services/                 # 데이터 페칭 함수 (현재 Mock → 추후 실제 API)
│   │   ├── marketService.ts
│   │   ├── groupService.ts
│   │   ├── lifeStudyService.ts
│   │   └── prayerService.ts
│   │
│   ├── hooks/                    # TanStack Query 훅 + 커스텀 훅
│   │   ├── useAuth.ts            # Zustand authStore 래퍼
│   │   ├── useMarketItems.ts     # useQuery — 장터 목록/상세
│   │   ├── useGroupList.ts       # useQuery — 소모임 목록/상세
│   │   ├── useLifeStudyCourses.ts# useQuery — 삶공부 과정
│   │   └── usePrayerList.ts      # useQuery — 기도제목 목록
│   │
│   ├── lib/
│   │   └── queryClient.ts        # QueryClient 인스턴스 및 기본 설정
│   │
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   │
│   ├── constants/
│   │   └── theme.ts              # 색상, spacing, 폰트 크기 등 디자인 토큰
│   │
│   └── mocks/                    # Mock 데이터 (services/ 내부에서 사용)
│       ├── auth.ts               # MOCK_USER
│       ├── market.ts
│       ├── groups.ts
│       ├── lifeStudy.ts
│       └── prayers.ts
│
├── assets/                       # 이미지, 폰트, 아이콘
├── PLAN.md                       # 이 파일 — 프로젝트 기준 문서
├── app.json                      # Expo 설정
├── tsconfig.json
└── package.json
```

---

## 🗃 데이터 타입 설계

```typescript
// ─── 공통 ───────────────────────────────────────────
interface Member {
  id: string;
  name: string;
  profileImage?: string;
  department?: string;    // 교구/구역
}

// ─── 나눔장터 ────────────────────────────────────────
type MarketCategory =
  | '가전/디지털'
  | '의류/잡화'
  | '도서/문구'
  | '식품'
  | '유아용품'
  | '스포츠/레저'
  | '기타';

interface MarketItem {
  id: string;
  title: string;
  price: number | 'free';
  description: string;
  images: string[];
  status: 'available' | 'reserved' | 'sold';
  seller: Member;
  category: MarketCategory;
  createdAt: Date;
}

// ─── 소모임 ─────────────────────────────────────────
type GroupCategory =
  | '독서'
  | '운동/스포츠'
  | '찬양/음악'
  | '봉사'
  | '영어회화'
  | '요리'
  | '육아'
  | '기타';

interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;    // 소모임 대표 이미지 (목록 썸네일용)
  leader: Member;
  members: Member[];
  maxMembers: number;
  schedule: string;       // "매주 목요일 오후 7시"
  location: string;
  category: GroupCategory;
  isJoined: boolean;
}

// ─── 삶공부 ─────────────────────────────────────────
interface LifeStudyCourse {
  id: string;
  title: string;          // API에서 가져옴
  description: string;
  sessions: number;       // 전체 회차 수
  instructor: Member;
  schedule: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface LifeStudyHistory {
  memberId: string;       // 수강자 ID (어느 유저의 이력인지 구분)
  courseId: string;
  enrolledAt: Date;
  completedSessions: number;
  completedAt?: Date;
  certificateIssued: boolean;
}

// ─── 중보기도 ────────────────────────────────────────
interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  author: Member;
  isAnonymous: boolean;
  prayerCount: number;
  hasPrayed: boolean;     // 내가 기도했는지 여부
  createdAt: Date;
  expiresAt?: Date;
}
```

---

## 🔧 개발 환경 및 코드 품질

| 항목 | 도구 | 비고 |
|------|------|------|
| 린팅 | ESLint | `expo` lint preset 사용 |
| 포맷팅 | Prettier | 탭 너비 2, 세미콜론 없음 |
| 빌드 | EAS Build | 로컬 개발은 Expo Go + Dev Client |
| 환경변수 | `.env` + `expo-constants` | API 키 등 분리 관리 |
| Node.js | `^20.x` (LTS) | package.json에 `engines` 명시 |

---

## 🌐 네트워크 레이어

TanStack Query의 `queryFn` 내부에서 사용할 HTTP 클라이언트:

- **개발 초기 (Mock 단계)**: `services/`의 함수가 Mock 데이터를 직접 반환
- **API 연결 후 (Phase 7)**: `fetch` API (기본) 또는 `axios` 중 선택

```typescript
// services/marketService.ts — 패턴 예시
export async function fetchMarketItems(): Promise<MarketItem[]> {
  // Phase 7에서 아래 Mock 반환을 실제 fetch로 교체
  return MOCK_MARKET_ITEMS;
}
```

> services/ 레이어가 fetcher 역할을 하므로 TanStack Query hooks는 교체 없이 그대로 유지됩니다.

### TanStack Query — React Native 필수 설정

```typescript
// src/lib/queryClient.ts
import { onlineManager, focusManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

// 네트워크 상태 연동
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
);

// 앱 포커스 연동 (백그라운드 → 포그라운드 시 refetch)
AppState.addEventListener('change', (status) =>
  focusManager.setFocused(status === 'active')
);
```

> `@react-native-community/netinfo`를 의존성에 추가해야 합니다.

---

## 👤 Mock Auth 설계

개발 초기에는 고정된 Mock 유저로 진행하고, Phase 7에서 실제 API 인증으로 교체합니다.

```typescript
// src/mocks/auth.ts
export const MOCK_USER: Member = {
  id: 'user-001',
  name: '홍길동',
  profileImage: undefined,
  department: '1교구 3구역',
};

// src/store/authStore.ts
interface AuthState {
  currentUser: Member | null;
  isLoggedIn: boolean;
  login: (user: Member) => void;
  logout: () => void;
}
```

**개발 시작 시** `authStore`의 초기값으로 `MOCK_USER`를 주입해 로그인된 상태로 시작합니다.  
**Phase 7**에서 `login()` 함수를 실제 API 토큰 기반 인증으로 교체합니다.

---

## 🏪 나눔장터 카테고리

| 카테고리 | 설명 |
|---------|------|
| 가전/디지털 | 가전제품, 휴대폰, 노트북 등 |
| 의류/잡화 | 옷, 신발, 가방 등 |
| 도서/문구 | 책, 교재, 노트류 |
| 식품 | 가공식품, 건강식품 |
| 유아용품 | 아기용품, 장난감, 유모차 등 |
| 스포츠/레저 | 운동기구, 아웃도어 용품 |
| 기타 | 그 외 카테고리 |

---

## 🚨 에러 처리 전략

| 상황 | 처리 방식 |
|------|---------|
| 네트워크 오류 | TanStack Query `retry: 2` + 에러 메시지 토스트 |
| 데이터 로딩 중 | 스켈레톤 UI (Skeleton 컴포넌트) |
| 빈 목록 | EmptyState 컴포넌트 (일러스트 + 안내 문구) |
| 폼 유효성 실패 | react-hook-form 인라인 에러 메시지 |
| 전역 예외 | React 에러 바운더리 (`app/_layout.tsx`에 등록) |

> Mock 단계에서는 에러를 시뮬레이션하는 Mock 함수로 UI 동작을 미리 검증합니다.

---

## 🏷 소모임 카테고리

| 카테고리 | 설명 |
|---------|------|
| 독서 | 책 읽기, 독서 토론 |
| 운동/스포츠 | 축구, 배드민턴, 헬스 등 |
| 찬양/음악 | 악기, 합창, 찬양 팀 |
| 봉사 | 지역사회 봉사, 섬김 모임 |
| 영어회화 | 영어 스터디, 원어민 교류 |
| 요리 | 요리 실습, 음식 나눔 |
| 육아 | 부모 모임, 아이 동반 |
| 기타 | 그 외 카테고리 |

---

## 📱 탭 네비게이션 구성

| 탭 순서 | 탭명 | 아이콘 (MaterialIcons) | 주요 화면 |
|---------|------|----------------------|----------|
| 1 | 홈 | `home` | 공지, 최신 피드 모아보기 |
| 2 | 나눔장터 | `storefront` | 목록 / 상세 / 글쓰기 |
| 3 | 소모임 | `people` | 목록 / 상세 / 신청 |
| 4 | 삶공부 | `menu_book` | 과정 목록 / 신청 / 내 이력 |
| 5 | 기도 | `favorite` | 기도제목 / 기도하기 |

> MaterialIcons 기준 아이콘 이름 (`@expo/vector-icons`의 `MaterialIcons` 컴포넌트에 그대로 전달)

---

## 🚀 개발 단계 (Phase)

### ✅ Phase 0 — 기획 및 문서화
- [x] 기능 정의
- [x] 기술 스택 결정 (TanStack Query, MaterialIcons 추가)
- [x] 폴더 구조 설계
- [x] 데이터 타입 설계
- [x] 디자인 방향 → `design.md` 파일로 분리 관리
- [x] 삶공부 과정명 → API에서 동적으로 가져오는 방식으로 결정
- [x] Mock Auth 방식 확정 (고정 Mock 유저 → Phase 7에서 실제 API 연결)
- [x] 소모임 카테고리 확정

### 🔲 Phase 1 — 프로젝트 초기 세팅
- [ ] `create-expo-app` 으로 프로젝트 생성 (`--template blank-typescript`)
- [ ] 의존성 설치
  ```bash
  # 서버 상태
  npx expo install @tanstack/react-query
  # 네트워크 상태 (TanStack Query React Native 필수)
  npx expo install @react-native-community/netinfo
  # 클라이언트 상태
  npm install zustand
  # 폼 + 검증
  npm install react-hook-form zod @hookform/resolvers
  # 날짜
  npm install date-fns
  # 이미지
  npx expo install expo-image
  # 개발 도구
  npm install -D eslint prettier
  ```
- [ ] 폴더 구조 생성 (app/, src/ 하위 전체)
- [ ] `src/lib/queryClient.ts` — QueryClient 설정 + React Native onlineManager/focusManager 연동
- [ ] Root layout에 `QueryClientProvider` + Zustand 연결
- [ ] `src/mocks/auth.ts` — MOCK_USER 정의
- [ ] `src/store/authStore.ts` — Mock 유저 기본값 주입
- [ ] `src/constants/theme.ts` — 디자인 토큰 (색상, spacing, typography)
- [ ] 공통 UI 컴포넌트 (Button, Card, Badge, Avatar, Divider)
- [ ] Root layout + 5탭 네비게이션 뼈대 (MaterialIcons 적용)
- [ ] `.env` 파일 + `app.json` extra 설정 (환경변수 기반)

### 🔲 Phase 2 — 나눔장터
- [ ] `src/mocks/market.ts` — Mock 데이터 작성 (MarketCategory 전체 커버)
- [ ] `src/services/marketService.ts` — fetchMarketItems(), fetchMarketItem(id) 구현
- [ ] `src/hooks/useMarketItems.ts` — useQuery로 목록/상세 훅 작성
- [ ] 목록 화면 (`app/(tabs)/market/index.tsx`) — 카테고리 필터 탭 + 검색바
- [ ] 상세 화면 (`app/(tabs)/market/[id].tsx`) — 이미지 슬라이더, 판매자 정보, 거래 상태 배지
- [ ] 글쓰기 모달 (`app/modal/market-new.tsx`) — react-hook-form + zod 적용

### 🔲 Phase 3 — 소모임
- [ ] `src/mocks/groups.ts` — Mock 데이터 (GroupCategory 전체 커버, coverImage 포함)
- [ ] `src/services/groupService.ts` — fetchGroups(), fetchGroup(id), joinGroup(), leaveGroup()
- [ ] `src/hooks/useGroupList.ts` — useQuery + useMutation (참여/탈퇴)
- [ ] 목록 화면 (`app/(tabs)/group/index.tsx`) — 카테고리 탭 + 인원 배지
- [ ] 상세 화면 (`app/(tabs)/group/[id].tsx`) — 멤버 목록, 일정, 참여 버튼
- [ ] 소모임 개설 모달 (`app/modal/group-new.tsx`) — react-hook-form + zod 적용

### 🔲 Phase 4 — 삶공부
- [ ] `src/mocks/lifeStudy.ts` — Mock 과정 데이터 + 수강이력 (memberId 포함)
- [ ] `src/services/lifeStudyService.ts` — fetchCourses(), fetchMyHistory(), enrollCourse()
- [ ] `src/hooks/useLifeStudyCourses.ts` — useQuery + useMutation (신청/취소)
- [ ] 과정 목록 화면 (`app/(tabs)/life-study/index.tsx`) — 상태(upcoming/ongoing/completed) 탭
- [ ] 과정 상세 화면 (`app/(tabs)/life-study/[id].tsx`) — 신청 폼
- [ ] 내 이력 화면 — 수강 완료 과정 + 수료증 여부 표시

### 🔲 Phase 5 — 중보기도
- [ ] `src/mocks/prayers.ts` — Mock 기도제목 (익명 포함, 만료일 포함)
- [ ] `src/services/prayerService.ts` — fetchPrayers(), prayForRequest(id)
- [ ] `src/hooks/usePrayerList.ts` — useQuery + useMutation (기도하기)
- [ ] 목록 화면 (`app/(tabs)/prayer/index.tsx`) — 만료 임박 배지, 기도 수 표시
- [ ] 상세 화면 (`app/(tabs)/prayer/[id].tsx`) — 기도하기 버튼 (카운트 낙관적 업데이트)
- [ ] 기도제목 등록 모달 (`app/modal/prayer-new.tsx`) — 익명 옵션 + 만료일 선택

### 🔲 Phase 6 — 인증 (Auth)
- [ ] 로그인 화면
- [ ] 회원가입 화면
- [ ] authStore 연결

### 🔲 Phase 7 — 백엔드 연결
- [ ] services/ 레이어 실제 API로 교체
- [ ] 에러 핸들링 / 로딩 상태 처리
- [ ] Push 알림

---

## ✅ 결정 사항 (Phase 0 완료)

| # | 질문 | 결정 |
|---|------|------|
| 1 | 로그인 먼저 vs Mock 유저로 기능 먼저 개발? | ✅ Mock 유저로 먼저 개발, Phase 7에서 API 연결 |
| 2 | 디자인 톤 | ✅ `design.md` 파일로 별도 관리 (사용자 직접 작성) |
| 3 | 삶공부 실제 과정명 | ✅ API에서 동적으로 가져오므로 문서에서 제외 |
| 4 | 소모임 카테고리 종류 | ✅ 독서 / 운동·스포츠 / 찬양·음악 / 봉사 / 영어회화 / 요리 / 육아 / 기타 |

---

## 📝 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-07 | 초안 작성 — 기술 스택, 구조, 타입, Phase 정의 |
| 2026-05-07 | Phase 0 완료 — 미결 사항 4개 확정, TanStack Query + MaterialIcons 추가, Mock Auth 설계, 소모임 카테고리 정의 |
| 2026-05-07 | 버전 검토 — Expo SDK 55 / Expo Router v7 / RN 0.83 기준으로 버전 명시, New Architecture 전용 주의사항 추가, 네트워크 레이어 설계, TanStack Query React Native 설정 추가 |
| 2026-05-07 | 2차 보완 — 핵심 기능별 화면 플로우 상세화, MaterialIcons 아이콘 이름 수정, 나눔장터 카테고리 정의, 데이터 타입 보완(MarketCategory·memberId·coverImage), 에러 처리 전략 추가, Phase 2~5 세부 태스크 구체화 |
