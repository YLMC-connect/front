import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import {
  fetchGroupDetail,
  fetchGroupMembers,
  fetchGroupOverview,
} from "../services/groupService";

export function useGroupOverview() {
  return useQuery({
    queryKey: queryKeys.group.overview(),
    queryFn: fetchGroupOverview,
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
