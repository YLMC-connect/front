import { createHttpMarketDataSource } from "../marketHttpDataSource";

jest.mock("expo-file-system", () => ({
  // 실제 expo-file-system File 처럼 Blob 을 구현하는 파일 객체
  File: class MockFile extends Blob {
    uri: string;
    constructor(uri: string) {
      super(["x"], { type: "image/jpeg" });
      this.uri = uri;
    }
    get name() {
      return this.uri.split("/").pop() ?? "";
    }
  },
}));

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

  it("loads my shares from /api/share/my and marks them as mine", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({
      content: [
        {
          id: 8,
          title: "내 나눔",
          status: "COMPLETED",
          categoryCode: "BOOK_STATIONERY",
          authorId: "someone-else",
          createdAt: "2026-11-04T01:00:00",
        },
      ],
      hasNext: true,
      nextCursor: 8,
    });

    await expect(
      dataSource.getMyOverviewPage?.({
        category: "book",
        lastId: 12,
        size: 10,
      }),
    ).resolves.toMatchObject({
      items: [
        expect.objectContaining({
          id: "8",
          category: "book",
          status: "done",
          isMine: true,
        }),
      ],
      hasNext: true,
      nextCursor: 8,
    });
    expect(request).toHaveBeenCalledWith(
      "/api/share/my?size=10&lastId=12&categoryCode=BOOK_STATIONERY",
    );
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
        // expo/fetch 는 { uri } 파트를 못 보내므로 이미지는 Blob(파일) 이어야 한다
        const image = (options.body as FormData).get("images");
        expect(image).toBeInstanceOf(Blob);
        expect((image as Blob & { name: string }).name).toBe("probe.jpg");
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

  it("updates a share post and reloads detail", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/share/1" && options?.method === "PUT") {
        expect(JSON.parse(options.body)).toEqual({
          title: "수정된 나눔 제목",
          content: "수정된 나눔 설명글입니다.",
          categoryCode: "BABY_KIDS",
          itemStatus: "USED",
        });
        return null;
      }
      if (path === "/api/share/1") {
        return {
          id: 1,
          title: "수정된 나눔 제목",
          content: "수정된 나눔 설명글입니다.",
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
      dataSource.updatePost({
        marketId: "1",
        title: "수정된 나눔 제목",
        description: "수정된 나눔 설명글입니다.",
        category: "baby",
        condition: "사용감 있음",
      }),
    ).resolves.toMatchObject({
      id: "1",
      title: "수정된 나눔 제목",
      content: "수정된 나눔 설명글입니다.",
      isMine: true,
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
