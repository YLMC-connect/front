import { ApiError } from "../lib/apiClient";
import type {
  MarketCategory,
  MarketDetail,
  MarketDetailComment,
  MarketOverviewItem,
  MarketStatus,
} from "../types/market";
import type { ShareCommentDto, ShareDetailDto } from "../types/marketApi";

const SHARE_STATUS_TO_DOMAIN = {
  AVAILABLE: "sharing",
  RESERVED: "reserved",
  COMPLETED: "done",
} as const satisfies Record<string, MarketStatus>;

const SHARE_CATEGORY_TO_DOMAIN = {
  CLOTHING_ACC: "cloth",
  APPLIANCE_FURNITURE: "home",
  BOOK_STATIONERY: "book",
  FOOD_DAILY: "food",
  BABY_KIDS: "baby",
  SPORTS_HOBBY: "sport",
  OTHER: "etc",
} as const satisfies Record<string, Exclude<MarketCategory, "all">>;

const DOMAIN_CATEGORY_TO_SHARE = {
  cloth: "CLOTHING_ACC",
  home: "APPLIANCE_FURNITURE",
  book: "BOOK_STATIONERY",
  food: "FOOD_DAILY",
  baby: "BABY_KIDS",
  sport: "SPORTS_HOBBY",
  etc: "OTHER",
} as const;

const SHARE_ITEM_STATUS_LABEL = {
  NEW: "새것",
  USED: "사용감 있음",
  DAMAGED: "파손 있음",
} as const;

const ITEM_STATUS_TO_SHARE = {
  새것: "NEW",
  "사용감 있음": "USED",
  "파손 있음": "DAMAGED",
} as const;

const CATEGORY_LABEL = {
  cloth: "의류·잡화",
  home: "가전·가구",
  book: "도서·문구",
  food: "식품·생필품",
  baby: "유아·아동용품",
  sport: "스포츠·취미",
  etc: "기타",
} as const;

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

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return readString(value);
}

export function formatShareCreatedLabel(
  createdAt: string,
  now: Date = new Date(),
) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export function toShareCategoryCode(category: Exclude<MarketCategory, "all">) {
  return DOMAIN_CATEGORY_TO_SHARE[category];
}

export function toShareItemStatus(condition: string) {
  return ITEM_STATUS_TO_SHARE[condition as keyof typeof ITEM_STATUS_TO_SHARE];
}

export function mapShareOverviewItem(
  data: unknown,
  currentUserId: string | null,
  now?: Date,
): MarketOverviewItem | null {
  if (!isRecord(data)) return null;
  const id = readId(data.id);
  const title = readString(data.title);
  const authorId = readString(data.authorId);
  const createdAt = readString(data.createdAt);
  const status =
    SHARE_STATUS_TO_DOMAIN[
      readString(data.status) as keyof typeof SHARE_STATUS_TO_DOMAIN
    ];
  const category =
    SHARE_CATEGORY_TO_DOMAIN[
      readString(data.categoryCode) as keyof typeof SHARE_CATEGORY_TO_DOMAIN
    ];
  if (!id || !title || !authorId || !createdAt || !status || !category) {
    return null;
  }

  return {
    id,
    thumbSeed: Number.parseInt(id, 10) || 0,
    title,
    authorName: authorId,
    createdLabel: formatShareCreatedLabel(createdAt, now),
    status,
    category,
    isMine: Boolean(currentUserId && authorId === currentUserId),
  };
}

export function mapShareDetail(
  data: unknown,
  comments: MarketDetailComment[],
  currentUserId: string | null,
  now?: Date,
): MarketDetail {
  if (!isRecord(data)) invalid(data);
  const id = readId(data.id);
  const title = readString(data.title);
  const content = readString(data.content) ?? "";
  const authorId = readString(data.authorId);
  const authorName = readString(data.authorName) ?? authorId;
  const createdAt = readString(data.createdAt);
  const status =
    SHARE_STATUS_TO_DOMAIN[
      readString(data.status) as keyof typeof SHARE_STATUS_TO_DOMAIN
    ];
  const category =
    SHARE_CATEGORY_TO_DOMAIN[
      readString(data.categoryCode) as keyof typeof SHARE_CATEGORY_TO_DOMAIN
    ];
  if (!id || !title || !authorId || !createdAt || !status || !category) {
    invalid(data);
  }

  const mappedId = id as string;
  const mappedTitle = title as string;
  const mappedAuthorId = authorId as string;
  const mappedCreatedAt = createdAt as string;
  const mappedStatus = status as MarketStatus;
  const mappedCategory = category as Exclude<MarketCategory, "all">;
  const dto = data as unknown as ShareDetailDto;
  const condition =
    SHARE_ITEM_STATUS_LABEL[
      readString(dto.itemStatus) as keyof typeof SHARE_ITEM_STATUS_LABEL
    ] ?? "";

  return {
    id: mappedId,
    thumbSeed: Number.parseInt(mappedId, 10) || 0,
    title: mappedTitle,
    content,
    categoryLabel: CATEGORY_LABEL[mappedCategory],
    conditionLabel: condition,
    status: mappedStatus,
    authorName: authorName ?? mappedAuthorId,
    createdLabel: formatShareCreatedLabel(mappedCreatedAt, now),
    isMine: Boolean(currentUserId && mappedAuthorId === currentUserId),
    comments,
  };
}

export function mapShareComment(
  data: unknown,
  currentUserId: string | null,
  now?: Date,
): MarketDetailComment | null {
  if (!isRecord(data)) return null;
  const id = readId(data.id);
  const content = readString(data.content);
  const authorId = readString(data.authorId);
  const authorName = readString(data.authorName) ?? authorId;
  const createdAt = readString(data.createdAt);
  if (!id || !content || !authorId || !authorName || !createdAt) return null;

  const dto = data as unknown as ShareCommentDto;
  const updatedAt = readString(dto.updatedAt);
  return {
    id,
    authorName,
    createdLabel: formatShareCreatedLabel(createdAt, now),
    content,
    isMine: Boolean(currentUserId && authorId === currentUserId),
    isEdited: Boolean(updatedAt && updatedAt !== createdAt),
    isDeleted: false,
  };
}

export function mapShareCommentList(
  data: unknown,
  currentUserId: string | null,
  now?: Date,
) {
  if (!Array.isArray(data)) invalid(data);
  return data.flatMap((item) => {
    const comment = mapShareComment(item, currentUserId, now);
    return comment ? [comment] : [];
  });
}
