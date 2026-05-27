# YLMC Connect — 프로젝트 기획 문서

> 우리 교회(YLMC) 성도를 서로 이어주는 커뮤니티 앱  
> 최종 수정: 2026-05-23

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
| Dev Client | expo-dev-client | `~55.0.35` | Expo Go 대신 development build + `expo start --dev-client` 기준 |
| 라우팅 | Expo Router | `^55.0.x` (v7) | 파일 기반 라우팅, SDK와 함께 설치됨 |
| 서버 상태 | TanStack Query | `^5.100.x` | 비동기 페칭, 캐싱, 동기화 — React Native 공식 지원 |
| 클라이언트 상태 | Zustand | `^5.0.x` | auth·UI 상태만 담당 (React 18+ 필요) |
| 스타일 | NativeWind v4 + StyleSheet (예외) | `^4.1.x` | className 기반 Tailwind. 디자인 토큰은 `theme.ts` 단일 출처, `tailwind.config.js` 가 import |
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
| TanStack Query (React Native) | `onlineManager`, `focusManager` 설정 + `query-async-storage-persister` 연동 필요 |
| Zustand v5 | React 18 미만 미지원 (Expo SDK 55 = React 19.2 이므로 문제없음) |
| @sentry/react-native | Expo plugin 등록 필수 (`app.json`의 `plugins` 배열) |
| expo-notifications | iOS는 development build 필요 (Expo Go에서 일부 기능 미지원) |
| expo-secure-store | iOS Keychain / Android Keystore 사용 — 디바이스 잠금 해제 필요 |
| NativeWind v4 | Babel preset (`nativewind/babel`) + Metro 래퍼 (`withNativeWind`) + entry 의 `import './global.css'` + `nativewind-env.d.ts` 4가지가 모두 있어야 className 이 작동. 하나라도 빠지면 **에러 없이 className 이 무시** 되어 디버깅 어려움 |

---

## 🗂 핵심 기능

### 2026-05-22 Notion 최신 기준 적용

Notion의 “열린문커넥트” 기획 정의와 `열린문커넥트.zip` 디자인 토큰을 우선 기준으로 삼습니다. 로컬 문서의 과거 Phase 정의와 충돌할 경우 Notion을 우선합니다.

| 구분 | 포함 범위 | 제외 / TODO |
|---|---|---|
| MVP | 회원가입, 로그인, 교인 DB 대조/불일치 관리 흐름, 홈, 나눔, 소모임, MY, 신고·관리자 안전 처리, 이미지 선택/미리보기 | 비밀번호 찾기, 가입코드 입력/검증, 사용자 차단 |
| v1 | 삶공부, 중보기도, 홈 주요 활동 확장 | 교회 공지·알림, 푸시, 실제 파일 업로드, 실제 관리자 도구 |
| API 준비 | Swagger에서 확인된 인증 API adapter 구조, `secureStore` 토큰 저장 유틸 | 실제 API 응답 스키마 확정 전 fetch 활성화 금지 |

현재 앱 라우팅은 ZIP 기준 홈 / 나눔 / 소모임 / 동행 / MY 5탭입니다. 삶공부와 중보기도는 `동행` 탭의 segmented view로 묶고, 상세/신청/작성 route는 숨김 route로 유지합니다. 서버성 데이터는 `screens -> hooks(TanStack Query) -> services -> mocks/API` 흐름을 따르고, Zustand는 인증·UI·임시 작성 상태에만 사용합니다.

### 🛒 나눔
> 성도 간 무료 나눔

