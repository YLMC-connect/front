import type { Comment, Member } from "./common";
import type { MARKET_REPORT_REASONS } from "../constants/domainOptions";

export type MarketCategory =
  | "all"
  | "cloth"
  | "home"
  | "book"
  | "food"
  | "baby"
  | "sport"
  | "etc";

export type MarketStatus = "sharing" | "reserved" | "done";

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  category: Exclude<MarketCategory, "all">;
  status: MarketStatus;
  images: string[];
  owner: Member;
  createdAt: string;
  condition: string;
  location: string;
  comments: Comment[];
  liked: boolean;
}

export interface MarketInput {
  title: string;
  description: string;
  category: Exclude<MarketCategory, "all">;
  condition: string;
  location: string;
  images: string[];
}

export interface MarketOverviewItem {
  id: string;
  thumbSeed: number;
  title: string;
  authorName: string;
  createdLabel: string;
  status: MarketStatus;
}

export interface MarketOverview {
  items: MarketOverviewItem[];
}

export interface MarketDetailComment {
  id: string;
  authorName: string;
  createdLabel: string;
  content?: string;
  isMine: boolean;
  isEdited: boolean;
  isDeleted: boolean;
}

export interface MarketCommentInput {
  marketId: string;
  content: string;
}

export interface MarketCommentTarget {
  marketId: string;
  commentId: string;
}

export interface MarketCommentUpdateInput extends MarketCommentTarget {
  content: string;
}

export type MarketReportReason = (typeof MARKET_REPORT_REASONS)[number]["key"];
export type MarketReportTargetType = "market" | "comment";

export interface MarketReportInput {
  targetType: MarketReportTargetType;
  targetId: string;
  reason: MarketReportReason;
  content?: string;
}

export interface MarketDetail {
  id: string;
  thumbSeed: number;
  title: string;
  content: string;
  categoryLabel: string;
  conditionLabel: string;
  status: MarketStatus;
  authorName: string;
  createdLabel: string;
  isMine: boolean;
  comments: MarketDetailComment[];
}
