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
  /** 모임 일정. 선택(빈 글자 가능). */
  schedule: string;
  /** 모임 장소. 선택(빈 글자 가능). */
  location: string;
  /** 켜면 소모임장이 가입 신청을 승인해야 참여된다. */
  requiresApproval: boolean;
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
  schedule: string;
  location: string;
  requiresApproval: boolean;
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
  /** 없으면 빈 글자. */
  schedule: string;
  /** 없으면 빈 글자. */
  location: string;
  requiresApproval: boolean;
  currentMembers: number;
  maxMembers: number;
  status: GroupStatus;
  leaderName: string;
  isLeader: boolean;
  isJoined: boolean;
  /** 내 가입 신청 상태(서버 myMemberStatus). 신청한 적 없거나 비로그인이면 null. */
  myApplicationStatus: GroupMemberStatus | null;
  /** 참여가 확정된 멤버 이름. */
  members: string[];
  /** 가입 승인 대기 멤버. 서버가 소모임장에게만 준다. */
  pendingMembers: GroupMemberDetail[];
  notices: GroupDetailNotice[];
}

export type GroupMemberStatus = "approved" | "pending" | "rejected";

export interface GroupMemberDetail {
  userId: string;
  userName: string;
  joinedLabel: string;
  isLeader: boolean;
  isMine: boolean;
  /** 서버 값이 없으면 approved(예전 응답). */
  status: GroupMemberStatus;
}

export interface GroupMemberStatusInput {
  groupId: string;
  targetUserId: string;
  status: Exclude<GroupMemberStatus, "pending">;
}
