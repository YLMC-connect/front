import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  addMarketComment,
  createMarketItem,
  fetchMarketItem,
  fetchMarketItems,
  reportMarketItem,
  toggleMarketLike,
  updateMarketStatus,
} from "../services/marketService";
import type {
  MarketCategory,
  MarketInput,
  MarketStatus,
} from "../types/market";

export function useMarketItems(filter: MarketCategory = "all") {
  return useQuery({
    queryKey: queryKeys.market.list(filter),
    queryFn: () => fetchMarketItems(filter),
  });
}

export function useMarketItem(id: string) {
  return useQuery({
    queryKey: queryKeys.market.detail(id),
    queryFn: () => fetchMarketItem(id),
  });
}

export function useCreateMarketItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MarketInput) => createMarketItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.market.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
    },
  });
}

export function useUpdateMarketStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: MarketStatus) => updateMarketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.market.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.market.detail(id) });
    },
  });
}

export function useToggleMarketLike(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleMarketLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.market.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.market.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useAddMarketComment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => addMarketComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.market.detail(id) });
    },
  });
}

export function useReportMarketItem(id: string) {
  return useMutation({
    mutationFn: (reason: string) => reportMarketItem(id, reason),
  });
}
