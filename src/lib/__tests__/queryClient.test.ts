import { ApiError } from "../apiClient";
import { shouldRetryQuery } from "../queryClient";

describe("shouldRetryQuery", () => {
  it("does not retry on 4xx client errors", () => {
    const error400 = new ApiError({
      code: "BAD_REQUEST",
      message: "잘못된 요청입니다.",
      status: 400,
    });
    const error401 = new ApiError({
      code: "UNAUTHORIZED",
      message: "인증이 필요합니다.",
      status: 401,
    });
    const error404 = new ApiError({
      code: "NOT_FOUND",
      message: "존재하지 않습니다.",
      status: 404,
    });

    expect(shouldRetryQuery(0, error400)).toBe(false);
    expect(shouldRetryQuery(0, error401)).toBe(false);
    expect(shouldRetryQuery(0, error404)).toBe(false);
  });

  it("retries on 5xx server errors up to 2 times", () => {
    const error500 = new ApiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류",
      status: 500,
    });

    expect(shouldRetryQuery(0, error500)).toBe(true);
    expect(shouldRetryQuery(1, error500)).toBe(true);
    expect(shouldRetryQuery(2, error500)).toBe(false);
  });

  it("retries on network errors (status 0) up to 2 times", () => {
    const networkError = new ApiError({
      code: "NETWORK_ERROR",
      message: "네트워크 연결을 확인해주세요.",
      status: 0,
    });

    expect(shouldRetryQuery(0, networkError)).toBe(true);
    expect(shouldRetryQuery(1, networkError)).toBe(true);
    expect(shouldRetryQuery(2, networkError)).toBe(false);
  });

  it("retries on generic unknown errors up to 2 times", () => {
    const genericError = new Error("Generic error");

    expect(shouldRetryQuery(0, genericError)).toBe(true);
    expect(shouldRetryQuery(1, genericError)).toBe(true);
    expect(shouldRetryQuery(2, genericError)).toBe(false);
  });
});
