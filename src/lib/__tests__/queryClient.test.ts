import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../apiClient";
import {
  clearQueryCache,
  queryClient,
  shouldPersistQuery,
  shouldRetryQuery,
} from "../queryClient";
import { queryKeys } from "../queryKeys";
import { reportInvalidResponse } from "../sentry";

jest.mock("../sentry", () => ({ reportInvalidResponse: jest.fn() }));

describe("shouldRetryQuery", () => {
  it("does not retry on 4xx client errors", () => {
    const error400 = new ApiError({
      code: "BAD_REQUEST",
      message: "잘못된 요청입니다.",
      status: 400,
    });
    const error401 = new ApiError({
      code: "UNAUTHORIZED",
      message: "인증이 필요합니다.",
      status: 401,
    });
    const error404 = new ApiError({
      code: "NOT_FOUND",
      message: "존재하지 않습니다.",
      status: 404,
    });

    expect(shouldRetryQuery(0, error400)).toBe(false);
    expect(shouldRetryQuery(0, error401)).toBe(false);
    expect(shouldRetryQuery(0, error404)).toBe(false);
  });

  it("retries on 5xx server errors up to 2 times", () => {
    const error500 = new ApiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류",
      status: 500,
    });

    expect(shouldRetryQuery(0, error500)).toBe(true);
    expect(shouldRetryQuery(1, error500)).toBe(true);
    expect(shouldRetryQuery(2, error500)).toBe(false);
  });

  it("retries on network errors (status 0) up to 2 times", () => {
    const networkError = new ApiError({
      code: "NETWORK_ERROR",
      message: "네트워크 연결을 확인해주세요.",
      status: 0,
    });

    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(1, networkError)).toBe(true);
    expect(shouldRetryQuery(2, networkError)).toBe(false);
  });

  it("retries on generic unknown errors up to 2 times", () => {
    const genericError = new Error("Generic error");

    expect(shouldRetryQuery(0, genericError)).toBe(true);
    expect(shouldRetryQuery(1, genericError)).toBe(true);
    expect(shouldRetryQuery(2, genericError)).toBe(false);
  });
});

describe("shouldPersistQuery", () => {
  const client = new QueryClient();

  function successQuery(queryKey: readonly unknown[]) {
    client.setQueryData(queryKey, { ok: true });
    return client.getQueryCache().find({ queryKey, exact: true })!;
  }

  afterEach(() => client.clear());

  it.each([
    ["member.me", queryKeys.member.me()],
    ["market.mine", queryKeys.market.mine("all")],
    ["group.detail", queryKeys.group.detail("1")],
    ["group.members", queryKeys.group.members("1")],
    ["prayer.overview", queryKeys.prayer.overview()],
    ["lifeStudy.overview", queryKeys.lifeStudy.overview()],
  ])("does not persist personal query %s", (_, queryKey) => {
    expect(shouldPersistQuery(successQuery(queryKey))).toBe(false);
  });

  it.each([
    ["home.overview", queryKeys.home.overview()],
    ["market.overview", queryKeys.market.overview()],
    ["market.detail", queryKeys.market.detail("1")],
    ["group.overview", queryKeys.group.overview()],
    ["lifeStudy.list", queryKeys.lifeStudy.list()],
    ["prayer.categories", ["prayer", "categories"]],
    ["faqs", ["faqs", "all"]],
  ])("persists public query %s", (_, queryKey) => {
    expect(shouldPersistQuery(successQuery(queryKey))).toBe(true);
  });

  it("does not persist a query that has no data yet", () => {
    client
      .getQueryCache()
      .build(client, { queryKey: queryKeys.home.overview() });
    const query = client
      .getQueryCache()
      .find({ queryKey: queryKeys.home.overview(), exact: true })!;
    expect(shouldPersistQuery(query)).toBe(false);
  });
});

describe("queryClient error reporting", () => {
  it("passes query and mutation errors to reportInvalidResponse", async () => {
    const error = new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
    });

    await expect(
      queryClient.fetchQuery({
        queryKey: ["home", "overview"],
        queryFn: () => Promise.reject(error),
        retry: false,
      }),
    ).rejects.toBe(error);
    expect(reportInvalidResponse).toHaveBeenCalledWith(error, [
      "home",
      "overview",
    ]);

    await expect(
      queryClient
        .getMutationCache()
        .build(queryClient, {
          mutationKey: ["group", "kick"],
          mutationFn: () => Promise.reject(error),
        })
        .execute(undefined),
    ).rejects.toBe(error);
    expect(reportInvalidResponse).toHaveBeenLastCalledWith(error, [
      "group",
      "kick",
    ]);
  });
});

describe("clearQueryCache", () => {
  it("메모리 캐시와 기기에 저장된 캐시를 모두 지운다", async () => {
    queryClient.setQueryData(queryKeys.member.me(), { id: "u1" });
    await AsyncStorage.setItem("REACT_QUERY_OFFLINE_CACHE", "{}");

    await clearQueryCache();

    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(await AsyncStorage.getItem("REACT_QUERY_OFFLINE_CACHE")).toBeNull();
  });
});
