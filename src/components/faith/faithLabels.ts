import type { LifeStudyOverviewStatus } from "../../types/lifeStudy";
import type {
  PrayerOverviewRoomStatus,
  PrayerPeriod,
  PrayerRequestStatus,
  PrayerWeekday,
} from "../../types/prayer";

export const weekdayLabels: Record<
  PrayerWeekday,
  { short: string; long: string }
> = {
  mon: { short: "월", long: "월요일" },
  tue: { short: "화", long: "화요일" },
  wed: { short: "수", long: "수요일" },
  thu: { short: "목", long: "목요일" },
  fri: { short: "금", long: "금요일" },
};

export const periodLabels: Record<PrayerPeriod, string> = {
  morning: "오전",
  afternoon: "오후",
};

export const roomStatusLabels: Record<PrayerOverviewRoomStatus, string> = {
  joined: "참여중",
  pending: "승인 대기",
};

export const requestStatusLabels: Record<PrayerRequestStatus, string> = {
  reviewing: "검토중",
  published: "공개중",
  rejected: "반려",
  answerRequested: "응답 요청",
  answered: "응답됨",
  hidden: "숨김",
};

export const lifeStudyStatusLabels: Record<LifeStudyOverviewStatus, string> = {
  completed: "수료",
  recommended: "추천",
  pending: "대기",
};
