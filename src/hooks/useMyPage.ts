import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { fetchMyPage } from "../services/myPageService";

export function useMyPage() {
  return useQuery({
    queryKey: queryKeys.mypage.all,
    queryFn: fetchMyPage,
  });
}
