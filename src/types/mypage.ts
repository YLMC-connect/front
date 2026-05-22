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
