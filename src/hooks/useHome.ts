import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  fetchDawnPrayerDetail,
  fetchHomeOverview,
} from "../services/homeService";

export function useHomeOverview() {
  return useQuery({
    queryKey: queryKeys.home.overview(),
    queryFn: () => fetchHomeOverview(),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useDawnPrayerDetail(id?: number | string) {
  return useQuery({
    queryKey: [...queryKeys.home.dawn(), id ?? "latest"],
    queryFn: () => fetchDawnPrayerDetail(id),
    staleTime: 0,
  });
}
