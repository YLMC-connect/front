import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  applyLifeStudyCohort,
  fetchLifeStudyCourses,
  fetchLifeStudyOverview,
  resolveLifeStudyAdapterMode,
} from "../services/lifeStudyService";
import type { LifeStudyStatus } from "../types/lifeStudy";
import type { LifeStudyAttendRequest } from "../types/lifeStudyApi";

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

export function useApplyLifeStudyCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cohortId,
      input,
    }: {
      cohortId: string | number;
      input: LifeStudyAttendRequest;
    }) => applyLifeStudyCohort(cohortId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lifeStudy.all });
    },
  });
}
