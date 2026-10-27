import { useQuery } from "@tanstack/react-query";
import { getActiveSitePolicy, getFaqs } from "../services/siteContentService";
import type { SitePolicyType } from "../types/siteContentApi";

export const SITE_POLICY_QUERY_KEY = (policyType: SitePolicyType) =>
  ["site-policy", policyType] as const;

export const FAQS_QUERY_KEY = (categoryId?: number) =>
  ["faqs", categoryId ?? "all"] as const;

export function useActiveSitePolicy(policyType: SitePolicyType) {
  return useQuery({
    queryKey: SITE_POLICY_QUERY_KEY(policyType),
    queryFn: () => getActiveSitePolicy(policyType),
    staleTime: 1000 * 60 * 30,
  });
}

export function useFaqs(categoryId?: number) {
  return useQuery({
    queryKey: FAQS_QUERY_KEY(categoryId),
    queryFn: () => getFaqs(categoryId),
    staleTime: 1000 * 60 * 10,
  });
}
