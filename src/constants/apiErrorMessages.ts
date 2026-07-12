import type { ApiErrorMessageMap } from "../lib/apiErrorMessage";

export const authApiErrorMessages: ApiErrorMessageMap = {
  MEM001: "이미 사용 중인 아이디입니다.",
  MEM002: "이미 사용 중인 연락처입니다.",
  MEM003: "이미 사용 중인 이메일입니다.",
  MEM004: "사용자 정보를 찾을 수 없습니다.",
  MEM005: "중복확인 항목을 확인해주세요.",
  MEM006: "비밀번호가 일치하지 않습니다.",
};
