import Constants from "expo-constants";
import { MOCK_USER } from "../mocks/auth";
import {
  mockPrayerOverview,
  mockPrayerRooms,
  mockPrayerTopics,
} from "../mocks/prayers";
import type {
  PrayerOverview,
  PrayerTopic,
  PrayerTopicInput,
} from "../types/prayer";
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
  createPrayerTopic(input: PrayerTopicInput): Promise<PrayerTopic>;
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

const rooms = [...mockPrayerRooms];
let topics: PrayerTopic[] = [...mockPrayerTopics];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensurePrayerRoom(id: string) {
  await delay();
  const room = rooms.find((candidate) => candidate.id === id);
  if (!room) throw new Error("존재하지 않는 기도방입니다.");
}

async function unavailable(message: string): Promise<never> {
  await delay();
  throw new Error(message);
}

const mockPrayerDataSource: PrayerDataSource = {
  async getOverview() {
    await delay();
    return mockPrayerOverview;
  },

  async createPrayerTopic(input) {
    await delay();
    await ensurePrayerRoom(input.roomId);

    const topic: PrayerTopic = {
      id: `prayer-topic-${Date.now()}`,
      ...input,
      author: MOCK_USER,
      prayerCount: 0,
      hasPrayed: false,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };
    topics = [topic, ...topics];
    return topic;
  },

  async getMyCohorts() {
    await delay();
    return [];
  },

  async getOpenCohorts() {
    await delay();
    return [];
  },

  async getCohort() {
    await delay();
    return null;
  },

  async getCohortStatus() {
    await delay();
    return null;
  },

  async completeCohort() {
    return unavailable("목 데이터에는 이번 주 기도 현황이 없습니다.");
  },

  async cancelCohortCompletion() {
    return unavailable("목 데이터에는 이번 주 기도 현황이 없습니다.");
  },

  async likeCompletion() {
    await delay();
  },

  async unlikeCompletion() {
    await delay();
  },

  async getMyApplications() {
    await delay();
    return [];
  },

  async createApplication() {
    return unavailable("목 데이터에는 기도방 신청이 없습니다.");
  },

  async cancelApplication() {
    await delay();
  },

  async getMyHistory() {
    await delay();
    return [];
  },

  async getCategories() {
    await delay();
    return [];
  },

  async getTopicBoard() {
    await delay();
    return null;
  },

  async getMyTopics() {
    await delay();
    return [];
  },

  async createTopic() {
    return unavailable("목 데이터에는 기도제목 카테고리가 없습니다.");
  },

  async updateTopic() {
    await delay();
  },

  async deleteTopic() {
    await delay();
  },

  async requestTopicAnswer() {
    await delay();
  },
};

export function createPrayerService(dataSource: PrayerDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    createPrayerTopic: (input: PrayerTopicInput) =>
      dataSource.createPrayerTopic(input),
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

function resolvePrayerAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_PRAYER_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.prayerAdapter === "http"
    ? "http"
    : "mock";
}

const prayerService = createPrayerService(
  resolvePrayerAdapterMode() === "http"
    ? httpPrayerDataSource
    : mockPrayerDataSource,
);

export const fetchPrayerOverview = prayerService.fetchOverview;
export const createPrayerTopic = prayerService.createPrayerTopic;
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
