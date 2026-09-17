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
      if (path.startsWith("/api/communion?type=SMALL_GROUP")) {
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
          content: [{ id: 1 }],
          hasNext: false,
          nextCursor: null,
        };
      }
      return { content: [], hasNext: false, nextCursor: null };
    });

    await expect(dataSource.getOverview()).resolves.toMatchObject({
      groups: [
        expect.objectContaining({ id: "1", isJoined: true, category: "hobby" }),
      ],
      services: [
        expect.objectContaining({ id: "2", linkedGroupId: "2", schedule: "" }),
      ],
    });
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
        schedule: "매주 토 오후 2시",
        location: "본당 카페",
      }),
    ).resolves.toMatchObject({
      id: "1",
      isLeader: true,
      isJoined: true,
    });
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
        schedule: "주일",
        location: "주차장",
      }),
    ).rejects.toThrow("이 카테고리는 아직 서버에 없습니다.");
  });
});
