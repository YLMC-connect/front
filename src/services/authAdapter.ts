import { MOCK_LOGIN_CREDENTIALS, MOCK_USER } from "../mocks/auth";
import type {
  AuthSession,
  LoginInput,
  MemberAvailability,
  MemberDuplicateInput,
  SignupInput,
} from "../types/auth";
import type { Member } from "../types/common";

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

export const httpAuthAdapter: AuthAdapter = {
  async checkAvailability() {
    throw new Error(
      "Auth API 연결은 Swagger 응답 스키마 확정 후 Phase 6에서 활성화합니다.",
    );
  },

  async login() {
    throw new Error(
      "Auth API 연결은 Swagger 응답 스키마 확정 후 Phase 6에서 활성화합니다.",
    );
  },

  async signup() {
    throw new Error(
      "Auth API 연결은 Swagger 응답 스키마 확정 후 Phase 6에서 활성화합니다.",
    );
  },

  async refresh() {
    throw new Error(
      "Auth API 연결은 Swagger 응답 스키마 확정 후 Phase 6에서 활성화합니다.",
    );
  },

  async getCurrentMember() {
    throw new Error(
      "Auth API 연결은 Swagger 응답 스키마 확정 후 Phase 6에서 활성화합니다.",
    );
  },
};

export const authAdapter = mockAuthAdapter;
