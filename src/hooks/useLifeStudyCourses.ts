import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  applyLifeStudyCohort,
  fetchLifeStudyCohortDetail,
  fetchLifeStudyCourseLessons,
  fetchLifeStudyCourses,
  fetchLifeStudyOverview,
} from "../services/lifeStudyService";
import type { LifeStudyStatus } from "../types/lifeStudy";
import type { LifeStudyAttendRequest } from "../types/lifeStudyApi";

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

export function useLifeStudyCohortDetail(cohortId?: string) {
  return useQuery({
    queryKey: queryKeys.lifeStudy.cohortDetail(cohortId ?? ""),
    queryFn: () =>
      cohortId ? fetchLifeStudyCohortDetail(cohortId) : Promise.resolve(null),
    enabled: Boolean(cohortId),
  });
}

export function useLifeStudyCourseLessons(courseId?: string) {
  return useQuery({
    queryKey: queryKeys.lifeStudy.courseLessons(courseId ?? ""),
    queryFn: () =>
      courseId ? fetchLifeStudyCourseLessons(courseId) : Promise.resolve(null),
    enabled: Boolean(courseId),
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
