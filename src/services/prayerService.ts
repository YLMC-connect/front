import type { PrayerOverview } from "../types/prayer";
import type {
  PrayerAnswerRequest,
  PrayerApplicationCreateRequest,
  PrayerCategoryDto,
  PrayerCohortStatusDto,
  PrayerHistoryItem,
  PrayerTopicBoard,
  PrayerTopicDto,
  PrayerTopicWriteRequest,
} from "../types/prayerApi";
import { httpPrayerDataSource } from "./prayerHttpDataSource";

export interface PrayerDataSource {
  getOverview(): Promise<PrayerOverview>;
  getCohortStatus(cohortId: string): Promise<PrayerCohortStatusDto | null>;
  completeCohort(cohortId: string): Promise<PrayerCohortStatusDto>;
  cancelCohortCompletion(cohortId: string): Promise<PrayerCohortStatusDto>;
  createApplication(input: PrayerApplicationCreateRequest): Promise<number>;
  cancelApplication(applicationId: string): Promise<void>;
  getMyHistory(): Promise<PrayerHistoryItem[]>;
  getCategories(): Promise<PrayerCategoryDto[]>;
  getTopicBoard(): Promise<PrayerTopicBoard | null>;
  getMyTopics(): Promise<PrayerTopicDto[]>;
  createTopic(input: PrayerTopicWriteRequest): Promise<number>;
  requestTopicAnswer(
    topicId: string,
    input: PrayerAnswerRequest,
  ): Promise<void>;
}

export function createPrayerService(dataSource: PrayerDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchCohortStatus: (cohortId: string) =>
      dataSource.getCohortStatus(cohortId),
    completeCohort: (cohortId: string) => dataSource.completeCohort(cohortId),
    cancelCohortCompletion: (cohortId: string) =>
      dataSource.cancelCohortCompletion(cohortId),
    createApplication: (input: PrayerApplicationCreateRequest) =>
      dataSource.createApplication(input),
    cancelApplication: (applicationId: string) =>
      dataSource.cancelApplication(applicationId),
    fetchMyHistory: () => dataSource.getMyHistory(),
    fetchCategories: () => dataSource.getCategories(),
    fetchTopicBoard: () => dataSource.getTopicBoard(),
    fetchMyTopics: () => dataSource.getMyTopics(),
    createTopic: (input: PrayerTopicWriteRequest) =>
      dataSource.createTopic(input),
    requestTopicAnswer: (topicId: string, input: PrayerAnswerRequest) =>
      dataSource.requestTopicAnswer(topicId, input),
  };
}

const prayerService = createPrayerService(httpPrayerDataSource);

export const fetchPrayerOverview = prayerService.fetchOverview;
export const fetchPrayerCohortStatus = prayerService.fetchCohortStatus;
export const completePrayerCohort = prayerService.completeCohort;
export const cancelPrayerCohortCompletion =
  prayerService.cancelCohortCompletion;
export const createPrayerApplication = prayerService.createApplication;
export const cancelPrayerApplication = prayerService.cancelApplication;
export const fetchMyPrayerHistory = prayerService.fetchMyHistory;
export const fetchPrayerCategories = prayerService.fetchCategories;
export const fetchPrayerTopicBoard = prayerService.fetchTopicBoard;
export const fetchMyPrayerTopics = prayerService.fetchMyTopics;
export const createPrayerTopicRequest = prayerService.createTopic;
export const requestPrayerTopicAnswer = prayerService.requestTopicAnswer;
