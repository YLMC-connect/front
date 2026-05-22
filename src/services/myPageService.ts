import { MOCK_USER } from "../mocks/auth";
import { mockGroups } from "../mocks/groups";
import { mockLifeStudyCourses } from "../mocks/lifeStudy";
import { mockMarketItems } from "../mocks/market";
import { mockPrayerRooms } from "../mocks/prayers";
import type { MyPageData } from "../types/mypage";

const delay = (ms = 160) => new Promise((resolve) => setTimeout(resolve, ms));

const faqs = [
  {
    question: "회원 정보가 교회 DB와 다르게 보이면 어떻게 하나요?",
    answer:
      "관리자 확인이 필요한 항목입니다. 교회 사무실 또는 앱 문의로 수정 요청을 남겨주세요.",
  },
  {
    question: "나눔 완료 글은 언제 숨겨지나요?",
    answer:
      "Notion 기획 기준으로 완료 후 30일 뒤 자동 숨김, 미완료 글은 90일 뒤 비활성 처리 예정입니다.",
  },
];

export async function fetchMyPage(): Promise<MyPageData> {
  await delay();

  const marketItems = mockMarketItems.filter(
    (item) => item.liked || item.owner.id === MOCK_USER.id,
  );
  const groups = mockGroups.filter(
    (group) => group.isJoined || group.isFavorite,
  );
  const lifeStudyCourses = mockLifeStudyCourses.filter(
    (course) => course.isEnrolled || course.isCompleted,
  );
  const prayerRooms = mockPrayerRooms.filter((room) => room.isJoined);
  const favoriteTitles = [
    ...mockMarketItems.filter((item) => item.liked).map((item) => item.title),
    ...mockGroups
      .filter((group) => group.isFavorite)
      .map((group) => group.name),
  ];

  return {
    marketItems,
    groups,
    lifeStudyCourses,
    prayerRooms,
    favoriteTitles,
    faqs,
  };
}
