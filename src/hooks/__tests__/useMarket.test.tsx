import { act, waitFor } from "@testing-library/react-native";
import { queryKeys } from "../../lib/queryKeys";
import * as marketService from "../../services/marketService";
import { renderHookWithClient } from "../../test/renderHookWithClient";
import type {
  MarketDetail,
  MarketDetailComment,
  MarketInput,
  MarketOverviewItem,
} from "../../types/market";
import {
  useCreateMarketComment,
  useCreateMarketPost,
  useDeleteMarketComment,
  useDeleteMarketPost,
  useReportMarketContent,
  useUpdateMarketComment,
  useUpdateMarketPost,
} from "../useMarket";

jest.mock("../../services/marketService", () => ({
  createMarketPost: jest.fn(),
  updateMarketPost: jest.fn(),
  deleteMarketPost: jest.fn(),
  createMarketComment: jest.fn(),
  updateMarketComment: jest.fn(),
  deleteMarketComment: jest.fn(),
  reportMarketContent: jest.fn(),
  fetchMarketDetail: jest.fn(),
  fetchMarketOverviewPage: jest.fn(),
  fetchMyMarketOverviewPage: jest.fn(),
}));

const service = jest.mocked(marketService);

function comment(
  id: string,
  overrides: Partial<MarketDetailComment> = {},
): MarketDetailComment {
  return {
    id,
    authorName: "작성자",
    createdLabel: "방금",
    content: `댓글 ${id}`,
    isMine: true,
    isEdited: false,
    isDeleted: false,
    ...overrides,
  };
}

function detail(overrides: Partial<MarketDetail> = {}): MarketDetail {
  return {
    id: "10",
    thumbSeed: 1,
    title: "책 나눔",
    content: "내용",
    categoryLabel: "도서",
    conditionLabel: "좋음",
    status: "sharing",
    authorName: "작성자",
    createdLabel: "방금",
    isMine: true,
    comments: [comment("c1"), comment("c2")],
    ...overrides,
  };
}

