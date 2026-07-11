import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  createMarketComment,
  deleteMarketComment,
  fetchMarketDetail,
  fetchMarketOverview,
  reportMarketContent,
  updateMarketComment,
} from "../services/marketService";
import type { MarketDetail, MarketReportInput } from "../types/market";

export function useMarketOverview() {
  return useQuery({
    queryKey: queryKeys.market.overview(),
    queryFn: fetchMarketOverview,
  });
}

export function useUpdateMarketComment(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => updateMarketComment({ marketId, commentId, content }),
    onSuccess: (updated) => {
      queryClient.setQueryData<MarketDetail>(
        queryKeys.market.detail(marketId),
        (detail) =>
          detail
            ? {
                ...detail,
                comments: detail.comments.map((comment) =>
                  comment.id === updated.id ? updated : comment,
                ),
              }
            : detail,
      );
    },
  });
}

export function useDeleteMarketComment(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteMarketComment({ marketId, commentId }),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData<MarketDetail>(
        queryKeys.market.detail(marketId),
        (detail) =>
          detail
            ? {
                ...detail,
                comments: detail.comments.map((comment) =>
                  comment.id === commentId
                    ? { ...comment, content: undefined, isDeleted: true }
                    : comment,
                ),
              }
            : detail,
      );
    },
  });
}

export function useReportMarketContent() {
  return useMutation({
    mutationFn: (input: MarketReportInput) => reportMarketContent(input),
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
