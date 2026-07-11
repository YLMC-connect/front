import type { Comment, Member } from "./common";

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
