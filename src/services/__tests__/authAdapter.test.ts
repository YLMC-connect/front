import { mockAuthAdapter } from "../authAdapter";
import { MOCK_USER } from "../../mocks/auth";

describe("mockAuthAdapter", () => {
  it.each([
    ["id", "admin"],
    ["phone", "010-2345-6789"],
  ] as const)(
    "reports a known %s as unavailable",
    async (searchType, searchValue) => {
      await expect(
        mockAuthAdapter.checkAvailability({ searchType, searchValue }),
      ).resolves.toEqual({ available: false });
    },
  );

  it("reports an unknown id as available", async () => {
    await expect(
      mockAuthAdapter.checkAvailability({
        searchType: "id",
        searchValue: "new-member",
      }),
    ).resolves.toEqual({ available: true });
  });

  it("checks duplicate values within the requested member field", async () => {
    await expect(
      mockAuthAdapter.checkAvailability({
        searchType: "id",
        searchValue: "010-2345-6789",
      }),
    ).resolves.toEqual({ available: true });
  });

  it("logs in with the configured mock credentials", async () => {
    await expect(
      mockAuthAdapter.login({ id: "admin", password: "admin123" }),
    ).resolves.toMatchObject({ member: MOCK_USER });
  });

  it("rejects the previous mock credentials", async () => {
    await expect(
      mockAuthAdapter.login({ id: "gracekim", password: "password" }),
    ).rejects.toThrow("아이디 또는 비밀번호가 올바르지 않습니다");
  });
});
