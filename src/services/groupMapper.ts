import { isRecord, readId, readString } from "../lib/parse";
import { invalidResponse as invalid } from "../lib/reportResponseIssue";
import type {
  GroupCategory,
  GroupDetail,
  GroupDetailNotice,
  GroupMemberDetail,
  GroupMemberStatus,
  GroupOverviewItem,
  GroupRecruitStatus,
  GroupServiceOverviewItem,
  GroupStatus,
} from "../types/group";
const COMMUNION_STATUS_TO_DOMAIN = {
  RECRUITING: "open",
  CLOSED: "closed",
  COMPLETED: "closed",
  PENDING: "pending",
  REJECTED: "rejected",
} as const satisfies Record<string, GroupStatus>;

const MEMBER_STATUS_TO_DOMAIN: Record<string, GroupMemberStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const GROUP_STATUS_LABEL: Record<GroupStatus, string> = {
  open: "모집중",
  closed: "모집완료",
  pending: "승인대기",
  rejected: "반려",
};

/** 배지 글자. */
export function groupStatusLabel(status: GroupStatus) {
  return GROUP_STATUS_LABEL[status];
}

/** 배지 색: 모집중=success, 승인대기=warning, 반려=danger, 모집완료=neutral. */
export function groupStatusTone(
  status: GroupStatus,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "open") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected") return "danger";
  return "neutral";
}

/** 승인 전·반려 모임은 공개 목록에 두지 않고 내 모임에서만 보인다. */
export function isApprovedGroupStatus(status: GroupStatus) {
  return status === "open" || status === "closed";
}

const COMMUNION_STATUS_LABEL = {
  RECRUITING: "모집중",
  CLOSED: "모집완료",
  COMPLETED: "모집완료",
} as const;

const COMMUNION_CATEGORY_TO_DOMAIN = {
  WORSHIP_STUDY: "bible",
  PRAYER: "pray",
  HOBBY_CULTURE: "hobby",
  SPORTS_HEALTH: "sport",
  OTHER: "etc",
} as const satisfies Record<string, Exclude<GroupCategory, "all">>;

const DOMAIN_CATEGORY_TO_COMMUNION = {
  bible: "WORSHIP_STUDY",
  pray: "PRAYER",
  hobby: "HOBBY_CULTURE",
  sport: "SPORTS_HEALTH",
  etc: "OTHER",
} as const;

const CATEGORY_LABEL = {
  bible: "성경공부·예배",
  pray: "기도모임",
  volunteer: "봉사",
  hobby: "취미·문화",
  sport: "운동·건강",
  cell: "목장",
  mission: "선교",
  carpool: "카풀",
  etc: "기타",
} as const;

function readCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function formatCommunionCreatedLabel(
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

export function toCommunionCategoryCode(
  category: Exclude<GroupCategory, "all">,
) {
  return DOMAIN_CATEGORY_TO_COMMUNION[
    category as keyof typeof DOMAIN_CATEGORY_TO_COMMUNION
  ];
}

export function toCommunionStatus(status: GroupRecruitStatus): string {
  return status === "open" ? "RECRUITING" : "COMPLETED";
}

export function toNoticePreview(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 100);
}

export function mapCommunionOverviewItem(
  data: unknown,
  joinedIds: Set<string>,
): GroupOverviewItem | null {
  if (!isRecord(data)) return null;
  const id = readId(data.id);
  const name = readString(data.title);
  const status =
    COMMUNION_STATUS_TO_DOMAIN[
      readString(data.status) as keyof typeof COMMUNION_STATUS_TO_DOMAIN
    ];
  const category =
    COMMUNION_CATEGORY_TO_DOMAIN[
      readString(data.categoryCode) as keyof typeof COMMUNION_CATEGORY_TO_DOMAIN
    ];
  const currentMembers = readCount(data.currentParticipants);
  const maxMembers = readCount(data.maxParticipants);
  if (
    !id ||
    !name ||
    !status ||
    !category ||
    currentMembers == null ||
    maxMembers == null
  ) {
    return null;
  }

  return {
    id,
    name,
    description: "",
    category,
    currentMembers,
    maxMembers,
    status,
    isJoined: joinedIds.has(id),
  };
}

export function mapCommunionServiceItem(
  data: unknown,
): GroupServiceOverviewItem | null {
  if (!isRecord(data)) return null;
  const id = readId(data.id);
  const name = readString(data.title);
  const currentMembers = readCount(data.currentParticipants);
  const maxMembers = readCount(data.maxParticipants);
  const status = readString(data.status);
  if (!id || !name || currentMembers == null || maxMembers == null || !status) {
    return null;
  }
  const statusLabel =
    COMMUNION_STATUS_LABEL[status as keyof typeof COMMUNION_STATUS_LABEL];
  if (!statusLabel) return null;

  return {
    id,
    name,
    description: "",
    schedule: readString(data.schedule) ?? "",
    currentMembers,
    maxMembers,
    statusLabel,
    linkedGroupId: id,
  };
}

