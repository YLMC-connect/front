import { createApiClient } from "../apiClient";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

describe("apiClient", () => {
  it("unwraps successful API response data", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse({
        code: "SUCCESS",
        message: "정상 처리되었습니다.",
        data: { id: 1 },
      }),
    );
    const client = createApiClient({
      baseUrl: "https://api.example.com/",
      fetchImpl,
    });

    await expect(
      client.request<{ id: number }>("/api/items/1"),
    ).resolves.toEqual({ id: 1 });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.com/api/items/1",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/json" }),
      }),
    );
  });

  it("adds the stored access token to authenticated requests", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        jsonResponse({ code: "SUCCESS", message: "성공", data: null }),
      );
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
      getAccessToken: jest.fn().mockResolvedValue("access-token"),
    });

    await client.request("/api/member/me");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.com/api/member/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  it("does not read or send a token for public requests", async () => {
    const getAccessToken = jest.fn().mockResolvedValue("access-token");
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        jsonResponse({ code: "SUCCESS", message: "성공", data: null }),
      );
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
      getAccessToken,
    });

    await client.request("/api/auth/login", { auth: false });

    expect(getAccessToken).not.toHaveBeenCalled();
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example.com/api/auth/login",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      }),
    );
  });

  it("throws an ApiError for a documented API error response", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "MEM006",
          message: "비밀번호가 일치하지 않습니다.",
          data: null,
        },
        401,
      ),
    );
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
    });

    await expect(
      client.request("/api/auth/login", { auth: false }),
    ).rejects.toMatchObject({
      name: "ApiError",
      code: "MEM006",
      status: 401,
      message: "비밀번호가 일치하지 않습니다.",
    });
  });

  it("rejects a response that does not follow the common envelope", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse({ accessToken: "guess" }));
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
    });

    await expect(
      client.request("/api/auth/login", { auth: false }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "INVALID_RESPONSE",
        status: 200,
      }),
    );
  });

  it("rejects a common response without the data field", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse({ code: "SUCCESS", message: "성공" }));
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
    });

    await expect(client.request("/api/member/me")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: 200,
    });
  });

  it("normalizes transport failures as a network ApiError", async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error("offline"));
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetchImpl,
    });

    await expect(client.request("/api/member/me")).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK_ERROR",
      status: 0,
    });
  });
});
