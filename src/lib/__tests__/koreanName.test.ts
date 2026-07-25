import { getGivenName, getGivenNameInitial } from "../koreanName";

describe("koreanName", () => {
  it("strips a single-character surname", () => {
    expect(getGivenName("이민구")).toBe("민구");
    expect(getGivenName("김은혜")).toBe("은혜");
    expect(getGivenNameInitial("이민구")).toBe("민");
  });

  it("strips compound surnames", () => {
    expect(getGivenName("남궁민수")).toBe("민수");
    expect(getGivenName("황보은정")).toBe("은정");
  });

  it("handles short and empty names", () => {
    expect(getGivenName("김")).toBe("김");
    expect(getGivenName("  ")).toBe("");
    expect(getGivenNameInitial("")).toBe("?");
  });
});
