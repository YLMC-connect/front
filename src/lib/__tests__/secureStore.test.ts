import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { secureTokenStore } from "../secureStore";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("secureTokenStore", () => {
  const nativeOS = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: nativeOS,
    });
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

  it("attempts to delete both tokens when one deletion fails", async () => {
    const error = new Error("keystore delete failed");
    jest
      .mocked(SecureStore.deleteItemAsync)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);

    await expect(secureTokenStore.clear()).rejects.toBe(error);

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "ylmc.access_token",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "ylmc.refresh_token",
    );
  });

  it("uses session storage on web without calling the native module", async () => {
    const values = new Map<string, string>();
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "web",
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: {
        getItem: jest.fn((key: string) => values.get(key) ?? null),
        setItem: jest.fn((key: string, value: string) =>
          values.set(key, value),
        ),
        removeItem: jest.fn((key: string) => values.delete(key)),
      },
    });

    await secureTokenStore.setTokens("web-access", "web-refresh");
    await expect(secureTokenStore.getTokens()).resolves.toEqual({
      accessToken: "web-access",
      refreshToken: "web-refresh",
    });
    await secureTokenStore.clear();
    await expect(secureTokenStore.getTokens()).resolves.toEqual({
      accessToken: null,
      refreshToken: null,
    });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});
