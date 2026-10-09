import Constants from "expo-constants";
import {
  mockLifeStudyCourses,
  mockLifeStudyHistory,
  mockLifeStudyOverview,
} from "../mocks/lifeStudy";
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

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

const courses: LifeStudyCourse[] = [...mockLifeStudyCourses];

const mockLifeStudyDataSource: LifeStudyDataSource = {
  async getOverview() {
    await delay();
    return mockLifeStudyOverview;
  },

  async getCourses(filter: LifeStudyStatus = "all") {
    await delay();
    if (filter === "all") return courses;
    return courses.filter((course) => course.status === filter);
  },

  async getMyCompletions() {
    await delay();
    return mockLifeStudyHistory.map((history) => ({ ...history }));
  },

  async applyClassesToCourse(_cohortId, course) {
    await delay();
    return { ...course };
  },

  async getAttendance(_classId) {
    await delay();
    return null;
  },

  async replaceAttendance(_classId, _attendedUserIds) {
    await delay();
  },

  async updateAttendanceUser(_classId, _input) {
    await delay();
  },

  async applyRosterToCourse(_cohortId, course) {
    await delay();
    return { ...course };
  },

  async updateCompletionUser() {
    await delay();
    throw new Error("목 데이터에는 수료 명단이 없습니다.");
  },
};

export function createLifeStudyService(dataSource: LifeStudyDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchCourses: (filter?: LifeStudyStatus) => dataSource.getCourses(filter),
    fetchMyCompletions: () => dataSource.getMyCompletions(),
    applyClassesToCourse: (cohortId: string, course: LifeStudyOverviewCourse) =>
      dataSource.applyClassesToCourse(cohortId, course),
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

function resolveLifeStudyAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_LIFE_STUDY_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.lifeStudyAdapter === "http"
    ? "http"
    : "mock";
}

const lifeStudyService = createLifeStudyService(
  resolveLifeStudyAdapterMode() === "http"
    ? httpLifeStudyDataSource
    : mockLifeStudyDataSource,
);

export const fetchLifeStudyOverview = lifeStudyService.fetchOverview;
export const fetchLifeStudyCourses = lifeStudyService.fetchCourses;
export const fetchMyLifeStudyCompletions = lifeStudyService.fetchMyCompletions;
export const applyLifeStudyClassesToCourse =
  lifeStudyService.applyClassesToCourse;
export const fetchLifeStudyAttendance = lifeStudyService.fetchAttendance;
export const replaceLifeStudyAttendance = lifeStudyService.replaceAttendance;
export const updateLifeStudyAttendanceUser =
  lifeStudyService.updateAttendanceUser;
export const applyLifeStudyRosterToCourse =
  lifeStudyService.applyRosterToCourse;
export const updateLifeStudyCompletionUser =
  lifeStudyService.updateCompletionUser;
