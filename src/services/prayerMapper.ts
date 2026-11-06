import {
  invalidResponse as invalid,
  keepValidItems,
} from "../lib/reportResponseIssue";
import type {
  PrayerOverview,
  PrayerOverviewRoom,
  PrayerPeriod,
  PrayerRequestStatus,
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
const MEMBER_ROLES = ["LEADER", "MEMBER"] as const;
const TOPIC_STATUSES = [
  "REVIEW",
  "OPEN",
  "ANSWER_REQUESTED",
  "ANSWERED",
  "REJECTED",
  "HIDDEN",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function requireKey(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  if (!(key in data)) invalid(source, key);
}

function requireInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readInteger(data[key]);
  if (value == null) invalid(source, key);
  return value;
}

function requireString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "string") invalid(source, key);
  return data[key];
}

function requireNullableString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (typeof data[key] !== "string") invalid(source, key);
  return data[key];
}

function requireBoolean(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "boolean") invalid(source, key);
  return data[key];
}

function requireOneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
  allowed: readonly T[],
): T {
  const value = requireString(data, key, source);
  if (!allowed.includes(value as T)) invalid(source, key);
  return value as T;
}

function requireNullableRole(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
): PrayerMemberRole | null {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (data[key] !== "LEADER" && data[key] !== "MEMBER") invalid(source, key);
  return data[key];
}

/** 화면에서 쓰지 않는 필드. 없거나 형식이 다르면 null. */
function optionalInteger(data: Record<string, unknown>, key: string) {
  return readInteger(data[key]);
}

function optionalString(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "string" ? data[key] : null;
}

function optionalBoolean(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "boolean" ? data[key] : null;
}

function optionalOneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T | null {
  return allowed.includes(data[key] as T) ? (data[key] as T) : null;
}

/** 배열이 아니면 응답 오류. 형식이 틀린 항목만 빼고 돌려준다. */
function readList<T>(
  data: unknown,
  source: string,
  readItem: (item: unknown, source: unknown) => T,
): T[] {
  if (data == null) return [];
  if (!Array.isArray(data)) invalid(data);
  return keepValidItems(data, source, (item) => readItem(item, data));
}

function readArrayField<T>(
  data: Record<string, unknown>,
  key: string,
  source: string,
  readItem: (item: unknown, source: unknown) => T,
): T[] {
  const items = data[key];
  if (!Array.isArray(items)) invalid(data, key);
  return keepValidItems(items, `${source}.${key}`, (item) =>
    readItem(item, data),
  );
}

function readCohort(value: unknown, source: unknown): PrayerCohortDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    cohortYear: optionalInteger(value, "cohortYear"),
    yoil: requireInteger(value, "yoil", source),
    timeSlot: requireOneOf(value, "timeSlot", source, TIME_SLOTS),
    cohortName: requireString(value, "cohortName", source),
    description: optionalString(value, "description"),
    startDate: optionalString(value, "startDate"),
    endDate: optionalString(value, "endDate"),
    status: optionalOneOf(value, "status", COHORT_STATUSES),
    memberCount: requireInteger(value, "memberCount", source),
    weekCompletedCount: requireInteger(value, "weekCompletedCount", source),
    completionRate: requireInteger(value, "completionRate", source),
    myCompleted: optionalBoolean(value, "myCompleted"),
    myRole: requireNullableRole(value, "myRole", source),
    emergencyCount: optionalInteger(value, "emergencyCount"),
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
    userPhone: optionalString(value, "userPhone"),
    memberRole: optionalOneOf(value, "memberRole", MEMBER_ROLES),
    completionId: optionalInteger(value, "completionId"),
    completedAt: optionalString(value, "completedAt"),
    likeCount: optionalInteger(value, "likeCount"),
    liked: optionalBoolean(value, "liked"),
  };
}

