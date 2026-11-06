import { act } from "@testing-library/react-native";
import { queryKeys } from "../../lib/queryKeys";
import * as groupService from "../../services/groupService";
import { renderHookWithClient } from "../../test/renderHookWithClient";
import type {
  GroupDetail,
  GroupDetailNotice,
  GroupInput,
} from "../../types/group";
import {
  useCreateGroup,
  useCreateGroupNotice,
  useDeleteGroup,
  useDeleteGroupNotice,
  useJoinGroup,
  useKickGroupMember,
  useLeaveGroup,
  useTransferGroupLeader,
  useUpdateGroup,
  useUpdateGroupNotice,
  useUpdateGroupStatus,
} from "../useGroups";

jest.mock("../../services/groupService", () => ({
  createGroup: jest.fn(),
  createGroupNotice: jest.fn(),
  deleteGroup: jest.fn(),
  deleteGroupNotice: jest.fn(),
  fetchGroupDetail: jest.fn(),
  fetchGroupMembers: jest.fn(),
  fetchGroupOverviewPage: jest.fn(),
  joinGroup: jest.fn(),
  kickGroupMember: jest.fn(),
  transferGroupLeader: jest.fn(),
  leaveGroup: jest.fn(),
  updateGroup: jest.fn(),
  updateGroupNotice: jest.fn(),
  updateGroupStatus: jest.fn(),
}));

const service = jest.mocked(groupService);

function notice(
  id: string,
  overrides: Partial<GroupDetailNotice> = {},
): GroupDetailNotice {
  return {
    id,
    title: `공지 ${id}`,
    content: "내용",
    preview: "내용",
    createdLabel: "방금",
    isEdited: false,
    ...overrides,
  };
}

function detail(overrides: Partial<GroupDetail> = {}): GroupDetail {
  return {
    id: "7",
    name: "성경 읽기",
    description: "설명",
    categoryLabel: "성경",
    currentMembers: 3,
    maxMembers: 10,
    status: "open",
    leaderName: "리더",
    isLeader: true,
    isJoined: true,
    members: ["리더", "A", "B"],
    notices: [notice("n1"), notice("n2")],
    ...overrides,
  };
}

const membershipKeys = [
  queryKeys.group.overview(),
  queryKeys.group.members("7"),
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useCreateGroup", () => {
  const input: GroupInput = {
    name: "성경 읽기",
    description: "설명",
    category: "bible",
    maxMembers: 10,
    schedule: "매주",
    location: "본당",
  };

  it("성공하면 상세 캐시를 채우고 목록을 무효화한다", async () => {
    service.createGroup.mockResolvedValue(detail());
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useCreateGroup(),
    );

    await act(() => result.current.mutateAsync(input));

    expect(service.createGroup).toHaveBeenCalledWith(input);
    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      detail(),
    );
    expect(invalidatedKeys()).toEqual([queryKeys.group.overview()]);
  });

  it("실패하면 에러를 전달하고 캐시를 만들지 않는다", async () => {
    const error = new Error("400");
    service.createGroup.mockRejectedValue(error);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useCreateGroup(),
    );

    await act(async () => {
      await expect(result.current.mutateAsync(input)).rejects.toBe(error);
    });

    expect(result.current.error).toBe(error);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe.each([
  ["useJoinGroup", useJoinGroup, "joinGroup"] as const,
  ["useLeaveGroup", useLeaveGroup, "leaveGroup"] as const,
])("%s", (_, useHook, serviceName) => {
  it("응답 상세로 캐시를 교체하고 목록·멤버를 무효화한다", async () => {
    const after = detail({ isJoined: serviceName === "joinGroup" });
    service[serviceName].mockResolvedValue(after);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useHook("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(() => result.current.mutateAsync());

    expect(service[serviceName]).toHaveBeenCalledWith("7");
    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      after,
    );
    expect(invalidatedKeys()).toEqual(membershipKeys);
  });

  it("실패하면 상세 캐시와 목록을 그대로 둔다", async () => {
    service[serviceName].mockRejectedValue(new Error("409"));
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useHook("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow("409");
    });

    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      detail(),
    );
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("useUpdateGroup", () => {
  it("groupId 를 붙여 호출하고 상세 캐시를 교체한다", async () => {
    const updated = detail({ name: "새 이름" });
    service.updateGroup.mockResolvedValue(updated);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useUpdateGroup("7"),
    );
    const input = {
      name: "새 이름",
      description: "설명",
      category: "bible" as const,
      maxMembers: 12,
    };

    await act(() => result.current.mutateAsync(input));

    expect(service.updateGroup).toHaveBeenCalledWith({
      ...input,
      groupId: "7",
    });
    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      updated,
    );
    expect(invalidatedKeys()).toEqual([queryKeys.group.overview()]);
  });
});

describe("useUpdateGroupStatus", () => {
  it("상태를 넘기고 상세 캐시를 응답으로 교체한다", async () => {
    const closed = detail({ status: "closed" });
    service.updateGroupStatus.mockResolvedValue(closed);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useUpdateGroupStatus("7"),
    );

    await act(() => result.current.mutateAsync("closed"));

    expect(service.updateGroupStatus).toHaveBeenCalledWith({
      groupId: "7",
      status: "closed",
    });
    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      closed,
    );
    expect(invalidatedKeys()).toEqual([queryKeys.group.overview()]);
  });
});