| 화면 | 설명 | 주요 액션 |
|------|------|---------|
| 목록 | 카테고리/상태 필터 + 검색 | 카테고리 선택, 검색어 입력 |
| 상세 | 사진, 작성자, 상태, 댓글 | 관심, 댓글, 신고 |
| 글쓰기 (모달) | 제목·설명·상태·장소·카테고리·사진 입력 | 등록하기 |
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
| 목록 | 요일별 기도방 + 내 기도방 | 요일 필터, 기도방 진입 |
| 상세 | 기도제목 내용 + 기도한 사람 수 + 응답 기록 | 기도했어요, 응답 기록 |
| 등록 (모달) | 제목·내용·익명 여부 | 등록하기 |

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
│   │       ├── index.tsx         # 기도방 목록
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
│   │   ├── lifeStudy/
│   │   └── prayer/
│   │
│   ├── store/                    # Zustand — 클라이언트 상태만
│   │   └── authStore.ts          # Mock 유저 / 로그인 상태
│   │
│   ├── services/                 # 데이터 페칭 함수 (현재 Mock → 추후 실제 API)
│   │   ├── authAdapter.ts         # Mock/Auth API adapter 스위치 지점
│   │   ├── marketService.ts
│   │   ├── groupService.ts
│   │   ├── lifeStudyService.ts
│   │   ├── prayerService.ts
│   │   └── myPageService.ts
│   │
│   ├── hooks/                    # TanStack Query 훅 + 커스텀 훅
│   │   ├── useAuth.ts            # Zustand authStore 래퍼
│   │   ├── useMarketItems.ts     # useQuery — 장터 목록/상세
│   │   ├── useGroups.ts          # useQuery — 소모임 목록/상세
│   │   ├── useLifeStudyCourses.ts# useQuery — 삶공부 과정
│   │   ├── usePrayers.ts         # useQuery — 기도방/기도제목
│   │   └── useMyPage.ts          # useQuery — MY 활동 요약
│   │
│   ├── lib/
│   │   ├── queryClient.ts        # QueryClient 인스턴스 및 기본 설정
│   │   ├── queryKeys.ts          # queryKey 컨벤션 중앙화 (도메인별)
│   │   └── secureStore.ts        # expo-secure-store 토큰 저장 유틸
│   │
│   ├── types/                    # TypeScript 타입 정의 (도메인별 분리)
│   │   ├── common.ts             # Member, PaginatedResponse, Report
│   │   ├── market.ts
│   │   ├── group.ts
│   │   ├── lifeStudy.ts
│   │   ├── prayer.ts
│   │   └── mypage.ts
│   │
│   ├── constants/
│   │   ├── theme.ts              # 색상, spacing, 폰트 크기 등 디자인 토큰 — tailwind.config.js 가 import 하는 단일 출처
│   │   └── domainOptions.ts      # 카테고리/탭/신고 사유 등 UI 옵션
│   │
│   └── mocks/                    # Mock 데이터 (services/ 내부에서 사용)
│       ├── auth.ts               # MOCK_USER
│       ├── market.ts
│       ├── groups.ts
│       ├── lifeStudy.ts
│       └── prayers.ts
│
├── assets/                       # 이미지, 폰트, 아이콘
├── docs/
│   └── adr/                      # Architecture Decision Records (주요 의사결정 기록)
├── .github/
│   └── workflows/                # GitHub Actions (typecheck, lint, test)
├── PLAN.md                       # 이 파일 — 프로젝트 기준 문서
├── README.md                     # 프로젝트 소개·세팅·실행 가이드
├── app.config.ts                 # 환경별 동적 Expo 설정 (app.json 대체)
├── eas.json                      # EAS Build profiles (dev/preview/production)
├── babel.config.js               # nativewind/babel preset 등록
├── metro.config.js               # withNativeWind 래퍼 + global.css 입력
├── tailwind.config.js            # theme.ts 를 import 하여 토큰 동기화
├── global.css                    # @tailwind base; @tailwind components; @tailwind utilities;
├── nativewind-env.d.ts           # className prop 타입 선언 (RN 컴포넌트 확장)
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
  role: 'member' | 'leader' | 'staff' | 'admin';  // 'leader' = 소모임장, 'staff' = 교역자, 'admin' = 운영자
}

// 페이지네이션 응답 (모든 목록 API 공통)
interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// 신고 — 장터·소모임·기도제목 공통
interface Report {
  id: string;
  targetType: 'market' | 'group' | 'prayer';
  targetId: string;
  reporterId: string;
  reason: 'inappropriate' | 'spam' | 'abuse' | 'no_show' | 'other';
  detail?: string;
  createdAt: string;
}

