export type PrayerWeekday = "mon" | "tue" | "wed" | "thu" | "fri";

export type PrayerOverviewRoomStatus = "joined" | "pending";
export type PrayerRequestStatus =
  | "reviewing"
  | "published"
  | "rejected"
  | "answerRequested"
  | "answered"
  | "hidden";
export type PrayerPeriod = "morning" | "afternoon";

export interface PrayerOverviewRoom {
  id: string;
  /** 서버 기도방 이름. mock 행에는 없다. */
  title?: string;
  weekday: PrayerWeekday;
  period: PrayerPeriod;
  memberCount: number;
  completedCount?: number;
  participationRate?: number;
  status: PrayerOverviewRoomStatus;
  /** 승인 대기 행의 참여 신청 ID. 신청 취소에 쓴다. */
  applicationId?: string;
}

export interface PrayerRequestSummary {
  id: string;
  title: string;
  category: string;
  status: PrayerRequestStatus;
  description: string;
}

export interface PrayerOverview {
  rooms: readonly PrayerOverviewRoom[];
  requests: readonly PrayerRequestSummary[];
}
