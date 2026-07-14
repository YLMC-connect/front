import {
  createGroup,
  createGroupNotice,
  createGroupService,
  deleteGroupNotice,
  fetchGroupDetail,
  fetchGroupMembers,
  fetchGroupOverview,
  updateGroupNotice,
  type GroupDataSource,
} from "../groupService";
import {
  createMarketPost,
  createMarketComment,
  createMarketService,
  deleteMarketComment,
  deleteMarketPost,
  DuplicateMarketReportError,
  fetchMarketDetail,
  fetchMarketOverview,
  reportMarketContent,
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
    expect(overview.items.map((item) => item.isMine)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
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
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
      reportContent: jest.fn().mockRejectedValue(new Error("not used")),
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
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockResolvedValue(createdComment),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
      reportContent: jest.fn().mockRejectedValue(new Error("not used")),
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
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
      reportContent: jest.fn().mockRejectedValue(new Error("not used")),
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

  it("records a report once and rejects a duplicate target", async () => {
    const input = {
      targetType: "comment" as const,
      targetId: "comment-2",
      reason: "advertising" as const,
    };

    await expect(reportMarketContent(input)).resolves.toBeUndefined();
    await expect(reportMarketContent(input)).rejects.toBeInstanceOf(
      DuplicateMarketReportError,
    );
  });

  it("requires details for the other report reason", () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
      reportContent: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    expect(() =>
      service.reportContent({
        targetType: "market",
        targetId: "1",
        reason: "other",
        content: "   ",
      }),
    ).toThrow("기타 신고 사유를 입력해주세요.");
    expect(dataSource.reportContent).not.toHaveBeenCalled();
  });

  it("deletes an owned market post from detail and overview persistence", async () => {
    await deleteMarketPost({ marketId: "1" });

    await expect(fetchMarketDetail("1")).rejects.toThrow(
      "존재하지 않는 나눔입니다.",
    );
    await expect(fetchMarketOverview()).resolves.toMatchObject({
      items: expect.not.arrayContaining([expect.objectContaining({ id: "1" })]),
    });
  });

  it("creates a market post and keeps it in mock overview", async () => {
    const created = await createMarketPost({
      images: ["file://market.jpg"],
      category: "home",
      title: "  새 나눔 물품  ",
      condition: "사용감 있음",
      description: "  필요한 분께 나누고 싶습니다.  ",
      location: "  교회 로비  ",
    });
    const overview = await fetchMarketOverview();

    expect(created).toMatchObject({
      title: "새 나눔 물품",
      content: "필요한 분께 나누고 싶습니다.",
      isMine: true,
    });
    expect(overview.items[0]).toMatchObject({
      id: created.id,
      isMine: true,
    });
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

  it("creates, updates, and deletes a persisted group notice", async () => {
    const created = await createGroupNotice({
      groupId: "1",
      title: "  새 공지  ",
      content: "  새 공지 내용입니다.  ",
    });
    expect(created).toMatchObject({
      title: "새 공지",
      content: "새 공지 내용입니다.",
      isEdited: false,
    });

    const updated = await updateGroupNotice({
      groupId: "1",
      noticeId: created.id,
      title: "수정 공지",
      content: "수정된 공지 내용입니다.",
    });
    expect(updated).toMatchObject({
      id: created.id,
      title: "수정 공지",
      isEdited: true,
    });

    await deleteGroupNotice({ groupId: "1", noticeId: created.id });
    const detail = await fetchGroupDetail("1");
    expect(detail.notices.some(({ id }) => id === created.id)).toBe(false);
  });

  it("rejects an empty group notice before calling the data source", () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
      createGroup: jest.fn().mockRejectedValue(new Error("not used")),
      createNotice: jest.fn().mockRejectedValue(new Error("not used")),
      updateNotice: jest.fn().mockRejectedValue(new Error("not used")),
      deleteNotice: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    expect(() =>
      service.createNotice({ groupId: "1", title: " ", content: "내용" }),
    ).toThrow("공지 제목을 입력해주세요.");
    expect(dataSource.createNotice).not.toHaveBeenCalled();
  });

  it("switches the group data source without changing service consumers", async () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockResolvedValue({ groups: [], services: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
      createGroup: jest.fn().mockRejectedValue(new Error("not used")),
      createNotice: jest.fn().mockRejectedValue(new Error("not used")),
      updateNotice: jest.fn().mockRejectedValue(new Error("not used")),
      deleteNotice: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    await expect(service.fetchOverview()).resolves.toEqual({
      groups: [],
      services: [],
    });
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });

  it("creates a group and keeps it in mock overview", async () => {
    const created = await createGroup({
      category: "cell",
      name: "  새 소모임  ",
      description: "  함께 말씀을 나누는 모임입니다.  ",
      maxMembers: 8,
      schedule: "  매주 토요일 오후 2시  ",
      location: "  교육관 2층  ",
    });
    const overview = await fetchGroupOverview();

    expect(created).toMatchObject({
      name: "새 소모임",
      description: "함께 말씀을 나누는 모임입니다.",
      isLeader: true,
    });
    expect(overview.groups[0]).toMatchObject({ id: created.id });
  });
});
