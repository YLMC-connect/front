import { apiClient } from "../lib/apiClient";
import type {
  DailyQtResponse,
  PageResponse,
  SermonResponse,
} from "../types/homeApi";

export type HomeApiClient = {
  request<T>(
    path: string,
    options?: { auth?: boolean; method?: string; body?: string },
  ): Promise<T | null>;
};

export interface HomeDataSource {
  fetchSermons(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<SermonResponse>>;
  fetchDailyQts(params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<DailyQtResponse>>;
  fetchDailyQtDetail(id: number | string): Promise<DailyQtResponse>;
}

const emptyPage = <T>(): PageResponse<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 1,
  size: 10,
  hasNext: false,
});

export function createHttpHomeDataSource(
  client: HomeApiClient = apiClient,
): HomeDataSource {
  return {
    async fetchSermons(
      params = { page: 1, size: 10 },
    ): Promise<PageResponse<SermonResponse>> {
      const page = params.page ?? 1;
      const size = params.size ?? 10;
      const data = await client.request<PageResponse<SermonResponse>>(
        `/api/sermons?page=${page}&size=${size}`,
        { auth: false, method: "GET" },
      );
      return data ?? emptyPage<SermonResponse>();
    },

    async fetchDailyQts(
      params = { page: 1, size: 10 },
    ): Promise<PageResponse<DailyQtResponse>> {
      const page = params.page ?? 1;
      const size = params.size ?? 10;
      const data = await client.request<PageResponse<DailyQtResponse>>(
        `/api/daily-qt?page=${page}&size=${size}`,
        { auth: false, method: "GET" },
      );
      return data ?? emptyPage<DailyQtResponse>();
    },

    async fetchDailyQtDetail(id: number | string): Promise<DailyQtResponse> {
      const data = await client.request<DailyQtResponse>(
        `/api/daily-qt/${id}`,
        {
          auth: false,
          method: "GET",
        },
      );
      if (!data) {
        throw new Error(`큐티(${id}) 정보를 불러올 수 없습니다.`);
      }
      return data;
    },
  };
}

export const httpHomeDataSource = createHttpHomeDataSource();