interface Comment {
  id: string;
  author: Member;
  content: string;
  createdAt: string;
}

// ─── 나눔장터 ────────────────────────────────────────
type MarketCategory =
  | '의류·잡화'
  | '가전·가구'
  | '도서/문구'
  | '식품·생필품'
  | '유아·아동용품'
  | '스포츠·취미'
  | '기타';

interface MarketItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: 'sharing' | 'reserved' | 'done';
  owner: Member;
  category: MarketCategory;
  condition: string;
  location: string;
  createdAt: string;
  liked: boolean;
  comments: Comment[];
}

// ─── 소모임 ─────────────────────────────────────────
type GroupCategory =
  | '성경공부·예배'
  | '기도모임'
  | '봉사'
  | '취미·문화'
  | '운동·건강'
  | '목장'
  | '선교'
  | '카풀'
  | '기타';

interface GroupNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

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
  isFavorite: boolean;
  notices: GroupNotice[];
}

// ─── 삶공부 ─────────────────────────────────────────
interface LifeStudyCourse {
  id: string;
  title: string;          // API에서 가져옴
  description: string;
  sessions: number;       // 전체 회차 수
  currentSession: number;
  instructor: Member;
  schedule: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  curriculum: string[];
}

interface LifeStudyHistory {
  memberId: string;       // 수강자 ID (어느 유저의 이력인지 구분)
  courseId: string;
  enrolledAt: string;
  completedSessions: number;
  completedAt?: string;
  certificateIssued: boolean;
}

// ─── 중보기도 ────────────────────────────────────────
interface PrayerRoom {
  id: string;
  title: string;
  weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  description: string;
  leader: Member;
  memberCount: number;
  isJoined: boolean;
}

interface PrayerRequest {
  id: string;
  roomId: string;
  title: string;
  content: string;
  author: Member;
  isAnonymous: boolean;
  prayerCount: number;
  hasPrayed: boolean;     // 내가 기도했는지 여부
  isAnswered: boolean;
  answer?: string;
  createdAt: string;
}
```

---

## 🔧 개발 환경 및 코드 품질

| 항목 | 도구 | 비고 |
|------|------|------|
| 린팅 | ESLint | `expo` lint preset 사용 |
| 포맷팅 | Prettier | 탭 너비 2, 세미콜론 없음 |
| 빌드 | EAS Build | dev / preview / production profiles (`eas.json`) |
| 로컬 실행 | Expo Dev Client | `npm run start:dev-client`, development build는 `npm run ios:dev-client` 또는 `npm run android:dev-client` |
| 자동 검증 | npm scripts + GitHub Actions + Maestro | `validate`(typecheck/lint/format/test), Dev Client Metro smoke, v1 탭 E2E smoke |
| 환경변수 | `app.config.ts` + `expo-constants` | 환경별 API URL, 키 분리 |
| Node.js | `>=20.19.4` (LTS) | React Native 0.83 / Metro 요구 버전에 맞춰 package.json `engines`와 CI Node 버전 명시 |
| 커밋 컨벤션 | Conventional Commits + commitlint | `feat / fix / docs / chore / refactor / test` |
| 커밋 훅 | husky + lint-staged | 커밋 전 typecheck + lint + format 자동 실행 |
| CI | GitHub Actions | PR마다 `npm ci` + `npm run validate` 실행 |
| 의존성 추적 | Renovate 또는 Dependabot | Expo SDK 메이저 업그레이드 추적 |

---

## 🌍 환경 분리

`app.config.ts`로 동적 설정, `eas.json` profiles로 빌드 분리. 런타임 접근은 `expo-constants.expoConfig.extra.apiUrl`.

| 환경 | 용도 | API URL | Bundle ID |
|------|------|---------|----------|
| development | 로컬 개발 | dev API | `com.ylmc.connect.dev` |
| preview | 내부 테스트 (EAS Internal Distribution) | staging API | `com.ylmc.connect.preview` |
| production | 스토어 배포 | prod API | `com.ylmc.connect` |

```typescript
// app.config.ts 패턴
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT ?? 'development';
  return {
    ...config,
    name: variant === 'production' ? 'YLMC Connect' : `YLMC (${variant})`,
    ios: { bundleIdentifier: bundleIds[variant] },
    android: { package: bundleIds[variant] },
    extra: { apiUrl: apiUrls[variant], variant },
  };
};
```

> 환경별로 동시에 설치 가능해야 하므로 Bundle ID를 분리합니다.

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

## 🔑 queryKey 컨벤션

queryKey 형식이 도메인별로 흩어지면 무효화·캐시 동기화가 깨집니다. **모든 queryKey는 `src/lib/queryKeys.ts`에서만 생성**합니다.

```typescript
// src/lib/queryKeys.ts
export const queryKeys = {
  market: {
    all: ['market'] as const,
    lists: () => [...queryKeys.market.all, 'list'] as const,
    list: (filter: MarketCategory | 'all') => [...queryKeys.market.lists(), filter] as const,
    detail: (id: string) => [...queryKeys.market.all, 'detail', id] as const,
  },
  group: {
    all: ['group'] as const,
    lists: () => [...queryKeys.group.all, 'list'] as const,
    list: (filter?: unknown) => [...queryKeys.group.lists(), filter ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.group.all, 'detail', id] as const,
  },
  lifeStudy: {
    all: ['lifeStudy'] as const,
    lists: () => [...queryKeys.lifeStudy.all, 'list'] as const,
    list: (filter?: unknown) => [...queryKeys.lifeStudy.lists(), filter ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.lifeStudy.all, 'detail', id] as const,
    history: () => [...queryKeys.lifeStudy.all, 'history'] as const,
  },
  prayer: {
    all: ['prayer'] as const,
    lists: () => [...queryKeys.prayer.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.prayer.all, 'detail', id] as const,
  },
  mypage: {
    all: ['mypage'] as const,
  },
} as const;
```

**무효화 패턴 통일**:
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.market.lists() });  // 목록만
queryClient.invalidateQueries({ queryKey: queryKeys.market.all });       // 도메인 전체
```

