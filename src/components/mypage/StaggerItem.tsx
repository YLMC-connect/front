import type { ReactNode } from "react";
import { MotionEnter, motionStaggerDelay } from "../ui/motion";

/** 목록 첫 진입 때 처음 8개만 60ms 간격으로 8px 아래에서 떠오른다. */
const STAGGER_LIMIT = 8;

export function StaggerItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  if (index >= STAGGER_LIMIT) return <>{children}</>;
  return (
    <MotionEnter mode="fadeUp" delay={motionStaggerDelay(index)}>
      {children}
    </MotionEnter>
  );
}
