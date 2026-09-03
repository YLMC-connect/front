import Constants from "expo-constants";
import {
  mockGroupDetails,
  mockGroupMembers,
  mockGroupOverview,
} from "../mocks/groups";
import { MOCK_USER } from "../mocks/auth";
import { GROUP_CATEGORIES } from "../constants/domainOptions";
import { httpGroupDataSource } from "./groupHttpDataSource";
import type {
  GroupDetail,
  GroupMemberDetail,
  GroupNoticeInput,
  GroupNoticeTarget,
  GroupNoticeUpdateInput,
  GroupOverview,
  GroupInput,
} from "../types/group";

export interface GroupDataSource {
  getOverview(): Promise<GroupOverview>;
  getDetail(id: string): Promise<GroupDetail>;
  getMembers(id: string): Promise<GroupMemberDetail[]>;
  createGroup(input: GroupInput): Promise<GroupDetail>;
  createNotice(
    input: GroupNoticeInput,
  ): Promise<GroupDetail["notices"][number]>;
  updateNotice(
    input: GroupNoticeUpdateInput,
  ): Promise<GroupDetail["notices"][number]>;
  deleteNotice(input: GroupNoticeTarget): Promise<void>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const mockGroupNotices = new Map<string, GroupDetail["notices"]>();
const mockCreatedGroups: GroupOverview["groups"] = [];
const mockCreatedDetails = new Map<string, GroupDetail>();
const mockCreatedMembers = new Map<string, GroupMemberDetail[]>();

function getMockNotices(groupId: string) {
  const detail = mockCreatedDetails.get(groupId) ?? mockGroupDetails[groupId];
  if (!detail) throw new Error("존재하지 않는 소모임입니다.");
  const notices = mockGroupNotices.get(groupId);
  if (notices) return notices;
  const initial = detail.notices.map((notice) => ({ ...notice }));
  mockGroupNotices.set(groupId, initial);
  return initial;
}

function toNoticePreview(content: string) {
  return content.replace(/\s+/g, " ").trim().slice(0, 100);
}

export const mockGroupDataSource: GroupDataSource = {
  async getOverview() {
    await delay();
    return {
      ...mockGroupOverview,
      groups: [...mockCreatedGroups, ...mockGroupOverview.groups],
    };
  },
  async getDetail(id) {
    await delay();
    const detail = mockCreatedDetails.get(id) ?? mockGroupDetails[id];
    if (!detail) throw new Error("존재하지 않는 소모임입니다.");
    return {
      ...detail,
      notices: getMockNotices(id).map((notice) => ({ ...notice })),
    };
  },
  async getMembers(id) {
    await delay();
    const members = mockCreatedMembers.get(id) ?? mockGroupMembers[id];
    if (!members) throw new Error("존재하지 않는 소모임입니다.");
    return members;
  },
  async createGroup(input) {
    await delay();
    const id = `mock-group-${Date.now()}`;
    const categoryLabel =
      GROUP_CATEGORIES.find(({ key }) => key === input.category)?.label ??
      input.category;
    const detail: GroupDetail = {
      id,
      name: input.name,
      description: input.description,
      categoryLabel,
      currentMembers: 1,
      maxMembers: input.maxMembers,
      status: "open",
      leaderName: MOCK_USER.name,
      isLeader: true,
      isJoined: true,
      members: [MOCK_USER.name],
      notices: [],
    };
    mockCreatedDetails.set(id, detail);
    mockCreatedMembers.set(id, [
      {
        userId: MOCK_USER.id,
        userName: MOCK_USER.name,
        joinedLabel: "오늘",
        isLeader: true,
        isMine: true,
      },
    ]);
    mockCreatedGroups.unshift({
      id,
      name: input.name,
      description: input.description,
      category: input.category,
      currentMembers: 1,
      maxMembers: input.maxMembers,
      status: "open",
      coverSeed: mockGroupOverview.groups.length + mockCreatedGroups.length,
      isJoined: true,
    });
    mockGroupNotices.set(id, []);
    return detail;
  },
  async createNotice(input) {
    await delay();
    const notices = getMockNotices(input.groupId);
    const notice = {
      id: `mock-notice-${input.groupId}-${Date.now()}`,
      title: input.title,
      content: input.content,
      preview: toNoticePreview(input.content),
      createdLabel: "방금 전",
      isEdited: false,
    };
    mockGroupNotices.set(input.groupId, [notice, ...notices]);
    return notice;
  },
  async updateNotice(input) {
    await delay();
    const notices = getMockNotices(input.groupId);
    const current = notices.find(({ id }) => id === input.noticeId);
    if (!current) throw new Error("존재하지 않는 공지입니다.");
    const updated = {
      ...current,
      title: input.title,
      content: input.content,
      preview: toNoticePreview(input.content),
      isEdited: true,
    };
    mockGroupNotices.set(
      input.groupId,
      notices.map((notice) =>
        notice.id === input.noticeId ? updated : notice,
      ),
    );
    return updated;
  },
  async deleteNotice(input) {
    await delay();
    const notices = getMockNotices(input.groupId);
    if (!notices.some(({ id }) => id === input.noticeId)) {
      throw new Error("존재하지 않는 공지입니다.");
    }
    mockGroupNotices.set(
      input.groupId,
      notices.filter(({ id }) => id !== input.noticeId),
    );
  },
};

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
    fetchDetail: (id: string) => dataSource.getDetail(id),
    fetchMembers: (id: string) => dataSource.getMembers(id),
    createGroup: (input: GroupInput) => {
      const normalized = {
        ...input,
        name: input.name.trim(),
        description: input.description.trim(),
        schedule: input.schedule.trim(),
        location: input.location.trim(),
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
      if (!normalized.schedule) throw new Error("모임 일정을 입력해주세요.");
      if (!normalized.location) throw new Error("모임 장소를 입력해주세요.");
      return dataSource.createGroup(normalized);
    },
    createNotice: (input: GroupNoticeInput) =>
      dataSource.createNotice(normalizeNoticeInput(input)),
    updateNotice: (input: GroupNoticeUpdateInput) =>
      dataSource.updateNotice(normalizeNoticeInput(input)),
    deleteNotice: (input: GroupNoticeTarget) => dataSource.deleteNotice(input),
  };
}

function resolveGroupAdapterMode(): "http" | "mock" {
  const fromEnv = process.env.EXPO_PUBLIC_GROUP_ADAPTER;
  if (fromEnv === "http" || fromEnv === "mock") return fromEnv;
  return Constants.expoConfig?.extra?.groupAdapter === "http" ? "http" : "mock";
}

const groupService = createGroupService(
  resolveGroupAdapterMode() === "http"
    ? httpGroupDataSource
    : mockGroupDataSource,
);

export const fetchGroupOverview = groupService.fetchOverview;
export const fetchGroupDetail = groupService.fetchDetail;
export const fetchGroupMembers = groupService.fetchMembers;
export const createGroup = groupService.createGroup;
export const createGroupNotice = groupService.createNotice;
export const updateGroupNotice = groupService.updateNotice;
export const deleteGroupNotice = groupService.deleteNotice;
