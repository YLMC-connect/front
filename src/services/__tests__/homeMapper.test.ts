import {
  extractYoutubeVideoId,
  formatSermonDate,
  getYoutubeThumbnailUrl,
  mapDailyQtToDawnPrayer,
  mapSermonToSundaySermon,
  stripHtmlToText,
} from "../homeMapper";
import type { DailyQtResponse, SermonResponse } from "../../types/homeApi";

describe("homeMapper", () => {
  describe("extractYoutubeVideoId & getYoutubeThumbnailUrl", () => {
    it("extracts 11-digit video id from standard watch URL", () => {
      expect(
        extractYoutubeVideoId("https://www.youtube.com/watch?v=1t5SPGmJxsg"),
      ).toBe("1t5SPGmJxsg");
    });

    it("extracts video id from short youtu.be URL", () => {
      expect(
        extractYoutubeVideoId(
          "https://youtu.be/wyFldwl6hW8?si=RGgYZd4Om9QcJuoR",
        ),
      ).toBe("wyFldwl6hW8");
    });

    it("returns null for invalid or null URL", () => {
      expect(extractYoutubeVideoId(null)).toBeNull();
      expect(extractYoutubeVideoId("")).toBeNull();
      expect(
        extractYoutubeVideoId("https://example.com/not-youtube"),
      ).toBeNull();
    });

    it("generates correct hqdefault thumbnail URL", () => {
      expect(
        getYoutubeThumbnailUrl("https://www.youtube.com/watch?v=1t5SPGmJxsg"),
      ).toBe("https://img.youtube.com/vi/1t5SPGmJxsg/hqdefault.jpg");
    });

    it("uses fallback when url is null or invalid", () => {
      expect(getYoutubeThumbnailUrl(null, "https://fallback.com/img.jpg")).toBe(
        "https://fallback.com/img.jpg",
      );
    });
  });

  describe("stripHtmlToText", () => {
    it("removes HTML tags, strips redundant header, and unescapes common entities", () => {
      const html =
        "<p>&lt;새벽예배 말씀요약&gt;</p><p>&nbsp;</p><p>본문말씀: 고린도후서 1:23~2:17</p><br/>눈물로 쓴 편지";
      const stripped = stripHtmlToText(html);
      expect(stripped).not.toContain("<새벽예배 말씀요약>");
      expect(stripped).toContain("본문말씀: 고린도후서 1:23~2:17");
      expect(stripped).toContain("눈물로 쓴 편지");
      expect(stripped).not.toContain("<p>");
      expect(stripped).not.toContain("&nbsp;");
    });

    it("joins numbered list items into a single verse line", () => {
      const html =
        "<ul><li><div>1</div><div>하늘은 하나님의 영광을 드러내고</div></li></ul>";
      expect(stripHtmlToText(html)).toBe("1. 하늘은 하나님의 영광을 드러내고");
    });

    it("handles null and empty string", () => {
      expect(stripHtmlToText(null)).toBe("");
      expect(stripHtmlToText("")).toBe("");
    });
  });

  describe("formatSermonDate", () => {
    it("formats YYYY-MM-DD to M월 D일", () => {
      expect(formatSermonDate("2026-11-01")).toBe("11월 1일");
      expect(formatSermonDate("2026-05-09")).toBe("5월 9일");
    });

    it("handles invalid or empty date", () => {
      expect(formatSermonDate(undefined)).toBe("");
      expect(formatSermonDate("invalid")).toBe("invalid");
    });
  });

  describe("mapSermonToSundaySermon", () => {
    const mockSermon: SermonResponse = {
      id: 1,
      title: "넘쳐 흐르는 위로(고후1:1~11)",
      sermonDate: "2026-11-01",
      bibleText: "고린도후서 1장 1 ~ 11절",
      preacher: "이재홍 전도사",
      youtubeUrl: "https://www.youtube.com/watch?v=1t5SPGmJxsg",
    };

    it("maps SermonResponse to HomeSundaySermon correctly", () => {
      const mapped = mapSermonToSundaySermon(mockSermon);
      expect(mapped.id).toBe("1");
      expect(mapped.title).toBe("넘쳐 흐르는 위로(고후1:1~11)");
      expect(mapped.timeLabel).toBe("이번 주일 말씀 · 11월 1일");
      expect(mapped.summary).toBe("고린도후서 1장 1 ~ 11절 · 이재홍 전도사");
      expect(mapped.videoUrl).toBe(mockSermon.youtubeUrl);
      expect(mapped.thumbnailUrl).toBe(
        "https://img.youtube.com/vi/1t5SPGmJxsg/hqdefault.jpg",
      );
    });
  });

  describe("mapDailyQtToDawnPrayer", () => {
    const mockQt: DailyQtResponse = {
      id: 1,
      title: "2026. 11. 3. 화요일 ㅡ 고린도후서 1:23~2:17",
      qtDate: "2026-11-03",
      bibleText: "고린도후서 1:23~2:17",
      content: null,
    };

    it("maps DailyQtResponse to HomeDawnPrayer correctly with detail HTML", () => {
      const html = "<p>본문 요약입니다.</p>";
      const mapped = mapDailyQtToDawnPrayer(mockQt, html);
      expect(mapped.id).toBe("dawn-1");
      expect(mapped.timeLabel).toBe("새벽기도 말씀요약 · 11월 3일 (화)");
      expect(mapped.title).toBe("고린도후서 1:23~2:17");
      expect(mapped.summary).toBe("본문 요약입니다.");
      expect(mapped.body).toBe("본문 요약입니다.");
      expect(mapped.href).toBe("/prayer/dawn?id=1");
    });
  });
});
