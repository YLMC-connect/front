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
}

export function createMyPageService(dataSource: MyPageActivityDataSource) {
  return {
    fetchPosts: (query?: MyPageActivityPageQuery) => dataSource.getPosts(query),
    fetchComments: (query?: MyPageActivityPageQuery) =>
      dataSource.getComments(query),
    fetchGroups: (query?: MyPageGroupPageQuery) => dataSource.getGroups(query),
    fetchLifeStudies: () => dataSource.getLifeStudies(),
  };
}

const myPageService = createMyPageService(httpMyPageDataSource);

export const fetchMyPageActivityPosts = myPageService.fetchPosts;
export const fetchMyPageActivityComments = myPageService.fetchComments;
export const fetchMyPageActivityGroups = myPageService.fetchGroups;
export const fetchMyPageActivityLifeStudies = myPageService.fetchLifeStudies;
