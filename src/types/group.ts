import type { Member } from "./common";

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

export type GroupStatus = "open" | "closed";

export interface GroupNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  leader: Member;
  members: Member[];
  maxMembers: number;
  schedule: string;
  location: string;
  coverImage?: string;
  status: GroupStatus;
  isJoined: boolean;
  isFavorite: boolean;
  notices: GroupNotice[];
}

export interface GroupInput {
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  maxMembers: number;
  schedule: string;
  location: string;
  coverImage?: string;
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
