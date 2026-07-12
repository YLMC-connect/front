import type { Member } from "./common";

export interface LoginInput {
  id: string;
  password: string;
}

export interface SignupInput {
  id: string;
  password: string;
  userName: string;
  phone: string;
  email?: string;
}

export type MemberDuplicateType = "id" | "phone";

export interface MemberDuplicateInput {
  searchType: MemberDuplicateType;
  searchValue: string;
}

export interface MemberAvailability {
  available: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  member: Member;
}

export type AuthStatus =
  | "restoring"
  | "authenticated"
  | "anonymous"
  | "unavailable";
