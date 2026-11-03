import type { PrayerOverview } from "../types/prayer";
import type {
  PrayerAnswerRequest,
  PrayerApplicationCreateRequest,
  PrayerApplicationDto,
  PrayerCategoryDto,
  PrayerCohortDetail,
  PrayerCohortDto,
  PrayerCohortStatusDto,
  PrayerHistoryItem,
  PrayerTopicBoard,
  PrayerTopicDto,
  PrayerTopicWriteRequest,
} from "../types/prayerApi";
import { httpPrayerDataSource } from "./prayerHttpDataSource";

export interface PrayerDataSource {
  getOverview(): Promise<PrayerOverview>;
  getMyCohorts(): Promise<PrayerCohortDto[]>;
  getOpenCohorts(): Promise<PrayerCohortDto[]>;
  getCohort(cohortId: string): Promise<PrayerCohortDetail | null>;
  getCohortStatus(cohortId: string): Promise<PrayerCohortStatusDto | null>;
  completeCohort(cohortId: string): Promise<PrayerCohortStatusDto>;
  cancelCohortCompletion(cohortId: string): Promise<PrayerCohortStatusDto>;
  likeCompletion(completionId: string): Promise<void>;
  unlikeCompletion(completionId: string): Promise<void>;
  getMyApplications(): Promise<PrayerApplicationDto[]>;
  createApplication(input: PrayerApplicationCreateRequest): Promise<number>;
  cancelApplication(applicationId: string): Promise<void>;
  getMyHistory(): Promise<PrayerHistoryItem[]>;
  getCategories(): Promise<PrayerCategoryDto[]>;
  getTopicBoard(): Promise<PrayerTopicBoard | null>;
  getMyTopics(): Promise<PrayerTopicDto[]>;
  createTopic(input: PrayerTopicWriteRequest): Promise<number>;
  updateTopic(topicId: string, input: PrayerTopicWriteRequest): Promise<void>;
  deleteTopic(topicId: string): Promise<void>;
  requestTopicAnswer(
    topicId: string,
    input: PrayerAnswerRequest,
  ): Promise<void>;
}

export function createPrayerService(dataSource: PrayerDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchMyCohorts: () => dataSource.getMyCohorts(),
    fetchOpenCohorts: () => dataSource.getOpenCohorts(),
    fetchCohort: (cohortId: string) => dataSource.getCohort(cohortId),
    fetchCohortStatus: (cohortId: string) =>
      dataSource.getCohortStatus(cohortId),
    completeCohort: (cohortId: string) => dataSource.completeCohort(cohortId),
    cancelCohortCompletion: (cohortId: string) =>
      dataSource.cancelCohortCompletion(cohortId),
    likeCompletion: (completionId: string) =>
      dataSource.likeCompletion(completionId),
    unlikeCompletion: (completionId: string) =>
      dataSource.unlikeCompletion(completionId),
    fetchMyApplications: () => dataSource.getMyApplications(),
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
    updateTopic: (topicId: string, input: PrayerTopicWriteRequest) =>
      dataSource.updateTopic(topicId, input),
    deleteTopic: (topicId: string) => dataSource.deleteTopic(topicId),
    requestTopicAnswer: (topicId: string, input: PrayerAnswerRequest) =>
      dataSource.requestTopicAnswer(topicId, input),
  };
}

const prayerService = createPrayerService(httpPrayerDataSource);

export const fetchPrayerOverview = prayerService.fetchOverview;
export const fetchMyPrayerCohorts = prayerService.fetchMyCohorts;
export const fetchOpenPrayerCohorts = prayerService.fetchOpenCohorts;
export const fetchPrayerCohort = prayerService.fetchCohort;
export const fetchPrayerCohortStatus = prayerService.fetchCohortStatus;
export const completePrayerCohort = prayerService.completeCohort;
export const cancelPrayerCohortCompletion =
  prayerService.cancelCohortCompletion;
export const likePrayerCompletion = prayerService.likeCompletion;
export const unlikePrayerCompletion = prayerService.unlikeCompletion;
export const fetchMyPrayerApplications = prayerService.fetchMyApplications;
export const createPrayerApplication = prayerService.createApplication;
export const cancelPrayerApplication = prayerService.cancelApplication;
export const fetchMyPrayerHistory = prayerService.fetchMyHistory;
export const fetchPrayerCategories = prayerService.fetchCategories;
export const fetchPrayerTopicBoard = prayerService.fetchTopicBoard;
export const fetchMyPrayerTopics = prayerService.fetchMyTopics;
export const createPrayerTopicRequest = prayerService.createTopic;
export const updatePrayerTopic = prayerService.updateTopic;
export const deletePrayerTopic = prayerService.deleteTopic;
export const requestPrayerTopicAnswer = prayerService.requestTopicAnswer;
