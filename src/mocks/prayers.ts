import { MOCK_MEMBERS, MOCK_USER } from "./auth";
import type { PrayerRoom, PrayerTopic } from "../types/prayer";

export const mockPrayerRooms: PrayerRoom[] = [
  {
    id: "prayer-room-001",
    title: "월요 중보기도방",
    weekday: "mon",
    description: "한 주를 시작하며 가정과 교회를 위해 함께 기도합니다.",
    leader: MOCK_MEMBERS[3],
    memberCount: 18,
    isJoined: true,
  },
  {
    id: "prayer-room-002",
    title: "수요 치유와 회복 기도방",
    weekday: "wed",
    description: "아픈 성도와 회복이 필요한 가정을 위해 기도합니다.",
    leader: MOCK_MEMBERS[4],
    memberCount: 12,
    isJoined: false,
  },
  {
    id: "prayer-room-003",
    title: "금요 선교 중보기도방",
    weekday: "fri",
    description: "선교지와 다음 세대를 위해 마음을 모읍니다.",
    leader: MOCK_MEMBERS[5],
    memberCount: 21,
    isJoined: true,
  },
];

export const mockPrayerTopics: PrayerTopic[] = [
  {
    id: "prayer-topic-001",
    roomId: "prayer-room-001",
    title: "수술을 앞둔 어머니를 위해 기도해주세요",
    content:
      "다음 주 수술이 안전하게 진행되고 마음이 평안하도록 기도 부탁드립니다.",
    author: MOCK_USER,
    isAnonymous: false,
    prayerCount: 24,
    hasPrayed: true,
    isAnswered: false,
    createdAt: "2026-05-22T07:30:00.000Z",
  },
  {
    id: "prayer-topic-002",
    roomId: "prayer-room-001",
    title: "진로를 준비하는 자녀를 위해",
    content:
      "가정 안에서 지혜롭게 대화하고 좋은 길로 인도받도록 함께 기도해주세요.",
    author: MOCK_MEMBERS[1],
    isAnonymous: true,
    prayerCount: 16,
    hasPrayed: false,
    isAnswered: false,
    createdAt: "2026-05-21T12:00:00.000Z",
  },
  {
    id: "prayer-topic-003",
    roomId: "prayer-room-003",
    title: "단기선교 준비팀 건강을 위해",
    content: "출발 전까지 모든 팀원이 건강하게 준비하도록 기도합니다.",
    author: MOCK_MEMBERS[2],
    isAnonymous: false,
    prayerCount: 31,
    hasPrayed: false,
    isAnswered: true,
    answer: "필요한 재정이 채워졌습니다. 함께 기도해주셔서 감사합니다.",
    createdAt: "2026-05-20T09:15:00.000Z",
  },
];
