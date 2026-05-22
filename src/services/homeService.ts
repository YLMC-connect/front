import { homeNotices } from "../mocks/home";
import { mockGroups } from "../mocks/groups";
import { mockMarketItems } from "../mocks/market";

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchHome() {
  await delay();
  return {
    notices: homeNotices,
    recentMarketItems: mockMarketItems.slice(0, 4),
    recommendedGroups: mockGroups.slice(0, 3),
    notificationCount: 3,
  };
}