---

## 📦 영속 캐시 / 오프라인 지원

성도 앱 특성상 지하/이동 중 사용 비율이 높아, 마지막 본 데이터를 항상 표시할 수 있어야 합니다.

- **영속 캐시**: `@tanstack/query-async-storage-persister` + AsyncStorage로 캐시를 디스크에 저장
- **오프라인 인디케이터**: 상단 배너로 `onlineManager.isOnline()` 상태 표시
- **낙관적 업데이트 큐**: 기도하기·찜하기 등 가벼운 mutation은 오프라인 중에도 큐잉 → `mutationCache.resumePausedMutations()`로 네트워크 복구 시 자동 재시도
- **stale 정책**: 목록 5분 / 상세 1분 / 사용자 정보 10분을 기본값으로

```typescript
// src/lib/queryClient.ts (확장)
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persister = createAsyncStoragePersister({ storage: AsyncStorage });
persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 });  // 24시간
```

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

## 🔐 보안 및 개인정보

교회 성도 데이터(이름·교구·기도제목)는 민감 정보로 취급합니다. 스토어 심사도 이를 요구합니다.

| 항목 | 정책 |
|------|------|
| 토큰 저장 | **`expo-secure-store`** 전용 (iOS Keychain / Android Keystore) — AsyncStorage 금지 |
| 통신 | HTTPS 강제, `app.json`의 `usesCleartextTraffic: false` |
| 토큰 갱신 | refresh token rotation, 만료 시 자동 재발급 → 실패 시 로그인 화면으로 |
| 익명 기도제목 | 작성자 ID는 클라이언트 응답에 포함되지 않음 (서버 권한 검증 후 노출) |
| 민감 데이터 로깅 | 기도제목 본문·사용자 PII는 Sentry `beforeSend`에서 제거 |
| 약관 동의 | 개인정보 처리방침 / 이용약관 화면 — 회원가입 시 필수 (스토어 심사용) |
| 사진 메타데이터 | 업로드 전 EXIF 제거 (`expo-image-manipulator`) |

