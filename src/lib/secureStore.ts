import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "ylmc.access_token";
const REFRESH_TOKEN_KEY = "ylmc.refresh_token";

function getWebStorage() {
  return typeof globalThis.sessionStorage === "undefined"
    ? null
    : globalThis.sessionStorage;
}

async function getItem(key: string) {
  if (Platform.OS === "web") return getWebStorage()?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureTokenStore = {
  async getAccessToken() {
    return getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return getItem(REFRESH_TOKEN_KEY);
  },
  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  },
  async setTokens(accessToken: string, refreshToken: string) {
    await setItem(ACCESS_TOKEN_KEY, accessToken);
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clear() {
    const results = await Promise.allSettled([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
    ]);
    const failed = results.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failed) throw failed.reason;
  },
};
