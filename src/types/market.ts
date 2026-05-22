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