```typescript
// src/lib/secureStore.ts — Phase 1에 만들어두고 Phase 7에서 사용
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'ylmc.access_token';
const REFRESH_TOKEN_KEY = 'ylmc.refresh_token';

export const secureTokenStore = {
  async getAccessToken() { return SecureStore.getItemAsync(ACCESS_TOKEN_KEY); },
  async setTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
```

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

## 📊 에러 추적 및 분석

| 항목 | 도구 | 사용처 |
|------|------|--------|
| 크래시·예외 추적 | `@sentry/react-native` | 에러 바운더리, TanStack Query `onError`, 전역 핸들러 |
| 사용성 분석 | Firebase Analytics 또는 Amplitude | 핵심 funnel: 글쓰기 진입→등록 완료, 소모임 참여, 기도 참여 |
| 개인정보 스크러빙 | Sentry `beforeSend` 훅 | 기도제목 본문, 사용자 이름, 토큰 자동 제거 |
| Source map 업로드 | Sentry CLI + EAS Build hook | 프로덕션 스택트레이스 가독성 확보 |
| Release 트래킹 | Sentry release | 어느 버전에서 발생한 에러인지 식별 |

```typescript
// 글로벌 에러 핸들링 패턴
queryClient.setDefaultOptions({
  queries: { onError: (error) => Sentry.captureException(error) },
  mutations: { onError: (error) => Sentry.captureException(error) },
});
```

---

## 🧪 테스트 전략

| 레이어 | 도구 | 범위 | 커버리지 목표 |
|-------|------|------|------|
| 단위 테스트 | Jest | `services/`, `hooks/`, `lib/` | 80%+ |
| 컴포넌트 테스트 | React Native Testing Library | `components/ui/` 원자 + critical 화면 | critical path 100% |
| E2E | Maestro | 로그인 → 각 탭 진입 → 글쓰기 골든 패스 | 핵심 플로우 |

- 최소 로컬/PR 게이트: `npm run validate` (`typecheck` + `lint` + `format:check` + `test`)
- 커버리지 확인: `npm run test:coverage`
- Dev Client Metro smoke: `npm run test:dev-client:smoke` (`expo start --dev-client` 부팅 후 `/status` 확인)
- v1 E2E smoke: `npm run test:e2e:smoke`가 Metro를 확인/부팅하고 deep link로 Dev Client를 열어, `.maestro/smoke.yml`에서 React Native `testID` 기준으로 홈/나눔/소모임/삶공부/중보기도/MY 탭 진입 확인. Android Emulator에서는 host `localhost:8081` 상태 확인과 device `127.0.0.1:8081` + `adb reverse`를 기본값으로 사용
- 전체 수동-자동 통합 게이트: `npm run validate:full`
- Maestro E2E 실행 전제: Maestro CLI, Java 17+, Xcode Command Line Tools 또는 Android Emulator, `com.ylmc.connect.dev` development build 설치
- 테스트 파일 위치: 대상 파일 옆 `__tests__/` 폴더에 co-location
- Mock 데이터(`src/mocks/`)를 테스트 픽스처로 그대로 재사용
- `@testing-library/react-hooks` 대신 RTL의 `renderHook` 사용 (RTL v13+에 통합)
- TanStack Query 훅 테스트는 별도 `QueryClientProvider`로 wrap (각 테스트마다 새 인스턴스)
- CI(GitHub Actions)에서 PR마다 `npm ci`와 `npm run validate`를 자동 실행합니다. Dev Client/Simulator 기반 E2E는 일반 PR CI와 분리하고, 수동/release/nightly용 모바일 러너에서 실행합니다.

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

| 탭 순서 | 탭명 | ZIP key | 앱 아이콘 state | 주요 화면 |
|---------|------|---------|----------------|----------|
| 1 | 홈 | `home` | `home-outline` / `home` | 공지, 최신 피드 모아보기 |
| 2 | 나눔 | `market` | `shopping-outline` / `shopping` | 목록 / 상세 / 글쓰기 |
| 3 | 소모임 | `group` | `account-group-outline` / `account-group` | 목록 / 상세 / 신청 |
| 4 | 동행 | `faith` | `heart-outline` / `heart` | 중보기도 목록, 삶공부 목록, 각 상세 / 신청 |
| 5 | MY | `me` | `account-outline` / `account` | 내 정보 / 내 활동 / 관심 목록 / 고객센터 |

