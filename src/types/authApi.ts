export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  role?: string;
}

export interface MemberMeResponse {
  id: string;
  userName: string;
  email?: string | null;
  phone?: string | null;
  mokjangName?: string | null;
  role?: string;
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
