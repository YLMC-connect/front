import * as Sentry from "@sentry/react-native";

/**
 * 배포 빌드에서만 Sentry 를 켠다. 개발 빌드(__DEV__)거나 DSN 이 없으면 아무것도 보내지 않는다.
 */
export function initSentry(
  dsn: string | undefined = process.env.EXPO_PUBLIC_SENTRY_DSN,
): boolean {
  const trimmed = dsn?.trim();
  if (__DEV__ || !trimmed) return false;

  Sentry.init({ dsn: trimmed });
  return true;
}

export const wrapWithSentry = Sentry.wrap;
