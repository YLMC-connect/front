import { authAdapter } from "./authAdapter";
import { createAuthSessionManager } from "./authSessionService";
import { configureAuthRecovery } from "../lib/authRecovery";
import { secureTokenStore } from "../lib/secureStore";
import { useAuthStore } from "../store/authStore";
import type { AuthSession, LoginInput, SignupInput } from "../types/auth";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const sessionManager = createAuthSessionManager({
  adapter: authAdapter,
  tokenStore: secureTokenStore,
  state: {
    setRestoring: () => useAuthStore.getState().setRestoring(),
    setAuthenticated: (member) =>
      useAuthStore.getState().setAuthenticated(member),
    setAnonymous: () => useAuthStore.getState().setAnonymous(),
    setUnavailable: () => useAuthStore.getState().setUnavailable(),
  },
});

export async function login(input: LoginInput): Promise<AuthSession> {
  await delay();
  return sessionManager.login(input);
}

export async function signup(input: SignupInput): Promise<AuthSession> {
  await delay();
  return sessionManager.signup(input);
}

export async function refreshSession(): Promise<AuthSession> {
  return sessionManager.refresh();
}

export const restoreAuthSession = () => sessionManager.restore();
export const logout = () => sessionManager.logout();

configureAuthRecovery(async () => {
  await refreshSession();
});
