import { httpHomeDataSource } from "./homeHttpDataSource";
import {
  buildHomeDailyPrayer,
  mapDailyQtToDawnPrayer,
  mapSermonToSundaySermon,
  toWeekdayTopicNumber,
} from "./homeMapper";
import type { HomeDawnPrayer, HomeOverview } from "../types/home";

export async function fetchHomeOverview(
  date: Date = new Date(),
): Promise<HomeOverview> {
  const [sermonsRes, qtsRes, weekdayRes] = await Promise.allSettled([
    httpHomeDataSource.fetchSermons({ page: 1, size: 1 }),
    httpHomeDataSource.fetchDailyQts({ page: 1, size: 1 }),
    httpHomeDataSource.fetchWeekdayPrayers(toWeekdayTopicNumber(date)),
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

  // 요일별 기도가 실패하거나 비면 카드만 숨긴다
  const dailyPrayer =
    weekdayRes.status === "fulfilled"
      ? buildHomeDailyPrayer(weekdayRes.value, date)
      : null;

  return {
    dailyPrayer,
    dawnPrayer,
    sundaySermon,
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
    throw new Error("등록된 새벽기도 말씀요약이 없어요.");
  }

  const detail = await httpHomeDataSource.fetchDailyQtDetail(targetId);
  return mapDailyQtToDawnPrayer(detail, detail.content);
}

/** 이전·다음 날짜를 찾을 때 훑는 최근 말씀요약 수. */
const DAWN_NEIGHBOR_PAGE_SIZE = 30;

/**
 * 이 말씀요약의 바로 이전 날짜·다음 날짜 id. 최근 목록 한 페이지 안에서 날짜순으로 찾고,
 * 없으면 null 이다(화면은 그쪽 화살표를 비활성으로 둔다).
 */
export async function fetchDawnPrayerNeighbors(
  id: number | string,
): Promise<{ prevId: number | null; nextId: number | null }> {
  const list = await httpHomeDataSource.fetchDailyQts({
    page: 1,
    size: DAWN_NEIGHBOR_PAGE_SIZE,
  });
  const items = [...(list.content ?? [])].sort((a, b) =>
    a.qtDate.localeCompare(b.qtDate),
  );
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index < 0) return { prevId: null, nextId: null };
  return {
    prevId: items[index - 1]?.id ?? null,
    nextId: items[index + 1]?.id ?? null,
  };
}
