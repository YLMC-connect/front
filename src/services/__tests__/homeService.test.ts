import { buildHomeDailyPrayer, resolveHomeWeekday } from "../../mocks/home";
import { fetchDawnPrayerDetail, fetchHomeOverview } from "../homeService";

describe("home service", () => {
  it("resolves weekdays from Date", () => {
    // 2026-07-25 is Saturday
    expect(resolveHomeWeekday(new Date("2026-07-25T12:00:00"))).toBe("sat");
    expect(resolveHomeWeekday(new Date("2026-07-27T12:00:00"))).toBe("mon");
  });

  it("builds daily prayer copy for the given day", () => {
    const daily = buildHomeDailyPrayer(new Date("2026-07-27T09:00:00"));
    expect(daily.weekday).toBe("mon");
    expect(daily.weekdayLabel).toBe("월요일");
    expect(daily.dateLabel).toBe("7월 27일");
    expect(daily.title.length).toBeGreaterThan(0);
    expect(daily.href).toBe("/prayer");
  });

  it("returns home overview and dawn detail from mock", async () => {
    const overview = await fetchHomeOverview(new Date("2026-07-25T09:00:00"));
    expect(overview.dailyPrayer.weekday).toBe("sat");
    expect(overview.dawnPrayer.href).toBe("/prayer/dawn");

    const dawn = await fetchDawnPrayerDetail();
    expect(dawn.id).toBe(overview.dawnPrayer.id);
    expect(dawn.body.length).toBeGreaterThan(0);
  });
});
