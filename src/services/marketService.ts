import { mockMarketDetails, mockMarketOverview } from "../mocks/market";
import { MOCK_USER } from "../mocks/auth";
import type {
  MarketCommentInput,
  MarketCommentTarget,
  MarketCommentUpdateInput,
  MarketDetail,
  MarketDetailComment,
  MarketOverview,
} from "../types/market";

export interface MarketDataSource {
  getOverview(): Promise<MarketOverview>;
  getDetail(id: string): Promise<MarketDetail>;
  createComment(input: MarketCommentInput): Promise<MarketDetailComment>;
  updateComment(input: MarketCommentUpdateInput): Promise<MarketDetailComment>;
  deleteComment(input: MarketCommentTarget): Promise<void>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const mockComments = new Map<string, MarketDetailComment[]>();

function getMockComments(marketId: string) {
  const detail = mockMarketDetails[marketId];
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
    return mockMarketOverview;
  },
  async getDetail(id) {
    await delay();
    const detail = mockMarketDetails[id];
    if (!detail) throw new Error("존재하지 않는 나눔입니다.");
    return {
      ...detail,
      comments: getMockComments(id).map((comment) => ({ ...comment })),
    };
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
    updateComment: (input: MarketCommentUpdateInput) => {
      const content = input.content.trim();
      if (!content) throw new Error("댓글 내용을 입력해주세요.");
      return dataSource.updateComment({ ...input, content });
    },
    deleteComment: (input: MarketCommentTarget) =>
      dataSource.deleteComment(input),
  };
}

const marketService = createMarketService(mockMarketDataSource);

export const fetchMarketOverview = marketService.fetchOverview;
export const fetchMarketDetail = marketService.fetchDetail;
export const createMarketComment = marketService.createComment;
export const updateMarketComment = marketService.updateComment;
export const deleteMarketComment = marketService.deleteComment;
