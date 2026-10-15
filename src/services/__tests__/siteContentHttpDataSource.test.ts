import { ApiError } from "../../lib/apiClient";
import { createSiteContentHttpDataSource } from "../siteContentHttpDataSource";

describe("siteContentHttpDataSource", () => {
  function setup() {
    const request = jest.fn();
    const dataSource = createSiteContentHttpDataSource({ request });
    return { request, dataSource };
  }

  it("fetches active policy for policyType 1", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({
      id: 1,
      policyType: 1,
      title: "서비스 이용약관",
      content: "제1조...",
      enforcedAt: "2026-10-01T00:00:00",
    });

    const result = await dataSource.fetchActivePolicy(1);
    expect(result).toEqual({
      id: 1,
      policyType: 1,
      title: "서비스 이용약관",
      content: "제1조...",
      enforcedAt: "2026-10-01T00:00:00",
    });
    expect(request).toHaveBeenCalledWith("/api/site-policies/1", {
      auth: false,
      method: "GET",
    });
  });

  it("returns null when active policy is not found (404 / POLICY001)", async () => {
    const { request, dataSource } = setup();
    request.mockRejectedValue(
      new ApiError({
        code: "POLICY001",
        message: "게시 중인 약관이 없습니다.",
        status: 404,
      }),
    );

    const result = await dataSource.fetchActivePolicy(1);
    expect(result).toBeNull();
  });

  it("fetches FAQs without categoryId", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([
      {
        id: 1,
        name: "계정",
        faqs: [
          { id: 10, question: "비밀번호 변경", answer: "마이페이지에서..." },
        ],
      },
    ]);

    const result = await dataSource.fetchFaqs();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("계정");
    expect(request).toHaveBeenCalledWith("/api/faqs", {
      auth: false,
      method: "GET",
    });
  });

  it("fetches FAQs with specific categoryId", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([
      {
        id: 2,
        name: "소모임",
        faqs: [{ id: 20, question: "모임 개설", answer: "소모임 탭에서..." }],
      },
    ]);

    const result = await dataSource.fetchFaqs(2);
    expect(result).toHaveLength(1);
    expect(request).toHaveBeenCalledWith("/api/faqs?categoryId=2", {
      auth: false,
      method: "GET",
    });
  });
});
