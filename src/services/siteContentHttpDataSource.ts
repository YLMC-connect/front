import { apiClient, ApiError } from "../lib/apiClient";
import type {
  FaqCategoryResponse,
  SitePolicyResponse,
  SitePolicyType,
} from "../types/siteContentApi";

type SiteContentApiClient = {
  request<T>(
    path: string,
    options?: { auth?: boolean; method?: string; body?: string },
  ): Promise<T | null>;
};

export function createSiteContentHttpDataSource(
  client: SiteContentApiClient = apiClient,
) {
  return {
    async fetchActivePolicy(
      policyType: SitePolicyType,
    ): Promise<SitePolicyResponse | null> {
      try {
        const data = await client.request<SitePolicyResponse>(
          `/api/site-policies/${policyType}`,
          { auth: false, method: "GET" },
        );
        return data;
      } catch (error: unknown) {
        if (
          error instanceof ApiError &&
          (error.code === "POLICY001" || error.status === 404)
        ) {
          return null;
        }
        throw error;
      }
    },

    async fetchFaqs(categoryId?: number): Promise<FaqCategoryResponse[]> {
      const path =
        categoryId !== undefined
          ? `/api/faqs?categoryId=${categoryId}`
          : "/api/faqs";
      const data = await client.request<FaqCategoryResponse[]>(path, {
        auth: false,
        method: "GET",
      });
      return data ?? [];
    },
  };
}

export const httpSiteContentDataSource = createSiteContentHttpDataSource();