> ZIP `lib.jsx`의 `TABS`를 기준으로 번역합니다. ZIP의 `Icon.hands` 이름은 `hands`지만 실제 glyph는 heart path이므로 앱에서는 `동행` 탭을 heart 계열로 표시합니다.

---

## 🔔 푸시 알림 시나리오

`expo-notifications` + 권한 플로우. 디바이스 토큰은 로그인 시 백엔드에 등록, 로그아웃 시 해제.

| 트리거 | 대상 | 알림 메시지 예시 |
|-------|------|----------|
| 소모임 일정 24시간 전 | 참여 멤버 | "내일 [모임명] 일정이 있습니다" |
| 기도제목 만료 임박 | 작성자 | "기도제목이 곧 만료됩니다" |
| 삶공부 신청 결과 | 신청자 | "[과정명] 신청이 승인되었습니다" |
| 새 기도제목 등록 (선택) | 구독자 | "새 기도제목: [제목]" |

**Deep link**: 알림 탭 → 해당 화면으로 직진입. `app.config.ts`의 `scheme`, iOS `associatedDomains`, Android `intentFilters` 설정 필요.

**알림 설정 화면**: 사용자가 카테고리별 ON/OFF를 직접 제어할 수 있도록 합니다 (장터/소모임/삶공부/기도 + 야간 방해금지 시간대).

---

## 🖼 이미지 업로드 파이프라인

장터(최대 5장) · 소모임 cover(1장) · 프로필 사진(1장)에서 사용.

| 단계 | 도구 | 비고 |
|------|------|------|
| 선택 | `expo-image-picker` | 다중 선택 지원, 권한 플로우 포함 |
| EXIF 제거 + 압축 | `expo-image-manipulator` | 최대 1920px 리사이즈, JPEG 80% 품질 |
| 업로드 | 백엔드 presigned URL 직접 PUT | 서버 부하 최소화 (Phase 7 결정) |
| 진행률 | `XMLHttpRequest.upload.onprogress` | % 표시 |
| 캐시 | `expo-image`의 `cachePolicy="memory-disk"` | 기본값 활용 |
| 실패 처리 | 재시도 버튼 + 임시 로컬 보관 | 네트워크 끊김 시 |

> 백엔드 스토리지(S3 / Cloudinary / Firebase Storage)는 Phase 7 시작 전에 결정하고 ADR로 기록합니다.

---

## 🚩 신고 / 차단 / 모더레이션

성도 커뮤니티는 일반 SNS보다 신뢰도가 높지만, 스토어 심사·운영 안정성을 위해 필수입니다.

- 모든 게시물(장터·소모임·기도제목)과 댓글에 신고 버튼
- 신고 사유: `inappropriate` / `spam` / `abuse` / `other`
- 사용자 차단: Notion 최신 MVP/v1 범위에서 제외. 운영자 차단·신고 처리만 우선하고, 사용자 차단 UI는 후속 Phase TODO로 둠
- `Member.role`로 권한 구분:
  - `member`: 일반 성도
  - `staff`: 교역자 — 본인 영역 게시물 즉시 비공개 처리 가능
  - `admin`: 운영자 — 전체 권한, 관리자 도구 사용
- 신고 누적 임계치 시 자동 비공개 (백엔드 정책, 클라이언트는 `status` 필드 표시)
- 관리자 도구: 별도 어드민 웹 또는 인앱 어드민 화면 — Phase 9에서 결정

---

## ♿ 접근성 (a11y)

시니어 성도 비율을 고려해 적극적으로 설계합니다.

- 모든 인터랙션 요소에 `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`
- 색상 대비 WCAG AA (4.5:1 이상) — `theme.ts` 색상 정의 시 검증
- `PixelRatio.getFontScale()` 대응 — 시스템 글자 크기 2배까지 깨지지 않도록 레이아웃
- VoiceOver / TalkBack 핵심 플로우 동작 확인 (로그인·글쓰기·기도하기)
- 터치 타겟 최소 44×44pt (iOS HIG 기준)
- 동적 폰트 크기는 `useWindowDimensions()`로 반응형 처리

