import * as Sentry from "@sentry/react-native";
import { initSentry } from "../sentry";

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  wrap: jest.fn((component: unknown) => component),
}));

function setDev(value: boolean) {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
}

const DSN = "https://public@example.ingest.sentry.io/1";

describe("initSentry", () => {
  const originalDev = __DEV__;

  afterEach(() => {
    setDev(originalDev);
    jest.clearAllMocks();
  });

  it("does not initialize in development builds", () => {
    setDev(true);
    expect(initSentry(DSN)).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("does not initialize without a DSN", () => {
    setDev(false);
    expect(initSentry(undefined)).toBe(false);
    expect(initSentry("  ")).toBe(false);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("initializes release builds with the DSN", () => {
    setDev(false);
    expect(initSentry(` ${DSN} `)).toBe(true);
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: DSN });
  });
});
