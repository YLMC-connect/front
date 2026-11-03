import { createApiClient, type ApiRequestOptions } from "../../lib/apiClient";
import { createHttpAuthAdapter } from "../authAdapter";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown as Response;
}

describe("httpAuthAdapter", () => {
  function setup() {
    const request = jest.fn();
    const adapter = createHttpAuthAdapter({ request });
    return { request, adapter };
  }

  it("checks availability through the duplicate endpoint", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({ available: true });

    await expect(
      adapter.checkAvailability({
        searchType: "id",
        searchValue: "new-member",
      }),
    ).resolves.toEqual({ available: true });
    expect(request).toHaveBeenCalledWith(
      "/api/member/duplicate",
      expect.objectContaining({
        method: "POST",
        auth: false,
        body: JSON.stringify({
          searchType: "id",
          searchValue: "new-member",
        }),
      }),
    );
  });

  it("logs in with the observed token payload", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      userId: "ylmc",
      userName: "열린문",
      role: "USER",
    });

    await expect(
      adapter.login({ id: "ylmc", password: "secret" }),
    ).resolves.toMatchObject({
      accessToken: "access",
      member: { id: "ylmc", name: "열린문", role: "USER" },
    });
    expect(request).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        auth: false,
        method: "POST",
      }),
    );
    expect(request.mock.calls[0]?.[1]).not.toHaveProperty("format");
  });

  it("reads login tokens from the success envelope", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse({
        code: "SUCCESS",
        message: "정상 처리되었습니다.",
        data: {
          accessToken: "access",
          refreshToken: "refresh",
          userId: "ylmc",
          userName: "열린문",
          role: "USER",
        },
      }),
    );
    const adapter = createHttpAuthAdapter(
      createApiClient({
        baseUrl: "https://api.example.com",
        fetchImpl,
      }),
    );

    await expect(
      adapter.login({ id: "ylmc", password: "secret" }),
    ).resolves.toMatchObject({
      accessToken: "access",
      refreshToken: "refresh",
      member: { id: "ylmc", name: "열린문", role: "USER" },
    });
  });

  it("signs up then logs in because signup does not return tokens", async () => {
    const { request, adapter } = setup();
    request.mockImplementation(async (path: string) => {
      if (path === "/api/signup") return { userStatus: "0" };
      return {
        accessToken: "access",
        refreshToken: "refresh",
        userId: "ylmc",
        userName: "열린문",
        role: "USER",
      };
    });

    await expect(
      adapter.signup({
        id: "ylmc",
        password: "secret",
        userName: "열린문",
        phone: "010-1234-5678",
        email: "ylmc@example.com",
      }),
    ).resolves.toMatchObject({
      accessToken: "access",
      member: { id: "ylmc", name: "열린문" },
    });
    expect(request).toHaveBeenNthCalledWith(
      1,
      "/api/signup",
      expect.objectContaining({ auth: false }),
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/api/auth/login",
      expect.not.objectContaining({ format: "json" }),
    );
  });

  it("refreshes with the refreshToken field observed on the live API", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({
      accessToken: "next-access",
      refreshToken: "next-refresh",
      userId: "ylmc",
      userName: "열린문",
      role: "USER",
    });

    await expect(adapter.refresh("stored-refresh")).resolves.toMatchObject({
      accessToken: "next-access",
      refreshToken: "next-refresh",
    });
    expect(request).toHaveBeenCalledWith(
      "/api/auth/refresh",
      expect.objectContaining<ApiRequestOptions>({
        auth: false,
        method: "POST",
        body: JSON.stringify({ refreshToken: "stored-refresh" }),
      }),
    );
    expect(request.mock.calls[0]?.[1]).not.toHaveProperty("format");
  });

  it("reads refresh tokens from the success envelope", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      jsonResponse({
        code: "SUCCESS",
        message: "정상 처리되었습니다.",
        data: {
          accessToken: "next-access",
          refreshToken: "next-refresh",
          userId: "ylmc",
          userName: "열린문",
          role: "USER",
        },
      }),
    );
    const adapter = createHttpAuthAdapter(
      createApiClient({
        baseUrl: "https://api.example.com",
        fetchImpl,
      }),
    );

    await expect(adapter.refresh("stored-refresh")).resolves.toMatchObject({
      accessToken: "next-access",
      refreshToken: "next-refresh",
      member: { id: "ylmc", name: "열린문", role: "USER" },
    });
  });

  it("loads the current member from /api/member/me", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({
      id: "ylmc",
      userName: "열린문",
      role: "USER",
    });

    await expect(adapter.getCurrentMember()).resolves.toEqual({
      id: "ylmc",
      name: "열린문",
      role: "USER",
    });
    expect(request).toHaveBeenCalledWith("/api/member/me");
  });

  it("loads the current member from /api/member/me with phone, email, point, department", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({
      id: "ylmc",
      userName: "열린문",
      phone: "010-1234-5678",
      email: "ylmc@example.com",
      point: 100,
      mokjangName: "믿음목장",
      role: "USER",
    });

    await expect(adapter.getCurrentMember()).resolves.toEqual({
      id: "ylmc",
      name: "열린문",
      phone: "010-1234-5678",
      email: "ylmc@example.com",
      point: 100,
      department: "믿음목장",
      role: "USER",
    });
    expect(request).toHaveBeenCalledWith("/api/member/me");
  });

  it("updates the current member through PUT /api/member/me", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue({
      id: "ylmc",
      userName: "열린문",
      phone: "010-9999-8888",
      role: "USER",
    });

    await expect(
      adapter.updateCurrentMember({ phone: "010-9999-8888" }),
    ).resolves.toEqual({
      id: "ylmc",
      name: "열린문",
      phone: "010-9999-8888",
      role: "USER",
    });
    expect(request).toHaveBeenCalledWith("/api/member/me", {
      method: "PUT",
      body: JSON.stringify({ phone: "010-9999-8888" }),
    });
  });

  it("verifies password through POST /api/member/verify-password", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue(null);

    await expect(
      adapter.verifyPassword({ password: "secretPassword" }),
    ).resolves.toBe(true);
    expect(request).toHaveBeenCalledWith("/api/member/verify-password", {
      method: "POST",
      body: JSON.stringify({ password: "secretPassword" }),
    });
  });

  it("changes password through PUT /api/member/password", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue(null);

    await expect(
      adapter.changePassword({
        currentPassword: "oldPassword",
        newPassword: "newPassword123!",
      }),
    ).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith("/api/member/password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword: "oldPassword",
        newPassword: "newPassword123!",
      }),
    });
  });

  it("withdraws through DELETE /api/member/me", async () => {
    const { request, adapter } = setup();
    request.mockResolvedValue(null);

    await expect(adapter.withdraw()).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith("/api/member/me", {
      method: "DELETE",
    });
  });
});