const input = {
  title: "책 나눔",
  content: "내용",
} as unknown as MarketInput;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCreateMarketPost", () => {
  it("성공하면 상세 캐시를 채우고 목록·내 글을 무효화한다", async () => {
    const created = detail({ id: "99" });
    service.createMarketPost.mockResolvedValue(created);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useCreateMarketPost(),
    );

    await act(() => result.current.mutateAsync(input));

    expect(service.createMarketPost).toHaveBeenCalledWith(input);
    expect(queryClient.getQueryData(queryKeys.market.detail("99"))).toEqual(
      created,
    );
    expect(invalidatedKeys()).toEqual([
      queryKeys.market.overview(),
      queryKeys.market.mine(),
    ]);
  });

  it("실패하면 에러를 전달하고 캐시를 건드리지 않는다", async () => {
    const error = new Error("network");
    service.createMarketPost.mockRejectedValue(error);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useCreateMarketPost(),
    );

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toBe(error);
    });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useUpdateMarketPost", () => {
  it("marketId 를 붙여 호출하고 상세 캐시를 응답으로 교체한다", async () => {
    const updated = detail({ title: "수정됨" });
    service.updateMarketPost.mockResolvedValue(updated);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useUpdateMarketPost("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() => result.current.mutateAsync(input));

    expect(service.updateMarketPost).toHaveBeenCalledWith({
      ...input,
      marketId: "10",
    });
    expect(queryClient.getQueryData(queryKeys.market.detail("10"))).toEqual(
      updated,
    );
    expect(invalidatedKeys()).toEqual([
      queryKeys.market.overview(),
      queryKeys.market.mine(),
    ]);
  });

  it("실패하면 기존 상세 캐시를 유지한다", async () => {
    service.updateMarketPost.mockRejectedValue(new Error("403"));
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useUpdateMarketPost("10"),
    );
    const original = detail();
    queryClient.setQueryData(queryKeys.market.detail("10"), original);

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toThrow("403");
    });

    expect(queryClient.getQueryData(queryKeys.market.detail("10"))).toEqual(
      original,
    );
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useDeleteMarketPost", () => {
  it("상세 캐시를 지우고 내 글을 무효화한다", async () => {
    service.deleteMarketPost.mockResolvedValue(undefined);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useDeleteMarketPost("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() => result.current.mutateAsync());

    expect(service.deleteMarketPost).toHaveBeenCalledWith({ marketId: "10" });
    expect(
      queryClient.getQueryState(queryKeys.market.detail("10")),
    ).toBeUndefined();
    expect(invalidatedKeys()).toEqual([queryKeys.market.mine()]);
  });

  it("무한 스크롤 목록 캐시의 모든 페이지에서 삭제한 글을 뺀다", async () => {
    service.deleteMarketPost.mockResolvedValue(undefined);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useDeleteMarketPost("10"),
    );
    const item = (id: string) => ({ id }) as MarketOverviewItem;
    queryClient.setQueryData(queryKeys.market.overview(), {
      pages: [
        { items: [item("9"), item("10")], hasNext: true, nextCursor: 10 },
        { items: [item("10"), item("11")], hasNext: false },
      ],
      pageParams: [undefined, 10],
    });
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() => result.current.mutateAsync());

    const overview = queryClient.getQueryData<{
      pages: { items: MarketOverviewItem[] }[];
    }>(queryKeys.market.overview());
    expect(
      overview?.pages.map((page) => page.items.map(({ id }) => id)),
    ).toEqual([["9"], ["11"]]);
    expect(
      queryClient.getQueryState(queryKeys.market.detail("10")),
    ).toBeUndefined();
    expect(invalidatedKeys()).toEqual([queryKeys.market.mine()]);
  });

  it("실패하면 상세 캐시를 남긴다", async () => {
    service.deleteMarketPost.mockRejectedValue(new Error("500"));
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useDeleteMarketPost("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow("500");
    });

    expect(queryClient.getQueryData(queryKeys.market.detail("10"))).toEqual(
      detail(),
    );
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useCreateMarketComment", () => {
  it("응답 댓글을 상세 캐시 끝에 붙인다", async () => {
    const created = comment("c3", { content: "새 댓글" });
    service.createMarketComment.mockResolvedValue(created);
    const { result, queryClient } = renderHookWithClient(() =>
      useCreateMarketComment("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() => result.current.mutateAsync("새 댓글"));

    expect(service.createMarketComment).toHaveBeenCalledWith({
      marketId: "10",
      content: "새 댓글",
    });
    expect(
      queryClient
        .getQueryData<MarketDetail>(queryKeys.market.detail("10"))
        ?.comments.map(({ id }) => id),
    ).toEqual(["c1", "c2", "c3"]);
  });

  it("상세 캐시가 없으면 새로 만들지 않는다", async () => {
    service.createMarketComment.mockResolvedValue(comment("c3"));
    const { result, queryClient } = renderHookWithClient(() =>
      useCreateMarketComment("10"),
    );

    await act(() => result.current.mutateAsync("새 댓글"));

    expect(
      queryClient.getQueryData(queryKeys.market.detail("10")),
    ).toBeUndefined();
  });

  it("실패하면 댓글 목록을 바꾸지 않는다", async () => {
    service.createMarketComment.mockRejectedValue(new Error("400"));
    const { result, queryClient } = renderHookWithClient(() =>
      useCreateMarketComment("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync("x")).rejects.toThrow("400");
    });

    expect(
      queryClient.getQueryData<MarketDetail>(queryKeys.market.detail("10"))
        ?.comments,
    ).toHaveLength(2);
  });
});

describe("useUpdateMarketComment", () => {
  it("같은 id 의 댓글만 응답으로 교체한다", async () => {
    const updated = comment("c2", { content: "수정", isEdited: true });
    service.updateMarketComment.mockResolvedValue(updated);
    const { result, queryClient } = renderHookWithClient(() =>
      useUpdateMarketComment("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() =>
      result.current.mutateAsync({ commentId: "c2", content: "수정" }),
    );

    expect(service.updateMarketComment).toHaveBeenCalledWith({
      marketId: "10",
      commentId: "c2",
      content: "수정",
    });
    const comments = queryClient.getQueryData<MarketDetail>(
      queryKeys.market.detail("10"),
    )?.comments;
    expect(comments?.[0]).toEqual(comment("c1"));
    expect(comments?.[1]).toEqual(updated);
  });
});

describe("useDeleteMarketComment", () => {
  it("삭제한 댓글을 내용 없는 삭제 상태로 바꾼다", async () => {
    service.deleteMarketComment.mockResolvedValue(undefined);
    const { result, queryClient } = renderHookWithClient(() =>
      useDeleteMarketComment("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(() => result.current.mutateAsync("c1"));

    expect(service.deleteMarketComment).toHaveBeenCalledWith({
      marketId: "10",
      commentId: "c1",
    });
    const comments = queryClient.getQueryData<MarketDetail>(
      queryKeys.market.detail("10"),
    )?.comments;
    expect(comments?.[0]).toMatchObject({
      id: "c1",
      content: undefined,
      isDeleted: true,
    });
    expect(comments?.[1]).toEqual(comment("c2"));
  });

  it("실패하면 댓글을 그대로 둔다", async () => {
    service.deleteMarketComment.mockRejectedValue(new Error("404"));
    const { result, queryClient } = renderHookWithClient(() =>
      useDeleteMarketComment("10"),
    );
    queryClient.setQueryData(queryKeys.market.detail("10"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync("c1")).rejects.toThrow("404");
    });

    expect(
      queryClient.getQueryData<MarketDetail>(queryKeys.market.detail("10"))
        ?.comments[0],
    ).toEqual(comment("c1"));
  });
});

describe("useReportMarketContent", () => {
  it("신고 입력을 그대로 넘기고 서비스 에러를 전달한다", async () => {
    const error = new Error("이미 신고한 게시글입니다.");
    service.reportMarketContent.mockRejectedValue(error);
    const { result } = renderHookWithClient(() => useReportMarketContent());
    const report = {
      targetType: "market",
      targetId: "10",
      reason: "SPAM",
    } as const;

    await act(async () => {
      await expect(result.current.mutateAsync(report as never)).rejects.toBe(
        error,
      );
    });

    expect(service.reportMarketContent).toHaveBeenCalledWith(report);
  });
});
