import type { ComponentType } from "react";
import * as Sentry from "@sentry/react-native";
import { ApiError } from "./apiClient";

let sentryEnabled = false;

/**
 * 배포 빌드에서만 Sentry 를 켠다. 개발 빌드(__DEV__)거나 DSN 이 없으면 아무것도 보내지 않는다.
 */
export function initSentry(
  dsn: string | undefined = process.env.EXPO_PUBLIC_SENTRY_DSN,
): boolean {
  const trimmed = dsn?.trim();
  if (__DEV__ || !trimmed) return false;

  Sentry.init({ dsn: trimmed });
  sentryEnabled = true;
  return true;
}

/** Sentry 를 켰을 때만 감싼다. 켜지 않은 개발 빌드에서 "wrap was called before init" 경고를 막는다. */
export function wrapWithSentry<P extends Record<string, unknown>>(
  component: ComponentType<P>,
): ComponentType<P> {
  return sentryEnabled ? Sentry.wrap(component) : component;
}

/**
 * 서버 응답 형식 오류(INVALID_RESPONSE)만 Sentry 에 남긴다.
 * 네트워크 오류·4xx 응답은 보내지 않는다. 응답 본문·메시지(개인정보 가능)는 싣지 않고,
 * 쿼리 키 앞부분(문자열 조각만)과 HTTP status 만 태그로 보낸다.
 */
export function reportInvalidResponse(
  error: unknown,
  queryKey: readonly unknown[] | undefined,
): void {
  if (!sentryEnabled) return;
  if (!(error instanceof ApiError) || error.code !== "INVALID_RESPONSE") return;
  // 4xx 는 형식이 달라도 사용자 입력 오류(예: 로그인 실패)라 보내지 않는다.
  if (error.status >= 400 && error.status < 500) return;

  const keyPrefix = (queryKey ?? [])
    .slice(0, 2)
    .filter((part): part is string => typeof part === "string")
    .join(".");

  Sentry.captureMessage("API 응답 형식 오류", {
    level: "warning",
    tags: {
      code: error.code,
      status: String(error.status),
      queryKey: keyPrefix || "unknown",
    },
    fingerprint: ["invalid-response", keyPrefix || "unknown"],
  });
}
