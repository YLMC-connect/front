import {
  buildHomeDailyPrayer,
  resolveHomeWeekday,
  toWeekdayTopicNumber,
} from "../homeMapper";
import { httpHomeDataSource } from "../homeHttpDataSource";
import {
  fetchDawnPrayerDetail,
  fetchDawnPrayerNeighbors,
  fetchHomeOverview,
} from "../homeService";

describe("home service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("resolves weekdays from Date", () => {
    expect(resolveHomeWeekday(new Date("2026-07-25T12:00:00"))).toBe("sat");
    expect(resolveHomeWeekday(new Date("2026-07-27T12:00:00"))).toBe("mon");
  });

  it("converts dates to server weekday numbers (1=mon … 7=sun)", () => {
    expect(toWeekdayTopicNumber(new Date("2026-07-27T12:00:00"))).toBe(1);
    expect(toWeekdayTopicNumber(new Date("2026-07-25T12:00:00"))).toBe(6);
    expect(toWeekdayTopicNumber(new Date("2026-07-26T12:00:00"))).toBe(7);
  });

  it("builds today's weekday prayers in server order and skips other days", () => {
    const daily = buildHomeDailyPrayer(
      [
        {
          id: 1,
          weekday: 1,
          title: " 첫 기도 ",
          summary: "요약",
          content: null,
        },
        {
          id: 2,
          weekday: 2,
          title: "화요일 기도",
          summary: null,
          content: null,
        },
        {
          id: 3,
          weekday: 1,
          title: "둘째 기도",
          summary: null,
          content: "내용",
        },
        { id: 4, weekday: 1, title: " ", summary: null, content: null },
      ],
      new Date("2026-07-27T09:00:00"),
    );
    expect(daily).toEqual({
      dateLabel: "7월 27일",
      weekday: "mon",
      weekdayLabel: "월요일",
      items: [
        { id: "1", title: "첫 기도", summary: "요약", content: "" },
        { id: "3", title: "둘째 기도", summary: "", content: "내용" },
      ],
    });
  });

  it("returns null when today has no weekday prayer", () => {
    expect(
      buildHomeDailyPrayer(
        [
          {
            id: 2,
            weekday: 2,
            title: "화요일 기도",
            summary: null,
            content: null,
          },
        ],
        new Date("2026-07-27T09:00:00"),
      ),
    ).toBeNull();
    expect(
      buildHomeDailyPrayer([], new Date("2026-07-27T09:00:00")),
    ).toBeNull();
  });

  it("fetches real sermon and daily-qt data", async () => {
    const weekdaySpy = jest
      .spyOn(httpHomeDataSource, "fetchWeekdayPrayers")
      .mockResolvedValue([
        {
          id: 5,
          weekday: 2,
          title: "화요일 기도",
          summary: null,
          content: null,
        },
      ]);
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
    expect(weekdaySpy).toHaveBeenCalledWith(2);
    expect(overview.dailyPrayer?.items.map((item) => item.title)).toEqual([
      "화요일 기도",
    ]);
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

  it("finds the previous and next dates around a dawn summary", async () => {
    const qt = (id: number, qtDate: string) => ({
      id,
      title: "",
      qtDate,
      bibleText: "",
      content: null,
    });
    jest.spyOn(httpHomeDataSource, "fetchDailyQts").mockResolvedValue({
      content: [
        qt(22, "2026-11-05"),
        qt(21, "2026-11-04"),
        qt(20, "2026-11-03"),
      ],
      totalElements: 3,
      totalPages: 1,
      currentPage: 1,
      size: 30,
      hasNext: false,
    });

    await expect(fetchDawnPrayerNeighbors("21")).resolves.toEqual({
      prevId: 20,
      nextId: 22,
    });
    await expect(fetchDawnPrayerNeighbors(22)).resolves.toEqual({
      prevId: 21,
      nextId: null,
    });
    await expect(fetchDawnPrayerNeighbors(99)).resolves.toEqual({
      prevId: null,
      nextId: null,
    });
  });

  it("returns null for every card when server lists are empty", async () => {
    jest.spyOn(httpHomeDataSource, "fetchWeekdayPrayers").mockResolvedValue([]);
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
    expect(overview.dailyPrayer).toBeNull();
  });

  it("throws when both sermon and daily-qt requests fail", async () => {
    jest.spyOn(httpHomeDataSource, "fetchWeekdayPrayers").mockResolvedValue([]);
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
