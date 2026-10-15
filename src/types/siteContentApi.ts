export type SitePolicyType = 1 | 2; // 1: 이용약관, 2: 개인정보처리방침

export interface SitePolicyResponse {
  id: number;
  policyType: number;
  title: string;
  content: string;
  active?: boolean;
  enforcedAt?: string;
  createAt?: string;
  createdId?: string;
  modifyAt?: string;
  modifiedId?: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface FaqCategoryResponse {
  id: number;
  name: string;
  faqs: FaqItem[];
}
