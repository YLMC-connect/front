import { readDesignVariant } from "../designVariant";

describe("designVariant", () => {
  it("reads the first design variant in development", () => {
    expect(readDesignVariant(["empty", "ignored"], true)).toBe("empty");
    expect(readDesignVariant("network-error", true)).toBe("network-error");
  });

  it("ignores design variants outside development", () => {
    expect(readDesignVariant("network-error", false)).toBeUndefined();
  });
});
