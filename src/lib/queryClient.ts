import { AppState, type AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery,
  focusManager,
  onlineManager,
  type Query,
} from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { ApiError } from "./apiClient";
import { reportInvalidResponse } from "./sentry";

export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  // 화면이 오류를 처리해도 서버 응답 형식 오류는 Sentry 에 남긴다 (Sentry 를 켰을 때만).
  queryCache: new QueryCache({
    onError: (error, query) => reportInvalidResponse(error, query.queryKey),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) =>
      reportInvalidResponse(error, mutation.options.mutationKey),
  }),
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: 1000 * 60 * 5,
    },
  },
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  }),
);

AppState.addEventListener("change", (status: AppStateStatus) => {
  focusManager.setFocused(status === "active");
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

/**
 * 개인정보가 담긴 쿼리. queryKey 앞부분이 이 중 하나와 같으면 기기에 저장하지 않고 메모리에만 둔다.
 */
export const NON_PERSISTED_QUERY_KEY_PREFIXES: readonly (readonly string[])[] =
  [
    ["member"], // 내 정보: 이름·전화번호·이메일·포인트
    ["market", "mine"], // 내 나눔 목록
    ["group", "detail"], // 소모임 상세·회원 목록: 회원 실명, 내 가입 여부
    ["prayer", "overview"], // 내 기도방·내 기도 신청 내용
    ["lifeStudy", "overview"], // 내 수료 현황
  ];

function startsWithKey(
  queryKey: readonly unknown[],
  prefix: readonly string[],
) {
  return prefix.every((part, index) => queryKey[index] === part);
}

export function shouldPersistQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) return false;
  return !NON_PERSISTED_QUERY_KEY_PREFIXES.some((prefix) =>
    startsWithKey(query.queryKey, prefix),
  );
}

/** 메모리 캐시와 기기에 저장된 캐시를 모두 지운다. 로그아웃·세션 만료·새 로그인 때 쓴다. */
export async function clearQueryCache() {
  queryClient.clear();
  await persister.removeClient();
}

persistQueryClient({
  queryClient,
  persister,
  buster: "private-excluded-v2",
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
  },
});
