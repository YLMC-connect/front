import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  createMarketComment,
  fetchMarketDetail,
  fetchMarketOverview,
} from "../services/marketService";
import type { MarketDetail } from "../types/market";

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

export function useCreateMarketComment(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createMarketComment({ marketId, content }),
    onSuccess: (comment) => {
      queryClient.setQueryData<MarketDetail>(
        queryKeys.market.detail(marketId),
        (detail) =>
          detail
            ? { ...detail, comments: [...detail.comments, comment] }
            : detail,
      );
    },
  });
}
