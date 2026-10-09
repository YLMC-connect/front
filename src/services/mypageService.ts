import Constants from "expo-constants";
import {
  mockActivityComments,
  mockActivityGroups,
  mockActivityPosts,
} from "../mocks/mypageActivity";
import type {
  MyPageActivityComment,
  MyPageActivityGroup,
  MyPageActivityList,
  MyPageActivityPost,
} from "../types/mypage";
import type {
  MyPageActivityPageQuery,
  MyPageGroupPageQuery,
  MyPageLifeStudyHistoryDto,
  MyPagePrayerHistoryDto,
} from "../types/mypageApi";
import { httpMyPageDataSource } from "./mypageHttpDataSource";

export interface MyPageActivityDataSource {
  getPosts(
    query?: MyPageActivityPageQuery,
  ): Promise<MyPageActivityList<MyPageActivityPost>>;
  getComments(
    query?: MyPageActivityPageQuery,
  ): Promise<MyPageActivityList<MyPageActivityComment>>;
  getGroups(
    query?: MyPageGroupPageQuery,
  ): Promise<MyPageActivityList<MyPageActivityGroup>>;
  getLifeStudies(): Promise<MyPageLifeStudyHistoryDto>;
  getPrayers(): Promise<MyPagePrayerHistoryDto>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

function localList<T>(items: readonly T[]): MyPageActivityList<T> {
  return {
    items: [...items],
    currentPage: 1,
    size: items.length > 0 ? items.length : 10,
    totalElements: items.length,
    totalPages: items.length > 0 ? 1 : 0,
    hasNext: false,
    nextPage: null,
  };
}

const emptyLifeStudyHistory: MyPageLifeStudyHistoryDto = {
  completionCount: 0,
  applications: [],
  ongoing: [],
  completed: [],
};

const emptyPrayerHistory: MyPagePrayerHistoryDto = {
  activeCount: 0,
  totalPeriod: "",
  totalPeriodDays: 0,
  totalRoomCount: 0,
  currentActivities: [],
  pastActivities: [],
};

const mockMyPageDataSource: MyPageActivityDataSource = {
  async getPosts() {
    await delay();
    return localList(mockActivityPosts);
  },

  async getComments() {
    await delay();
    return localList(mockActivityComments);
  },

  async getGroups() {
    await delay();
    return localList(mockActivityGroups);
  },

  async getLifeStudies() {
    await delay();
    return {
      ...emptyLifeStudyHistory,
      applications: [],
      ongoing: [],
      completed: [],
    };
  },

  async getPrayers() {
    await delay();
    return {
      ...emptyPrayerHistory,
      currentActivities: [],
      pastActivities: [],
    };
  },
};

export function createMyPageService(dataSource: MyPageActivityDataSource) {
  return {
    fetchPosts: (query?: MyPageActivityPageQuery) => dataSource.getPosts(query),
    fetchComments: (query?: MyPageActivityPageQuery) =>
      dataSource.getComments(query),
    fetchGroups: (query?: MyPageGroupPageQuery) => dataSource.getGroups(query),
    fetchLifeStudies: () => dataSource.getLifeStudies(),
    fetchPrayers: () => dataSource.getPrayers(),
  };
}

export function resolveMyPageAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_MYPAGE_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.mypageAdapter === "http"
    ? "http"
    : "mock";
}

export function readLocalMyPageActivity() {
  return {
    posts: mockActivityPosts,
    comments: mockActivityComments,
    groups: mockActivityGroups,
  };
}

const myPageService = createMyPageService(
  resolveMyPageAdapterMode() === "http"
    ? httpMyPageDataSource
    : mockMyPageDataSource,
);

export const fetchMyPageActivityPosts = myPageService.fetchPosts;
export const fetchMyPageActivityComments = myPageService.fetchComments;
export const fetchMyPageActivityGroups = myPageService.fetchGroups;
export const fetchMyPageActivityLifeStudies = myPageService.fetchLifeStudies;
export const fetchMyPageActivityPrayers = myPageService.fetchPrayers;
