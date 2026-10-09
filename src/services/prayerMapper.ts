import { ApiError } from "../lib/apiClient";
import type {
  PrayerOverview,
  PrayerOverviewRoom,
  PrayerPeriod,
  PrayerRequestStatus,
  PrayerRequestSummary,
  PrayerRoom,
  PrayerTopic,
  PrayerWeekday,
} from "../types/prayer";
import type {
  PrayerApplicationDto,
  PrayerCategoryDto,
  PrayerCohortDetail,
  PrayerCohortDto,
  PrayerCohortStatusDto,
  PrayerCompletionMemberDto,
  PrayerHistoryItem,
  PrayerMemberRole,
  PrayerTopicBoard,
  PrayerTopicDto,
  PrayerTopicStatus,
} from "../types/prayerApi";

const TIME_SLOTS = ["AM", "PM"] as const;
const COHORT_STATUSES = ["ACTIVE", "CLOSED"] as const;
const TOPIC_STATUSES = [
  "REVIEW",
  "OPEN",
  "ANSWER_REQUESTED",
  "ANSWERED",
  "REJECTED",
  "HIDDEN",
] as const;

const REQUEST_STATUS: Partial<Record<PrayerTopicStatus, PrayerRequestStatus>> =
  {
    REVIEW: "reviewing",
    OPEN: "published",
    REJECTED: "rejected",
  };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function invalid(data: unknown): never {
  throw new ApiError({
    code: "INVALID_RESPONSE",
    message: "서버 응답 형식을 확인할 수 없습니다.",
    status: 200,
    data,
  });
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function requireKey(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  if (!(key in data)) invalid(source);
}

function requireInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readInteger(data[key]);
  if (value == null) invalid(source);
  return value;
}

function requireNullableInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  const value = readInteger(data[key]);
  if (value == null) invalid(source);
  return value;
}

function requireString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "string") invalid(source);
  return data[key];
}

function requireNullableString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (typeof data[key] !== "string") invalid(source);
  return data[key];
}

function requireBoolean(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "boolean") invalid(source);
  return data[key];
}

function requireOneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
  allowed: readonly T[],
): T {
  const value = requireString(data, key, source);
  if (!allowed.includes(value as T)) invalid(source);
  return value as T;
}

function requireRole(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
): PrayerMemberRole {
  const value = requireString(data, key, source);
  if (value !== "LEADER" && value !== "MEMBER") invalid(source);
  return value;
}

function requireNullableRole(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
): PrayerMemberRole | null {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (data[key] !== "LEADER" && data[key] !== "MEMBER") invalid(source);
  return data[key];
}

function readList<T>(
  data: unknown,
  readItem: (item: unknown, source: unknown) => T,
): T[] {
  if (data == null) return [];
  if (!Array.isArray(data)) invalid(data);
  return data.map((item) => readItem(item, data));
}

function readCohort(value: unknown, source: unknown): PrayerCohortDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    cohortYear: requireInteger(value, "cohortYear", source),
    yoil: requireInteger(value, "yoil", source),
    timeSlot: requireOneOf(value, "timeSlot", source, TIME_SLOTS),
    cohortName: requireString(value, "cohortName", source),
    description: requireString(value, "description", source),
    startDate: requireString(value, "startDate", source),
    endDate: requireString(value, "endDate", source),
    status: requireOneOf(value, "status", source, COHORT_STATUSES),
    memberCount: requireInteger(value, "memberCount", source),
    weekCompletedCount: requireInteger(value, "weekCompletedCount", source),
    completionRate: requireInteger(value, "completionRate", source),
    myCompleted: requireBoolean(value, "myCompleted", source),
    myRole: requireNullableRole(value, "myRole", source),
    emergencyCount: requireInteger(value, "emergencyCount", source),
  };
}

function readMember(
  value: unknown,
  source: unknown,
): PrayerCompletionMemberDto {
  if (!isRecord(value)) invalid(source);
  return {
    userId: requireString(value, "userId", source),
    userName: requireString(value, "userName", source),
    userPhone: requireString(value, "userPhone", source),
    memberRole: requireRole(value, "memberRole", source),
    completionId: requireNullableInteger(value, "completionId", source),
    completedAt: requireString(value, "completedAt", source),
    likeCount: requireInteger(value, "likeCount", source),
    liked: requireBoolean(value, "liked", source),
  };
}

function readTopic(value: unknown, source: unknown): PrayerTopicDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    categoryId: requireInteger(value, "categoryId", source),
    categoryName: requireString(value, "categoryName", source),
    title: requireString(value, "title", source),
    content: requireString(value, "content", source),
    status: requireOneOf(value, "status", source, TOPIC_STATUSES),
    rejectReason: requireString(value, "rejectReason", source),
    writerName: requireString(value, "writerName", source),
    mine: requireBoolean(value, "mine", source),
    emergency: requireBoolean(value, "emergency", source),
    emergencyEndAt: requireString(value, "emergencyEndAt", source),
    answerContent: requireString(value, "answerContent", source),
    answeredAt: requireString(value, "answeredAt", source),
    createdAt: requireString(value, "createdAt", source),
  };
}

