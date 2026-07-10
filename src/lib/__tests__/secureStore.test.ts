import * as SecureStore from "expo-secure-store";
import { secureTokenStore } from "../secureStore";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("secureTokenStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads both access and refresh tokens", async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValueOnce("access-token")
      .mockResolvedValueOnce("refresh-token");

    await expect(secureTokenStore.getTokens()).resolves.toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it("stores both tokens", async () => {
    await secureTokenStore.setTokens("access-token", "refresh-token");

    expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
      1,
      "ylmc.access_token",
      "access-token",
    );
    expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
      2,
      "ylmc.refresh_token",
      "refresh-token",
    );
  });

  it("clears both tokens", async () => {
    await secureTokenStore.clear();

    expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(
      1,
      "ylmc.access_token",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(
      2,
      "ylmc.refresh_token",
    );
  });
});
