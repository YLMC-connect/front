import {
  mockGroupDetails,
  mockGroupMembers,
  mockGroupOverview,
} from "../mocks/groups";
import type {
  GroupDetail,
  GroupMemberDetail,
  GroupNoticeInput,
  GroupNoticeTarget,
  GroupNoticeUpdateInput,
  GroupOverview,
} from "../types/group";

export interface GroupDataSource {
  getOverview(): Promise<GroupOverview>;
  getDetail(id: string): Promise<GroupDetail>;
  getMembers(id: string): Promise<GroupMemberDetail[]>;
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

function getMockNotices(groupId: string) {
  const detail = mockGroupDetails[groupId];
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
    return mockGroupOverview;
  },
  async getDetail(id) {
    await delay();
    const detail = mockGroupDetails[id];
    if (!detail) throw new Error("존재하지 않는 소모임입니다.");
    return {
      ...detail,
      notices: getMockNotices(id).map((notice) => ({ ...notice })),
    };
  },
  async getMembers(id) {
    await delay();
    const members = mockGroupMembers[id];
    if (!members) throw new Error("존재하지 않는 소모임입니다.");
    return members;
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
    createNotice: (input: GroupNoticeInput) =>
      dataSource.createNotice(normalizeNoticeInput(input)),
    updateNotice: (input: GroupNoticeUpdateInput) =>
      dataSource.updateNotice(normalizeNoticeInput(input)),
    deleteNotice: (input: GroupNoticeTarget) => dataSource.deleteNotice(input),
  };
}

const groupService = createGroupService(mockGroupDataSource);

export const fetchGroupOverview = groupService.fetchOverview;
export const fetchGroupDetail = groupService.fetchDetail;
export const fetchGroupMembers = groupService.fetchMembers;
export const createGroupNotice = groupService.createNotice;
export const updateGroupNotice = groupService.updateNotice;
export const deleteGroupNotice = groupService.deleteNotice;
