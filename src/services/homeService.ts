import { httpHomeDataSource } from "./homeHttpDataSource";
import {
  buildHomeDailyPrayer,
  buildHomeProgressSteps,
  buildHomeTodos,
  mapDailyQtToDawnPrayer,
  mapSermonToSundaySermon,
} from "./homeMapper";
import type { HomeDawnPrayer, HomeOverview } from "../types/home";

export async function fetchHomeOverview(
  date: Date = new Date(),
): Promise<HomeOverview> {
  const dailyPrayer = buildHomeDailyPrayer(date);

  const [sermonsRes, qtsRes] = await Promise.allSettled([
    httpHomeDataSource.fetchSermons({ page: 1, size: 1 }),
    httpHomeDataSource.fetchDailyQts({ page: 1, size: 1 }),
  ]);

  if (sermonsRes.status === "rejected" && qtsRes.status === "rejected") {
    throw sermonsRes.reason;
  }

  const sundaySermon =
    sermonsRes.status === "fulfilled" && sermonsRes.value.content?.[0]
      ? mapSermonToSundaySermon(sermonsRes.value.content[0])
      : null;

  let dawnPrayer: HomeDawnPrayer | null = null;
  if (qtsRes.status === "fulfilled" && qtsRes.value.content?.[0]) {
    const latestQt = qtsRes.value.content[0];
    let detailContent = latestQt.content;
    if (!detailContent && latestQt.id != null) {
      const detail = await httpHomeDataSource
        .fetchDailyQtDetail(latestQt.id)
        .catch(() => null);
      detailContent = detail?.content ?? null;
    }
    dawnPrayer = mapDailyQtToDawnPrayer(latestQt, detailContent);
  }

  return {
    dailyPrayer,
    dawnPrayer,
    sundaySermon,
    todos: buildHomeTodos(dailyPrayer, dawnPrayer),
    progressSteps: buildHomeProgressSteps(),
  };
}

export async function fetchDawnPrayerDetail(
  id?: number | string,
): Promise<HomeDawnPrayer> {
  let targetId = id;
  if (!targetId) {
    const list = await httpHomeDataSource.fetchDailyQts({ page: 1, size: 1 });
    targetId = list.content?.[0]?.id;
  }
  if (!targetId) {
    throw new Error("등록된 새벽기도 말씀요약이 없습니다.");
  }

  const detail = await httpHomeDataSource.fetchDailyQtDetail(targetId);
  return mapDailyQtToDawnPrayer(detail, detail.content);
}
