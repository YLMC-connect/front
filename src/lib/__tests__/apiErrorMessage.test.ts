import { authApiErrorMessages } from "../../constants/apiErrorMessages";
import { ApiError } from "../apiClient";
import { getApiErrorMessage } from "../apiErrorMessage";

describe("getApiErrorMessage", () => {
  it("maps a documented API code to a stable user message", () => {
    const error = new ApiError({
      code: "MEM001",
      message: "backend wording",
      status: 409,
    });

    expect(
      getApiErrorMessage(error, authApiErrorMessages, "가입에 실패했습니다."),
    ).toBe("이미 사용 중인 아이디입니다.");
  });

  it("uses a common message for transport and response failures", () => {
    expect(
      getApiErrorMessage(
        new ApiError({
          code: "NETWORK_ERROR",
          message: "fetch failed",
          status: 0,
        }),
        authApiErrorMessages,
        "로그인에 실패했습니다.",
      ),
    ).toBe("네트워크 연결을 확인해주세요.");
  });

  it("does not expose an undocumented API message", () => {
    const error = new ApiError({
      code: "AUTH999",
      message: "internal authentication detail",
      status: 401,
    });

    expect(
      getApiErrorMessage(
        error,
        authApiErrorMessages,
        "아이디 또는 비밀번호를 확인해주세요.",
      ),
    ).toBe("아이디 또는 비밀번호를 확인해주세요.");
  });

  it("preserves intentional local validation errors", () => {
    expect(
      getApiErrorMessage(
        new Error("아이디와 비밀번호를 입력해주세요."),
        authApiErrorMessages,
        "로그인에 실패했습니다.",
      ),
    ).toBe("아이디와 비밀번호를 입력해주세요.");
  });
});
