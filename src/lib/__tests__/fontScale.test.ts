import { scaleHeightForFont } from "../fontScale";

describe("scaleHeightForFont", () => {
  it("keeps the height at default or smaller font sizes", () => {
    expect(scaleHeightForFont(89, 1)).toBe(89);
    expect(scaleHeightForFont(89, 0.85)).toBe(89);
  });

  it("grows the height with larger font sizes", () => {
    expect(scaleHeightForFont(89, 1.5)).toBe(134);
    expect(scaleHeightForFont(116, 2)).toBe(232);
  });
});
