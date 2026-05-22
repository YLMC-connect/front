import { mockGroups } from "../mocks/groups";
import { MOCK_USER } from "../mocks/auth";
import type { Group, GroupCategory, GroupInput } from "../types/group";

let groups: Group[] = [...mockGroups];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchGroups(
  filter: GroupCategory = "all",
): Promise<Group[]> {
  await delay();
  if (filter === "all") return groups;
  return groups.filter((group) => group.category === filter);
}

export async function fetchGroup(id: string): Promise<Group> {
  await delay();
  const group = groups.find((candidate) => candidate.id === id);
  if (!group) throw new Error("존재하지 않는 소모임입니다.");
  return group;
}

export async function createGroup(input: GroupInput): Promise<Group> {
  await delay();
  const group: Group = {
    id: `group-${Date.now()}`,
    ...input,
    leader: MOCK_USER,
    members: [MOCK_USER],
    status: "open",
    isJoined: true,
    isFavorite: false,
    notices: [],
  };
  groups = [group, ...groups];
  return group;
}

export async function joinGroup(id: string): Promise<Group> {
  await delay();
  const target = await fetchGroup(id);

  if (
    target.status === "closed" ||
    target.members.length >= target.maxMembers
  ) {
    throw new Error("모집이 마감된 소모임입니다.");
  }

  groups = groups.map((group) =>
    group.id === id && !group.isJoined
      ? { ...group, isJoined: true, members: [...group.members, MOCK_USER] }
      : group,
  );
  return fetchGroup(id);
}

export async function leaveGroup(id: string): Promise<Group> {
  await delay();
  const target = await fetchGroup(id);

  if (target.leader.id === MOCK_USER.id) {
    throw new Error("소모임장은 대표 위임 후 탈퇴할 수 있습니다.");
  }

  groups = groups.map((group) =>
    group.id === id
      ? {
          ...group,
          isJoined: false,
          members: group.members.filter((member) => member.id !== MOCK_USER.id),
        }
      : group,
  );
  return fetchGroup(id);
}

export async function toggleGroupFavorite(id: string): Promise<Group> {
  await delay();
  groups = groups.map((group) =>
    group.id === id ? { ...group, isFavorite: !group.isFavorite } : group,
  );
  return fetchGroup(id);
}

export async function removeGroupMember(
  id: string,
  memberId: string,
): Promise<Group> {
  await delay();
  groups = groups.map((group) =>
    group.id === id
      ? {
          ...group,
          members: group.members.filter(
            (member) => member.id !== memberId || member.id === group.leader.id,
          ),
        }
      : group,
  );
  return fetchGroup(id);
}

export async function addGroupNotice(
  id: string,
  title: string,
  content: string,
): Promise<Group> {
  await delay();
  groups = groups.map((group) =>
    group.id === id
      ? {
          ...group,
          notices: [
            {
              id: `notice-${Date.now()}`,
              title,
              content,
              createdAt: new Date().toISOString(),
            },
            ...group.notices,
          ],
        }
      : group,
  );
  return fetchGroup(id);
}
