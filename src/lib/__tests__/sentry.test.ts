jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  wrap: jest.fn((component: unknown) => ({ wrapped: component })),
  captureMessage: jest.fn(),
}));

type SentryMock = {
  init: jest.Mock;
  wrap: jest.Mock;
  captureMessage: jest.Mock;
};

function setDev(value: boolean) {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
}

const DSN = "https://public@example.ingest.sentry.io/1";

/** 모듈 상태(켜짐 여부)를 테스트마다 새로 시작한다 */
function loadFresh() {
  let modules!: {
    sentry: typeof import("../sentry");
    Sentry: SentryMock;
    apiError: (code: string, status: number) => Error;
  };
  /* eslint-disable @typescript-eslint/no-require-imports -- isolateModules 는 require 로 새 모듈을 받는다 */
  jest.isolateModules(() => {
    const { ApiError } =
      require("../apiClient") as typeof import("../apiClient");
    modules = {
      sentry: require("../sentry"),
      Sentry: require("@sentry/react-native"),
      apiError: (code, status) =>
        new ApiError({
          code,
          message: "메시지",
          status,
          data: { name: "홍길동" },
        }),
    };
  });
  /* eslint-enable @typescript-eslint/no-require-imports */
  return modules;
}

describe("initSentry", () => {
  const originalDev = __DEV__;

  afterEach(() => {
    setDev(originalDev);
  });

  it("does not initialize in development builds", () => {
    setDev(true);
    const { sentry, Sentry } = loadFresh();
    expect(sentry.initSentry(DSN)).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("does not initialize without a DSN", () => {
    setDev(false);
    const { sentry, Sentry } = loadFresh();
    expect(sentry.initSentry(undefined)).toBe(false);
    expect(sentry.initSentry("  ")).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("initializes release builds with the DSN", () => {
    setDev(false);
    const { sentry, Sentry } = loadFresh();
    expect(sentry.initSentry(` ${DSN} `)).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: DSN });
  });
});

describe("wrapWithSentry", () => {
  const originalDev = __DEV__;
  const Root = () => null;

  afterEach(() => {
    setDev(originalDev);
  });

  it("returns the component as is when Sentry is not initialized", () => {
    setDev(true);
    const { sentry, Sentry } = loadFresh();
    sentry.initSentry(DSN);
    expect(sentry.wrapWithSentry(Root)).toBe(Root);
    expect(Sentry.wrap).not.toHaveBeenCalled();
  });

  it("wraps the component in release builds", () => {
    setDev(false);
    const { sentry, Sentry } = loadFresh();
    sentry.initSentry(DSN);
    expect(sentry.wrapWithSentry(Root)).toEqual({ wrapped: Root });
    expect(Sentry.wrap).toHaveBeenCalledWith(Root);
  });
});

describe("reportInvalidResponse", () => {
  const originalDev = __DEV__;

  afterEach(() => {
    setDev(originalDev);
  });

  function enabled() {
    setDev(false);
    const modules = loadFresh();
    modules.sentry.initSentry(DSN);
    return modules;
  }

  it("reports INVALID_RESPONSE with only the query key prefix and status", () => {
    const { sentry, Sentry, apiError } = enabled();
    sentry.reportInvalidResponse(apiError("INVALID_RESPONSE", 200), [
      "group",
      "detail",
      "42",
    ]);

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    const [message, context] = Sentry.captureMessage.mock.calls[0];
    expect(message).toBe("API 응답 형식 오류");
    expect(context.tags).toEqual({
      code: "INVALID_RESPONSE",
      status: "200",
      queryKey: "group.detail",
    });
    expect(JSON.stringify(Sentry.captureMessage.mock.calls)).not.toContain(
      "홍길동",
    );
  });

  it("does not report network errors, 4xx errors or non-ApiErrors", () => {
    const { sentry, Sentry, apiError } = enabled();
    sentry.reportInvalidResponse(apiError("NETWORK_ERROR", 0), ["home"]);
    sentry.reportInvalidResponse(apiError("BAD_REQUEST", 400), ["home"]);
    sentry.reportInvalidResponse(apiError("UNAUTHORIZED", 401), ["home"]);
    sentry.reportInvalidResponse(apiError("INVALID_RESPONSE", 401), ["home"]);
    sentry.reportInvalidResponse(new Error("boom"), ["home"]);

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("does nothing when Sentry is not initialized", () => {
    setDev(true);
    const { sentry, Sentry, apiError } = loadFresh();
    sentry.initSentry(DSN);
    sentry.reportInvalidResponse(apiError("INVALID_RESPONSE", 200), ["home"]);

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe("captureResponseIssue", () => {
  const originalDev = __DEV__;

  afterEach(() => {
    setDev(originalDev);
  });

  it("reports only the path and field names, grouped without list index", () => {
    setDev(false);
    const { sentry, Sentry } = loadFresh();
    sentry.initSentry(DSN);
    sentry.captureResponseIssue({
      source: "prayer.topicBoard.ongoing[2]",
      reason: "createdAt 형식 오류",
    });

    expect(Sentry.captureMessage).toHaveBeenCalledWith("API 응답 항목 제외", {
      level: "warning",
      tags: {
        source: "prayer.topicBoard.ongoing[]",
        reason: "createdAt 형식 오류",
      },
      fingerprint: [
        "response-issue",
        "prayer.topicBoard.ongoing[]",
        "createdAt 형식 오류",
      ],
    });
  });

  it("does nothing when Sentry is not initialized", () => {
    setDev(true);
    const { sentry, Sentry } = loadFresh();
    sentry.initSentry(DSN);
    sentry.captureResponseIssue({ source: "prayer.list[0]", reason: "x" });

    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});
