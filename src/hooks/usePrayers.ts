import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  createPrayerTopic,
  fetchPrayerRoom,
  fetchPrayerRooms,
  joinPrayerRoom,
  leavePrayerRoom,
  markPrayerTopicPrayed,
  recordPrayerAnswer,
} from "../services/prayerService";
import type { PrayerTopicInput, PrayerWeekday } from "../types/prayer";

export function usePrayerRooms(filter: PrayerWeekday | "all" = "all") {
  return useQuery({
    queryKey: [...queryKeys.prayer.lists(), filter] as const,
    queryFn: () => fetchPrayerRooms(filter),
  });
}

export function usePrayerRoom(id: string) {
  return useQuery({
    queryKey: queryKeys.prayer.detail(id),
    queryFn: () => fetchPrayerRoom(id),
  });
}

export function useJoinPrayerRoom(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinPrayerRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useLeavePrayerRoom(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leavePrayerRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useCreatePrayerTopic(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<PrayerTopicInput, "roomId">) =>
      createPrayerTopic({ ...input, roomId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prayer.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayer.detail(roomId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
}

export function useMarkPrayerTopicPrayed(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => markPrayerTopicPrayed(topicId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayer.detail(roomId),
      });
    },
  });
}

export function useRecordPrayerAnswer(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, answer }: { topicId: string; answer: string }) =>
      recordPrayerAnswer(topicId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayer.detail(roomId),
      });
    },
  });
}
