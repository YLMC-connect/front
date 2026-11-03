import {
  createMyPageService,
  type MyPageActivityDataSource,
} from "../mypageService";

describe("mypageService", () => {
  it("delegates activity queries through the data source", async () => {
    const dataSource: MyPageActivityDataSource = {
      getPosts: jest.fn().mockResolvedValue({
        items: [
          {
            id: "1",
            title: "유아용 카시트 나눔해요",
            date: "2026.10.15",
            statusLabel: "나눔 가능",
            statusTone: "primary",
          },
        ],
        currentPage: 1,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        nextPage: null,
      }),
      getComments: jest.fn().mockResolvedValue({
        items: [],
        currentPage: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        nextPage: null,
      }),
      getGroups: jest.fn().mockResolvedValue({
        items: [],
        currentPage: 1,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        nextPage: null,
      }),
      getLifeStudies: jest.fn().mockResolvedValue({
        completionCount: 0,
        applications: [],
        ongoing: [],
        completed: [],
      }),
      getPrayers: jest.fn().mockResolvedValue({
        activeCount: 0,
        totalPeriod: "",
        totalPeriodDays: 0,
        totalRoomCount: 0,
        currentActivities: [],
        pastActivities: [],
      }),
    };

    const service = createMyPageService(dataSource);
    const posts = await service.fetchPosts({ page: 0, size: 10 });

    expect(dataSource.getPosts).toHaveBeenCalledWith({ page: 0, size: 10 });
    expect(posts.items[0]?.title).toBe("유아용 카시트 나눔해요");
    await expect(service.fetchLifeStudies()).resolves.toMatchObject({
      completionCount: 0,
    });
    await expect(service.fetchPrayers()).resolves.toMatchObject({
      activeCount: 0,
    });
  });
});
