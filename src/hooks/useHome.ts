import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { fetchHome } from "../services/homeService";

export function useHome() {
  return useQuery({
    queryKey: queryKeys.home.all,
    queryFn: fetchHome,
  });
}
