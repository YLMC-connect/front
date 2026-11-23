import { isValidPhoneDigits, validateSignup } from "../signupForm";

const valid = {
  id: "ylmc",
  password: "secret1234",
  passwordConfirm: "secret1234",
  userName: "열린문",
  phone: "",
  email: "ylmc@example.com",
};

describe("signupForm", () => {
  it("accepts an empty phone because it is optional", () => {
    expect(validateSignup(valid).phone).toBeUndefined();
  });

  it("checks the phone format only when one is entered", () => {
    expect(validateSignup({ ...valid, phone: "010-1234-5678" }).phone).toBe(
      undefined,
    );
    expect(validateSignup({ ...valid, phone: "011-1234-5678" }).phone).toBe(
      "연락처는 010으로 시작하는 10~11자리로 입력해주세요.",
    );
    expect(validateSignup({ ...valid, phone: "010-123" }).phone).toBe(
      "연락처는 010으로 시작하는 10~11자리로 입력해주세요.",
    );
  });

  it("accepts 10 and 11 digit numbers starting with 010", () => {
    expect(isValidPhoneDigits("0101234567")).toBe(true);
    expect(isValidPhoneDigits("01012345678")).toBe(true);
    expect(isValidPhoneDigits("010123456789")).toBe(false);
    expect(isValidPhoneDigits("02123456789")).toBe(false);
  });
});
