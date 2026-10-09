import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import type {
  MyPageActivityPageQuery,
  MyPageGroupPageQuery,
} from "../types/mypageApi";
import {
  MY_PAGE_COMMENT_SORT,
  MY_PAGE_POST_SORT,
  normalizeMyPageActivityQuery,
  normalizeMyPageGroupQuery,
  readMyPageCommentList,
  readMyPageGroupList,
  readMyPageLifeStudyHistory,
  readMyPagePostList,
  readMyPagePrayerHistory,
} from "./mypageMapper";
import type { MyPageActivityDataSource } from "./mypageService";

type MyPageApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

const postsPath = "/api/mypage/activities/posts";
const commentsPath = "/api/mypage/activities/comments";
const groupsPath = "/api/mypage/activities/groups";
const lifeStudiesPath = "/api/mypage/activities/life-studies";
const prayersPath = "/api/mypage/activities/prayers";

function withPageQuery(
  path: string,
  query: { page: number; size: number; sort: string },
  type?: string,
) {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    sort: query.sort,
  });
  if (type) params.set("type", type);
  return `${path}?${params.toString()}`;
}

export function createHttpMyPageDataSource({
  client = apiClient,
}: {
  client?: MyPageApiClient;
} = {}): MyPageActivityDataSource {
  return {
    async getPosts(query?: MyPageActivityPageQuery) {
      const page = normalizeMyPageActivityQuery(query, MY_PAGE_POST_SORT);
      return readMyPagePostList(
        await client.request<unknown>(withPageQuery(postsPath, page)),
      );
    },

    async getComments(query?: MyPageActivityPageQuery) {
      const page = normalizeMyPageActivityQuery(query, MY_PAGE_COMMENT_SORT);
      return readMyPageCommentList(
        await client.request<unknown>(withPageQuery(commentsPath, page)),
      );
    },

    async getGroups(query?: MyPageGroupPageQuery) {
      const page = normalizeMyPageGroupQuery(query);
      return readMyPageGroupList(
        await client.request<unknown>(
          withPageQuery(groupsPath, page, page.type),
        ),
      );
    },

    async getLifeStudies() {
      return readMyPageLifeStudyHistory(
        await client.request<unknown>(lifeStudiesPath),
      );
    },

    async getPrayers() {
      return readMyPagePrayerHistory(
        await client.request<unknown>(prayersPath),
      );
    },
  };
}

export const httpMyPageDataSource = createHttpMyPageDataSource();
