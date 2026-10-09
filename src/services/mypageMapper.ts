import { ApiError } from "../lib/apiClient";
import type {
  MyPageActivityComment,
  MyPageActivityGroup,
  MyPageActivityList,
  MyPageActivityPost,
  MyPageActivityTone,
} from "../types/mypage";
import type {
  MyPageActivityPage,
  MyPageActivityPageQuery,
  MyPageCommentDto,
  MyPageGroupDto,
  MyPageGroupPageQuery,
  MyPageGroupType,
  MyPageLifeStudyApplication,
  MyPageLifeStudyCompleted,
  MyPageLifeStudyHistoryDto,
  MyPageLifeStudyOngoing,
  MyPagePostDto,
  MyPagePostStatus,
  MyPagePostStatusName,
  MyPagePrayerActivityItem,
  MyPagePrayerHistoryDto,
  MyPagePrayerMemberRole,
  MyPagePrayerMemberRoleName,
  MyPagePrayerTimeSlot,
  MyPagePrayerTimeSlotName,
} from "../types/mypageApi";

const POST_STATUSES = ["AVAILABLE", "RESERVED", "COMPLETED"] as const;
const POST_STATUS_NAMES = ["나눔중", "예약완료", "나눔완료"] as const;
const GROUP_TYPES = ["GROUP", "VOLUNTEER"] as const;
const TIME_SLOTS = ["AM", "PM"] as const;
const TIME_SLOT_NAMES = ["오전", "오후"] as const;
const MEMBER_ROLES = ["LEADER", "MEMBER"] as const;
const MEMBER_ROLE_NAMES = ["팀장", "중보기도요원"] as const;

const POST_TONE: Record<MyPagePostStatus, MyPageActivityTone> = {
  AVAILABLE: "primary",
  RESERVED: "warn",
  COMPLETED: "mute",
};

const APPLICATION_KEYS = [
  "cohortId",
  "lifeStudyId",
  "name",
  "cohortNumber",
  "startDate",
  "status",
  "description",
  "appliedAt",
] as const;

const ONGOING_KEYS = [
  "cohortId",
  "lifeStudyId",
  "name",
  "cohortNumber",
  "period",
  "progress",
  "week",
  "status",
  "nextClass",
  "attendCount",
  "totalClassCount",
] as const;

const COMPLETED_KEYS = [
  "lifeStudyId",
  "name",
  "cohortId",
  "cohortNumber",
  "status",
  "completedAt",
  "attendCount",
  "totalClassCount",
] as const;

export const MY_PAGE_POST_SORT = "id,desc";
export const MY_PAGE_COMMENT_SORT = "id,desc";
export const MY_PAGE_GROUP_SORT = "joinedAt,desc";

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

function requireYoil(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  const value = requireInteger(data, key, source);
  if (value < 0 || value > 6) invalid(source);
  return value;
}

export function formatMyPageActivityDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function normalizeMyPageActivityQuery(
  query: MyPageActivityPageQuery | undefined,
  defaultSort: string,
) {
  const page = query?.page ?? 0;
  const size = query?.size ?? 10;
  const sort = query?.sort ?? defaultSort;
  if (!Number.isInteger(page) || page < 0) {
    throw new Error("활동 목록 page는 0부터입니다.");
  }
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("활동 목록 size는 1 이상입니다.");
  }
  if (!sort.trim()) throw new Error("활동 목록 sort가 필요합니다.");
  return { page, size, sort };
}

export function normalizeMyPageGroupQuery(query?: MyPageGroupPageQuery) {
  const page = normalizeMyPageActivityQuery(query, MY_PAGE_GROUP_SORT);
  const type = query?.type;
  if (type !== undefined && !GROUP_TYPES.includes(type)) {
    throw new Error("소모임 type은 GROUP 또는 VOLUNTEER입니다.");
  }
  return { ...page, type };
}

function readPage<T>(
  data: unknown,
  readItem: (item: unknown, source: unknown) => T,
): MyPageActivityPage<T> {
  if (!isRecord(data) || !Array.isArray(data.content)) invalid(data);
  const currentPage = requireInteger(data, "currentPage", data);
  if (currentPage < 1) invalid(data);
  return {
    content: data.content.map((item) => readItem(item, data)),
    totalElements: requireInteger(data, "totalElements", data),
    totalPages: requireInteger(data, "totalPages", data),
    currentPage,
    size: requireInteger(data, "size", data),
    hasNext: requireBoolean(data, "hasNext", data),
  };
}

function toActivityList<TDto, TItem>(
  page: MyPageActivityPage<TDto>,
  mapItem: (item: TDto) => TItem,
): MyPageActivityList<TItem> {
  return {
    items: page.content.map(mapItem),
    currentPage: page.currentPage,
    size: page.size,
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    hasNext: page.hasNext,
    nextPage: page.hasNext ? page.currentPage : null,
  };
}

function readPost(value: unknown, source: unknown): MyPagePostDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    title: requireString(value, "title", source),
    content: requireString(value, "content", source),
    status: requireOneOf<MyPagePostStatus>(
      value,
      "status",
      source,
      POST_STATUSES,
    ),
    statusName: requireOneOf<MyPagePostStatusName>(
      value,
      "statusName",
      source,
      POST_STATUS_NAMES,
    ),
    categoryCode: requireString(value, "categoryCode", source),
    itemStatus: requireString(value, "itemStatus", source),
    viewCount: requireInteger(value, "viewCount", source),
    thumbnailUrl: requireString(value, "thumbnailUrl", source),
    createdAt: requireString(value, "createdAt", source),
  };
}

