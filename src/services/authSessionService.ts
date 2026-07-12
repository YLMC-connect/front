import type { AuthAdapter } from "./authAdapter";
import type { AuthSession, LoginInput, SignupInput } from "../types/auth";
import type { Member } from "../types/common";

export interface AuthTokenStore {
  getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AuthStateWriter {
  setRestoring(): void;
  setAuthenticated(member: Member): void;
  setAnonymous(): void;
  setUnavailable(): void;
}

type AuthSessionManagerOptions = {
  adapter: AuthAdapter;
  tokenStore: AuthTokenStore;
  state: AuthStateWriter;
};

function isUnauthorized(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 401
  );
}

export function createAuthSessionManager({
  adapter,
  tokenStore,
  state,
}: AuthSessionManagerOptions) {
  let refreshPromise: Promise<AuthSession> | null = null;

  const persistSession = async (session: AuthSession) => {
    await tokenStore.setTokens(session.accessToken, session.refreshToken);
    state.setAuthenticated(session.member);
    return session;
  };

  const logout = async () => {
    try {
      await tokenStore.clear();
    } finally {
      state.setAnonymous();
    }
  };

  const startSession = async (sessionPromise: Promise<AuthSession>) => {
    try {
      return await persistSession(await sessionPromise);
    } catch (error) {
      await logout().catch(() => undefined);
      throw error;
    }
  };

  const refresh = () => {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshToken = await tokenStore.getRefreshToken();
          if (!refreshToken) {
            throw new Error("저장된 refresh token이 없습니다.");
          }

          const session = await adapter.refresh(refreshToken);
          return await persistSession(session);
        } catch (error) {
          await logout().catch(() => undefined);
          throw error;
        }
      })().finally(() => {
        refreshPromise = null;
      });
    }

    return refreshPromise;
  };

  return {
    async login(input: LoginInput) {
      return startSession(adapter.login(input));
    },

    async signup(input: SignupInput) {
      return startSession(adapter.signup(input));
    },

    async restore() {
      state.setRestoring();
      let accessToken: string | null;
      let refreshToken: string | null;
      try {
        ({ accessToken, refreshToken } = await tokenStore.getTokens());
      } catch (error) {
        state.setUnavailable();
        throw error;
      }

      if (!refreshToken) {
        if (accessToken) await tokenStore.clear().catch(() => undefined);
        state.setAnonymous();
        return null;
      }

      if (!accessToken) return refresh();

      try {
        const member = await adapter.getCurrentMember();
        state.setAuthenticated(member);
        return member;
      } catch (error) {
        if (isUnauthorized(error)) return refresh();
        state.setUnavailable();
        throw error;
      }
    },

    refresh,
    logout,
  };
}
