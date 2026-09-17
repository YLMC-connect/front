import type { UserRole } from "./common";

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  role?: UserRole;
}

export interface MemberMeResponse {
  id: string;
  userName: string;
  email?: string | null;
  phone?: string | null;
  mokjangName?: string | null;
  role?: UserRole;
  userStatus?: string;
  point?: number;
  snsId?: string | null;
}

export interface MemberDuplicateResponse {
  available: boolean;
}

export interface MemberSignupResponse {
  userStatus?: string;
}