describe("useDeleteGroup", () => {
  it("상세 캐시를 지우고 목록을 무효화한다", async () => {
    service.deleteGroup.mockResolvedValue(undefined);
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useDeleteGroup("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(() => result.current.mutateAsync());

    expect(service.deleteGroup).toHaveBeenCalledWith("7");
    expect(
      queryClient.getQueryState(queryKeys.group.detail("7")),
    ).toBeUndefined();
    expect(invalidatedKeys()).toEqual([queryKeys.group.overview()]);
  });

  it("실패하면 상세 캐시를 남긴다", async () => {
    service.deleteGroup.mockRejectedValue(new Error("403"));
    const { result, queryClient, invalidatedKeys } = renderHookWithClient(() =>
      useDeleteGroup("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow("403");
    });

    expect(queryClient.getQueryData(queryKeys.group.detail("7"))).toEqual(
      detail(),
    );
    expect(invalidatedKeys()).toEqual([]);
  });
});

describe.each([
  [
    "useKickGroupMember",
    useKickGroupMember,
    "kickGroupMember",
    { groupId: "7", targetUserId: "u2" },
  ] as const,
  [
    "useTransferGroupLeader",
    useTransferGroupLeader,
    "transferGroupLeader",
    { groupId: "7", newLeaderUserId: "u2" },
  ] as const,
])("%s", (_, useHook, serviceName, expectedArgs) => {
  it("대상 사용자로 호출하고 상세·멤버·목록을 무효화한다", async () => {
    service[serviceName].mockResolvedValue(undefined);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useHook("7"),
    );

    await act(() => result.current.mutateAsync("u2"));

    expect(service[serviceName]).toHaveBeenCalledWith(expectedArgs);
    expect(invalidatedKeys()).toEqual([
      queryKeys.group.detail("7"),
      queryKeys.group.members("7"),
      queryKeys.group.overview(),
    ]);
  });

  it("실패하면 에러를 전달하고 무효화하지 않는다", async () => {
    const error = new Error("403");
    service[serviceName].mockRejectedValue(error);
    const { result, invalidatedKeys } = renderHookWithClient(() =>
      useHook("7"),
    );

    await act(async () => {
      await expect(result.current.mutateAsync("u2")).rejects.toBe(error);
    });

    expect(invalidatedKeys()).toEqual([]);
  });
});

describe("group notices", () => {
  it("작성한 공지를 맨 앞에 추가한다", async () => {
    service.createGroupNotice.mockResolvedValue(notice("n3"));
    const { result, queryClient } = renderHookWithClient(() =>
      useCreateGroupNotice("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(() =>
      result.current.mutateAsync({ title: "공지 n3", content: "내용" }),
    );

    expect(service.createGroupNotice).toHaveBeenCalledWith({
      groupId: "7",
      title: "공지 n3",
      content: "내용",
    });
    expect(
      queryClient
        .getQueryData<GroupDetail>(queryKeys.group.detail("7"))
        ?.notices.map(({ id }) => id),
    ).toEqual(["n3", "n1", "n2"]);
  });

  it("수정한 공지만 응답으로 교체한다", async () => {
    const updated = notice("n2", { title: "수정", isEdited: true });
    service.updateGroupNotice.mockResolvedValue(updated);
    const { result, queryClient } = renderHookWithClient(() =>
      useUpdateGroupNotice("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(() =>
      result.current.mutateAsync({
        noticeId: "n2",
        title: "수정",
        content: "내용",
      }),
    );

    expect(service.updateGroupNotice).toHaveBeenCalledWith({
      groupId: "7",
      noticeId: "n2",
      title: "수정",
      content: "내용",
    });
    expect(
      queryClient.getQueryData<GroupDetail>(queryKeys.group.detail("7"))
        ?.notices,
    ).toEqual([notice("n1"), updated]);
  });

  it("삭제한 공지를 목록에서 뺀다", async () => {
    service.deleteGroupNotice.mockResolvedValue(undefined);
    const { result, queryClient } = renderHookWithClient(() =>
      useDeleteGroupNotice("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(() => result.current.mutateAsync("n1"));

    expect(service.deleteGroupNotice).toHaveBeenCalledWith({
      groupId: "7",
      noticeId: "n1",
    });
    expect(
      queryClient.getQueryData<GroupDetail>(queryKeys.group.detail("7"))
        ?.notices,
    ).toEqual([notice("n2")]);
  });

  it("공지 삭제가 실패하면 목록을 그대로 둔다", async () => {
    service.deleteGroupNotice.mockRejectedValue(new Error("404"));
    const { result, queryClient } = renderHookWithClient(() =>
      useDeleteGroupNotice("7"),
    );
    queryClient.setQueryData(queryKeys.group.detail("7"), detail());

    await act(async () => {
      await expect(result.current.mutateAsync("n1")).rejects.toThrow("404");
    });

    expect(
      queryClient.getQueryData<GroupDetail>(queryKeys.group.detail("7"))
        ?.notices,
    ).toHaveLength(2);
  });

  it("상세 캐시가 없으면 공지 작성 후에도 캐시를 만들지 않는다", async () => {
    service.createGroupNotice.mockResolvedValue(notice("n3"));
    const { result, queryClient } = renderHookWithClient(() =>
      useCreateGroupNotice("7"),
    );

    await act(() => result.current.mutateAsync({ title: "t", content: "c" }));

    expect(
      queryClient.getQueryData(queryKeys.group.detail("7")),
    ).toBeUndefined();
  });
});
