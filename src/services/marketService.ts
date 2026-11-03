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

const marketService = createMarketService(httpMarketDataSource);

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
