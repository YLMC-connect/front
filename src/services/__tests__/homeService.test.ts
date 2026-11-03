import { buildHomeDailyPrayer, resolveHomeWeekday } from "../homeMapper";
import { httpHomeDataSource } from "../homeHttpDataSource";
import { fetchDawnPrayerDetail, fetchHomeOverview } from "../homeService";

describe("home service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("resolves weekdays from Date", () => {
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

  it("fetches real sermon and daily-qt data", async () => {
    jest.spyOn(httpHomeDataSource, "fetchSermons").mockResolvedValue({
      content: [
        {
          id: 10,
          title: "실제 주일 설교",
          sermonDate: "2026-11-01",
          bibleText: "창세기 1:1",
          preacher: "김목사",
          youtubeUrl: "https://www.youtube.com/watch?v=1t5SPGmJxsg",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });

    jest.spyOn(httpHomeDataSource, "fetchDailyQts").mockResolvedValue({
      content: [
        {
          id: 20,
          title: "2026. 11. 3. 화요일 ㅡ 고린도후서 1:23~2:17",
          qtDate: "2026-11-03",
          bibleText: "고린도후서 1:23~2:17",
          content: null,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });
    jest.spyOn(httpHomeDataSource, "fetchDailyQtDetail").mockResolvedValue({
      id: 20,
      title: "2026. 11. 3. 화요일 ㅡ 고린도후서 1:23~2:17",
      qtDate: "2026-11-03",
      bibleText: "고린도후서 1:23~2:17",
      content:
        "<p>&lt;새벽예배 말씀요약&gt;</p><p>본문말씀: 고린도후서 1:23~2:17</p><p>찬송: 455장</p><p>눈물로 쓴 편지</p>",
    });

    const overview = await fetchHomeOverview(new Date("2026-11-03T09:00:00"));

    expect(overview.sundaySermon?.title).toBe("실제 주일 설교");
    expect(overview.sundaySermon?.summary).toBe("창세기 1:1 · 김목사");
    expect(overview.sundaySermon?.thumbnailUrl).toContain("1t5SPGmJxsg");
    expect(overview.dawnPrayer?.id).toBe("dawn-20");
    expect(overview.dawnPrayer?.title).toBe("고린도후서 1:23~2:17");
    expect(overview.todos).toHaveLength(2);
    expect(overview.progressSteps).toHaveLength(2);
  });

  it("fetches detail and maps html content", async () => {
    jest.spyOn(httpHomeDataSource, "fetchDailyQtDetail").mockResolvedValue({
      id: 20,
      title: "2026. 11. 3. 화요일 ㅡ 고린도후서 1:23~2:17",
      qtDate: "2026-11-03",
      bibleText: "고린도후서 1:23~2:17",
      content: "<p>말씀 본문 요약입니다.</p>",
    });

    const dawn = await fetchDawnPrayerDetail(20);
    expect(dawn.id).toBe("dawn-20");
    expect(dawn.body).toBe("말씀 본문 요약입니다.");
  });

  it("returns null for sundaySermon and dawnPrayer when server lists are empty", async () => {
    jest.spyOn(httpHomeDataSource, "fetchSermons").mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });
    jest.spyOn(httpHomeDataSource, "fetchDailyQts").mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 1,
      size: 10,
      hasNext: false,
    });

    const overview = await fetchHomeOverview(new Date("2026-07-25T09:00:00"));
    expect(overview.sundaySermon).toBeNull();
    expect(overview.dawnPrayer).toBeNull();
    expect(overview.todos).toHaveLength(1);
    expect(overview.todos[0]?.id).toBe("daily-prayer");
  });

  it("throws when both sermon and daily-qt requests fail", async () => {
    jest
      .spyOn(httpHomeDataSource, "fetchSermons")
      .mockRejectedValue(new Error("Network Error"));
    jest
      .spyOn(httpHomeDataSource, "fetchDailyQts")
      .mockRejectedValue(new Error("Network Error"));

    await expect(
      fetchHomeOverview(new Date("2026-07-25T09:00:00")),
    ).rejects.toThrow("Network Error");
  });
});
