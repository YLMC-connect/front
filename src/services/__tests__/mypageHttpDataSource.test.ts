import { ApiError } from "../../lib/apiClient";
import { createHttpMyPageDataSource } from "../mypageHttpDataSource";

const postPage = {
  content: [
    {
      id: 4,
      title: "유아용 카시트",
      content: "본문",
      status: "AVAILABLE",
      statusName: "나눔중",
      categoryCode: "BABY",
      itemStatus: "GOOD",
      viewCount: 1,
      thumbnailUrl: "https://example.test/a.jpg",
      createdAt: "2026-05-08T00:00:00",
    },
  ],
  totalElements: 1,
  totalPages: 1,
  currentPage: 1,
  size: 10,
  hasNext: false,
};

function setup() {
  const request = jest.fn();
  const dataSource = createHttpMyPageDataSource({ client: { request } });
  return { request, dataSource };
}

function pathsOf(request: jest.Mock) {
  return request.mock.calls.map((call) => String(call[0]));
}

describe("httpMyPageDataSource", () => {
  it("requests posts with a 0-based page and reads 1-based currentPage", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(postPage);

    await expect(dataSource.getPosts()).resolves.toMatchObject({
      items: [{ title: "유아용 카시트", status: "나눔중", tone: "primary" }],
      currentPage: 1,
      nextPage: null,
    });
    expect(decodeURIComponent(pathsOf(request)[0])).toBe(
      "/api/mypage/activities/posts?page=0&size=10&sort=id,desc",
    );

    await dataSource.getPosts({ page: 2, size: 5, sort: "id,asc" });
    expect(decodeURIComponent(pathsOf(request)[1])).toBe(
      "/api/mypage/activities/posts?page=2&size=5&sort=id,asc",
    );
  });

  it("requests comments with the post sort default", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...postPage, content: [] });

    await dataSource.getComments();
    expect(decodeURIComponent(pathsOf(request)[0])).toBe(
      "/api/mypage/activities/comments?page=0&size=10&sort=id,desc",
    );
  });

  it("requests groups without a type unless one is given", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...postPage, content: [] });

    await dataSource.getGroups();
    await dataSource.getGroups({ type: "VOLUNTEER", page: 1 });

    expect(decodeURIComponent(pathsOf(request)[0])).toBe(
      "/api/mypage/activities/groups?page=0&size=10&sort=joinedAt,desc",
    );
    expect(decodeURIComponent(pathsOf(request)[1])).toBe(
      "/api/mypage/activities/groups?page=1&size=10&sort=joinedAt,desc&type=VOLUNTEER",
    );
  });

  it("loads life studies and prayers as one object without a page query", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation((path: string) => {
      if (path.endsWith("/life-studies")) {
        return Promise.resolve({
          completionCount: 0,
          applications: [],
          ongoing: [],
          completed: [],
        });
      }
      return Promise.resolve({
        activeCount: 0,
        totalPeriod: "15일",
        totalPeriodDays: 15,
        totalRoomCount: 0,
        currentActivities: [],
        pastActivities: [],
      });
    });

    await expect(dataSource.getLifeStudies()).resolves.toMatchObject({
      completionCount: 0,
    });
    await expect(dataSource.getPrayers()).resolves.toMatchObject({
      totalPeriod: "15일",
      totalPeriodDays: 15,
    });
    expect(pathsOf(request)).toEqual([
      "/api/mypage/activities/life-studies",
      "/api/mypage/activities/prayers",
    ]);
  });

  it("does not call admin, life-study, or prayer paths", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...postPage, content: [] });

    await dataSource.getPosts();
    await dataSource.getComments();
    await dataSource.getGroups();
    const paths = pathsOf(request);
    expect(paths.some((path) => path.includes("/api/admin"))).toBe(false);
    expect(paths.some((path) => path.startsWith("/api/life-study"))).toBe(
      false,
    );
    expect(paths.some((path) => path.startsWith("/api/prayer"))).toBe(false);
  });

  it("rejects a page whose currentPage is 0", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...postPage, currentPage: 0 });

    await expect(dataSource.getPosts()).rejects.toBeInstanceOf(ApiError);
  });
});