function readTopic(value: unknown, source: unknown): PrayerTopicDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    categoryId: optionalInteger(value, "categoryId"),
    categoryName: requireString(value, "categoryName", source),
    title: requireString(value, "title", source),
    content: requireString(value, "content", source),
    status: requireOneOf(value, "status", source, TOPIC_STATUSES),
    rejectReason: optionalString(value, "rejectReason"),
    // 기도방 화면은 작성자가 없으면 "성도" 로 보여 준다
    writerName: optionalString(value, "writerName"),
    mine: optionalBoolean(value, "mine"),
    emergency: optionalBoolean(value, "emergency"),
    emergencyEndAt: optionalString(value, "emergencyEndAt"),
    answerContent: requireNullableString(value, "answerContent", source),
    answeredAt: optionalString(value, "answeredAt"),
    createdAt: optionalString(value, "createdAt"),
  };
}

export function readPrayerCohorts(data: unknown): PrayerCohortDto[] {
  return readList(data, "prayer.cohorts", readCohort);
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
  return {
    cohortId: requireInteger(data, "cohortId", data),
    cohortName: requireString(data, "cohortName", data),
    weekStartDate: optionalString(data, "weekStartDate"),
    scheduledDate: optionalString(data, "scheduledDate"),
    totalMembers: requireInteger(data, "totalMembers", data),
    completedCount: requireInteger(data, "completedCount", data),
    notCompletedCount: requireInteger(data, "notCompletedCount", data),
    completionRate: requireInteger(data, "completionRate", data),
    myCompleted: requireBoolean(data, "myCompleted", data),
    canComplete: optionalBoolean(data, "canComplete"),
    completed: readArrayField(
      data,
      "completed",
      "prayer.cohortStatus",
      readMember,
    ),
    notCompleted: readArrayField(
      data,
      "notCompleted",
      "prayer.cohortStatus",
      readMember,
    ),
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
  return readList(data, "prayer.topics", readTopic);
}

export function readPrayerTopicBoard(data: unknown): PrayerTopicBoard | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  const source = "prayer.topicBoard";
  return {
    emergency: readArrayField(data, "emergency", source, readTopic),
    recentAnswers: readArrayField(data, "recentAnswers", source, readTopic),
    ongoing: readArrayField(data, "ongoing", source, readTopic),
  };
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

/** 값 타입이 정해지지 않은 행. 없는 이름은 null 로 채운다. */
function readApplication(
  value: unknown,
  source: unknown,
): PrayerApplicationDto {
  if (!isRecord(value)) invalid(source);
  const row = {} as PrayerApplicationDto;
  for (const key of APPLICATION_KEYS) {
    row[key] = key in value ? value[key] : null;
  }
  return row;
}

function readCategory(value: unknown, source: unknown): PrayerCategoryDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    categoryCode: optionalString(value, "categoryCode"),
    categoryName: requireString(value, "categoryName", source),
    orderNum: optionalInteger(value, "orderNum"),
  };
}

export function readPrayerApplications(data: unknown): PrayerApplicationDto[] {
  return readList(data, "prayer.applications", readApplication);
}

export function readPrayerCategories(data: unknown): PrayerCategoryDto[] {
  return readList(data, "prayer.categories", readCategory);
}

function readHistoryItem(value: unknown, source: unknown): PrayerHistoryItem {
  if (!isRecord(value)) invalid(source);
  return {
    cohortId: requireInteger(value, "cohortId", source),
    cohortName: optionalString(value, "cohortName"),
    cohortYear: optionalInteger(value, "cohortYear"),
    yoil: optionalInteger(value, "yoil"),
    timeSlot: optionalOneOf(value, "timeSlot", TIME_SLOTS),
    memberRole: optionalOneOf(value, "memberRole", MEMBER_ROLES),
    joinedAt: optionalString(value, "joinedAt"),
    leftAt: optionalString(value, "leftAt"),
    leaveReason: optionalString(value, "leaveReason"),
    active: optionalBoolean(value, "active"),
  };
}

export function readPrayerHistory(data: unknown): PrayerHistoryItem[] {
  return readList(data, "prayer.history", readHistoryItem);
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
