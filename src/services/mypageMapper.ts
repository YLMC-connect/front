import {
  invalidResponse as invalid,
  keepValidItems,
} from "../lib/reportResponseIssue";
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

/** 0=일 … 6=토. 범위 밖이면 null. */
function optionalYoil(data: Record<string, unknown>, key: string) {
  const value = optionalInteger(data, key);
  return value != null && value >= 0 && value <= 6 ? value : null;
}

/** 배열이 아니면 응답 오류. 형식이 틀린 항목만 빼고 돌려준다. */
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
  source: string,
  readItem: (item: unknown, source: unknown) => T,
): MyPageActivityPage<T> {
  if (!isRecord(data) || !Array.isArray(data.content)) invalid(data);
  const currentPage = requireInteger(data, "currentPage", data);
  if (currentPage < 1) invalid(data, "currentPage");
  return {
    content: readArrayField(data, "content", source, readItem),
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
    content: optionalString(value, "content"),
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
    categoryCode: optionalString(value, "categoryCode"),
    itemStatus: optionalString(value, "itemStatus"),
    viewCount: optionalInteger(value, "viewCount"),
    thumbnailUrl: optionalString(value, "thumbnailUrl"),
    createdAt: requireString(value, "createdAt", source),
  };
}

function readComment(value: unknown, source: unknown): MyPageCommentDto {
  if (!isRecord(value)) invalid(source);
  return {
    id: requireInteger(value, "id", source),
    shareId: optionalInteger(value, "shareId"),
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
    type: optionalOneOf<MyPageGroupType>(value, "type", GROUP_TYPES),
    categoryCode: optionalString(value, "categoryCode"),
    maxParticipants: optionalInteger(value, "maxParticipants"),
    currentParticipants: requireInteger(value, "currentParticipants", source),
    status: optionalString(value, "status"),
    leaderId: optionalString(value, "leaderId"),
    leaderName: optionalString(value, "leaderName"),
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
  return toActivityList(
    readPage(data, "mypage.posts", readPost),
    mapMyPagePostRow,
  );
}

export function readMyPageCommentList(
  data: unknown,
): MyPageActivityList<MyPageActivityComment> {
  return toActivityList(
    readPage(data, "mypage.comments", readComment),
    mapMyPageCommentRow,
  );
}

export function readMyPageGroupList(
  data: unknown,
): MyPageActivityList<MyPageActivityGroup> {
  return toActivityList(
    readPage(data, "mypage.groups", readGroup),
    mapMyPageGroupRow,
  );
}

/** 값 타입이 정해지지 않은 행. 없는 이름은 null 로 채운다. */
function namedItemReader<T extends string>(keys: readonly T[]) {
  return (value: unknown, source: unknown): { [K in T]: unknown } => {
    if (!isRecord(value)) invalid(source);
    const row = {} as { [K in T]: unknown };
    for (const key of keys) {
      row[key] = key in value ? value[key] : null;
    }
    return row;
  };
}

export function readMyPageLifeStudyHistory(
  data: unknown,
): MyPageLifeStudyHistoryDto {
  if (!isRecord(data)) invalid(data);
  const source = "mypage.lifeStudies";
  return {
    completionCount: optionalInteger(data, "completionCount"),
    applications: readArrayField(
      data,
      "applications",
      source,
      namedItemReader(APPLICATION_KEYS),
    ) as MyPageLifeStudyApplication[],
    ongoing: readArrayField(
      data,
      "ongoing",
      source,
      namedItemReader(ONGOING_KEYS),
    ) as MyPageLifeStudyOngoing[],
    completed: readArrayField(
      data,
      "completed",
      source,
      namedItemReader(COMPLETED_KEYS),
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
    cohortName: optionalString(value, "cohortName"),
    cohortYear: optionalInteger(value, "cohortYear"),
    yoil: optionalYoil(value, "yoil"),
    yoilName: optionalString(value, "yoilName"),
    timeSlot: optionalOneOf<MyPagePrayerTimeSlot>(
      value,
      "timeSlot",
      TIME_SLOTS,
    ),
    timeSlotName: optionalOneOf<MyPagePrayerTimeSlotName>(
      value,
      "timeSlotName",
      TIME_SLOT_NAMES,
    ),
    memberRole: optionalOneOf<MyPagePrayerMemberRole>(
      value,
      "memberRole",
      MEMBER_ROLES,
    ),
    memberRoleName: optionalOneOf<MyPagePrayerMemberRoleName>(
      value,
      "memberRoleName",
      MEMBER_ROLE_NAMES,
    ),
    joinedAt: optionalString(value, "joinedAt"),
    leftAt: optionalString(value, "leftAt"),
    period: optionalString(value, "period"),
    leaveReason: optionalString(value, "leaveReason"),
    active: optionalBoolean(value, "active"),
  };
}

export function readMyPagePrayerHistory(data: unknown): MyPagePrayerHistoryDto {
  if (!isRecord(data)) invalid(data);
  const source = "mypage.prayers";
  return {
    activeCount: optionalInteger(data, "activeCount"),
    totalPeriod: optionalString(data, "totalPeriod"),
    totalPeriodDays: optionalInteger(data, "totalPeriodDays"),
    totalRoomCount: optionalInteger(data, "totalRoomCount"),
    currentActivities: readArrayField(
      data,
      "currentActivities",
      source,
      readPrayerActivity,
    ),
    pastActivities: readArrayField(
      data,
      "pastActivities",
      source,
      readPrayerActivity,
    ),
  };
}
