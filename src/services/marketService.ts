import Constants from "expo-constants";
import { mockMarketDetails, mockMarketOverview } from "../mocks/market";
import { MOCK_USER } from "../mocks/auth";
import { MARKET_CATEGORIES } from "../constants/domainOptions";
import { httpMarketDataSource } from "./marketHttpDataSource";
import type {
  MarketCommentInput,
  MarketCommentTarget,
  MarketCommentUpdateInput,
  MarketDetail,
  MarketDetailComment,
  MarketOverview,
  MarketInput,
  MarketPostTarget,
  MarketReportInput,
  MarketUpdateInput,
} from "../types/market";

export class DuplicateMarketReportError extends Error {
  constructor() {
    super("이미 신고한 콘텐츠입니다.");
    this.name = "DuplicateMarketReportError";
  }
}

export interface MarketOverviewPage {
  items: MarketOverview["items"];
  hasNext: boolean;
  nextCursor?: number | null;
}

export interface MarketDataSource {
  getOverview(): Promise<MarketOverview>;
  getOverviewPage?(params?: {
    lastId?: number | null;
    size?: number;
  }): Promise<MarketOverviewPage>;
  getDetail(id: string): Promise<MarketDetail>;
  createPost(input: MarketInput): Promise<MarketDetail>;
  updatePost(input: MarketUpdateInput): Promise<MarketDetail>;
  deletePost(input: MarketPostTarget): Promise<void>;
  createComment(input: MarketCommentInput): Promise<MarketDetailComment>;
  updateComment(input: MarketCommentUpdateInput): Promise<MarketDetailComment>;
  deleteComment(input: MarketCommentTarget): Promise<void>;
  reportContent(input: MarketReportInput): Promise<void>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const mockComments = new Map<string, MarketDetailComment[]>();
const mockReportTargets = new Set<string>();
const mockDeletedPosts = new Set<string>();
const mockCreatedOverviewItems: MarketOverview["items"] = [];
const mockCreatedDetails = new Map<string, MarketDetail>();

function getMockComments(marketId: string) {
  const detail =
    mockCreatedDetails.get(marketId) ?? mockMarketDetails[marketId];
  if (!detail) throw new Error("존재하지 않는 나눔입니다.");

  const comments = mockComments.get(marketId);
  if (comments) return comments;

  const initialComments = detail.comments.map((comment) => ({ ...comment }));
  mockComments.set(marketId, initialComments);
  return initialComments;
}

function findOwnMockComment(input: MarketCommentTarget) {
  const comments = getMockComments(input.marketId);
  const comment = comments.find(({ id }) => id === input.commentId);
  if (!comment || comment.isDeleted) {
    throw new Error("존재하지 않는 댓글입니다.");
  }
  if (!comment.isMine) throw new Error("내 댓글만 변경할 수 있습니다.");
  return { comments, comment };
}

export const mockMarketDataSource: MarketDataSource = {
  async getOverview() {
    await delay();
    return {
      items: [...mockCreatedOverviewItems, ...mockMarketOverview.items].filter(
        ({ id }) => !mockDeletedPosts.has(id),
      ),
    };
  },
  async getOverviewPage({
    lastId,
    size = 10,
  }: {
    lastId?: number | null;
    size?: number;
  } = {}) {
    await delay();
    const all = [
      ...mockCreatedOverviewItems,
      ...mockMarketOverview.items,
    ].filter(({ id }) => !mockDeletedPosts.has(id));
    let startIndex = 0;
    if (lastId != null) {
      const idx = all.findIndex((item) => Number(item.id) === lastId);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }
    const pageItems = all.slice(startIndex, startIndex + size);
    const hasNext = startIndex + size < all.length;
    const nextCursor =
      hasNext && pageItems.length > 0
        ? Number(pageItems[pageItems.length - 1].id) || null
        : null;
    return {
      items: pageItems,
      hasNext,
      nextCursor,
    };
  },
  async getDetail(id) {
    await delay();
    const detail = mockCreatedDetails.get(id) ?? mockMarketDetails[id];
    if (!detail || mockDeletedPosts.has(id)) {
      throw new Error("존재하지 않는 나눔입니다.");
    }
    return {
      ...detail,
      comments: getMockComments(id).map((comment) => ({ ...comment })),
    };
  },
  async createPost(input) {
    await delay();
    const id = `mock-market-${Date.now()}`;
    const categoryLabel =
      MARKET_CATEGORIES.find(({ key }) => key === input.category)?.label ??
      input.category;
    const detail: MarketDetail = {
      id,
      thumbSeed:
        mockMarketOverview.items.length + mockCreatedOverviewItems.length,
      ...(input.images.length > 0 ? { images: input.images } : {}),
      title: input.title,
      content: input.description,
      categoryLabel,
      conditionLabel: input.condition,
      status: "sharing",
      authorName: MOCK_USER.name,
      createdLabel: "방금 전",
      isMine: true,
      comments: [],
    };
    mockCreatedDetails.set(id, detail);
    mockCreatedOverviewItems.unshift({
      id,
      thumbSeed: detail.thumbSeed,
      ...(input.images[0] ? { thumbnailUrl: input.images[0] } : {}),
      title: detail.title,
      authorName: detail.authorName,
      createdLabel: detail.createdLabel,
      status: detail.status,
      category: input.category,
      isMine: true,
    });
    mockComments.set(id, []);
    return detail;
  },
  async updatePost(input) {
    await delay();
    const detail =
      mockCreatedDetails.get(input.marketId) ??
      mockMarketDetails[input.marketId];
    if (!detail || mockDeletedPosts.has(input.marketId)) {
      throw new Error("존재하지 않는 나눔입니다.");
    }
    const categoryLabel =
      MARKET_CATEGORIES.find((item) => item.key === input.category)?.label ||
      "기타";
    const updated: MarketDetail = {
      ...detail,
      title: input.title,
      content: input.description,
      categoryLabel,
      conditionLabel: input.condition,
    };
    mockCreatedDetails.set(input.marketId, updated);
    return updated;
  },
  async deletePost(input) {
    await delay();
    const detail =
      mockCreatedDetails.get(input.marketId) ??
      mockMarketDetails[input.marketId];
    if (!detail || mockDeletedPosts.has(input.marketId)) {
      throw new Error("존재하지 않는 나눔입니다.");
    }
    if (!detail.isMine) throw new Error("내 나눔만 삭제할 수 있습니다.");
    mockDeletedPosts.add(input.marketId);
    mockComments.delete(input.marketId);
  },
  async createComment(input) {
    await delay();
    const comments = getMockComments(input.marketId);

    const comment = {
      id: `mock-comment-${input.marketId}-${Date.now()}`,
      authorName: MOCK_USER.name,
      createdLabel: "방금 전",
      content: input.content,
      isMine: true,
      isEdited: false,
      isDeleted: false,
    };
    mockComments.set(input.marketId, [...comments, comment]);
    return comment;
  },
  async updateComment(input) {
    await delay();
    const { comments, comment } = findOwnMockComment(input);
    const updated = { ...comment, content: input.content, isEdited: true };
    mockComments.set(
      input.marketId,
      comments.map((current) =>
        current.id === input.commentId ? updated : current,
      ),
    );
    return updated;
  },
  async deleteComment(input) {
    await delay();
    const { comments, comment } = findOwnMockComment(input);
    mockComments.set(
      input.marketId,
      comments.map((current) =>
        current.id === input.commentId
          ? { ...comment, content: undefined, isDeleted: true }
          : current,
      ),
    );
  },
  async reportContent(input) {
    await delay();
    const key = `${input.targetType}:${input.targetId}`;
    if (mockReportTargets.has(key)) throw new DuplicateMarketReportError();
    mockReportTargets.add(key);
  },
};

export function createMarketService(dataSource: MarketDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchOverviewPage: (params?: { lastId?: number | null; size?: number }) => {
      if (dataSource.getOverviewPage) {
        return dataSource.getOverviewPage(params);
      }
      return dataSource.getOverview().then((res) => ({
        items: res.items,
        hasNext: false,
        nextCursor: null,
      }));
    },
    fetchDetail: (id: string) => dataSource.getDetail(id),
    createPost: (input: MarketInput) => {
      const normalized = {
        ...input,
        title: input.title.trim(),
        description: input.description.trim(),
        location: input.location.trim(),
      };
      if (normalized.title.length < 2 || normalized.title.length > 30) {
        throw new Error("제목은 2~30자로 입력해주세요.");
      }
      if (
        normalized.description.length < 5 ||
        normalized.description.length > 500
      ) {
        throw new Error("상세 설명은 5~500자로 입력해주세요.");
      }
      if (!normalized.location) throw new Error("수령 장소를 입력해주세요.");
      if (normalized.images.length < 1) {
        throw new Error("사진을 1장 이상 추가해주세요.");
      }
      return dataSource.createPost(normalized);
    },
    updatePost: (input: MarketUpdateInput) => {
      const normalized = {
        ...input,
        title: input.title.trim(),
        description: input.description.trim(),
      };
      if (!normalized.title || normalized.title.length > 50) {
        throw new Error("제목은 1~50자로 입력해주세요.");
      }
      if (
        normalized.description.length < 5 ||
        normalized.description.length > 500
      ) {
        throw new Error("상세 설명은 5~500자로 입력해주세요.");
      }
      return dataSource.updatePost(normalized);
    },
    deletePost: (input: MarketPostTarget) => dataSource.deletePost(input),
    createComment: (input: MarketCommentInput) => {
      const content = input.content.trim();
      if (!content) throw new Error("댓글 내용을 입력해주세요.");
      return dataSource.createComment({ ...input, content });
    },
    updateComment: (input: MarketCommentUpdateInput) => {
      const content = input.content.trim();
      if (!content) throw new Error("댓글 내용을 입력해주세요.");
      return dataSource.updateComment({ ...input, content });
    },
    deleteComment: (input: MarketCommentTarget) =>
      dataSource.deleteComment(input),
    reportContent: (input: MarketReportInput) => {
      const content = input.content?.trim();
      if (input.reason === "other" && !content) {
        throw new Error("기타 신고 사유를 입력해주세요.");
      }
      return dataSource.reportContent({
        ...input,
        content: content || undefined,
      });
    },
  };
}

function resolveMarketAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_MARKET_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.marketAdapter === "http"
    ? "http"
    : "mock";
}

const marketService = createMarketService(
  resolveMarketAdapterMode() === "http"
    ? httpMarketDataSource
    : mockMarketDataSource,
);

export const fetchMarketOverview = marketService.fetchOverview;
export const fetchMarketOverviewPage = marketService.fetchOverviewPage;
export const fetchMarketDetail = marketService.fetchDetail;
export const createMarketPost = marketService.createPost;
export const updateMarketPost = marketService.updatePost;
export const deleteMarketPost = marketService.deletePost;
export const createMarketComment = marketService.createComment;
export const updateMarketComment = marketService.updateComment;
export const deleteMarketComment = marketService.deleteComment;
export const reportMarketContent = marketService.reportContent;
