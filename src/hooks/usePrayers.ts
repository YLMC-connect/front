import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { createPrayerTopic } from "../services/prayerService";
import type { PrayerTopicInput } from "../types/prayer";

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
