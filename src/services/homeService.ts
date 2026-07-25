import {
  buildHomeDailyPrayer,
  homeDawnPrayer,
} from "../mocks/home";
import type { HomeDawnPrayer, HomeOverview } from "../types/home";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchHomeOverview(
  date: Date = new Date(),
): Promise<HomeOverview> {
  await delay();
  return {
    dailyPrayer: buildHomeDailyPrayer(date),
    dawnPrayer: homeDawnPrayer,
  };
}

export async function fetchDawnPrayerDetail(): Promise<HomeDawnPrayer> {
  await delay();
  return homeDawnPrayer;
}
