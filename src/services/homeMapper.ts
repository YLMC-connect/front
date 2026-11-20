import type {
  HomeDailyPrayer,
  HomeDailyPrayerItem,
  HomeDawnPrayer,
  HomeSundaySermon,
  HomeWeekday,
} from "../types/home";
import type {
  DailyQtResponse,
  PrayerWeekdayTopicResponse,
  SermonResponse,
} from "../types/homeApi";

const weekdayKeys: HomeWeekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const weekdayLabels: Record<HomeWeekday, string> = {
  sun: "일요일",
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
  sat: "토요일",
};

export function resolveHomeWeekday(date: Date = new Date()): HomeWeekday {
  return weekdayKeys[date.getDay()] ?? "mon";
}

export function formatHomeDateLabel(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 서버 요일 번호(1=월 … 7=일). JS 의 getDay(0=일)와 다르다. */
export function toWeekdayTopicNumber(date: Date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function mapWeekdayTopic(
  topic: PrayerWeekdayTopicResponse,
): HomeDailyPrayerItem | null {
  const title = typeof topic.title === "string" ? topic.title.trim() : "";
  if (topic.id == null || !title) return null;
  return {
    id: String(topic.id),
    title,
    summary: typeof topic.summary === "string" ? topic.summary.trim() : "",
    content: typeof topic.content === "string" ? topic.content.trim() : "",
  };
}

/** 오늘 요일 기도 목록으로 카드를 만든다. 쓸 수 있는 항목이 없으면 null. */
export function buildHomeDailyPrayer(
  topics: readonly PrayerWeekdayTopicResponse[],
  date: Date = new Date(),
): HomeDailyPrayer | null {
  const today = toWeekdayTopicNumber(date);
  const items = topics
    .filter((topic) => topic.weekday === today)
    .map(mapWeekdayTopic)
    .filter((item): item is HomeDailyPrayerItem => item !== null);
  if (items.length === 0) return null;
  const weekday = resolveHomeWeekday(date);
  return {
    dateLabel: formatHomeDateLabel(date),
    weekday,
    weekdayLabel: weekdayLabels[weekday],
    items,
  };
}

/**
 * YouTube 영상 URL에서 11자리 비디오 ID 추출
 */
export function extractYoutubeVideoId(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/**
 * YouTube 비디오 URL로부터 16:9 고화질 썸네일 주소 생성
 */
export function getYoutubeThumbnailUrl(
  url: string | null | undefined,
  fallback = "",
): string {
  const videoId = extractYoutubeVideoId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return fallback;
}

/**
 * 설교 제목 끝에 붙은 괄호 성경구절(예: "(고후1:1~11)")을 본문 구절이 별도로 있을 때 제거
 */
export function cleanSermonTitle(
  title: string,
  bibleText?: string | null,
): string {
  const trimmed = title.trim();
  if (!bibleText) return trimmed;
  return trimmed.replace(/\s*\([^()]+\d+[:장절~,-][^()]*\)\s*$/, "").trim();
}

/**
 * HTML 본문에서 위험 태그 및 서식을 제거하고 읽기 쉬운 줄바꿈 텍스트로 정제
 */
export function stripHtmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return (
    html
      // 주말 큐티 등 <li><div>1</div><div>말씀</div></li> 구조를 "1. 말씀" 한 줄로 결합
      .replace(
        /<li[^>]*>\s*<div[^>]*>\s*(\d+)\s*<\/div>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/li>/gi,
        "<p>$1. $2</p>",
      )
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|ul|ol|h[1-6])>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      // 첫 줄 고정 머리말(<새벽예배 말씀요약>) 제거
      .replace(/^<새벽예배\s*말씀요약>\s*\n*/i, "")
      // 문단 시작의 투박한 한글 줄표('ㅡ ')를 깔끔한 중점('• ') 또는 평문으로 정돈
      .replace(/^ㅡ\s*/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * 홈 카드 미리보기용 요약문 추출 (본문말씀/찬송 중복 줄을 건너뛰고 첫 의미 단락 반환)
 */
export function extractDailyQtPreview(
  bodyText: string,
  fallback = "오늘의 새벽기도 말씀요약을 확인해보세요.",
): string {
  if (!bodyText) return fallback;
  const lines = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !/^<새벽예배/i.test(line) &&
        !/^본문(\s*말씀)?\s*:/i.test(line) &&
        !/^찬송(가)?\s*:?\s*\d+/i.test(line),
    );

  if (lines.length === 0) return fallback;
  return lines.slice(0, 2).join(" · ");
}

const koreanWeekdays = ["일", "월", "화", "수", "목", "금", "토"] as const;

/**
 * 날짜 문자열(YYYY-MM-DD)을 'M월 D일' 형식으로 포맷팅
 */
export function formatSermonDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!Number.isNaN(month) && !Number.isNaN(day)) {
        return `${month}월 ${day}일`;
      }
    }
  } catch {
    // 의도된 무시: 형식을 알 수 없으면 아래에서 원래 문자열을 그대로 보여준다.
  }
  return dateStr;
}

