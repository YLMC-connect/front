import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  fetchLifeStudyCourses,
  fetchLifeStudyOverview,
  resolveLifeStudyAdapterMode,
} from "../services/lifeStudyService";
import type { LifeStudyStatus } from "../types/lifeStudy";

export function useLifeStudyCourses(filter: LifeStudyStatus = "all") {
  return useQuery({
    queryKey: [
      ...queryKeys.lifeStudy.list(filter),
      resolveLifeStudyAdapterMode(),
    ],
    queryFn: () => fetchLifeStudyCourses(filter),
  });
}

export function useLifeStudyOverview() {
  return useQuery({
    queryKey: [
      ...queryKeys.lifeStudy.overview(),
      resolveLifeStudyAdapterMode(),
    ],
    queryFn: fetchLifeStudyOverview,
  });
}
