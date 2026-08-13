import { createHttpAuthAdapter, mockAuthAdapter } from "../authAdapter";
import { MOCK_USER } from "../../mocks/auth";
import type { ApiRequestOptions } from "../../lib/apiClient";

describe("mockAuthAdapter", () => {
  it.each([
    ["id", "admin"],
    ["phone", "010-2345-6789"],
  ] as const)(
    "reports a known %s as unavailable",
    async (searchType, searchValue) => {
      await expect(
        mockAuthAdapter.checkAvailability({ searchType, searchValue }),
      ).resolves.toEqual({ available: false });
    },
  );

  it("reports an unknown id as available", async () => {
    await expect(
      mockAuthAdapter.checkAvailability({
        searchType: "id",
        searchValue: "new-member",
      }),
    ).resolves.toEqual({ available: true });
  });

  it("checks duplicate values within the requested member field", async () => {
    await expect(
      mockAuthAdapter.checkAvailability({
        searchType: "id",
        searchValue: "010-2345-6789",
      }),
    ).resolves.toEqual({ available: true });
  });

  it("logs in with the configured mock credentials", async () => {
    await expect(
      mockAuthAdapter.login({ id: "admin", password: "admin" }),
    ).resolves.toMatchObject({ member: MOCK_USER });
  });

  it("rejects the previous mock credentials", async () => {
    await expect(
      mockAuthAdapter.login({ id: "gracekim", password: "password" }),
    ).rejects.toThrow("아이디 또는 비밀번호가 올바르지 않습니다");
  });
});

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
      member: { id: "ylmc", name: "열린문", role: "member" },
    });
    expect(request).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        auth: false,
        format: "json",
      }),
    );
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
      expect.objectContaining({ format: "json" }),
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
        format: "json",
        body: JSON.stringify({ refreshToken: "stored-refresh" }),
      }),
    );
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
      role: "member",
    });
    expect(request).toHaveBeenCalledWith("/api/member/me");
  });
});
