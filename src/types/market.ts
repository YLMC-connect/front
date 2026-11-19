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

export interface MarketInput {
  title: string;
  description: string;
  category: Exclude<MarketCategory, "all">;
  condition: string;
  location: string;
  images: string[];
}

export interface MarketUpdateInput {
  marketId: string;
  title: string;
  description: string;
  category: Exclude<MarketCategory, "all">;
  condition: string;
  location: string;
  /** 화면에 남은 사진 순서. 서버 사진 URL 과 새로 고른 기기 사진 URI 가 섞여 있다. */
  images: string[];
  /** 수정 전 서버 사진(id·URL). 남은 사진 중 여기에 있는 것은 유지, 나머지는 새로 올린다. */
  existingImages: MarketImage[];
}

export interface MarketImage {
  id: string;
  url: string;
}

export interface MarketOverviewItem {
  id: string;
  thumbSeed: number;
  thumbnailUrl?: string;
  title: string;
  authorName: string;
  createdLabel: string;
  status: MarketStatus;
  category: Exclude<MarketCategory, "all">;
  isMine: boolean;
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

export interface MarketPostTarget {
  marketId: string;
}

export interface MarketStatusUpdateInput extends MarketPostTarget {
  status: MarketStatus;
}

export interface MarketCommentUpdateInput extends MarketCommentTarget {
  content: string;
}

export interface MarketDetail {
  id: string;
  thumbSeed: number;
  images?: string[];
  title: string;
  content: string;
  categoryLabel: string;
  conditionLabel: string;
  /** 수령 장소. 옛 글은 비어 있을 수 있다. */
  location?: string;
  /** 서버 사진 id·URL (수정 시 유지할 사진을 고르는 데 쓴다). */
  imageItems?: MarketImage[];
  status: MarketStatus;
  authorName: string;
  createdLabel: string;
  isMine: boolean;
  comments: MarketDetailComment[];
}
