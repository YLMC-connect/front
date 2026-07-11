import { mockAuthAdapter } from "../authAdapter";

describe("mockAuthAdapter", () => {
  it.each([
    ["id", "gracekim"],
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
});
