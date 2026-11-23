import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
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
  MemberChangePasswordRequest,
  MemberDuplicateResponse,
  MemberMeResponse,
} from "../types/authApi";
import type { Member } from "../types/common";

type AuthApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

export interface AuthAdapter {
  checkAvailability(input: MemberDuplicateInput): Promise<MemberAvailability>;
  login(input: LoginInput): Promise<AuthSession>;
  signup(input: SignupInput): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  getCurrentMember(): Promise<Member>;
  updateCurrentMember(input: { phone: string }): Promise<Member>;
  changePassword(input: MemberChangePasswordRequest): Promise<void>;
  withdraw(): Promise<void>;
}

export function createHttpAuthAdapter(
  client: AuthApiClient = apiClient,
): AuthAdapter {
  const login = async (input: LoginInput) => {
    const data = await client.request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
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
          // 연락처는 선택. 빈 값을 보내면 서버 중복 검사(MEM002)에 걸릴 수 있어 뺀다
          ...(input.phone.trim() ? { phone: input.phone.trim() } : {}),
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
          body: JSON.stringify({ refreshToken }),
        },
      );
      return mapAuthSession(data);
    },

    async getCurrentMember() {
      const data = await client.request<MemberMeResponse>("/api/member/me");
      return mapMemberFromMe(data);
    },

    async updateCurrentMember(input) {
      const data = await client.request<MemberMeResponse>("/api/member/me", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      return mapMemberFromMe(data);
    },

    async changePassword(input) {
      await client.request("/api/member/password", {
        method: "PUT",
        body: JSON.stringify(input),
      });
    },

    async withdraw() {
      await client.request("/api/member/me", {
        method: "DELETE",
      });
    },
  };
}

export const authAdapter = createHttpAuthAdapter();
