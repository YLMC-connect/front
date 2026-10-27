import { isValidLoginId, sanitizeLoginId } from "../authValidation";

describe("authValidation", () => {
  describe("sanitizeLoginId", () => {
    it("converts uppercase characters to lowercase", () => {
      expect(sanitizeLoginId("AdminUser")).toBe("adminuser");
      expect(sanitizeLoginId("TEST1234")).toBe("test1234");
    });

    it("removes whitespace and special characters", () => {
      expect(sanitizeLoginId("user-name!@#")).toBe("username");
      expect(sanitizeLoginId(" user 123 ")).toBe("user123");
    });

    it("removes Korean characters", () => {
      expect(sanitizeLoginId("홍길동123")).toBe("123");
      expect(sanitizeLoginId("user홍길동")).toBe("user");
    });

    it("keeps lowercase english letters and digits intact", () => {
      expect(sanitizeLoginId("admin123")).toBe("admin123");
      expect(sanitizeLoginId("user2026")).toBe("user2026");
    });
  });

  describe("isValidLoginId", () => {
    it("accepts valid lowercase alphanumeric strings", () => {
      expect(isValidLoginId("admin")).toBe(true);
      expect(isValidLoginId("user123")).toBe(true);
      expect(isValidLoginId("12345")).toBe(true);
    });

    it("rejects invalid characters, uppercase, and empty strings", () => {
      expect(isValidLoginId("")).toBe(false);
      expect(isValidLoginId("Admin")).toBe(false);
      expect(isValidLoginId("user-1")).toBe(false);
      expect(isValidLoginId("user_1")).toBe(false);
      expect(isValidLoginId("user 1")).toBe(false);
      expect(isValidLoginId("아이디")).toBe(false);
    });
  });
});
