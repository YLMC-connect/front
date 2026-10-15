import { httpSiteContentDataSource } from "./siteContentHttpDataSource";
import type {
  FaqCategoryResponse,
  SitePolicyResponse,
  SitePolicyType,
} from "../types/siteContentApi";

export async function getActiveSitePolicy(
  policyType: SitePolicyType,
): Promise<SitePolicyResponse | null> {
  return httpSiteContentDataSource.fetchActivePolicy(policyType);
}

export async function getFaqs(
  categoryId?: number,
): Promise<FaqCategoryResponse[]> {
  return httpSiteContentDataSource.fetchFaqs(categoryId);
}
