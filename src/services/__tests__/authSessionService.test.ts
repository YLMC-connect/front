import { MOCK_USER } from "../../mocks/auth";
import type { AuthAdapter } from "../authAdapter";
import {
  createAuthSessionManager,
  type AuthStateWriter,
  type AuthTokenStore,
} from "../authSessionService";
import type { AuthSession } from "../../types/auth";

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  member: MOCK_USER,
};

function setup() {
  const adapter: jest.Mocked<AuthAdapter> = {
    login: jest.fn().mockResolvedValue(session),
    signup: jest.fn().mockResolvedValue(session),
    refresh: jest.fn().mockResolvedValue({
      ...session,
      accessToken: "refreshed-access-token",
      refreshToken: "rotated-refresh-token",
    }),
    getCurrentMember: jest.fn().mockResolvedValue(MOCK_USER),
  };
  const tokenStore: jest.Mocked<AuthTokenStore> = {
    getTokens: jest.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    }),
    getRefreshToken: jest.fn().mockResolvedValue("refresh-token"),
    setTokens: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
  const state: jest.Mocked<AuthStateWriter> = {
    setRestoring: jest.fn(),
    setAuthenticated: jest.fn(),
    setAnonymous: jest.fn(),
    setUnavailable: jest.fn(),
  };
  const manager = createAuthSessionManager({ adapter, tokenStore, state });

  return { adapter, tokenStore, state, manager };
}

describe("authSessionService", () => {
  it("stores tokens before marking a login as authenticated", async () => {
    const { adapter, tokenStore, state, manager } = setup();

    await manager.login({ id: "gracekim", password: "password" });

    expect(adapter.login).toHaveBeenCalledWith({
      id: "gracekim",
      password: "password",
    });
    expect(tokenStore.setTokens).toHaveBeenCalledWith(
      "access-token",
      "refresh-token",
    );
    expect(tokenStore.setTokens.mock.invocationCallOrder[0]).toBeLessThan(
      state.setAuthenticated.mock.invocationCallOrder[0],
    );
    expect(state.setAuthenticated).toHaveBeenCalledWith(MOCK_USER);
  });

  it("cleans a partial session when token persistence fails", async () => {
    const { tokenStore, state, manager } = setup();
    tokenStore.setTokens.mockRejectedValue(new Error("keystore write failed"));

    await expect(
      manager.login({ id: "gracekim", password: "password" }),
    ).rejects.toThrow("keystore write failed");

    expect(tokenStore.clear).toHaveBeenCalledTimes(1);
    expect(state.setAnonymous).toHaveBeenCalledTimes(1);
    expect(state.setAuthenticated).not.toHaveBeenCalled();
  });

  it("restores a stored session through the current-member adapter", async () => {
    const { adapter, state, manager } = setup();

    await expect(manager.restore()).resolves.toEqual(MOCK_USER);

    expect(state.setRestoring).toHaveBeenCalledTimes(1);
    expect(adapter.getCurrentMember).toHaveBeenCalledTimes(1);
    expect(state.setAuthenticated).toHaveBeenCalledWith(MOCK_USER);
  });

  it("refreshes and rotates tokens when restore receives 401", async () => {
    const { adapter, tokenStore, state, manager } = setup();
    adapter.getCurrentMember.mockRejectedValue({ status: 401 });

    await manager.restore();

    expect(adapter.refresh).toHaveBeenCalledWith("refresh-token");
    expect(tokenStore.setTokens).toHaveBeenCalledWith(
      "refreshed-access-token",
      "rotated-refresh-token",
    );
    expect(state.setAuthenticated).toHaveBeenCalledWith(MOCK_USER);
  });

  it("shares one refresh request between concurrent callers", async () => {
    const { adapter, manager } = setup();

    await Promise.all([manager.refresh(), manager.refresh()]);

    expect(adapter.refresh).toHaveBeenCalledTimes(1);
  });

  it("clears tokens and authentication when refresh fails", async () => {
    const { adapter, tokenStore, state, manager } = setup();
    adapter.refresh.mockRejectedValue(new Error("expired refresh token"));

    await expect(manager.refresh()).rejects.toThrow("expired refresh token");

    expect(tokenStore.clear).toHaveBeenCalledTimes(1);
    expect(state.setAnonymous).toHaveBeenCalledTimes(1);
  });

  it("keeps stored tokens when session restore fails for a non-auth reason", async () => {
    const { adapter, tokenStore, state, manager } = setup();
    adapter.getCurrentMember.mockRejectedValue(new Error("offline"));

    await expect(manager.restore()).rejects.toThrow("offline");

    expect(tokenStore.clear).not.toHaveBeenCalled();
    expect(state.setUnavailable).toHaveBeenCalledTimes(1);
  });

  it("leaves tokens untouched and marks restore unavailable when storage read fails", async () => {
    const { tokenStore, state, manager } = setup();
    tokenStore.getTokens.mockRejectedValue(new Error("keystore unavailable"));

    await expect(manager.restore()).rejects.toThrow("keystore unavailable");

    expect(tokenStore.clear).not.toHaveBeenCalled();
    expect(state.setUnavailable).toHaveBeenCalledTimes(1);
  });

  it("cleans a partial token pair and becomes anonymous", async () => {
    const { tokenStore, state, manager } = setup();
    tokenStore.getTokens.mockResolvedValue({
      accessToken: "orphan-access-token",
      refreshToken: null,
    });

    await expect(manager.restore()).resolves.toBeNull();

    expect(tokenStore.clear).toHaveBeenCalledTimes(1);
    expect(state.setAnonymous).toHaveBeenCalledTimes(1);
  });
});