function readComment(value: unknown, source: unknown): MyPageCommentDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    shareId: requireInteger(value, "shareId", source),
    shareTitle: requireString(value, "shareTitle", source),
    content: requireString(value, "content", source),
    createdAt: requireString(value, "createdAt", source),
  };
}

function readGroup(value: unknown, source: unknown): MyPageGroupDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    title: requireString(value, "title", source),
    type: requireOneOf<MyPageGroupType>(value, "type", source, GROUP_TYPES),
    categoryCode: requireString(value, "categoryCode", source),
    maxParticipants: requireInteger(value, "maxParticipants", source),
    currentParticipants: requireInteger(value, "currentParticipants", source),
    status: requireString(value, "status", source),
    leaderId: requireString(value, "leaderId", source),
    leaderName: requireString(value, "leaderName", source),
    joinedAt: requireString(value, "joinedAt", source),
  };
}

export function mapMyPagePostRow(post: MyPagePostDto): MyPageActivityPost {
  return {
    id: String(post.id),
    thumb: post.id,
    title: post.title,
    status: post.statusName,
    tone: POST_TONE[post.status],
    date: formatMyPageActivityDate(post.createdAt),
  };
}

export function mapMyPageCommentRow(
  comment: MyPageCommentDto,
): MyPageActivityComment {
  return {
    id: String(comment.id),
    content: comment.content,
    src: comment.shareTitle,
    date: formatMyPageActivityDate(comment.createdAt),
  };
}

export function mapMyPageGroupRow(group: MyPageGroupDto): MyPageActivityGroup {
  return {
    id: String(group.id),
    name: group.title,
    members: group.currentParticipants,
    joined: formatMyPageActivityDate(group.joinedAt),
    seed: group.id,
  };
}

export function readMyPagePostList(
  data: unknown,
): MyPageActivityList<MyPageActivityPost> {
  return toActivityList(readPage(data, readPost), mapMyPagePostRow);
}

export function readMyPageCommentList(
  data: unknown,
): MyPageActivityList<MyPageActivityComment> {
  return toActivityList(readPage(data, readComment), mapMyPageCommentRow);
}

export function readMyPageGroupList(
  data: unknown,
): MyPageActivityList<MyPageActivityGroup> {
  return toActivityList(readPage(data, readGroup), mapMyPageGroupRow);
}

function readNamedItem<T extends string>(
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

function readNamedList<T extends string>(
  data: unknown,
  source: unknown,
  keys: readonly T[],
): { [K in T]: unknown }[] {
  if (!Array.isArray(data)) invalid(source);
  return data.map((item) => readNamedItem(item, source, keys));
}

export function readMyPageLifeStudyHistory(
  data: unknown,
): MyPageLifeStudyHistoryDto {
  if (!isRecord(data)) invalid(data);
  return {
    completionCount: requireInteger(data, "completionCount", data),
    applications: readNamedList(
      data.applications,
      data,
      APPLICATION_KEYS,
    ) as MyPageLifeStudyApplication[],
    ongoing: readNamedList(
      data.ongoing,
      data,
      ONGOING_KEYS,
    ) as MyPageLifeStudyOngoing[],
    completed: readNamedList(
      data.completed,
      data,
      COMPLETED_KEYS,
    ) as MyPageLifeStudyCompleted[],
  };
}

function readPrayerActivity(
  value: unknown,
  source: unknown,
): MyPagePrayerActivityItem {
  if (!isRecord(value)) invalid(source);
  return {
    cohortId: requireInteger(value, "cohortId", source),
    cohortName: requireString(value, "cohortName", source),
    cohortYear: requireInteger(value, "cohortYear", source),
    yoil: requireYoil(value, "yoil", source),
    yoilName: requireString(value, "yoilName", source),
    timeSlot: requireOneOf<MyPagePrayerTimeSlot>(
      value,
      "timeSlot",
      source,
      TIME_SLOTS,
    ),
    timeSlotName: requireOneOf<MyPagePrayerTimeSlotName>(
      value,
      "timeSlotName",
      source,
      TIME_SLOT_NAMES,
    ),
    memberRole: requireOneOf<MyPagePrayerMemberRole>(
      value,
      "memberRole",
      source,
      MEMBER_ROLES,
    ),
    memberRoleName: requireOneOf<MyPagePrayerMemberRoleName>(
      value,
      "memberRoleName",
      source,
      MEMBER_ROLE_NAMES,
    ),
    joinedAt: requireString(value, "joinedAt", source),
    leftAt: requireNullableString(value, "leftAt", source),
    period: requireString(value, "period", source),
    leaveReason: requireNullableString(value, "leaveReason", source),
    active: requireBoolean(value, "active", source),
  };
}

export function readMyPagePrayerHistory(data: unknown): MyPagePrayerHistoryDto {
  if (!isRecord(data)) invalid(data);
  if (
    !Array.isArray(data.currentActivities) ||
    !Array.isArray(data.pastActivities)
  ) {
    invalid(data);
  }
  return {
    activeCount: requireInteger(data, "activeCount", data),
    totalPeriod: requireString(data, "totalPeriod", data),
    totalPeriodDays: requireInteger(data, "totalPeriodDays", data),
    totalRoomCount: requireInteger(data, "totalRoomCount", data),
    currentActivities: data.currentActivities.map((item) =>
      readPrayerActivity(item, data),
    ),
    pastActivities: data.pastActivities.map((item) =>
      readPrayerActivity(item, data),
    ),
  };
}
