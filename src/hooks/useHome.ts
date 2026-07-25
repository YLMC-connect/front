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
  });
}

export function useDawnPrayerDetail() {
  return useQuery({
    queryKey: queryKeys.home.dawn(),
    queryFn: fetchDawnPrayerDetail,
  });
}
