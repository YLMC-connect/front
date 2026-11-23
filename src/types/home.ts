import type { PrayerWeekday } from "./prayer";

/** 홈 기준 요일(일요일 포함). */
export type HomeWeekday = PrayerWeekday | "sun";

export interface HomeDailyPrayerItem {
  id: string;
  title: string;
  /** 요약. 없으면 빈 글자. */
  summary: string;
  /** 기도 내용(상세). 없으면 빈 글자. */
  content: string;
}

/** 오늘 요일의 요일별 기도(관리자가 등록). 노출 순서대로 하나 이상. */
export interface HomeDailyPrayer {
  dateLabel: string;
  weekday: HomeWeekday;
  weekdayLabel: string;
  items: readonly HomeDailyPrayerItem[];
}

export interface HomeDawnPrayer {
  id: string;
  title: string;
  summary: string;
  timeLabel: string;
  dateLabel?: string;
  fullDateLabel?: string;
  body: string;
  href: string;
}

export interface HomeSundaySermon {
  id: string;
  timeLabel: string;
  dateLabel?: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface HomeOverview {
  /** 오늘 요일 기도가 없거나 불러오지 못하면 null(카드를 숨긴다). */
  dailyPrayer: HomeDailyPrayer | null;
  dawnPrayer: HomeDawnPrayer | null;
  sundaySermon: HomeSundaySermon | null;
}
