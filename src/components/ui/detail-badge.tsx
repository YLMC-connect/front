import type { ReactNode } from "react";
import { Badge } from "./display";

/**
 * 옛 상세 화면 배지. 공통 Badge 를 감싸는 호환 부품이라 새 코드는 Badge 를 바로 쓴다.
 * primary = 진한 primary 바탕(Badge solid), mute = neutral, warn = warning.
 */
export function DetailBadge({
  children,
  tone = "mute",
  bordered = false,
}: {
  children: ReactNode;
  tone?: "primary" | "mute" | "warn";
  bordered?: boolean;
}) {
  return (
    <Badge
      tone={tone === "warn" ? "warning" : "neutral"}
      solid={tone === "primary"}
      bordered={bordered}
    >
      {children}
    </Badge>
  );
}
