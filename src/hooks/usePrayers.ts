import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  cancelPrayerCohortCompletion,
  completePrayerCohort,
  createPrayerApplication,
  createPrayerTopicRequest,
  fetchPrayerCategories,
  fetchPrayerOverview,
  requestPrayerTopicAnswer,
} from "../services/prayerService";
import type {
  PrayerAnswerRequest,
  PrayerApplicationCreateRequest,
  PrayerTopicWriteRequest,
} from "../types/prayerApi";

export function usePrayerOverview() {
  return useQuery({
    queryKey: queryKeys.prayer.overview(),
    queryFn: fetchPrayerOverview,
  });
}

/** 기도 완료 / 완료 취소 토글 mutation */
export function useTogglePrayerCompletion(cohortId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currentlyCompleted: boolean) => {
      if (currentlyCompleted) {
        return await cancelPrayerCohortCompletion(cohortId);
      }
      return await completePrayerCohort(cohortId);
    },
    onSuccess: (updatedStatus) => {
      queryClient.setQueryData(
        ["prayer", "cohort-status", cohortId],
        updatedStatus,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
}

/** 기도방 참여 신청 mutation */
export function useCreatePrayerApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PrayerApplicationCreateRequest) =>
      createPrayerApplication(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["prayer", "my-applications"],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
    },
  });
}

/** 기도제목 작성 mutation (백엔드 실제 DTO) */
export function useCreatePrayerTopicApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PrayerTopicWriteRequest) =>
      createPrayerTopicRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer", "my-topics"] });
      queryClient.invalidateQueries({ queryKey: ["prayer", "topic-board"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
    },
  });
}

/** 기도 카테고리 목록 쿼리 */
export function usePrayerCategories() {
  return useQuery({
    queryKey: ["prayer", "categories"],
    queryFn: fetchPrayerCategories,
    staleTime: 1000 * 60 * 10,
  });
}

/** 기도 응답완료 요청 mutation */
export function useRequestPrayerTopicAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      topicId,
      input,
    }: {
      topicId: string;
      input: PrayerAnswerRequest;
    }) => requestPrayerTopicAnswer(topicId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer", "my-topics"] });
      queryClient.invalidateQueries({ queryKey: ["prayer", "topic-board"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
    },
  });
}
