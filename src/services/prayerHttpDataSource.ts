import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import { MOCK_USER } from "../mocks/auth";
import { mockPrayerRooms } from "../mocks/prayers";
import type { PrayerTopicInput } from "../types/prayer";
import type {
  PrayerAnswerRequest,
  PrayerApplicationCreateRequest,
  PrayerTopicWriteRequest,
} from "../types/prayerApi";
import type { PrayerDataSource } from "./prayerService";
import {
  buildPrayerOverview,
  readPrayerApplications,
  readPrayerCategories,
  readPrayerCohortDetail,
  readPrayerCohorts,
  readPrayerCohortStatus,
  readPrayerHistory,
  readPrayerTopicBoard,
  readPrayerTopics,
  requireCreatedId,
  requirePrayerCohortStatus,
} from "./prayerMapper";

type PrayerApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

export function createHttpPrayerDataSource({
  client = apiClient,
}: {
  client?: PrayerApiClient;
} = {}): PrayerDataSource {
  return {
    async getOverview() {
      const myCohorts = readPrayerCohorts(
        await client.request("/api/prayer/cohorts/my"),
      );
      const topics = readPrayerTopics(
        await client.request("/api/prayer/topics/my"),
      );
      return buildPrayerOverview(myCohorts, topics);
    },

    // 작성 화면은 categoryId가 없고 roomId·isAnonymous는 등록 요청 필드가 아니다.
    async createPrayerTopic(input: PrayerTopicInput) {
      const room = mockPrayerRooms.find(
        (candidate) => candidate.id === input.roomId,
      );
      if (!room) throw new Error("존재하지 않는 기도방입니다.");
      return {
        id: `prayer-topic-${Date.now()}`,
        ...input,
        author: MOCK_USER,
        prayerCount: 0,
        hasPrayed: false,
        isAnswered: false,
        createdAt: new Date().toISOString(),
      };
    },

    async getMyCohorts() {
      return readPrayerCohorts(await client.request("/api/prayer/cohorts/my"));
    },

    async getOpenCohorts() {
      return readPrayerCohorts(
        await client.request("/api/prayer/cohorts/open"),
      );
    },

    async getCohort(cohortId) {
      return readPrayerCohortDetail(
        await client.request(`/api/prayer/cohorts/${cohortId}`),
      );
    },

    async getCohortStatus(cohortId) {
      return readPrayerCohortStatus(
        await client.request(`/api/prayer/cohorts/${cohortId}/status`),
      );
    },

    async completeCohort(cohortId) {
      return requirePrayerCohortStatus(
        await client.request(`/api/prayer/cohorts/${cohortId}/completion`, {
          method: "POST",
        }),
      );
    },

    async cancelCohortCompletion(cohortId) {
      return requirePrayerCohortStatus(
        await client.request(`/api/prayer/cohorts/${cohortId}/completion`, {
          method: "DELETE",
        }),
      );
    },

    async likeCompletion(completionId) {
      await client.request(`/api/prayer/completions/${completionId}/like`, {
        method: "POST",
      });
    },

    async unlikeCompletion(completionId) {
      await client.request(`/api/prayer/completions/${completionId}/like`, {
        method: "DELETE",
      });
    },

    async getMyApplications() {
      return readPrayerApplications(
        await client.request("/api/prayer/applications/my"),
      );
    },

    async createApplication(input: PrayerApplicationCreateRequest) {
      const body: Record<string, unknown> = {
        yoil: input.yoil,
        timeSlot: input.timeSlot,
      };
      if (input.applicantName !== undefined) {
        body.applicantName = input.applicantName;
      }
      if (input.applicantPhone !== undefined) {
        body.applicantPhone = input.applicantPhone;
      }
      if (input.applyMemo !== undefined) body.applyMemo = input.applyMemo;
      return requireCreatedId(
        await client.request("/api/prayer/applications", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
    },

    async cancelApplication(applicationId) {
      await client.request(`/api/prayer/applications/${applicationId}`, {
        method: "DELETE",
      });
    },

    async getMyHistory() {
      return readPrayerHistory(await client.request("/api/prayer/me/history"));
    },

    async getCategories() {
      return readPrayerCategories(
        await client.request("/api/prayer/categories"),
      );
    },

    async getTopicBoard() {
      return readPrayerTopicBoard(
        await client.request("/api/prayer/topics/board"),
      );
    },

    async getMyTopics() {
      return readPrayerTopics(await client.request("/api/prayer/topics/my"));
    },

    async createTopic(input: PrayerTopicWriteRequest) {
      return requireCreatedId(
        await client.request("/api/prayer/topics", {
          method: "POST",
          body: JSON.stringify({
            categoryId: input.categoryId,
            title: input.title,
            content: input.content,
          }),
        }),
      );
    },

    async updateTopic(topicId, input) {
      await client.request(`/api/prayer/topics/${topicId}`, {
        method: "PUT",
        body: JSON.stringify({
          categoryId: input.categoryId,
          title: input.title,
          content: input.content,
        }),
      });
    },

    async deleteTopic(topicId) {
      await client.request(`/api/prayer/topics/${topicId}`, {
        method: "DELETE",
      });
    },

    async requestTopicAnswer(topicId, input: PrayerAnswerRequest) {
      await client.request(`/api/prayer/topics/${topicId}/answer-request`, {
        method: "POST",
        body: JSON.stringify({ answerContent: input.answerContent }),
      });
    },
  };
}

export const httpPrayerDataSource = createHttpPrayerDataSource();
