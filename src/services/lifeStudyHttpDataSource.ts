import { apiClient, type ApiRequestOptions } from "../lib/apiClient";
import type { LifeStudyStatus } from "../types/lifeStudy";
import type { LifeStudyDataSource } from "./lifeStudyService";
import {
  applyClassListToOverviewCourse,
  applyCompletionRosterToCourse,
  buildLifeStudyCourses,
  buildLifeStudyHistories,
  buildLifeStudyOverview,
  readAttendanceRoster,
  requireCompletionRoster,
} from "./lifeStudyMapper";

type LifeStudyApiClient = {
  request<T>(path: string, options?: ApiRequestOptions): Promise<T | null>;
};

export function createHttpLifeStudyDataSource({
  client = apiClient,
}: {
  client?: LifeStudyApiClient;
} = {}): LifeStudyDataSource {
  return {
    async getOverview() {
      const [studiesRes, cohortsRes, completionsRes] = await Promise.allSettled(
        [
          client.request<unknown>("/api/life-study"),
          client.request<unknown>("/api/life-study/cohorts"),
          client.request<unknown>("/api/life-study/completions"),
        ],
      );

      const lifeStudies =
        studiesRes.status === "fulfilled" ? studiesRes.value : null;
      const cohorts =
        cohortsRes.status === "fulfilled" ? cohortsRes.value : null;
      const completions =
        completionsRes.status === "fulfilled" ? completionsRes.value : null;

      return buildLifeStudyOverview({ lifeStudies, cohorts, completions });
    },

    async getCourses(filter: LifeStudyStatus = "all") {
      const [studiesRes, completionsRes] = await Promise.allSettled([
        client.request<unknown>("/api/life-study"),
        client.request<unknown>("/api/life-study/completions"),
      ]);

      const lifeStudies =
        studiesRes.status === "fulfilled" ? studiesRes.value : null;
      const completions =
        completionsRes.status === "fulfilled" ? completionsRes.value : null;

      const mapped =
        lifeStudies != null
          ? buildLifeStudyCourses(lifeStudies)
          : buildLifeStudyCourses(completions);

      if (filter === "all") return mapped;
      return mapped.filter((course) => course.status === filter);
    },

    async getMyCompletions() {
      const data = await client.request<unknown>("/api/life-study/completions");
      return buildLifeStudyHistories(data);
    },

    async applyClassesToCourse(cohortId, course) {
      const data = await client.request<unknown>(
        `/api/life-study/cohorts/${cohortId}/classes`,
      );
      return applyClassListToOverviewCourse(course, data);
    },

    async getAttendance(classId) {
      const data = await client.request<unknown>(
        `/api/life-study/classes/${classId}/attendance`,
      );
      return readAttendanceRoster(data);
    },

    async replaceAttendance(classId, attendedUserIds) {
      await client.request(`/api/life-study/classes/${classId}/attendance`, {
        method: "PUT",
        body: JSON.stringify({ attendedUserIds: [...attendedUserIds] }),
      });
    },

    async updateAttendanceUser(classId, input) {
      await client.request(
        `/api/life-study/classes/${classId}/attendance/user`,
        {
          method: "PUT",
          body: JSON.stringify({
            userId: input.userId,
            attended: input.attended,
          }),
        },
      );
    },

    async applyRosterToCourse(cohortId, course, currentUserId) {
      const data = await client.request<unknown>(
        `/api/life-study/cohorts/${cohortId}/completions`,
      );
      return applyCompletionRosterToCourse(course, data, currentUserId);
    },

    async updateCompletionUser(cohortId, input) {
      const data = await client.request<unknown>(
        `/api/life-study/cohorts/${cohortId}/completions/user`,
        {
          method: "PUT",
          body: JSON.stringify({
            userId: input.userId,
            completed: input.completed,
          }),
        },
      );
      return requireCompletionRoster(data);
    },
  };
}

export const httpLifeStudyDataSource = createHttpLifeStudyDataSource();
