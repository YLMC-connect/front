import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  fetchLifeStudyCourses,
  fetchLifeStudyOverview,
} from "../services/lifeStudyService";
import type { LifeStudyStatus } from "../types/lifeStudy";

export function useLifeStudyCourses(filter: LifeStudyStatus = "all") {
  return useQuery({
    queryKey: queryKeys.lifeStudy.list(filter),
    queryFn: () => fetchLifeStudyCourses(filter),
  });
}

export function useLifeStudyOverview() {
  return useQuery({
    queryKey: queryKeys.lifeStudy.overview(),
    queryFn: fetchLifeStudyOverview,
  });
}
