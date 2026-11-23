import {
  isRecord,
  optionalInteger,
  optionalOneOf,
  optionalString,
  readArrayField,
  requireBoolean,
  requireInteger,
  requireOneOf,
  requireString,
} from "../lib/parse";
import { invalidResponse as invalid } from "../lib/reportResponseIssue";
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
} from "../types/mypageApi";

const POST_STATUSES = ["AVAILABLE", "RESERVED", "COMPLETED"] as const;
const POST_STATUS_NAMES = ["나눔중", "예약완료", "나눔완료"] as const;
const GROUP_TYPES = ["GROUP", "VOLUNTEER"] as const;

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