> Phase 10에서 전체 화면 audit을 수행합니다.

---

## 🚀 개발 단계 (Phase)

> 본 섹션은 **Phase 단위 큰 그림과 범위** 만 정의합니다. 세부 작업 체크리스트와 진행 상태는 GitHub Issues (label = 도메인, milestone = Phase) 에서 단일 출처로 관리합니다 — `gh issue list --milestone "Phase N"`. 기존 TASKS.md 항목은 [docs/_archive/TASKS.md](docs/_archive/TASKS.md).

| Phase | 상태 | 핵심 산출물 / 범위 |
|---|---|---|
| Phase 0 — 기획·문서화 | ✅ 완료 | 기능 정의, 기술 스택, 폴더 구조, 데이터 타입, 디자인 방향, Mock Auth 설계, 소모임 카테고리 확정 |
| Phase 1 — MVP 앱 기반 | ✅ 완료 | Expo SDK 55 + Dev Client, Provider, QueryClient, secureStore, theme, 에러 바운더리, CI(`validate`), Jest/RNTL smoke, Dev Client smoke, Maestro smoke 구조, 인증 mock, 공통 UI, 이미지 선택/미리보기 |
| Phase 2 — 나눔장터 고도화 | ✅ 완료 | Notion MVP 기준 무료 나눔 목록/상세/작성, 검색, 상태/카테고리 필터, 관심, 댓글, 신고 사유, 활성 글 5개 제한 mock |
| Phase 3 — 소모임 고도화 | ✅ 완료 | Notion MVP 기준 목록/상세/개설, 검색, 카테고리/모집 필터, 참여/탈퇴, 관심, 공지, 멤버 관리 mock |
| Phase 4 — MY / 성도 프로필 | ✅ 완료 | 프로필 조회/수정 mock, 내 활동 탭, 관심 목록, FAQ/고객센터, 로그아웃, 탈퇴 요청 mock |
| Phase 5 — v1 기능 확장 | ✅ 완료 | Notion v1 기준 삶공부 과정 목록/상세/신청/이력, 중보기도 요일방/기도제목/기도 체크/응답 기록 mock |
| Phase 6 — 인증 (Auth) API 연결 준비 | 🔵 진행중 | Swagger 기준 `/api/signup`, `/api/auth/login`, `/api/auth/refresh` adapter 구조 준비. 실제 fetch 활성화는 응답 스키마 확정 후 |
| Phase 7 — 백엔드 연결 | ⬜ 예정 | services/ 실 API 교체 · zod 응답 검증 · 푸시 알림(권한·디바이스 토큰·Deep link·설정 화면) · 이미지 업로드 파이프라인(presigned URL·EXIF·압축) · 강제 업데이트 |
| Phase 8 — v2 실시간 커뮤니케이션 | ⬜ 예정 | v2 범위. 실시간 인프라 결정(ADR) · 1:1 메시징 모델 · 푸시 연동 · 신고/숨김 정책 · 이미지 메시지 |
| Phase 9 — 분석/모니터링 | ⬜ 예정 | Analytics funnel 정의·추적 · Sentry release·source map · 성능 모니터링 · (선택) 관리자 도구 |
| Phase 10 — 접근성/성능 | ⬜ 예정 | a11y audit (VoiceOver·TalkBack) · 색 대비 WCAG AA · 폰트 스케일 2배 검증 · 번들 최적화 · 이미지 lazy · 시니어 폰트 옵션 |

> Phase 1 의 의존성 설치 명령(npm/expo install) 원본은 git 히스토리(`74af553`) 또는 [docs/_archive/TASKS.md](docs/_archive/TASKS.md) 의 P1 항목에서 확인 가능합니다. 본 표는 “무엇을 만드나” 의 큰 그림이고, “어떻게 / 무슨 명령으로” 의 세부 절차는 GitHub Issues 와 ADR 의 영역입니다.

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