export function mapCommunionDetail(
  data: unknown,
  notices: GroupDetailNotice[],
  members: GroupMemberDetail[],
  currentUserId: string | null,
): GroupDetail {
  if (!isRecord(data)) invalid(data);
  const id = readId(data.id);
  const name = readString(data.title);
  const content = readString(data.content) ?? "";
  const leaderId = readString(data.leaderId);
  const leaderName = readString(data.leaderName) ?? leaderId;
  const status =
    COMMUNION_STATUS_TO_DOMAIN[
      readString(data.status) as keyof typeof COMMUNION_STATUS_TO_DOMAIN
    ];
  const category =
    COMMUNION_CATEGORY_TO_DOMAIN[
      readString(data.categoryCode) as keyof typeof COMMUNION_CATEGORY_TO_DOMAIN
    ];
  const currentMembers = readCount(data.currentParticipants);
  const maxMembers = readCount(data.maxParticipants);
  if (
    !id ||
    !name ||
    !leaderId ||
    !leaderName ||
    !status ||
    !category ||
    currentMembers == null ||
    maxMembers == null
  ) {
    invalid(data);
  }

  const mappedId = id as string;
  const mappedName = name as string;
  const mappedLeaderId = leaderId as string;
  const mappedLeaderName = leaderName as string;
  const mappedStatus = status as GroupStatus;
  const mappedCategory = category as Exclude<GroupCategory, "all">;
  const isLeader = Boolean(currentUserId && mappedLeaderId === currentUserId);

  const approvedMembers = members.filter(
    (member) => member.status === "approved",
  );
  return {
    id: mappedId,
    name: mappedName,
    description: content,
    categoryLabel: CATEGORY_LABEL[mappedCategory],
    schedule: readString(data.schedule) ?? "",
    location: readString(data.location) ?? "",
    requiresApproval: data.requiresApproval === true,
    currentMembers: currentMembers as number,
    maxMembers: maxMembers as number,
    status: mappedStatus,
    leaderName: mappedLeaderName,
    isLeader,
    isJoined:
      isLeader ||
      Boolean(
        currentUserId &&
        approvedMembers.some((member) => member.userId === currentUserId),
      ),
    // 화면은 첫 멤버에 소모임장 왕관을 그리므로 소모임장을 맨 앞에 둔다.
    members: [...approvedMembers]
      .sort((a, b) => Number(b.isLeader) - Number(a.isLeader))
      .map((member) => member.userName),
    pendingMembers: members.filter((member) => member.status === "pending"),
    notices,
  };
}

export function mapCommunionNotice(
  data: unknown,
  now?: Date,
): GroupDetailNotice | null {
  if (!isRecord(data)) return null;
  const id = readId(data.id);
  const title = readString(data.title);
  const content = readString(data.content);
  const createdAt = readString(data.createdAt);
  if (!id || !title || !content || !createdAt) return null;
  const updatedAt = readString(data.updatedAt);
  return {
    id,
    title,
    content,
    preview: toNoticePreview(content),
    createdLabel: formatCommunionCreatedLabel(createdAt, now),
    isEdited: Boolean(updatedAt && updatedAt !== createdAt),
  };
}

export function mapCommunionNoticeList(data: unknown, now?: Date) {
  if (!Array.isArray(data)) invalid(data);
  return data.flatMap((item) => {
    const notice = mapCommunionNotice(item, now);
    return notice ? [notice] : [];
  });
}

export function mapCommunionMember(
  data: unknown,
  leaderId: string | null,
  currentUserId: string | null,
  now?: Date,
): GroupMemberDetail | null {
  if (!isRecord(data)) return null;
  const userId = readString(data.userId);
  const userName = readString(data.userName);
  const joinedAt = readString(data.joinedAt);
  if (!userId || !userName || !joinedAt) return null;
  return {
    userId,
    userName,
    joinedLabel: formatCommunionCreatedLabel(joinedAt, now),
    isLeader: Boolean(leaderId && userId === leaderId),
    isMine: Boolean(currentUserId && userId === currentUserId),
    status:
      MEMBER_STATUS_TO_DOMAIN[readString(data.status) ?? ""] ?? "approved",
  };
}

export function mapCommunionMemberList(
  data: unknown,
  leaderId: string | null,
  currentUserId: string | null,
  now?: Date,
) {
  if (!Array.isArray(data)) invalid(data);
  return data.flatMap((item) => {
    const member = mapCommunionMember(item, leaderId, currentUserId, now);
    return member ? [member] : [];
  });
}
