import { invalidResponse, keepValidItems } from "../reportResponseIssue";
import { captureResponseIssue } from "../sentry";

jest.mock("../sentry", () => ({ captureResponseIssue: jest.fn() }));

describe("reportResponseIssue", () => {
  it("passes only the path and field name of a dropped item to Sentry", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = keepValidItems(
      [{ name: "홍길동" }, { name: 3 }],
      "prayer.list",
      (item) => {
        const name = (item as { name: unknown }).name;
        if (typeof name !== "string") invalidResponse(item, "name");
        return name;
      },
    );

    expect(result).toEqual(["홍길동"]);
    expect(captureResponseIssue).toHaveBeenCalledTimes(1);
    expect(captureResponseIssue).toHaveBeenCalledWith({
      source: "prayer.list[1]",
      reason: "name 형식 오류",
    });
    warn.mockRestore();
  });
});
