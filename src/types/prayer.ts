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
