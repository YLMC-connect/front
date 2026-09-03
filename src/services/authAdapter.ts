import Constants from "expo-constants";
import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import { MOCK_LOGIN_CREDENTIALS, MOCK_USER } from "../mocks/auth";
import {
  mapAuthSession,
  mapMemberAvailability,
  mapMemberFromMe,
} from "./authMapper";
import type {
  AuthSession,
  LoginInput,
  MemberAvailability,
  MemberDuplicateInput,
  SignupInput,
} from "../types/auth";
import type {
  AuthTokenResponse,
  MemberDuplicateResponse,
  MemberMeResponse,
} from "../types/authApi";
import type { Member } from "../types/common";

type AuthApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

const MOCK_DUPLICATE_VALUES = {
  id: new Set([MOCK_LOGIN_CREDENTIALS.id]),
  phone: new Set(["010-2345-6789"]),
};

export interface AuthAdapter {
  checkAvailability(input: MemberDuplicateInput): Promise<MemberAvailability>;
  login(input: LoginInput): Promise<AuthSession>;
  signup(input: SignupInput): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  getCurrentMember(): Promise<Member>;
}

export const mockAuthAdapter: AuthAdapter = {
  async checkAvailability(input) {
    return {
      available: !MOCK_DUPLICATE_VALUES[input.searchType].has(
        input.searchValue.trim(),
      ),
    };
  },

  async login(input) {
    const id = input.id.trim();
    const password = input.password.trim();
    if (!id || !password) {
      throw new Error("아이디와 비밀번호를 입력해주세요.");
    }
    if (
      id !== MOCK_LOGIN_CREDENTIALS.id ||
      password !== MOCK_LOGIN_CREDENTIALS.password
    ) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다");
    }

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      member: MOCK_USER,
    };
  },

  async signup(input) {
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      member: {
        ...MOCK_USER,
        id: `member-${input.id}`,
        name: input.userName,
      },
    };
  },

  async refresh() {
    return {
      accessToken: "mock-access-token-refreshed",
      refreshToken: "mock-refresh-token",
      member: MOCK_USER,
    };
  },

  async getCurrentMember() {
    return MOCK_USER;
  },
};

export function createHttpAuthAdapter(
  client: AuthApiClient = apiClient,
): AuthAdapter {
  const login = async (input: LoginInput) => {
    const data = await client.request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      format: "json",
      body: JSON.stringify({
        id: input.id.trim(),
        password: input.password,
      }),
    });
    return mapAuthSession(data);
  };

  return {
    async checkAvailability(input) {
      const data = await client.request<MemberDuplicateResponse>(
        "/api/member/duplicate",
        {
          method: "POST",
          auth: false,
          body: JSON.stringify(input),
        },
      );
      return mapMemberAvailability(data);
    },

    login,

    async signup(input) {
      await client.request("/api/signup", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          id: input.id.trim(),
          password: input.password,
          userName: input.userName.trim(),
          phone: input.phone.trim(),
          ...(input.email?.trim() ? { email: input.email.trim() } : {}),
        }),
      });
      return login({ id: input.id, password: input.password });
    },

    async refresh(refreshToken) {
      const data = await client.request<AuthTokenResponse>(
        "/api/auth/refresh",
        {
          method: "POST",
          auth: false,
          format: "json",
          body: JSON.stringify({ refreshToken }),
        },
      );
      return mapAuthSession(data);
    },

    async getCurrentMember() {
      const data = await client.request<MemberMeResponse>("/api/member/me");
      return mapMemberFromMe(data);
    },
  };
}

export const httpAuthAdapter = createHttpAuthAdapter();

function resolveAuthAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.authAdapter === "http" ? "http" : "mock";
}

export const authAdapter =
  resolveAuthAdapterMode() === "http" ? httpAuthAdapter : mockAuthAdapter;
