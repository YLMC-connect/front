import { mockMarketDetails, mockMarketOverview } from "../mocks/market";
import { MOCK_USER } from "../mocks/auth";
import type {
  MarketCommentInput,
  MarketDetail,
  MarketDetailComment,
  MarketOverview,
} from "../types/market";

export interface MarketDataSource {
  getOverview(): Promise<MarketOverview>;
  getDetail(id: string): Promise<MarketDetail>;
  createComment(input: MarketCommentInput): Promise<MarketDetailComment>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const mockCreatedComments = new Map<string, MarketDetailComment[]>();

export const mockMarketDataSource: MarketDataSource = {
  async getOverview() {
    await delay();
    return mockMarketOverview;
  },
  async getDetail(id) {
    await delay();
    const detail = mockMarketDetails[id];
    if (!detail) throw new Error("존재하지 않는 나눔입니다.");
    return {
      ...detail,
      comments: [...detail.comments, ...(mockCreatedComments.get(id) ?? [])],
    };
  },
  async createComment(input) {
    await delay();
    if (!mockMarketDetails[input.marketId]) {
      throw new Error("존재하지 않는 나눔입니다.");
    }

    const comment = {
      id: `mock-comment-${input.marketId}-${Date.now()}`,
      authorName: MOCK_USER.name,
      createdLabel: "방금 전",
      content: input.content,
      isMine: true,
      isEdited: false,
      isDeleted: false,
    };
    const comments = mockCreatedComments.get(input.marketId) ?? [];
    mockCreatedComments.set(input.marketId, [...comments, comment]);
    return comment;
  },
};

export function createMarketService(dataSource: MarketDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchDetail: (id: string) => dataSource.getDetail(id),
    createComment: (input: MarketCommentInput) => {
      const content = input.content.trim();
      if (!content) throw new Error("댓글 내용을 입력해주세요.");
      return dataSource.createComment({ ...input, content });
    },
  };
}

const marketService = createMarketService(mockMarketDataSource);

export const fetchMarketOverview = marketService.fetchOverview;
export const fetchMarketDetail = marketService.fetchDetail;
export const createMarketComment = marketService.createComment;
