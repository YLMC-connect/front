import type { Group } from "./group";
import type { LifeStudyCourse } from "./lifeStudy";
import type { MarketItem } from "./market";
import type { PrayerRoom } from "./prayer";

export interface MyPageFaq {
  question: string;
  answer: string;
}

export interface MyPageData {
  marketItems: MarketItem[];
  groups: Group[];
  lifeStudyCourses: LifeStudyCourse[];
  prayerRooms: PrayerRoom[];
  favoriteTitles: string[];
  faqs: MyPageFaq[];
}

export type MyPageActivityTone = "mute" | "primary" | "warn";

/** 활동 화면 나눔 행. 화면이 그리는 값만 둔다. */
export interface MyPageActivityPost {
  id: string;
  thumb: number;
  title: string;
  status: string;
  tone: MyPageActivityTone;
  date: string;
}

/** 활동 화면 댓글 행. */
export interface MyPageActivityComment {
  id: string;
  content: string;
  src: string;
  date: string;
}

/** 활동 화면 소모임 행. */
export interface MyPageActivityGroup {
  id: string;
  name: string;
  members: number;
  joined: string;
  seed: number;
}

/** 화면 목록. currentPage는 응답 기준 1부터이고 nextPage는 다음 요청 0-based page다. */
export interface MyPageActivityList<T> {
  items: T[];
  currentPage: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  nextPage: number | null;
}
