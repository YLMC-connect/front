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

const myPageService = createMyPageService(httpMyPageDataSource);

export const fetchMyPageActivityPosts = myPageService.fetchPosts;
export const fetchMyPageActivityComments = myPageService.fetchComments;
export const fetchMyPageActivityGroups = myPageService.fetchGroups;
export const fetchMyPageActivityLifeStudies = myPageService.fetchLifeStudies;
export const fetchMyPageActivityPrayers = myPageService.fetchPrayers;
