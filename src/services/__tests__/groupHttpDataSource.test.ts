import { createHttpGroupDataSource } from "../groupHttpDataSource";

describe("httpGroupDataSource", () => {
  function setup() {
    const request = jest.fn();
    const dataSource = createHttpGroupDataSource({
      client: { request },
      getCurrentUserId: () => "frontprobe",
    });
    return { request, dataSource };
  }

  it("loads small groups and volunteer lists separately", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string) => {
      if (
        path.includes("type=SMALL_GROUP") &&
        path.startsWith("/api/communion?")
      ) {
        return {
          content: [
            {
              id: 1,
              type: "SMALL_GROUP",
              title: "프론트 점검 소모임",
              categoryCode: "HOBBY_CULTURE",
              maxParticipants: 5,
              currentParticipants: 1,
              status: "RECRUITING",
              leaderName: "프론트점검",
              createdAt: "2026-08-13T11:26:07",
            },
          ],
          hasNext: false,
          nextCursor: null,
        };
      }
      if (path.startsWith("/api/communion?type=VOLUNTEER")) {
        return {
          content: [
            {
              id: 2,
              type: "VOLUNTEER",
              title: "프론트 점검 봉사",
              categoryCode: "OTHER",
              maxParticipants: 8,
              currentParticipants: 1,
              status: "RECRUITING",
              leaderName: "프론트점검",
              createdAt: "2026-08-13T11:26:08",
            },
          ],
          hasNext: false,
          nextCursor: null,
        };
      }
      if (path.startsWith("/api/communion/my?type=SMALL_GROUP")) {
        return {
          content: [
            {
              id: 1,
              type: "SMALL_GROUP",
              title: "프론트 점검 소모임",
              categoryCode: "HOBBY_CULTURE",
              maxParticipants: 5,
              currentParticipants: 1,
              status: "RECRUITING",
              leaderName: "프론트점검",
              createdAt: "2026-08-13T11:26:07",
            },
          ],
          hasNext: false,
          nextCursor: null,
        };
      }
      return { content: [], hasNext: false, nextCursor: null };
    });

    await expect(dataSource.getOverviewPage()).resolves.toMatchObject({
      groups: [
        expect.objectContaining({ id: "1", isJoined: true, category: "hobby" }),
      ],
      services: [
        expect.objectContaining({ id: "2", linkedGroupId: "2", schedule: "" }),
      ],
      myGroups: [expect.objectContaining({ id: "1", isJoined: true })],
      hasNext: false,
      nextCursor: null,
    });
  });

  it("keeps pending/rejected communions out of public lists and shows them in my groups", async () => {
    const { request, dataSource } = setup();
    const item = (id: number, type: string, status: string) => ({
      id,
      type,
      title: `모임 ${id}`,
      categoryCode: "HOBBY_CULTURE",
      maxParticipants: 5,
      currentParticipants: 1,
      status,
      leaderName: "프론트점검",
      createdAt: "2026-11-19T10:00:00",
    });
    request.mockImplementation(async (path: string) => {
      const page = (content: unknown[]) => ({
        content,
        hasNext: false,
        nextCursor: null,
      });
      if (
        path.startsWith("/api/communion?") &&
        path.includes("type=SMALL_GROUP")
      ) {
        return page([
          item(1, "SMALL_GROUP", "RECRUITING"),
          item(3, "SMALL_GROUP", "PENDING"),
        ]);
      }
      if (path.startsWith("/api/communion/my?type=SMALL_GROUP")) {
        return page([
          item(3, "SMALL_GROUP", "PENDING"),
          item(4, "SMALL_GROUP", "REJECTED"),
        ]);
      }
      if (path.startsWith("/api/communion/my?type=VOLUNTEER")) {
        return page([
          item(5, "VOLUNTEER", "RECRUITING"),
          item(6, "VOLUNTEER", "PENDING"),
        ]);
      }
      return page([]);
    });

    const overview = await dataSource.getOverviewPage();
    expect(overview.groups.map((g) => g.id)).toEqual(["1"]);
    expect(overview.myGroups.map((g) => [g.id, g.status])).toEqual([
      ["3", "pending"],
      ["4", "rejected"],
      ["6", "pending"],
    ]);
  });

  it("creates a small group without sending schedule or location", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion" && options?.method === "POST") {
        expect(JSON.parse(String(options.body))).toEqual({
          type: "SMALL_GROUP",
          title: "프론트 점검 소모임",
          content: "라이브 계약 확인용 소모임입니다.",
          categoryCode: "HOBBY_CULTURE",
          maxParticipants: 5,
        });
        return 1;
      }
      if (path === "/api/communion/1") {
        return {
          id: 1,
          type: "SMALL_GROUP",
          title: "프론트 점검 소모임",
          content: "라이브 계약 확인용 소모임입니다.",
          categoryCode: "HOBBY_CULTURE",
          maxParticipants: 5,
          currentParticipants: 1,
          status: "RECRUITING",
          leaderId: "frontprobe",
          leaderName: "프론트점검",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      if (path === "/api/communion/1/members") {
        return [
          {
            userId: "frontprobe",
            userName: "프론트점검",
            joinedAt: "2026-08-13T11:26:07",
          },
        ];
      }
      return [];
    });

    await expect(
      dataSource.createGroup({
        name: "프론트 점검 소모임",
        description: "라이브 계약 확인용 소모임입니다.",
        category: "hobby",
        maxMembers: 5,
      }),
    ).resolves.toMatchObject({
      id: "1",
      isLeader: true,
      isJoined: true,
    });
  });

  it("creates a volunteer when opened from the service tab", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion" && options?.method === "POST") return 9;
      if (path === "/api/communion/9") {
        return {
          id: 9,
          type: "VOLUNTEER",
          title: "주차 봉사",
          content: "주일 주차 안내 봉사입니다.",
          categoryCode: "OTHER",
          maxParticipants: 5,
          currentParticipants: 1,
          status: "RECRUITING",
          leaderId: "frontprobe",
          leaderName: "프론트점검",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      return [];
    });

    await dataSource.createGroup({
      name: "주차 봉사",
      description: "주일 주차 안내 봉사입니다.",
      category: "etc",
      maxMembers: 5,
      kind: "service",
    });

    const post = request.mock.calls.find(
      ([path, options]) =>
        path === "/api/communion" && options?.method === "POST",
    );
    expect(JSON.parse(post?.[1].body).type).toBe("VOLUNTEER");
  });

  it("creates a notice from the returned id", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(1);

    await expect(
      dataSource.createNotice({
        groupId: "1",
        title: "점검 공지",
        content: "라이브 공지 확인입니다.",
      }),
    ).resolves.toMatchObject({
      id: "1",
      title: "점검 공지",
      isEdited: false,
    });
    expect(request).toHaveBeenCalledWith(
      "/api/communion/1/notices",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("joins then reloads detail", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion/4/join" && options?.method === "POST") {
        return null;
      }
      if (path === "/api/communion/4") {
        return {
          id: 4,
          type: "SMALL_GROUP",
          title: "화요 새벽기도회",
          content: "함께 기도합니다.",
          categoryCode: "PRAYER",
          maxParticipants: 50,
          currentParticipants: 33,
          status: "RECRUITING",
          leaderId: "leader-1",
          leaderName: "소모임장",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      if (path === "/api/communion/4/members") {
        return [
          {
            userId: "frontprobe",
            userName: "프론트점검",
            joinedAt: "2026-08-13T11:26:07",
          },
        ];
      }
      return [];
    });

    await expect(dataSource.joinGroup("4")).resolves.toMatchObject({
      id: "4",
      isJoined: true,
    });
    expect(request).toHaveBeenCalledWith(
      "/api/communion/4/join",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("leaves then reloads detail", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion/4/leave" && options?.method === "DELETE") {
        return null;
      }
      if (path === "/api/communion/4") {
        return {
          id: 4,
          type: "SMALL_GROUP",
          title: "화요 새벽기도회",
          content: "함께 기도합니다.",
          categoryCode: "PRAYER",
          maxParticipants: 50,
          currentParticipants: 32,
          status: "RECRUITING",
          leaderId: "leader-1",
          leaderName: "소모임장",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      return [];
    });

    await expect(dataSource.leaveGroup("4")).resolves.toMatchObject({
      id: "4",
      isJoined: false,
    });
    expect(request).toHaveBeenCalledWith(
      "/api/communion/4/leave",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("rejects unmapped create categories instead of guessing", async () => {
    const { dataSource } = setup();
    await expect(
      dataSource.createGroup({
        name: "카풀",
        description: "주일 카풀 모임입니다.",
        category: "carpool",
        maxMembers: 4,
      }),
    ).rejects.toThrow("이 카테고리는 아직 서버에 없습니다.");
  });

  it("updates communion with PUT /api/communion/{id}", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion/1" && options?.method === "PUT") {
        expect(JSON.parse(String(options.body))).toEqual({
          title: "수정된 소모임",
          content: "수정된 설명입니다.",
          categoryCode: "HOBBY_CULTURE",
          maxParticipants: 10,
        });
        return null;
      }
      if (path === "/api/communion/1") {
        return {
          id: 1,
          type: "SMALL_GROUP",
          title: "수정된 소모임",
          content: "수정된 설명입니다.",
          categoryCode: "HOBBY_CULTURE",
          maxParticipants: 10,
          currentParticipants: 1,
          status: "RECRUITING",
          leaderId: "frontprobe",
          leaderName: "프론트점검",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      if (path === "/api/communion/1/members") {
        return [];
      }
      return null;
    });

    const updated = await dataSource.updateGroup({
      groupId: "1",
      name: "수정된 소모임",
      description: "수정된 설명입니다.",
      category: "hobby",
      maxMembers: 10,
    });
    expect(updated).toMatchObject({
      id: "1",
      name: "수정된 소모임",
      maxMembers: 10,
    });
  });

  it("deletes communion with DELETE /api/communion/{id}", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(null);

    await dataSource.deleteGroup("1");
    expect(request).toHaveBeenCalledWith("/api/communion/1", {
      method: "DELETE",
    });
  });

  it("kicks communion member with DELETE /api/communion/{id}/kick/{targetUserId}", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(null);

    await dataSource.kickMember({
      groupId: "1",
      targetUserId: "user-2",
    });
    expect(request).toHaveBeenCalledWith("/api/communion/1/kick/user-2", {
      method: "DELETE",
    });
  });

  it("transfers the leader with PUT /api/communion/{id}/leader", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(null);

    await dataSource.transferLeader({
      groupId: "1",
      newLeaderUserId: "user-2",
    });
    expect(request).toHaveBeenCalledWith("/api/communion/1/leader", {
      method: "PUT",
      body: JSON.stringify({ newLeaderUserId: "user-2" }),
    });
  });

  it("updates communion status with PUT /api/communion/{id}/status", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation(async (path: string, options) => {
      if (path === "/api/communion/1/status" && options?.method === "PUT") {
        expect(JSON.parse(String(options.body))).toEqual({
          status: "COMPLETED",
        });
        return null;
      }
      if (path === "/api/communion/1") {
        return {
          id: 1,
          type: "SMALL_GROUP",
          title: "소모임",
          content: "설명",
          categoryCode: "HOBBY_CULTURE",
          maxParticipants: 10,
          currentParticipants: 10,
          status: "COMPLETED",
          leaderId: "frontprobe",
          leaderName: "프론트점검",
          createdAt: "2026-08-13T11:26:07",
        };
      }
      if (path === "/api/communion/1/members") {
        return [];
      }
      return null;
    });

    const updated = await dataSource.updateGroupStatus({
      groupId: "1",
      status: "closed",
    });
    expect(updated).toMatchObject({
      id: "1",
      status: "closed",
    });
  });
});
