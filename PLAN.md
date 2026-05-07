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
│   │   ├── queryClient.ts        # QueryClient 인스턴스 및 기본 설정
│   │   ├── queryKeys.ts          # queryKey 컨벤션 중앙화 (도메인별)
│   │   └── secureStore.ts        # expo-secure-store 토큰 저장 유틸
│   │
│   ├── types/                    # TypeScript 타입 정의 (도메인별 분리)
│   │   ├── common.ts             # Member, PaginatedResponse, Report
│   │   ├── market.ts
│   │   ├── group.ts
│   │   ├── lifeStudy.ts
│   │   └── prayer.ts
│   │
│   ├── constants/
│   │   └── theme.ts              # 색상, spacing, 폰트 크기 등 디자인 토큰 — tailwind.config.js 가 import 하는 단일 출처
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
  role: 'member' | 'staff' | 'admin';  // 'staff' = 교역자, 'admin' = 운영자
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
  reason: 'inappropriate' | 'spam' | 'abuse' | 'other';
  detail?: string;
  createdAt: Date;
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
| 빌드 | EAS Build | dev / preview / production profiles (`eas.json`) |
| 환경변수 | `app.config.ts` + `expo-constants` | 환경별 API URL, 키 분리 |
| Node.js | `^20.x` (LTS) | package.json에 `engines` 명시 |
| 커밋 컨벤션 | Conventional Commits + commitlint | `feat / fix / docs / chore / refactor / test` |
| 커밋 훅 | husky + lint-staged | 커밋 전 typecheck + lint + format 자동 실행 |
| CI | GitHub Actions | PR마다 typecheck + lint + test 실행 |
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
    detail: (id: string) => [...queryKeys.group.all, 'detail', id] as const,
  },
  lifeStudy: {
    all: ['lifeStudy'] as const,
    courses: (status?: LifeStudyCourse['status']) => [...queryKeys.lifeStudy.all, 'courses', status] as const,
    history: (memberId: string) => [...queryKeys.lifeStudy.all, 'history', memberId] as const,
  },
  prayer: {
    all: ['prayer'] as const,
    lists: () => [...queryKeys.prayer.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.prayer.all, 'detail', id] as const,
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

- 테스트 파일 위치: 대상 파일 옆 `__tests__/` 폴더에 co-location
- Mock 데이터(`src/mocks/`)를 테스트 픽스처로 그대로 재사용
- `@testing-library/react-hooks` 대신 RTL의 `renderHook` 사용 (RTL v13+에 통합)
- TanStack Query 훅 테스트는 별도 `QueryClientProvider`로 wrap (각 테스트마다 새 인스턴스)
- CI(GitHub Actions)에서 PR마다 자동 실행 + 커버리지 리포트

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

## 🔔 푸시 알림 시나리오

`expo-notifications` + 권한 플로우. 디바이스 토큰은 로그인 시 백엔드에 등록, 로그아웃 시 해제.

| 트리거 | 대상 | 알림 메시지 예시 |
|-------|------|----------|
| 소모임 일정 24시간 전 | 참여 멤버 | "내일 [모임명] 일정이 있습니다" |
| 기도제목 만료 임박 | 작성자 | "기도제목이 곧 만료됩니다" |
| 장터 채팅 신규 메시지 | 수신자 | "[상품명]에 메시지가 도착했습니다" |
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

- 모든 게시물(장터·소모임·기도제목)·댓글·채팅에 신고 버튼
- 신고 사유: `inappropriate` / `spam` / `abuse` / `other`
- 사용자 차단: 차단 후 해당 사용자의 모든 컨텐츠 클라이언트에서 자동 숨김
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

> 본 섹션은 **Phase 단위 큰 그림과 범위** 만 정의합니다. 세부 작업 체크리스트와 진행 상태는 [docs/TASKS.md](docs/TASKS.md) 에서 단일 출처로 관리합니다.

| Phase | 상태 | 핵심 산출물 / 범위 |
|---|---|---|
| Phase 0 — 기획·문서화 | ✅ 완료 | 기능 정의, 기술 스택, 폴더 구조, 데이터 타입, 디자인 방향, Mock Auth 설계, 소모임 카테고리 확정 |
| Phase 1 — 프로젝트 초기 세팅 | ⬜ 예정 | Expo 프로젝트·의존성, `src/lib/`(queryClient·queryKeys·secureStore), `src/types/` 도메인 분리, `src/store/authStore`, `src/constants/theme`, Root layout(Provider·에러 바운더리·Sentry), 5탭 네비게이션, 공통 UI, `app.config.ts`·`eas.json`, husky·CI, ADR 0001 |
| Phase 2 — 나눔장터 | ⬜ 예정 | `mocks·service·hook` (useInfiniteQuery + 신고 mutation) + 목록(카테고리·검색·무한스크롤)·상세(이미지 슬라이더)·글쓰기 모달(rhf+zod+이미지) + 테스트·a11y |
| Phase 3 — 소모임 | ⬜ 예정 | `mocks·service·hook` (참여/탈퇴/신고) + 목록·상세(멤버·일정)·개설 모달(cover 이미지) + 테스트·a11y |
| Phase 4 — 삶공부 | ⬜ 예정 | `mocks·service·hook` (신청/취소) + 과정 목록(상태 탭)·상세(신청 폼)·내 이력(수료증) + 테스트·a11y |
| Phase 5 — 중보기도 | ⬜ 예정 | `mocks·service·hook` (기도하기/신고) + 목록(만료 배지)·상세(낙관적 카운트)·등록 모달(익명·만료일) + 익명 ID 미노출 검증 |
| Phase 6 — 인증 (Auth) | ⬜ 예정 | 로그인·회원가입(약관) · `secureStore` 토큰 저장 · refresh token rotation · authStore 실 토큰 연결 · 로그아웃 시 cache 초기화 |
| Phase 7 — 백엔드 연결 | ⬜ 예정 | services/ 실 API 교체 · zod 응답 검증 · 푸시 알림(권한·디바이스 토큰·Deep link·설정 화면) · 이미지 업로드 파이프라인(presigned URL·EXIF·압축) · 강제 업데이트 |
| Phase 8 — 채팅 (장터) | ⬜ 예정 | 실시간 인프라 결정(ADR) · 1:1 DM 모델 · 채팅방·목록 화면 · 푸시 연동 · 차단/신고 숨김 · 이미지 메시지 |
| Phase 9 — 분석/모니터링 | ⬜ 예정 | Analytics funnel 정의·추적 · Sentry release·source map · 성능 모니터링 · (선택) 관리자 도구 |
| Phase 10 — 접근성/성능 | ⬜ 예정 | a11y audit (VoiceOver·TalkBack) · 색 대비 WCAG AA · 폰트 스케일 2배 검증 · 번들 최적화 · 이미지 lazy · 시니어 폰트 옵션 |

> Phase 1 의 의존성 설치 명령(npm/expo install) 원본은 git 히스토리(`74af553`) 또는 [docs/TASKS.md](docs/TASKS.md) 의 P1 항목에서 확인 가능합니다. 본 표는 “무엇을 만드나” 의 큰 그림이고, “어떻게 / 무슨 명령으로” 의 세부 절차는 TASKS.md 와 ADR 의 영역입니다.

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

> 본 섹션은 **명세 자체의 마일스톤** 만 기록합니다 (Phase 단위 완료, 큰 데이터 타입 변경, 정책 변경 등). 일상 작업 단위 기록은 [docs/LOG.md](docs/LOG.md) 가 단일 출처입니다.

| 날짜 | 내용 |
|------|------|
| 2026-05-07 | 초안 작성 — 기술 스택, 구조, 타입, Phase 정의 |
| 2026-05-07 | Phase 0 완료 — 미결 사항 4개 확정, TanStack Query + MaterialIcons 추가, Mock Auth 설계, 소모임 카테고리 정의 |
| 2026-05-07 | 버전 검토 — Expo SDK 55 / Expo Router v7 / RN 0.83 기준으로 버전 명시, New Architecture 전용 주의사항 추가, 네트워크 레이어 설계, TanStack Query React Native 설정 추가 |
| 2026-05-07 | 2차 보완 — 핵심 기능별 화면 플로우 상세화, MaterialIcons 아이콘 이름 수정, 나눔장터 카테고리 정의, 데이터 타입 보완(MarketCategory·memberId·coverImage), 에러 처리 전략 추가, Phase 2~5 세부 태스크 구체화 |
| 2026-05-07 | 3차 보완 — 유지보수 관점 인프라 항목 추가 (테스트 전략·Sentry·보안/개인정보·CI/CD·환경 분리·queryKey 컨벤션·영속 캐시·푸시 알림 시나리오·이미지 업로드 파이프라인·신고/모더레이션·접근성), Phase 1 의존성/세팅 보강, Phase 2~5 페이지네이션·신고·테스트·a11y 추가, Phase 8(채팅)·Phase 9(분석)·Phase 10(a11y/성능) 신설, 데이터 타입에 Member.role·PaginatedResponse·Report 추가, 폴더 구조에 queryKeys.ts·secureStore.ts·types 도메인 분리·docs/adr·README.md 반영 |
| 2026-05-08 | 스타일 도구 변경 — NativeWind v4 채택 (StyleSheet 는 차트·동적 보간 등 className 으로 표현 곤란한 경계만). 디자인 토큰은 `src/constants/theme.ts` 단일 출처, `tailwind.config.js` 가 이를 import 해 동기화. ADR 0001 의 “고려했지만 채택하지 않은 대안” 에서 채택으로 이동. 호환성 표·폴더 구조에 babel/metro/global.css/nativewind-env.d.ts 반영 |
