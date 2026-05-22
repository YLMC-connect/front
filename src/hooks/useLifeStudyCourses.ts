import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  cancelLifeStudyEnrollment,
  enrollLifeStudyCourse,
  fetchLifeStudyCourse,
  fetchLifeStudyCourses,
  fetchLifeStudyHistory,
} from "../services/lifeStudyService";
import type { LifeStudyStatus } from "../types/lifeStudy";

export function useLifeStudyCourses(filter: LifeStudyStatus = "all") {
  return useQuery({
    queryKey: queryKeys.lifeStudy.list(filter),
    queryFn: () => fetchLifeStudyCourses(filter),
  });
}

export function useLifeStudyCourse(id: string) {
  return useQuery({
    queryKey: queryKeys.lifeStudy.detail(id),
    queryFn: () => fetchLifeStudyCourse(id),
  });
}

export function useLifeStudyHistory() {
  return useQuery({
    queryKey: queryKeys.lifeStudy.history(),
    queryFn: fetchLifeStudyHistory,
  });
}

export function useEnrollLifeStudyCourse(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => enrollLifeStudyCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lifeStudy.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useCancelLifeStudyEnrollment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelLifeStudyEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lifeStudy.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}
