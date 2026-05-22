import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  addGroupNotice,
  createGroup,
  fetchGroup,
  fetchGroups,
  joinGroup,
  leaveGroup,
  removeGroupMember,
  toggleGroupFavorite,
} from "../services/groupService";
import type { GroupCategory, GroupInput } from "../types/group";

export function useGroups(filter: GroupCategory = "all") {
  return useQuery({
    queryKey: queryKeys.group.list(filter),
    queryFn: () => fetchGroups(filter),
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: queryKeys.group.detail(id),
    queryFn: () => fetchGroup(id),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupInput) => createGroup(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useJoinGroup(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useLeaveGroup(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useToggleGroupFavorite(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleGroupFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.home.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.mypage.all });
    },
  });
}

export function useRemoveGroupMember(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeGroupMember(id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
    },
  });
}

export function useAddGroupNotice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      addGroupNotice(id, title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group.detail(id) });
    },
  });
}
