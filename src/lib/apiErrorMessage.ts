import { ApiError } from "./apiClient";

export type ApiErrorMessageMap = Readonly<Record<string, string>>;

const commonMessages: ApiErrorMessageMap = {
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  INVALID_RESPONSE:
    "서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.",
};

export function getApiErrorMessage(
  error: unknown,
  messages: ApiErrorMessageMap,
  fallback: string,
) {
  if (error instanceof ApiError) {
    return messages[error.code] ?? commonMessages[error.code] ?? fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
