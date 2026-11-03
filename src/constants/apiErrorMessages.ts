import type { ApiErrorMessageMap } from "../lib/apiErrorMessage";

export const authApiErrorMessages: ApiErrorMessageMap = {
  MEM001: "이미 사용 중인 아이디입니다.",
  MEM002: "이미 사용 중인 연락처입니다.",
  MEM003: "이미 사용 중인 이메일입니다.",
  MEM004: "사용자 정보를 찾을 수 없습니다.",
  MEM005: "중복확인 항목을 확인해주세요.",
  MEM006: "비밀번호가 일치하지 않습니다.",
};

export const lifeStudyApiErrorMessages: ApiErrorMessageMap = {
  LST001: "삶공부 과정을 찾을 수 없습니다.",
  LST006: "출석 정보를 찾을 수 없습니다.",
  LST012: "수업 일정을 확인할 수 없습니다.",
  LST013: "출석 저장 권한이 없습니다.",
  LST014: "수강생 정보를 확인할 수 없습니다.",
  LST016: "출석 처리 중 오류가 발생했습니다.",
  LST017: "수료 처리 권한이 없습니다.",
};

export const defaultApiErrorMessages: ApiErrorMessageMap = {
  ...authApiErrorMessages,
  ...lifeStudyApiErrorMessages,
};
