import {
  createGroupService,
  fetchGroupDetail,
  fetchGroupMembers,
  fetchGroupOverview,
  type GroupDataSource,
} from "../groupService";
import {
  createMarketComment,
  createMarketService,
  deleteMarketComment,
  fetchMarketDetail,
  fetchMarketOverview,
  updateMarketComment,
  type MarketDataSource,
} from "../marketService";

describe("market and group service boundaries", () => {
  it("returns market overview and detail through the default data source", async () => {
    const overview = await fetchMarketOverview();
    const detail = await fetchMarketDetail("1");

    expect(overview.items).toHaveLength(6);
    expect(overview.items.map((item) => item.status)).toEqual([
      "sharing",
      "reserved",
      "sharing",
      "sharing",
      "done",
      "sharing",
    ]);
    expect(detail).toMatchObject({
      id: "1",
      status: "sharing",
      authorName: "김은혜",
      isMine: true,
    });
    expect(detail.comments).toHaveLength(4);
  });

  it("switches the market data source without changing service consumers", async () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockResolvedValue({ items: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    await expect(service.fetchOverview()).resolves.toEqual({ items: [] });
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });

  it("trims and creates a market comment through the data source", async () => {
    const createdComment = {
      id: "comment-new",
      authorName: "김은혜",
      createdLabel: "방금 전",
      content: "새 댓글",
      isMine: true,
      isEdited: false,
      isDeleted: false,
    };
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockResolvedValue(createdComment),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    await expect(
      service.createComment({ marketId: "1", content: "  새 댓글  " }),
    ).resolves.toEqual(createdComment);
    expect(dataSource.createComment).toHaveBeenCalledWith({
      marketId: "1",
      content: "새 댓글",
    });
  });

  it("rejects an empty market comment before calling the data source", () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    expect(() =>
      service.createComment({ marketId: "1", content: "   " }),
    ).toThrow("댓글 내용을 입력해주세요.");
    expect(dataSource.createComment).not.toHaveBeenCalled();
  });

  it("keeps a created comment in the default mock data source", async () => {
    const before = await fetchMarketDetail("1");
    const created = await createMarketComment({
      marketId: "1",
      content: "다시 불러와도 남는 댓글",
    });
    const after = await fetchMarketDetail("1");

    expect(after.comments).toHaveLength(before.comments.length + 1);
    expect(after.comments.at(-1)).toEqual(created);
  });

  it("updates and persists an owned comment in the default mock data source", async () => {
    const updated = await updateMarketComment({
      marketId: "1",
      commentId: "comment-4",
      content: "  수정한 댓글입니다.  ",
    });
    const detail = await fetchMarketDetail("1");

    expect(updated).toMatchObject({
      id: "comment-4",
      content: "수정한 댓글입니다.",
      isEdited: true,
    });
    expect(detail.comments.find(({ id }) => id === "comment-4")).toEqual(
      updated,
    );
  });

  it("deletes an owned comment as a persistent tombstone", async () => {
    await deleteMarketComment({ marketId: "1", commentId: "comment-4" });
    const detail = await fetchMarketDetail("1");

    expect(detail.comments.find(({ id }) => id === "comment-4")).toMatchObject({
      id: "comment-4",
      content: undefined,
      isDeleted: true,
    });
  });

  it("rejects changing another member's comment", async () => {
    await expect(
      updateMarketComment({
        marketId: "1",
        commentId: "comment-1",
        content: "바꾸면 안 되는 댓글",
      }),
    ).rejects.toThrow("내 댓글만 변경할 수 있습니다.");
  });

  it("returns group overview and detail through the default data source", async () => {
    const overview = await fetchGroupOverview();
    const detail = await fetchGroupDetail("1");
    const members = await fetchGroupMembers("1");

    expect(overview.groups).toHaveLength(6);
    expect(overview.groups.filter((group) => group.isJoined)).toHaveLength(3);
    expect(overview.services).toHaveLength(3);
    expect(detail).toMatchObject({
      id: "1",
      status: "open",
      leaderName: "김은혜",
      isLeader: true,
    });
    expect(detail.notices).toHaveLength(2);
    expect(members).toHaveLength(8);
    expect(members[0]).toMatchObject({
      userName: "김은혜",
      isLeader: true,
      isMine: true,
    });
  });

  it("switches the group data source without changing service consumers", async () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockResolvedValue({ groups: [], services: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    await expect(service.fetchOverview()).resolves.toEqual({
      groups: [],
      services: [],
    });
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });
});
