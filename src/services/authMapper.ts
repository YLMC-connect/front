import { ApiError } from "../lib/apiClient";
import type { AuthSession } from "../types/auth";
import type {
  AuthTokenResponse,
  MemberDuplicateResponse,
  MemberMeResponse,
} from "../types/authApi";
import type { Member } from "../types/common";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapMemberRole(role: string | undefined): Member["role"] {
  if (role === "ADMIN" || role === "admin") return "admin";
  return "member";
}

export function mapMemberFromMe(data: unknown): Member {
  if (!isRecord(data)) {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
      data,
    });
  }

  const id = readString(data.id);
  const name = readString(data.userName);
  if (!id || !name) {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
      data,
    });
  }

  const dto = data as unknown as MemberMeResponse;
  const department = readString(dto.mokjangName);

  return {
    id,
    name,
    ...(department ? { department } : {}),
    role: mapMemberRole(readString(dto.role) ?? undefined),
  };
}

export function mapAuthSession(data: unknown): AuthSession {
  if (!isRecord(data)) {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
      data,
    });
  }

  const accessToken = readString(data.accessToken);
  const refreshToken = readString(data.refreshToken);
  const userId = readString(data.userId);
  const userName = readString(data.userName);
  if (!accessToken || !refreshToken || !userId || !userName) {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
      data,
    });
  }

  const dto = data as unknown as AuthTokenResponse;
  return {
    accessToken,
    refreshToken,
    member: {
      id: userId,
      name: userName,
      role: mapMemberRole(readString(dto.role) ?? undefined),
    },
  };
}

export function mapMemberAvailability(data: unknown) {
  if (!isRecord(data) || typeof data.available !== "boolean") {
    throw new ApiError({
      code: "INVALID_RESPONSE",
      message: "서버 응답 형식을 확인할 수 없습니다.",
      status: 200,
      data,
    });
  }

  const dto = data as unknown as MemberDuplicateResponse;
  return { available: dto.available };
}