/**
 * 날짜 문자열(YYYY-MM-DD)을 'M월 D일 요일' 형식으로 포맷팅
 */
export function formatDateWithWeekday(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      const date = new Date(year, month - 1, day);
      const dow = koreanWeekdays[date.getDay()];
      return `${month}월 ${day}일 ${dow}요일`;
    }
  }
  return formatSermonDate(dateStr);
}

/**
 * 날짜 문자열(YYYY-MM-DD)을 'YYYY년 M월 D일 요일' 형식으로 포맷팅
 */
export function formatFullDateWithWeekday(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      const date = new Date(year, month - 1, day);
      const dow = koreanWeekdays[date.getDay()];
      return `${year}년 ${month}월 ${day}일 ${dow}요일`;
    }
  }
  return formatSermonDate(dateStr);
}

/**
 * 설교 API 응답(SermonResponse)을 홈 화면 모델(HomeSundaySermon)로 변환
 */
export function mapSermonToSundaySermon(
  sermon: SermonResponse,
): HomeSundaySermon {
  const dateFormatted = formatSermonDate(sermon.sermonDate);
  const dateLabel = formatDateWithWeekday(sermon.sermonDate);
  const timeLabel = dateFormatted
    ? `이번 주일 말씀 · ${dateFormatted}`
    : "이번 주일 말씀";

  const summary = [sermon.bibleText, sermon.preacher]
    .filter(Boolean)
    .join(" · ");

  return {
    id: String(sermon.id),
    timeLabel,
    dateLabel,
    title: cleanSermonTitle(sermon.title, sermon.bibleText),
    summary: summary || "열린문교회 주일 설교",
    videoUrl: sermon.youtubeUrl ?? "",
    thumbnailUrl: getYoutubeThumbnailUrl(sermon.youtubeUrl),
  };
}

/**
 * 매일 큐티 API 응답(DailyQtResponse)을 홈 화면 모델(HomeDawnPrayer)로 변환
 */
export function mapDailyQtToDawnPrayer(
  qt: DailyQtResponse,
  detailContent?: string | null,
): HomeDawnPrayer {
  const dateLabel = formatDateWithWeekday(qt.qtDate);
  const fullDateLabel = formatFullDateWithWeekday(qt.qtDate);
  const timeLabel = dateLabel
    ? `새벽기도 말씀요약 · ${dateLabel}`
    : "새벽기도 말씀요약";

  const rawBody = detailContent || qt.content || "";
  const body = stripHtmlToText(rawBody);
  const summary = extractDailyQtPreview(body);

  return {
    id: `dawn-${qt.id}`,
    timeLabel,
    dateLabel,
    fullDateLabel,
    title: qt.bibleText || qt.title || "새벽기도 말씀요약",
    summary,
    body,
    href: `/dawn?id=${qt.id}`,
  };
}
