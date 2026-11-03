import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyOverview,
  LifeStudyOverviewCourse,
  LifeStudyStatus,
} from "../types/lifeStudy";
import type {
  LifeStudyAttendanceRoster,
  LifeStudyAttendanceUserRequest,
  LifeStudyAttendRequest,
  LifeStudyCompletionRoster,
  LifeStudyCompletionUserRequest,
} from "../types/lifeStudyApi";
import { httpLifeStudyDataSource } from "./lifeStudyHttpDataSource";

export interface LifeStudyDataSource {
  getOverview(): Promise<LifeStudyOverview>;
  getCourses(filter?: LifeStudyStatus): Promise<LifeStudyCourse[]>;
  getMyCompletions(): Promise<LifeStudyHistory[]>;
  applyClassesToCourse(
    cohortId: string,
    course: LifeStudyOverviewCourse,
  ): Promise<LifeStudyOverviewCourse>;
  applyCohort(
    cohortId: string | number,
    input: LifeStudyAttendRequest,
  ): Promise<number>;

  getAttendance(classId: string): Promise<LifeStudyAttendanceRoster | null>;
  replaceAttendance(
    classId: string,
    attendedUserIds: readonly string[],
  ): Promise<void>;
  updateAttendanceUser(
    classId: string,
    input: LifeStudyAttendanceUserRequest,
  ): Promise<void>;
  applyRosterToCourse(
    cohortId: string,
    course: LifeStudyCourse,
    currentUserId: string | null,
  ): Promise<LifeStudyCourse>;
  updateCompletionUser(
    cohortId: string,
    input: LifeStudyCompletionUserRequest,
  ): Promise<LifeStudyCompletionRoster>;
}

export function createLifeStudyService(dataSource: LifeStudyDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchCourses: (filter?: LifeStudyStatus) => dataSource.getCourses(filter),
    fetchMyCompletions: () => dataSource.getMyCompletions(),
    applyClassesToCourse: (cohortId: string, course: LifeStudyOverviewCourse) =>
      dataSource.applyClassesToCourse(cohortId, course),
    applyCohort: (cohortId: string | number, input: LifeStudyAttendRequest) =>
      dataSource.applyCohort(cohortId, input),
    fetchAttendance: (classId: string) => dataSource.getAttendance(classId),
    replaceAttendance: (classId: string, attendedUserIds: readonly string[]) =>
      dataSource.replaceAttendance(classId, attendedUserIds),
    updateAttendanceUser: (
      classId: string,
      input: LifeStudyAttendanceUserRequest,
    ) => dataSource.updateAttendanceUser(classId, input),
    applyRosterToCourse: (
      cohortId: string,
      course: LifeStudyCourse,
      currentUserId: string | null,
    ) => dataSource.applyRosterToCourse(cohortId, course, currentUserId),
    updateCompletionUser: (
      cohortId: string,
      input: LifeStudyCompletionUserRequest,
    ) => dataSource.updateCompletionUser(cohortId, input),
  };
}

const lifeStudyService = createLifeStudyService(httpLifeStudyDataSource);

export const fetchLifeStudyOverview = lifeStudyService.fetchOverview;
export const fetchLifeStudyCourses = lifeStudyService.fetchCourses;
export const fetchMyLifeStudyCompletions = lifeStudyService.fetchMyCompletions;
export const applyLifeStudyClassesToCourse =
  lifeStudyService.applyClassesToCourse;
export const applyLifeStudyCohort = lifeStudyService.applyCohort;
export const fetchLifeStudyAttendance = lifeStudyService.fetchAttendance;
export const replaceLifeStudyAttendance = lifeStudyService.replaceAttendance;
export const updateLifeStudyAttendanceUser =
  lifeStudyService.updateAttendanceUser;
export const applyLifeStudyRosterToCourse =
  lifeStudyService.applyRosterToCourse;
export const updateLifeStudyCompletionUser =
  lifeStudyService.updateCompletionUser;
