import type { LifeStudyOverviewStatus } from "../../../types/lifeStudy";

export const lifeStudyStatusLabel: Record<LifeStudyOverviewStatus, string> = {
  completed: "수료",
  recommended: "추천",
  pending: "미수료",
};

export function routeId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
