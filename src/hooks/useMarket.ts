import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  fetchMarketDetail,
  fetchMarketOverview,
} from "../services/marketService";

export function useMarketOverview() {
  return useQuery({
    queryKey: queryKeys.market.overview(),
    queryFn: fetchMarketOverview,
  });
}

export function useMarketDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.market.detail(id),
    queryFn: () => fetchMarketDetail(id),
  });
}
