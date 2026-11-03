import {
  createHttpHomeDataSource,
  type HomeApiClient,
} from "../homeHttpDataSource";

describe("homeHttpDataSource", () => {
  it("calls /api/sermons with pagination parameters", async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      content: [{ id: 1, title: "주일 설교" }],
      totalElements: 1,
      totalPages: 1,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });
    const client: HomeApiClient = { request: mockRequest };
    const dataSource = createHttpHomeDataSource(client);

    const result = await dataSource.fetchSermons({ page: 2, size: 5 });

    expect(mockRequest).toHaveBeenCalledWith("/api/sermons?page=2&size=5", {
      auth: false,
      method: "GET",
    });
    expect(result.content[0].title).toBe("주일 설교");
  });

  it("calls /api/daily-qt with pagination parameters", async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      content: [{ id: 1, title: "매일 큐티" }],
      totalElements: 1,
      totalPages: 1,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });
    const client: HomeApiClient = { request: mockRequest };
    const dataSource = createHttpHomeDataSource(client);

    const result = await dataSource.fetchDailyQts();

    expect(mockRequest).toHaveBeenCalledWith("/api/daily-qt?page=1&size=10", {
      auth: false,
      method: "GET",
    });
    expect(result.content[0].title).toBe("매일 큐티");
  });

  it("calls /api/daily-qt/{id} for detail", async () => {
    const mockRequest = jest.fn().mockResolvedValue({
      id: 3,
      title: "매일 큐티 상세",
      content: "<p>HTML</p>",
    });
    const client: HomeApiClient = { request: mockRequest };
    const dataSource = createHttpHomeDataSource(client);

    const result = await dataSource.fetchDailyQtDetail(3);

    expect(mockRequest).toHaveBeenCalledWith("/api/daily-qt/3", {
      auth: false,
      method: "GET",
    });
    expect(result.id).toBe(3);
    expect(result.content).toBe("<p>HTML</p>");
  });
});
