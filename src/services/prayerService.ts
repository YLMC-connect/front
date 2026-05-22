import { MOCK_USER } from "../mocks/auth";
import { mockPrayerRooms, mockPrayerTopics } from "../mocks/prayers";
import type {
  PrayerRoom,
  PrayerRoomDetail,
  PrayerTopic,
  PrayerTopicInput,
  PrayerWeekday,
} from "../types/prayer";

let rooms: PrayerRoom[] = [...mockPrayerRooms];
let topics: PrayerTopic[] = [...mockPrayerTopics];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPrayerRooms(
  filter: PrayerWeekday | "all" = "all",
): Promise<PrayerRoom[]> {
  await delay();
  if (filter === "all") return rooms;
  return rooms.filter((room) => room.weekday === filter);
}

export async function fetchPrayerRoom(id: string): Promise<PrayerRoomDetail> {
  await delay();
  const room = rooms.find((candidate) => candidate.id === id);
  if (!room) throw new Error("존재하지 않는 기도방입니다.");
  return {
    ...room,
    topics: topics.filter((topic) => topic.roomId === id),
  };
}

export async function joinPrayerRoom(id: string): Promise<PrayerRoomDetail> {
  await delay();
  rooms = rooms.map((room) =>
    room.id === id && !room.isJoined
      ? { ...room, isJoined: true, memberCount: room.memberCount + 1 }
      : room,
  );
  return fetchPrayerRoom(id);
}

export async function leavePrayerRoom(id: string): Promise<PrayerRoomDetail> {
  await delay();
  rooms = rooms.map((room) =>
    room.id === id && room.isJoined
      ? {
          ...room,
          isJoined: false,
          memberCount: Math.max(0, room.memberCount - 1),
        }
      : room,
  );
  return fetchPrayerRoom(id);
}

export async function createPrayerTopic(
  input: PrayerTopicInput,
): Promise<PrayerTopic> {
  await delay();
  await fetchPrayerRoom(input.roomId);

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

export async function markPrayerTopicPrayed(id: string): Promise<PrayerTopic> {
  await delay();
  topics = topics.map((topic) =>
    topic.id === id && !topic.hasPrayed
      ? { ...topic, hasPrayed: true, prayerCount: topic.prayerCount + 1 }
      : topic,
  );
  const topic = topics.find((candidate) => candidate.id === id);
  if (!topic) throw new Error("존재하지 않는 기도제목입니다.");
  return topic;
}

export async function recordPrayerAnswer(
  id: string,
  answer: string,
): Promise<PrayerTopic> {
  await delay();
  topics = topics.map((topic) =>
    topic.id === id ? { ...topic, isAnswered: true, answer } : topic,
  );
  const topic = topics.find((candidate) => candidate.id === id);
  if (!topic) throw new Error("존재하지 않는 기도제목입니다.");
  return topic;
}
