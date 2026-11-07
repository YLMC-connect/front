import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "../lib/queryKeys";
import {
  createMarketPost,
  createMarketComment,
  deleteMarketComment,
  deleteMarketPost,
  fetchMarketDetail,
  fetchMarketOverviewPage,
  fetchMyMarketOverviewPage,
  type MarketOverviewPage,
  reportMarketContent,
  updateMarketComment,
  updateMarketPost,
} from "../services/marketService";
import type {
  MarketCategory,
  MarketDetail,
  MarketInput,
  MarketReportInput,
  MarketUpdateInput,
} from "../types/market";

export function useMarketOverview(category?: Exclude<MarketCategory, "all">) {
  const query = useInfiniteQuery({
    // 카테고리는 서버에서 거른다(categoryCode). 카테고리마다 목록 캐시를 따로 둔다
    queryKey: [...queryKeys.market.overview(), category ?? "all"],
    queryFn: ({ pageParam }) =>
      fetchMarketOverviewPage({ lastId: pageParam, category }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor != null
        ? lastPage.nextCursor
        : undefined,
  });

  const allItems = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    ...query,
    data: query.data ? { items: allItems } : undefined,
  };
}

export function useMyMarketOverview(
  category?: Exclude<MarketCategory, "all">,
  enabled = true,
) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.market.mine(category ?? "all"),
    queryFn: ({ pageParam }) =>
      fetchMyMarketOverviewPage({ lastId: pageParam, category }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor != null
        ? lastPage.nextCursor
        : undefined,
    enabled,
  });

  const allItems = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    ...query,
    data: query.data ? { items: allItems } : undefined,
  };
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
      queryClient.invalidateQueries({ queryKey: queryKeys.market.mine() });
    },
  });
}

export function useUpdateMarketPost(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<MarketUpdateInput, "marketId">) =>
      updateMarketPost({ ...input, marketId }),
    onSuccess: (detail) => {
      queryClient.setQueryData<MarketDetail>(
        queryKeys.market.detail(marketId),
        detail,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.market.overview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.market.mine() });
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
    enabled: Boolean(id),
  });
}

export function useDeleteMarketPost(marketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteMarketPost({ marketId }),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<MarketOverviewPage>>(
        { queryKey: queryKeys.market.overview() },
        (overview) =>
          overview
            ? {
                ...overview,
                pages: overview.pages.map((page) => ({
                  ...page,
                  items: page.items.filter(({ id }) => id !== marketId),
                })),
              }
            : overview,
      );
      queryClient.removeQueries({
        queryKey: queryKeys.market.detail(marketId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.market.mine() });
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