export function readPrayerCohorts(data: unknown): PrayerCohortDto[] {
  return readList(data, readCohort);
}

export function readPrayerCohortDetail(
  data: unknown,
): PrayerCohortDetail | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  return {};
}

export function readPrayerCohortStatus(
  data: unknown,
): PrayerCohortStatusDto | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  if (!Array.isArray(data.completed) || !Array.isArray(data.notCompleted)) {
    invalid(data);
  }
  return {
    cohortId: requireInteger(data, "cohortId", data),
    cohortName: requireString(data, "cohortName", data),
    weekStartDate: requireString(data, "weekStartDate", data),
    scheduledDate: requireString(data, "scheduledDate", data),
    totalMembers: requireInteger(data, "totalMembers", data),
    completedCount: requireInteger(data, "completedCount", data),
    notCompletedCount: requireInteger(data, "notCompletedCount", data),
    completionRate: requireInteger(data, "completionRate", data),
    myCompleted: requireBoolean(data, "myCompleted", data),
    canComplete: requireBoolean(data, "canComplete", data),
    completed: data.completed.map((member) => readMember(member, data)),
    notCompleted: data.notCompleted.map((member) => readMember(member, data)),
  };
}

export function requirePrayerCohortStatus(
  data: unknown,
): PrayerCohortStatusDto {
  const status = readPrayerCohortStatus(data);
  if (!status) invalid(data);
  return status;
}

export function readPrayerTopics(data: unknown): PrayerTopicDto[] {
  return readList(data, readTopic);
}

export function readPrayerTopicBoard(data: unknown): PrayerTopicBoard | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  const emergency = data.emergency;
  const recentAnswers = data.recentAnswers;
  const ongoing = data.ongoing;
  if (
    !Array.isArray(emergency) ||
    !Array.isArray(recentAnswers) ||
    !Array.isArray(ongoing)
  ) {
    invalid(data);
  }
  return {
    emergency: emergency.map((item) => readTopic(item, data)),
    recentAnswers: recentAnswers.map((item) => readTopic(item, data)),
    ongoing: ongoing.map((item) => readTopic(item, data)),
  };
}

function readNamedFields<T extends string>(
  value: unknown,
  source: unknown,
  keys: readonly T[],
): { [K in T]: unknown } {
  if (!isRecord(value)) invalid(source);
  const row = {} as { [K in T]: unknown };
  for (const key of keys) {
    requireKey(value, key, source);
    row[key] = value[key];
  }
  return row;
}

const APPLICATION_KEYS = [
  "id",
  "cohortId",
  "cohortName",
  "yoil",
  "timeSlot",
  "applicantName",
  "applicantPhone",
  "applyMemo",
  "status",
  "rejectReason",
  "createdAt",
  "processedAt",
] as const;

const CATEGORY_KEYS = [
  "id",
  "categoryCode",
  "categoryName",
  "orderNum",
] as const;

export function readPrayerApplications(data: unknown): PrayerApplicationDto[] {
  return readList(data, (item, source) =>
    readNamedFields(item, source, APPLICATION_KEYS),
  );
}

export function readPrayerCategories(data: unknown): PrayerCategoryDto[] {
  return readList(data, (item, source) =>
    readNamedFields(item, source, CATEGORY_KEYS),
  );
}

function readHistoryItem(value: unknown, source: unknown): PrayerHistoryItem {
  if (!isRecord(value)) invalid(source);
  return {
    cohortId: requireInteger(value, "cohortId", source),
    cohortName: requireString(value, "cohortName", source),
    cohortYear: requireInteger(value, "cohortYear", source),
    yoil: requireInteger(value, "yoil", source),
    timeSlot: requireOneOf(value, "timeSlot", source, TIME_SLOTS),
    memberRole: requireRole(value, "memberRole", source),
    joinedAt: requireString(value, "joinedAt", source),
    leftAt: requireNullableString(value, "leftAt", source),
    leaveReason: requireString(value, "leaveReason", source),
    active: requireBoolean(value, "active", source),
  };
}

export function readPrayerHistory(data: unknown): PrayerHistoryItem[] {
  return readList(data, readHistoryItem);
}

export function requireCreatedId(data: unknown): number {
  const id = readInteger(data);
  if (id == null) invalid(data);
  return id;
}

function weekdayFromYoil(yoil: number): PrayerWeekday | undefined {
  switch (yoil) {
    case 1:
      return "mon";
    case 2:
      return "tue";
    case 3:
      return "wed";
    case 4:
      return "thu";
    case 5:
      return "fri";
    default:
      return undefined;
  }
}

function periodFromTimeSlot(timeSlot: string): PrayerPeriod | undefined {
  if (timeSlot === "AM") return "morning";
  if (timeSlot === "PM") return "afternoon";
  return undefined;
}