> 본 섹션은 **명세 자체의 마일스톤** 만 기록합니다 (Phase 단위 완료, 큰 데이터 타입 변경, 정책 변경 등). 일상 작업 단위 기록은 머지된 PR description (`gh pr list --state merged`) 이 단일 출처입니다. 기존 LOG.md 는 [docs/_archive/LOG.md](docs/_archive/LOG.md) 에 보존.

| 날짜 | 내용 |
|------|------|
| 2026-05-07 | 초안 작성 — 기술 스택, 구조, 타입, Phase 정의 |
| 2026-05-07 | Phase 0 완료 — 미결 사항 4개 확정, TanStack Query + MaterialIcons 추가, Mock Auth 설계, 소모임 카테고리 정의 |
| 2026-05-07 | 버전 검토 — Expo SDK 55 / Expo Router v7 / RN 0.83 기준으로 버전 명시, New Architecture 전용 주의사항 추가, 네트워크 레이어 설계, TanStack Query React Native 설정 추가 |
| 2026-05-07 | 2차 보완 — 핵심 기능별 화면 플로우 상세화, MaterialIcons 아이콘 이름 수정, 나눔장터 카테고리 정의, 데이터 타입 보완(MarketCategory·memberId·coverImage), 에러 처리 전략 추가, Phase 2~5 세부 태스크 구체화 |
| 2026-05-07 | 3차 보완 — 유지보수 관점 인프라 항목 추가 (테스트 전략·Sentry·보안/개인정보·CI/CD·환경 분리·queryKey 컨벤션·영속 캐시·푸시 알림 시나리오·이미지 업로드 파이프라인·신고/모더레이션·접근성), Phase 1 의존성/세팅 보강, Phase 2~5 페이지네이션·신고·테스트·a11y 추가, Phase 8(v2 실시간 커뮤니케이션)·Phase 9(분석)·Phase 10(a11y/성능) 신설, 데이터 타입에 Member.role·PaginatedResponse·Report 추가, 폴더 구조에 queryKeys.ts·secureStore.ts·types 도메인 분리·docs/adr·README.md 반영 |
| 2026-05-08 | 스타일 도구 변경 — NativeWind v4 채택 (StyleSheet 는 차트·동적 보간 등 className 으로 표현 곤란한 경계만). 디자인 토큰은 `src/constants/theme.ts` 단일 출처, `tailwind.config.js` 가 이를 import 해 동기화. ADR 0001 의 “고려했지만 채택하지 않은 대안” 에서 채택으로 이동. 호환성 표·폴더 구조에 babel/metro/global.css/nativewind-env.d.ts 반영 |
| 2026-05-22 | MVP 기준 재정의 — Notion 최신 기획을 우선해 MVP를 인증·홈·나눔·소모임·MY·이미지 선택으로 확정. 중보기도·삶공부는 MVP에서 분리하고 실제 API·푸시·차단은 후속 TODO로 이동. `열린문커넥트.zip` 디자인 토큰을 앱 theme 기준으로 반영 |
| 2026-05-22 | v1 기준 반영 — Notion 기능 범위와 IA를 우선해 삶공부·중보기도를 v1 범위로 확정하고, Expo Dev Client 기반 실행/검증 및 인증 API adapter 준비를 Phase 6 기준으로 반영 |
| 2026-05-23 | 자동 테스트 체계 반영 — `validate`에 typecheck/lint/format/test를 포함하고, Jest/RNTL smoke, Dev Client Metro smoke, Maestro v1 탭 E2E smoke, ADR 0005를 Phase 1 검증 기준에 포함 |
| 2026-05-23 | Maestro E2E 안정화 — Android Emulator에서는 Metro 상태 확인 URL과 Dev Client 전달 URL을 분리하고, Dev Client welcome sheet를 넘긴 뒤 v1 6탭 smoke를 `testID` 기준으로 검증 |
| 2026-05-27 | ZIP 5탭 IA 정정 — 디자인 산출물 기준을 최우선으로 재확정해 하단 탭을 홈/나눔/소모임/동행/MY로 정리하고, 삶공부·중보기도는 동행 내부 segment와 숨김 상세 route로 유지 |
