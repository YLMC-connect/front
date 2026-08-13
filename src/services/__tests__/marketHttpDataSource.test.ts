import { createHttpMarketDataSource } from "../marketHttpDataSource";

describe("httpMarketDataSource", () => {
  function setup() {
    const request = jest.fn();
    const dataSource = createHttpMarketDataSource({
      client: { request },
      getCurrentUser: () => ({ id: "frontprobe", name: "프론트점검" }),
    });
    return { request, dataSource };
  }

  it("maps an authenticated share list page", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({
      content: [
        {
          id: 1,
          title: "안쓰는 아기띠 나눔합니다",
          status: "AVAILABLE",
          categoryCode: "BABY_KIDS",
          authorId: "selah",
          createdAt: "2026-07-03T05:11:17",
        },
      ],
      hasNext: false,
      nextCursor: null,
    });

    await expect(dataSource.getOverview()).resolves.toMatchObject({
      items: [
        expect.objectContaining({
          id: "1",
          category: "baby",
          status: "sharing",
          authorName: "selah",
          isMine: false,
        }),
      ],
    });
    expect(request).toHaveBeenCalledWith("/api/share?size=50");
  });

  it("loads detail and comments together", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string) => {
      if (path === "/api/share/1") {
        return {
          id: 1,
          title: "안쓰는 아기띠 나눔합니다",
          content: "1년 정도 썼고 상태 좋아요.",
          status: "AVAILABLE",
          categoryCode: "BABY_KIDS",
          itemStatus: "USED",
          authorId: "selah",
          authorName: "찬양팀",
          createdAt: "2026-07-03T05:11:17",
        };
      }
      return [
        {
          id: 1,
          content: "저요! 제가 필요합니다!",
          authorId: "selah",
          authorName: "찬양팀",
          createdAt: "2026-07-03T05:12:30",
          updatedAt: "2026-07-03T05:12:30",
        },
      ];
    });

    await expect(dataSource.getDetail("1")).resolves.toMatchObject({
      id: "1",
      authorName: "찬양팀",
      conditionLabel: "사용감 있음",
      comments: [expect.objectContaining({ id: "1", isEdited: false })],
    });
  });

  it("creates a share as multipart and reloads the detail", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/share" && options?.method === "POST") {
        expect(options.body).toBeInstanceOf(FormData);
        return 3;
      }
      if (path === "/api/share/3") {
        return {
          id: 3,
          title: "프론트 점검 나눔",
          content: "라이브 계약 확인용 게시글입니다.",
          status: "AVAILABLE",
          categoryCode: "BABY_KIDS",
          itemStatus: "USED",
          authorId: "frontprobe",
          authorName: "프론트점검",
          createdAt: "2026-08-13T10:37:37",
        };
      }
      return [];
    });

    await expect(
      dataSource.createPost({
        title: "프론트 점검 나눔",
        description: "라이브 계약 확인용 게시글입니다.",
        category: "baby",
        condition: "사용감 있음",
        location: "교회 1층 로비",
        images: ["file:///tmp/probe.jpg"],
      }),
    ).resolves.toMatchObject({
      id: "3",
      isMine: true,
      title: "프론트 점검 나눔",
    });
  });

  it("creates a comment from the returned id", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(2);

    await expect(
      dataSource.createComment({
        marketId: "1",
        content: "프론트 계약 확인 댓글",
      }),
    ).resolves.toMatchObject({
      id: "2",
      content: "프론트 계약 확인 댓글",
      isMine: true,
    });
    expect(request).toHaveBeenCalledWith(
      "/api/share/1/comments",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("does not invent report reason codes", async () => {
    const { dataSource } = setup();
    await expect(
      dataSource.reportContent({
        targetType: "market",
        targetId: "1",
        reason: "abusive",
      }),
    ).rejects.toThrow("신고 사유 코드가 서버에 확정되지 않아");
  });
});
