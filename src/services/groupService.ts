import { httpGroupDataSource } from "./groupHttpDataSource";
import type {
  GroupDetail,
  GroupMemberDetail,
  GroupNoticeInput,
  GroupNoticeTarget,
  GroupNoticeUpdateInput,
  GroupOverview,
  GroupInput,
  GroupUpdateInput,
  GroupStatusUpdateInput,
  GroupKickMemberInput,
  GroupTransferLeaderInput,
} from "../types/group";

export interface GroupOverviewPage {
  groups: GroupOverview["groups"];
  services: GroupOverview["services"];
  /** 내 모임 탭은 페이지에 실린 목록이 아니라 `/my` 전체 결과를 쓴다. */
  myGroups: GroupOverview["groups"];
  hasNext: boolean;
  nextCursor?: number | null;
}

export interface GroupDataSource {
  getOverview(): Promise<GroupOverview>;
  getOverviewPage?(params?: {
    lastId?: number | null;
    size?: number;
  }): Promise<GroupOverviewPage>;
  getDetail(id: string): Promise<GroupDetail>;
  getMembers(id: string): Promise<GroupMemberDetail[]>;
  createGroup(input: GroupInput): Promise<GroupDetail>;
  updateGroup(input: GroupUpdateInput): Promise<GroupDetail>;
  deleteGroup(id: string): Promise<void>;
  kickMember(input: GroupKickMemberInput): Promise<void>;
  transferLeader(input: GroupTransferLeaderInput): Promise<void>;
  updateGroupStatus(input: GroupStatusUpdateInput): Promise<GroupDetail>;
  joinGroup(id: string): Promise<GroupDetail>;
  leaveGroup(id: string): Promise<GroupDetail>;
  createNotice(
    input: GroupNoticeInput,
  ): Promise<GroupDetail["notices"][number]>;
  updateNotice(
    input: GroupNoticeUpdateInput,
  ): Promise<GroupDetail["notices"][number]>;
  deleteNotice(input: GroupNoticeTarget): Promise<void>;
}

function normalizeNoticeInput<T extends GroupNoticeInput>(input: T): T {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title) throw new Error("공지 제목을 입력해주세요.");
  if (!content) throw new Error("공지 내용을 입력해주세요.");
  if (title.length > 30) throw new Error("공지 제목은 30자 이하입니다.");
  if (content.length > 500) throw new Error("공지 내용은 500자 이하입니다.");
  return { ...input, title, content };
}

export function createGroupService(dataSource: GroupDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchOverviewPage: (params?: { lastId?: number | null; size?: number }) => {
      if (dataSource.getOverviewPage) {
        return dataSource.getOverviewPage(params);
      }
      return dataSource.getOverview().then((res) => ({
        groups: res.groups,
        services: res.services,
        myGroups: res.groups.filter((group) => group.isJoined),
        hasNext: false,
        nextCursor: null,
      }));
    },
    fetchDetail: (id: string) => dataSource.getDetail(id),
    fetchMembers: (id: string) => dataSource.getMembers(id),
    createGroup: (input: GroupInput) => {
      const normalized = {
        ...input,
        name: input.name.trim(),
        description: input.description.trim(),
      };
      if (normalized.name.length < 2 || normalized.name.length > 20) {
        throw new Error("소모임명은 2~20자로 입력해주세요.");
      }
      if (
        normalized.description.length < 5 ||
        normalized.description.length > 200
      ) {
        throw new Error("설명은 5~200자로 입력해주세요.");
      }
      if (normalized.maxMembers < 2 || normalized.maxMembers > 100) {
        throw new Error("최대 인원은 2~100명으로 입력해주세요.");
      }
      return dataSource.createGroup(normalized);
    },
    updateGroup: (input: GroupUpdateInput) => {
      const normalized = {
        ...input,
        name: input.name.trim(),
        description: input.description.trim(),
      };
      if (normalized.name.length < 2 || normalized.name.length > 20) {
        throw new Error("소모임명은 2~20자로 입력해주세요.");
      }
      if (
        normalized.description.length < 5 ||
        normalized.description.length > 200
      ) {
        throw new Error("설명은 5~200자로 입력해주세요.");
      }
      if (normalized.maxMembers < 2 || normalized.maxMembers > 100) {
        throw new Error("최대 인원은 2~100명으로 입력해주세요.");
      }
      return dataSource.updateGroup(normalized);
    },
    deleteGroup: (id: string) => dataSource.deleteGroup(id),
    kickMember: (input: GroupKickMemberInput) => dataSource.kickMember(input),
    transferLeader: (input: GroupTransferLeaderInput) =>
      dataSource.transferLeader(input),
    updateGroupStatus: (input: GroupStatusUpdateInput) =>
      dataSource.updateGroupStatus(input),
    joinGroup: async (id: string) => {
      const detail = await dataSource.getDetail(id);
      if (detail.isJoined) return detail;
      if (detail.status === "closed") {
        throw new Error("모집이 마감됐어요");
      }
      if (detail.currentMembers >= detail.maxMembers) {
        throw new Error("인원이 꽉 찼습니다");
      }
      return dataSource.joinGroup(id);
    },
    leaveGroup: async (id: string) => {
      const detail = await dataSource.getDetail(id);
      if (detail.isLeader) {
        throw new Error("소모임장은 탈퇴할 수 없어요. 먼저 이관해주세요");
      }
      if (!detail.isJoined) return detail;
      return dataSource.leaveGroup(id);
    },
    createNotice: (input: GroupNoticeInput) =>
      dataSource.createNotice(normalizeNoticeInput(input)),
    updateNotice: (input: GroupNoticeUpdateInput) =>
      dataSource.updateNotice(normalizeNoticeInput(input)),
    deleteNotice: (input: GroupNoticeTarget) => dataSource.deleteNotice(input),
  };
}

const groupService = createGroupService(httpGroupDataSource);

export const fetchGroupOverview = groupService.fetchOverview;
export const fetchGroupOverviewPage = groupService.fetchOverviewPage;
export const fetchGroupDetail = groupService.fetchDetail;
export const fetchGroupMembers = groupService.fetchMembers;
export const createGroup = groupService.createGroup;
export const updateGroup = groupService.updateGroup;
export const deleteGroup = groupService.deleteGroup;
export const kickGroupMember = groupService.kickMember;
export const transferGroupLeader = groupService.transferLeader;
export const updateGroupStatus = groupService.updateGroupStatus;
export const joinGroup = groupService.joinGroup;
export const leaveGroup = groupService.leaveGroup;
export const createGroupNotice = groupService.createNotice;
export const updateGroupNotice = groupService.updateNotice;
export const deleteGroupNotice = groupService.deleteNotice;
