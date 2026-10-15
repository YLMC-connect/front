import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  getCurrentMember,
  updateCurrentMember,
  verifyPassword,
  withdrawMember,
} from "../services/authService";
import { useAuthStore } from "../store/authStore";
import type {
  MemberChangePasswordRequest,
  MemberVerifyPasswordRequest,
} from "../types/authApi";

export const MEMBER_ME_QUERY_KEY = ["member", "me"] as const;

export function useMemberMe() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: MEMBER_ME_QUERY_KEY,
    queryFn: getCurrentMember,
    enabled: isLoggedIn,
    initialData: currentUser ?? undefined,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateMemberMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { phone: string }) => updateCurrentMember(input),
    onSuccess: (updated) => {
      queryClient.setQueryData(MEMBER_ME_QUERY_KEY, updated);
    },
  });
}

export function useVerifyPassword() {
  return useMutation({
    mutationFn: (input: MemberVerifyPasswordRequest) => verifyPassword(input),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: MemberChangePasswordRequest) => changePassword(input),
  });
}

export function useWithdrawMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawMember(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
