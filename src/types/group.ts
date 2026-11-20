export type GroupCategory =
  | "all"
  | "bible"
  | "pray"
  | "volunteer"
  | "hobby"
  | "sport"
  | "cell"
  | "mission"
  | "carpool"
  | "etc";

/** pending(승인대기)·rejected(반려)는 서버 승인 절차 상태. 소모임장이 바꿀 수 있는 건 open·closed 뿐이다. */
export type GroupStatus = "open" | "closed" | "pending" | "rejected";
export type GroupRecruitStatus = Extract<GroupStatus, "open" | "closed">;

export interface GroupInput {
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  maxMembers: number;
  coverImage?: string;
  /** 개설 종류. 없으면 소모임. */
  kind?: "group" | "service";
}

export interface GroupUpdateInput {
  groupId: string;
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  maxMembers: number;
}

export interface GroupStatusUpdateInput {
  groupId: string;
  status: GroupRecruitStatus;
}

export interface GroupKickMemberInput {
  groupId: string;
  targetUserId: string;
}

export interface GroupTransferLeaderInput {
  groupId: string;
  newLeaderUserId: string;
}

export interface GroupOverviewItem {
  id: string;
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  currentMembers: number;
  maxMembers: number;
  status: GroupStatus;
  coverSeed: number;
  isJoined: boolean;
}

export interface GroupServiceOverviewItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  currentMembers: number;
  maxMembers: number;
  statusLabel: string;
  coverSeed: number;
  linkedGroupId: string;
}

export interface GroupOverview {
  groups: GroupOverviewItem[];
  services: GroupServiceOverviewItem[];
}

export interface GroupDetailNotice {
  id: string;
  title: string;
  content: string;
  preview: string;
  createdLabel: string;
  isEdited: boolean;
}

export interface GroupNoticeInput {
  groupId: string;
  title: string;
  content: string;
}

export interface GroupNoticeUpdateInput extends GroupNoticeInput {
  noticeId: string;
}

export interface GroupNoticeTarget {
  groupId: string;
  noticeId: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string;
  categoryLabel: string;
  currentMembers: number;
  maxMembers: number;
  status: GroupStatus;
  leaderName: string;
  isLeader: boolean;
  isJoined: boolean;
  members: string[];
  notices: GroupDetailNotice[];
}

export interface GroupMemberDetail {
  userId: string;
  userName: string;
  joinedLabel: string;
  isLeader: boolean;
  isMine: boolean;
}
