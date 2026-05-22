import { mockMarketItems } from "../mocks/market";
import { MOCK_USER } from "../mocks/auth";
import type {
  MarketCategory,
  MarketInput,
  MarketItem,
  MarketStatus,
} from "../types/market";

let marketItems: MarketItem[] = [...mockMarketItems];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMarketItems(
  filter: MarketCategory = "all",
): Promise<MarketItem[]> {
  await delay();
  if (filter === "all") return marketItems;
  return marketItems.filter((item) => item.category === filter);
}

export async function fetchMarketItem(id: string): Promise<MarketItem> {
  await delay();
  const item = marketItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error("존재하지 않는 나눔입니다.");
  return item;
}

export async function createMarketItem(
  input: MarketInput,
): Promise<MarketItem> {
  await delay();

  const activeOwnedCount = marketItems.filter(
    (item) => item.owner.id === MOCK_USER.id && item.status !== "done",
  ).length;

  if (activeOwnedCount >= 5) {
    throw new Error("진행 중인 나눔은 최대 5개까지 등록할 수 있습니다.");
  }

  if (input.images.length === 0) {
    throw new Error("나눔 사진을 1장 이상 등록해주세요.");
  }

  const item: MarketItem = {
    id: `market-${Date.now()}`,
    ...input,
    status: "sharing",
    owner: MOCK_USER,
    createdAt: new Date().toISOString(),
    comments: [],
    liked: false,
  };
  marketItems = [item, ...marketItems];
  return item;
}

export async function toggleMarketLike(id: string): Promise<MarketItem> {
  await delay();
  marketItems = marketItems.map((item) =>
    item.id === id ? { ...item, liked: !item.liked } : item,
  );
  return fetchMarketItem(id);
}

export async function updateMarketStatus(
  id: string,
  status: MarketStatus,
): Promise<MarketItem> {
  await delay();
  marketItems = marketItems.map((item) =>
    item.id === id ? { ...item, status } : item,
  );
  return fetchMarketItem(id);
}

export async function addMarketComment(
  id: string,
  content: string,
): Promise<MarketItem> {
  await delay();
  marketItems = marketItems.map((item) =>
    item.id === id
      ? {
          ...item,
          comments: [
            ...item.comments,
            {
              id: `comment-${Date.now()}`,
              author: MOCK_USER,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      : item,
  );
  return fetchMarketItem(id);
}

export async function reportMarketItem(
  id: string,
  reason: string,
): Promise<{ ok: true; reason: string }> {
  await delay();
  await fetchMarketItem(id);
  return { ok: true, reason };
}
