import { MOCK_USER } from "../mocks/auth";
import {
  mockPrayerOverview,
  mockPrayerRooms,
  mockPrayerTopics,
} from "../mocks/prayers";
import type {
  PrayerOverview,
  PrayerTopic,
  PrayerTopicInput,
} from "../types/prayer";

const rooms = [...mockPrayerRooms];
let topics: PrayerTopic[] = [...mockPrayerTopics];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPrayerOverview(): Promise<PrayerOverview> {
  await delay();
  return mockPrayerOverview;
}

async function ensurePrayerRoom(id: string) {
  await delay();
  const room = rooms.find((candidate) => candidate.id === id);
  if (!room) throw new Error("존재하지 않는 기도방입니다.");
}

export async function createPrayerTopic(
  input: PrayerTopicInput,
): Promise<PrayerTopic> {
  await delay();
  await ensurePrayerRoom(input.roomId);

  const topic: PrayerTopic = {
    id: `prayer-topic-${Date.now()}`,
    ...input,
    author: MOCK_USER,
    prayerCount: 0,
    hasPrayed: false,
    isAnswered: false,
    createdAt: new Date().toISOString(),
  };
  topics = [topic, ...topics];
  return topic;
}
