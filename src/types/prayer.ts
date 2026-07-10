import type { Member } from "./common";

export type PrayerWeekday = "mon" | "tue" | "wed" | "thu" | "fri";

export interface PrayerRoom {
  id: string;
  title: string;
  weekday: PrayerWeekday;
  description: string;
  leader: Member;
  memberCount: number;
  isJoined: boolean;
}

export interface PrayerTopic {
  id: string;
  roomId: string;
  title: string;
  content: string;
  author: Member;
  isAnonymous: boolean;
  prayerCount: number;
  hasPrayed: boolean;
  isAnswered: boolean;
  answer?: string;
  createdAt: string;
}

export interface PrayerRoomDetail extends PrayerRoom {
  topics: PrayerTopic[];
}

export interface PrayerTopicInput {
  roomId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
}

export type PrayerOverviewRoomStatus = "joined" | "pending";
export type PrayerRequestStatus = "reviewing" | "published" | "rejected";
export type PrayerPeriod = "morning" | "afternoon";

export interface PrayerOverviewRoom {
  id: string;
  weekday: PrayerWeekday;
  period: PrayerPeriod;
  memberCount: number;
  completedCount?: number;
  participationRate?: number;
  status: PrayerOverviewRoomStatus;
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
