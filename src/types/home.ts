import type { PrayerWeekday } from "./prayer";

/** Weekday used on home; weekend has its own copy. */
export type HomeWeekday = PrayerWeekday | "sat" | "sun";

export interface HomeNotice {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export interface HomeDailyPrayer {
  dateLabel: string;
  weekday: HomeWeekday;
  weekdayLabel: string;
  title: string;
  summary: string;
  href: string;
}

export interface HomeDawnPrayer {
  id: string;
  title: string;
  summary: string;
  timeLabel: string;
  body: string;
  href: string;
}

export interface HomeOverview {
  dailyPrayer: HomeDailyPrayer;
  dawnPrayer: HomeDawnPrayer;
}