function indexById<T extends { id: number }>(rows: readonly T[]) {
  const indexed = new Map<string, T>();
  for (const row of rows) indexed.set(String(row.id), row);
  return indexed;
}

function applyCohortToOverviewRoom(
  room: PrayerOverviewRoom,
  cohort: PrayerCohortDto | undefined,
): PrayerOverviewRoom {
  if (!cohort) return { ...room };
  const weekday = weekdayFromYoil(cohort.yoil);
  const period = periodFromTimeSlot(cohort.timeSlot);
  const joined = cohort.myRole === "LEADER" || cohort.myRole === "MEMBER";
  return {
    ...room,
    weekday: weekday ?? room.weekday,
    period: period ?? room.period,
    memberCount: cohort.memberCount,
    completedCount: cohort.weekCompletedCount,
    participationRate: cohort.completionRate,
    status: joined ? "joined" : room.status,
  };
}

function applyTopicToRequest(
  request: PrayerRequestSummary,
  topic: PrayerTopicDto | undefined,
): PrayerRequestSummary {
  if (!topic) return { ...request };
  return {
    ...request,
    title: topic.title,
    category: topic.categoryName,
    status: REQUEST_STATUS[topic.status] ?? request.status,
  };
}

export function applyPrayerApiToOverview(
  overview: PrayerOverview,
  cohorts: readonly PrayerCohortDto[],
  topics: readonly PrayerTopicDto[],
): PrayerOverview {
  const cohortById = indexById(cohorts);
  const topicById = indexById(topics);
  return {
    rooms: overview.rooms.map((room) =>
      applyCohortToOverviewRoom(room, cohortById.get(room.id)),
    ),
    requests: overview.requests.map((request) =>
      applyTopicToRequest(request, topicById.get(request.id)),
    ),
  };
}

const TOPIC_REQUEST_STATUS: Record<PrayerTopicStatus, PrayerRequestStatus> = {
  REVIEW: "reviewing",
  OPEN: "published",
  REJECTED: "rejected",
  ANSWER_REQUESTED: "answerRequested",
  ANSWERED: "answered",
  HIDDEN: "hidden",
};

function cohortToOverviewRoom(
  cohort: PrayerCohortDto,
): PrayerOverviewRoom | null {
  const weekday = weekdayFromYoil(cohort.yoil);
  const period = periodFromTimeSlot(cohort.timeSlot);
  const joined = cohort.myRole === "LEADER" || cohort.myRole === "MEMBER";
  if (!weekday || !period || !joined) return null;
  return {
    id: String(cohort.id),
    title: cohort.cohortName,
    weekday,
    period,
    memberCount: cohort.memberCount,
    completedCount: cohort.weekCompletedCount,
    participationRate: cohort.completionRate,
    status: "joined",
  };
}

/** 내 기도방·내 기도제목은 API 행으로만 만든다. 역할이 없거나 일·토는 뺀다. */
export function buildPrayerOverview(
  cohorts: readonly PrayerCohortDto[],
  topics: readonly PrayerTopicDto[],
): PrayerOverview {
  const rooms = new Map<string, PrayerOverviewRoom>();
  for (const cohort of cohorts) {
    const room = cohortToOverviewRoom(cohort);
    if (room) rooms.set(room.id, room);
  }
  return {
    rooms: [...rooms.values()],
    requests: topics.map((topic) => ({
      id: String(topic.id),
      title: topic.title,
      category: topic.categoryName,
      status: TOPIC_REQUEST_STATUS[topic.status],
      description: topic.content,
    })),
  };
}

export function applyCohortsToRooms(
  rooms: readonly PrayerRoom[],
  cohorts: readonly PrayerCohortDto[],
): PrayerRoom[] {
  const cohortById = indexById(cohorts);
  return rooms.map((room) => {
    const cohort = cohortById.get(room.id);
    if (!cohort) return { ...room };
    const weekday = weekdayFromYoil(cohort.yoil);
    return {
      ...room,
      title: cohort.cohortName,
      weekday: weekday ?? room.weekday,
      description: cohort.description,
      memberCount: cohort.memberCount,
      isJoined: cohort.myRole === "LEADER" || cohort.myRole === "MEMBER",
    };
  });
}

export function applyTopicsToTopics(
  topics: readonly PrayerTopic[],
  rows: readonly PrayerTopicDto[],
): PrayerTopic[] {
  const topicById = indexById(rows);
  return topics.map((topic) => {
    const row = topicById.get(topic.id);
    if (!row) return { ...topic };
    const answered = row.status === "ANSWERED";
    const next: PrayerTopic = {
      id: topic.id,
      roomId: topic.roomId,
      title: row.title,
      content: row.content,
      author: topic.author,
      isAnonymous: topic.isAnonymous,
      prayerCount: topic.prayerCount,
      hasPrayed: topic.hasPrayed,
      isAnswered: answered,
      createdAt: row.createdAt,
    };
    if (answered) next.answer = row.answerContent;
    return next;
  });
}
