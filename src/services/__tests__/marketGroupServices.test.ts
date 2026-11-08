import { createGroupService, type GroupDataSource } from "../groupService";
import { createMarketService, type MarketDataSource } from "../marketService";

describe("market and group service boundaries", () => {
  it("switches the market data source without changing service consumers", async () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockResolvedValue({ items: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      updatePost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      updateStatus: jest.fn().mockRejectedValue(new Error("not used")),
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
      updatePost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      updateStatus: jest.fn().mockRejectedValue(new Error("not used")),
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
      updatePost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      updateStatus: jest.fn().mockRejectedValue(new Error("not used")),
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

  it("requires details for the other report reason", () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createPost: jest.fn().mockRejectedValue(new Error("not used")),
      updatePost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      updateStatus: jest.fn().mockRejectedValue(new Error("not used")),
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

  it("validates market post fields and delegates to the data source", async () => {
    const createdDetail = {
      id: "10",
      thumbSeed: 1,
      images: ["file://market.jpg"],
      title: "새 나눔 물품",
      content: "필요한 분께 나누고 싶습니다.",
      categoryLabel: "생활·주방",
      conditionLabel: "사용감 있음" as const,
      status: "sharing" as const,
      authorName: "김은혜",
      createdLabel: "방금 전",
      isMine: true,
      comments: [],
    };
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      createPost: jest.fn().mockResolvedValue(createdDetail),
      updatePost: jest.fn().mockRejectedValue(new Error("not used")),
      deletePost: jest.fn().mockRejectedValue(new Error("not used")),
      updateStatus: jest.fn().mockRejectedValue(new Error("not used")),
      createComment: jest.fn().mockRejectedValue(new Error("not used")),
      updateComment: jest.fn().mockRejectedValue(new Error("not used")),
      deleteComment: jest.fn().mockRejectedValue(new Error("not used")),
      reportContent: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    await expect(
      service.createPost({
        images: ["file://market.jpg"],
        category: "home",
        title: "  새 나눔 물품  ",
        condition: "사용감 있음",
        description: "  필요한 분께 나누고 싶습니다.  ",
        location: "  교회 로비  ",
      }),
    ).resolves.toEqual(createdDetail);
    expect(dataSource.createPost).toHaveBeenCalledWith({
      images: ["file://market.jpg"],
      category: "home",
      title: "새 나눔 물품",
      condition: "사용감 있음",
      description: "필요한 분께 나누고 싶습니다.",
      location: "교회 로비",
    });
  });

  it("rejects an empty group notice before calling the data source", () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
      createGroup: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroup: jest.fn().mockRejectedValue(new Error("not used")),
      deleteGroup: jest.fn().mockRejectedValue(new Error("not used")),
      kickMember: jest.fn().mockRejectedValue(new Error("not used")),
      transferLeader: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroupStatus: jest.fn().mockRejectedValue(new Error("not used")),
      joinGroup: jest.fn().mockRejectedValue(new Error("not used")),
      leaveGroup: jest.fn().mockRejectedValue(new Error("not used")),
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
      updateGroup: jest.fn().mockRejectedValue(new Error("not used")),
      deleteGroup: jest.fn().mockRejectedValue(new Error("not used")),
      kickMember: jest.fn().mockRejectedValue(new Error("not used")),
      transferLeader: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroupStatus: jest.fn().mockRejectedValue(new Error("not used")),
      joinGroup: jest.fn().mockRejectedValue(new Error("not used")),
      leaveGroup: jest.fn().mockRejectedValue(new Error("not used")),
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

  it("rejects leaving as the group leader before calling the data source", async () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockResolvedValue({
        id: "1",
        name: "리더 모임",
        description: "설명",
        categoryLabel: "취미·문화",
        currentMembers: 2,
        maxMembers: 10,
        status: "open",
        leaderName: "이민구",
        isLeader: true,
        isJoined: true,
        members: ["이민구"],
        notices: [],
      }),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
      createGroup: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroup: jest.fn().mockRejectedValue(new Error("not used")),
      deleteGroup: jest.fn().mockRejectedValue(new Error("not used")),
      kickMember: jest.fn().mockRejectedValue(new Error("not used")),
      transferLeader: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroupStatus: jest.fn().mockRejectedValue(new Error("not used")),
      joinGroup: jest.fn().mockRejectedValue(new Error("not used")),
      leaveGroup: jest.fn().mockRejectedValue(new Error("not used")),
      createNotice: jest.fn().mockRejectedValue(new Error("not used")),
      updateNotice: jest.fn().mockRejectedValue(new Error("not used")),
      deleteNotice: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    await expect(service.leaveGroup("1")).rejects.toThrow(
      "소모임장은 탈퇴할 수 없어요. 먼저 이관해주세요",
    );
    expect(dataSource.leaveGroup).not.toHaveBeenCalled();
  });

  it("rejects joining a closed group before calling the data source", async () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockRejectedValue(new Error("not used")),
      getDetail: jest.fn().mockResolvedValue({
        id: "6",
        name: "마감 모임",
        description: "설명",
        categoryLabel: "취미·문화",
        currentMembers: 10,
        maxMembers: 10,
        status: "closed",
        leaderName: "이민구",
        isLeader: false,
        isJoined: false,
        members: ["이민구"],
        notices: [],
      }),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
      createGroup: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroup: jest.fn().mockRejectedValue(new Error("not used")),
      deleteGroup: jest.fn().mockRejectedValue(new Error("not used")),
      kickMember: jest.fn().mockRejectedValue(new Error("not used")),
      transferLeader: jest.fn().mockRejectedValue(new Error("not used")),
      updateGroupStatus: jest.fn().mockRejectedValue(new Error("not used")),
      joinGroup: jest.fn().mockRejectedValue(new Error("not used")),
      leaveGroup: jest.fn().mockRejectedValue(new Error("not used")),
      createNotice: jest.fn().mockRejectedValue(new Error("not used")),
      updateNotice: jest.fn().mockRejectedValue(new Error("not used")),
      deleteNotice: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    await expect(service.joinGroup("6")).rejects.toThrow("모집이 마감됐어요");
    expect(dataSource.joinGroup).not.toHaveBeenCalled();
  });
});
