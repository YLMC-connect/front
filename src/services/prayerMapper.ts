import {
  isRecord,
  optionalInteger,
  optionalOneOf,
  optionalString,
  readArrayField,
  readInteger,
  requireBoolean,
  requireInteger,
  requireKey,
  requireNullableString,
  requireOneOf,
  requireString,
} from "../lib/parse";
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
  PrayerAnswerPage,
  PrayerApplicationDto,
  PrayerCategoryDto,
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

function optionalBoolean(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "boolean" ? data[key] : null;
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
  const anonymous = optionalBoolean(value, "anonymous");
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
    // 익명 여부는 서버가 줄 때만 둔다. 작성자는 서버가 이미 "익명" 으로 가려 준다
    ...(anonymous != null ? { anonymous } : {}),
    emergency: optionalBoolean(value, "emergency"),
    emergencyEndAt: optionalString(value, "emergencyEndAt"),
    answerContent: requireNullableString(value, "answerContent", source),
    answeredAt: optionalString(value, "answeredAt"),
    receivedAt: optionalString(value, "receivedAt"),
    createdAt: optionalString(value, "createdAt"),
  };
}

export function readPrayerCohorts(data: unknown): PrayerCohortDto[] {
  return readList(data, "prayer.cohorts", readCohort);
}

export function readPrayerCohortStatus(
  data: unknown,
): PrayerCohortStatusDto | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  return {
    cohortId: requireInteger(data, "cohortId", data),
    cohortName: requireString(data, "cohortName", data),
    yoil: optionalInteger(data, "yoil"),
    timeSlot: optionalString(data, "timeSlot"),
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

export function readPrayerAnswerPage(data: unknown): PrayerAnswerPage {
  if (!isRecord(data)) invalid(data);
  const source = "prayer.answers";
  return {
    content: readArrayField(data, "content", source, readTopic),
    nextCursor: optionalInteger(data, "nextCursor"),
    hasNext: requireBoolean(data, "hasNext", source),
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
    case 6:
      return "sat";
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

/** 승인 대기(PENDING) 신청만 기도방 행으로 만든다. 값 형식이 다르면 뺀다. */
function applicationToOverviewRoom(
  application: PrayerApplicationDto,
): PrayerOverviewRoom | null {
  if (application.status !== "PENDING") return null;
  const applicationId = readInteger(application.id);
  const cohortId = readInteger(application.cohortId);
  const yoil = readInteger(application.yoil);
  const weekday = yoil == null ? undefined : weekdayFromYoil(yoil);
  const period =
    typeof application.timeSlot === "string"
      ? periodFromTimeSlot(application.timeSlot)
      : undefined;
  if (applicationId == null || !weekday || !period) {
    return null;
  }
  return {
    // 승인 전에는 기도방이 정해지지 않을 수 있다(cohortId 없음). 그때는 신청 id 로 구분한다
    id: cohortId == null ? `application-${applicationId}` : String(cohortId),
    title:
      typeof application.cohortName === "string" && application.cohortName
        ? application.cohortName
        : undefined,
    weekday,
    period,
    memberCount: 0,
    status: "pending",
    applicationId: String(applicationId),
  };
}

/** 서버 날짜(`YYYY-MM-DD...`)를 "M월 D일"로 바꾼다. 형식이 다르면 undefined. */
export function formatPrayerDate(value: string | null | undefined) {
  const match = value ? /^\d{4}-(\d{2})-(\d{2})/.exec(value) : null;
  if (!match) return undefined;
  return `${Number(match[1])}월 ${Number(match[2])}일`;
}

const YOIL_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** 서버 요일(0=일 … 6=토)·시간대(AM/PM)를 화면 글자로 바꾼다. 값이 없거나 범위 밖이면 빈 글자. */
export function formatPrayerRoomDayPeriod(
  yoil: number | null | undefined,
  timeSlot: string | null | undefined,
): { day: string; period: string } {
  const day = yoil == null ? "" : (YOIL_LABELS[yoil] ?? "");
  const period = timeSlot === "AM" ? "오전" : timeSlot === "PM" ? "오후" : "";
  return { day, period };
}

/**
 * 내 기도방·내 기도제목은 API 행으로만 만든다. 역할이 없거나 일요일은 뺀다.
 * 승인 대기 신청은 이미 참여 중인 기도방이 아니면 `pending` 행으로 붙인다.
 */
export function buildPrayerOverview(
  cohorts: readonly PrayerCohortDto[],
  topics: readonly PrayerTopicDto[],
  applications: readonly PrayerApplicationDto[] = [],
): PrayerOverview {
  const rooms = new Map<string, PrayerOverviewRoom>();
  for (const cohort of cohorts) {
    const room = cohortToOverviewRoom(cohort);
    if (room) rooms.set(room.id, room);
  }
  for (const application of applications) {
    const room = applicationToOverviewRoom(application);
    if (room && !rooms.has(room.id)) rooms.set(room.id, room);
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
