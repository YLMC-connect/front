import { mockMarketDetails, mockMarketOverview } from "../mocks/market";
import type { MarketDetail, MarketOverview } from "../types/market";

export interface MarketDataSource {
  getOverview(): Promise<MarketOverview>;
  getDetail(id: string): Promise<MarketDetail>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockMarketDataSource: MarketDataSource = {
  async getOverview() {
    await delay();
    return mockMarketOverview;
  },
  async getDetail(id) {
    await delay();
    const detail = mockMarketDetails[id];
    if (!detail) throw new Error("존재하지 않는 나눔입니다.");
    return detail;
  },
};

export function createMarketService(dataSource: MarketDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchDetail: (id: string) => dataSource.getDetail(id),
  };
}

const marketService = createMarketService(mockMarketDataSource);

export const fetchMarketOverview = marketService.fetchOverview;
export const fetchMarketDetail = marketService.fetchDetail;
