import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyOverview,
  LifeStudyStatus,
} from "../types/lifeStudy";
import type {
  LifeStudyAttendRequest,
  LifeStudyCohortDetailDto,
  LifeStudyLessonDto,
} from "../types/lifeStudyApi";
import { httpLifeStudyDataSource } from "./lifeStudyHttpDataSource";

export interface LifeStudyDataSource {
  getOverview(): Promise<LifeStudyOverview>;
  getCourses(filter?: LifeStudyStatus): Promise<LifeStudyCourse[]>;
  getMyCompletions(): Promise<LifeStudyHistory[]>;
  getCohortDetail?(
    cohortId: string | number,
  ): Promise<LifeStudyCohortDetailDto | null>;
  getCourseLessons?(
    courseId: string | number,
  ): Promise<LifeStudyLessonDto[] | null>;
  applyCohort(
    cohortId: string | number,
    input: LifeStudyAttendRequest,
  ): Promise<number>;
}

export function createLifeStudyService(dataSource: LifeStudyDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchCourses: (filter?: LifeStudyStatus) => dataSource.getCourses(filter),
    fetchMyCompletions: () => dataSource.getMyCompletions(),
    fetchCohortDetail: (cohortId: string | number) =>
      dataSource.getCohortDetail
        ? dataSource.getCohortDetail(cohortId)
        : Promise.resolve(null),
    fetchCourseLessons: (courseId: string | number) =>
      dataSource.getCourseLessons
        ? dataSource.getCourseLessons(courseId)
        : Promise.resolve(null),
    applyCohort: (cohortId: string | number, input: LifeStudyAttendRequest) =>
      dataSource.applyCohort(cohortId, input),
  };
}

const lifeStudyService = createLifeStudyService(httpLifeStudyDataSource);

export const fetchLifeStudyOverview = lifeStudyService.fetchOverview;
export const fetchLifeStudyCourses = lifeStudyService.fetchCourses;
export const fetchMyLifeStudyCompletions = lifeStudyService.fetchMyCompletions;
export const fetchLifeStudyCohortDetail = lifeStudyService.fetchCohortDetail;
export const fetchLifeStudyCourseLessons = lifeStudyService.fetchCourseLessons;
export const applyLifeStudyCohort = lifeStudyService.applyCohort;
