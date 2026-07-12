import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  createGroup,
  createGroupNotice,
  deleteGroupNotice,
  fetchGroupDetail,
  fetchGroupMembers,
  fetchGroupOverview,
  updateGroupNotice,
} from "../services/groupService";
import type {
  GroupDetail,
  GroupInput,
  GroupNoticeInput,
  GroupNoticeUpdateInput,
} from "../types/group";

export function useGroupOverview() {
  return useQuery({
    queryKey: queryKeys.group.overview(),
    queryFn: fetchGroupOverview,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupInput) => createGroup(input),
    onSuccess: (detail) => {
      queryClient.setQueryData<GroupDetail>(
        queryKeys.group.detail(detail.id),
        detail,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.group.overview() });
    },
  });
}

export function useGroupDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.group.detail(id),
    queryFn: () => fetchGroupDetail(id),
  });
}

export function useGroupMembers(id: string) {
  return useQuery({
    queryKey: queryKeys.group.members(id),
    queryFn: () => fetchGroupMembers(id),
  });
}

export function useCreateGroupNotice(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<GroupNoticeInput, "groupId">) =>
      createGroupNotice({ ...input, groupId }),
    onSuccess: (notice) => {
      queryClient.setQueryData<GroupDetail>(
        queryKeys.group.detail(groupId),
        (detail) =>
          detail ? { ...detail, notices: [notice, ...detail.notices] } : detail,
      );
    },
  });
}

export function useUpdateGroupNotice(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<GroupNoticeUpdateInput, "groupId">) =>
      updateGroupNotice({ ...input, groupId }),
    onSuccess: (updated) => {
      queryClient.setQueryData<GroupDetail>(
        queryKeys.group.detail(groupId),
        (detail) =>
          detail
            ? {
                ...detail,
                notices: detail.notices.map((notice) =>
                  notice.id === updated.id ? updated : notice,
                ),
              }
            : detail,
      );
    },
  });
}

export function useDeleteGroupNotice(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noticeId: string) => deleteGroupNotice({ groupId, noticeId }),
    onSuccess: (_, noticeId) => {
      queryClient.setQueryData<GroupDetail>(
        queryKeys.group.detail(groupId),
        (detail) =>
          detail
            ? {
                ...detail,
                notices: detail.notices.filter(({ id }) => id !== noticeId),
              }
            : detail,
      );
    },
  });
}
