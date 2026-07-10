import Constants from "expo-constants";
import { recoverAuth } from "./authRecovery";
import { secureTokenStore } from "./secureStore";
import type { ApiResponse } from "../types/api";

type BaseUrlSource = string | (() => string);
type FetchImplementation = typeof fetch;

export type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export type ApiClientOptions = {
  baseUrl: BaseUrlSource;
  fetchImpl?: FetchImplementation;
  getAccessToken?: () => Promise<string | null>;
  refreshAuth?: () => Promise<void>;
  onAuthFailure?: () => Promise<void> | void;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly data: unknown;

  constructor({
    code,
    message,
    status,
    data = null,
  }: {
    code: string;
    message: string;
    status: number;
    data?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

function getApiBaseUrl() {
  const apiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (typeof apiUrl !== "string" || !/^https?:\/\//.test(apiUrl)) {
    throw new Error(
      "유효한 API URL이 app.config.ts extra.apiUrl에 필요합니다.",
    );
  }
  return apiUrl;
}

function resolveBaseUrl(source: BaseUrlSource) {
  return (typeof source === "function" ? source() : source).replace(/\/+$/, "");
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (Array.isArray(headers)) return Object.fromEntries(headers);

  if (typeof (headers as Headers).forEach === "function") {
    const record: Record<string, string> = {};
    (headers as Headers).forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  return { ...(headers as Record<string, string>) };
}

function hasHeader(headers: Record<string, string>, name: string) {
  return Object.keys(headers).some(
    (key) => key.toLowerCase() === name.toLowerCase(),
  );
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ApiResponse<unknown>>;
  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    "data" in candidate
  );
}

export function createApiClient({
  baseUrl,
  fetchImpl = fetch,
  getAccessToken = async () => null,
  refreshAuth,
  onAuthFailure,
}: ApiClientOptions) {
  let refreshPromise: Promise<boolean> | null = null;

  const tryRefresh = () => {
    if (!refreshAuth) return Promise.resolve(false);

    if (!refreshPromise) {
      refreshPromise = refreshAuth()
        .then(() => true)
        .catch(async () => {
          try {
            await onAuthFailure?.();
          } catch {
            // Preserve the original 401 response when cleanup also fails.
          }
          return false;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  };

  const request = async <T>(
    path: string,
    options: ApiRequestOptions,
    canRefresh: boolean,
  ): Promise<T | null> => {
    const { auth = true, ...requestInit } = options;
    const headers = toHeaderRecord(requestInit.headers);

    if (!hasHeader(headers, "Accept")) headers.Accept = "application/json";
    if (
      typeof requestInit.body === "string" &&
      !hasHeader(headers, "Content-Type")
    ) {
      headers["Content-Type"] = "application/json";
    }

    if (auth) {
      const accessToken = await getAccessToken();
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    }

    const url = `${resolveBaseUrl(baseUrl)}/${path.replace(/^\/+/, "")}`;
    let response: Response;
    try {
      response = await fetchImpl(url, { ...requestInit, headers });
    } catch {
      throw new ApiError({
        code: "NETWORK_ERROR",
        message: "네트워크 연결을 확인해주세요.",
        status: 0,
      });
    }

    const text = await response.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    if (auth && canRefresh && response.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, options, false);
    }

    if (!isApiResponse(body)) {
      throw new ApiError({
        code: "INVALID_RESPONSE",
        message: "서버 응답 형식을 확인할 수 없습니다.",
        status: response.status,
        data: body,
      });
    }

    if (!response.ok || body.code !== "SUCCESS") {
      throw new ApiError({
        code: body.code,
        message: body.message,
        status: response.status,
        data: body.data,
      });
    }

    return body.data as T | null;
  };

  return {
    request<T>(
      path: string,
      options: ApiRequestOptions = {},
    ): Promise<T | null> {
      return request<T>(path, options, true);
    },
  };
}

export const apiClient = createApiClient({
  baseUrl: getApiBaseUrl,
  getAccessToken: () => secureTokenStore.getAccessToken(),
  refreshAuth: recoverAuth,
});
