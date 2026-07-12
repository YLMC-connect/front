import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  createMarketPost,
  createMarketComment,
  deleteMarketComment,
  deleteMarketPost,
  fetchMarketDetail,
  fetchMarketOverview,
  reportMarketContent,
  updateMarketComment,
} from "../services/marketService";
import type {
  MarketDetail,
  MarketInput,
  MarketOverview,
  MarketReportInput,
} from "../types/market";

export function useMarketOverview() {
  return useQuery({
    queryKey: queryKeys.market.overview(),
    queryFn: fetchMarketOverview,
  });
}

export function useCreateMarketPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarketInput) => createMarketPost(input),
    onSuccess: (detail) => {
      queryClient.setQueryData<MarketDetail>(
        queryKeys.market.detail(detail.id),
        detail,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.market.overview() });
    },
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

export function useDeleteMarketPost(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMarketPost({ marketId }),
    onSuccess: () => {
      queryClient.setQueryData<MarketOverview>(
        queryKeys.market.overview(),
        (overview) =>
          overview
            ? {
                ...overview,
                items: overview.items.filter(({ id }) => id !== marketId),
              }
            : overview,
      );
      queryClient.removeQueries({
        queryKey: queryKeys.market.detail(marketId),
      });
    },
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
