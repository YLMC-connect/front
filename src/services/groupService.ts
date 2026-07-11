import {
  mockGroupDetails,
  mockGroupMembers,
  mockGroupOverview,
} from "../mocks/groups";
import type {
  GroupDetail,
  GroupMemberDetail,
  GroupOverview,
} from "../types/group";

export interface GroupDataSource {
  getOverview(): Promise<GroupOverview>;
  getDetail(id: string): Promise<GroupDetail>;
  getMembers(id: string): Promise<GroupMemberDetail[]>;
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockGroupDataSource: GroupDataSource = {
  async getOverview() {
    await delay();
    return mockGroupOverview;
  },
  async getDetail(id) {
    await delay();
    const detail = mockGroupDetails[id];
    if (!detail) throw new Error("존재하지 않는 소모임입니다.");
    return detail;
  },
  async getMembers(id) {
    await delay();
    const members = mockGroupMembers[id];
    if (!members) throw new Error("존재하지 않는 소모임입니다.");
    return members;
  },
};

export function createGroupService(dataSource: GroupDataSource) {
  return {
    fetchOverview: () => dataSource.getOverview(),
    fetchDetail: (id: string) => dataSource.getDetail(id),
    fetchMembers: (id: string) => dataSource.getMembers(id),
  };
}

const groupService = createGroupService(mockGroupDataSource);

export const fetchGroupOverview = groupService.fetchOverview;
export const fetchGroupDetail = groupService.fetchDetail;
export const fetchGroupMembers = groupService.fetchMembers;
