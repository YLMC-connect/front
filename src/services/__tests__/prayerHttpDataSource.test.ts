import { ApiError } from "../../lib/apiClient";
import { createHttpPrayerDataSource } from "../prayerHttpDataSource";

const cohort = {
  id: 15,
  cohortYear: 2026,
  yoil: 1,
  timeSlot: "AM",
  cohortName: "월요일 오전 기도방",
  description: "한 주를 시작합니다",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "ACTIVE",
  memberCount: 40,
  weekCompletedCount: 30,
  completionRate: 75,
  myCompleted: true,
  myRole: "MEMBER",
  emergencyCount: 1,
};

const openCohort = {
  ...cohort,
  id: 16,
  yoil: 4,
  timeSlot: "PM",
  myRole: null,
  memberCount: 8,
  weekCompletedCount: 0,
  completionRate: 0,
};

const topic = {
  id: 7,
  categoryId: 2,
  categoryName: "치유",
  title: "어머니 회복",
  content: "수술이 잘 끝나기를",
  status: "REVIEW",
  rejectReason: "",
  writerName: "김성도",
  mine: true,
  emergency: false,
  emergencyEndAt: "2026-10-10T00:00:00",
  answerContent: "",
  answeredAt: "2026-10-01T00:00:00",
  createdAt: "2026-10-02T01:02:03",
};

const member = {
  userId: "user-1",
  userName: "김은혜",
  userPhone: "010-1111-2222",
  memberRole: "MEMBER",
  completionId: 9,
  completedAt: "2026-10-05T09:00:00",
  likeCount: 1,
  liked: true,
};

const status = {
  cohortId: 15,
  cohortName: "월요일 오전 기도방",
  weekStartDate: "2026-10-04",
  scheduledDate: "2026-10-05",
  totalMembers: 2,
  completedCount: 1,
  notCompletedCount: 1,
  completionRate: 50,
  myCompleted: true,
  canComplete: false,
  completed: [member],
  notCompleted: [{ ...member, userId: "user-2", completionId: null }],
};

function setup(
  overrides: Parameters<typeof createHttpPrayerDataSource>[0] = {},
) {
  const request = jest.fn();
  const dataSource = createHttpPrayerDataSource({
    client: { request },
    ...overrides,
  });
  return { request, dataSource };
}

function pathsOf(request: jest.Mock) {
  return request.mock.calls.map((call) => String(call[0]));
}

describe("httpPrayerDataSource", () => {
  it("builds my rooms and topics from the API and skips a cohort without a role", async () => {
    const { request, dataSource } = setup();
    request
      .mockResolvedValueOnce([{ ...cohort, memberCount: 41 }, openCohort])
      .mockResolvedValueOnce([topic]);

    await expect(dataSource.getOverview()).resolves.toEqual({
      rooms: [
        {
          id: "15",
          weekday: "mon",
          period: "morning",
          memberCount: 41,
          completedCount: 30,
          participationRate: 75,
          status: "joined",
        },
      ],
      requests: [
        {
          id: "7",
          title: "어머니 회복",
          category: "치유",
          status: "reviewing",
          description: "수술이 잘 끝나기를",
        },
      ],
    });
    expect(pathsOf(request)).toEqual([
      "/api/prayer/cohorts/my",
      "/api/prayer/topics/my",
    ]);
  });

  it("returns empty lists when the member has no cohorts or topics", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([]);

    await expect(dataSource.getOverview()).resolves.toEqual({
      rooms: [],
      requests: [],
    });
  });

  it("does not read undocumented cohort detail fields", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ id: 15, cohortName: "제외", leader: "김성도" });

    await expect(dataSource.getCohort("15")).resolves.toEqual({});
    expect(request).toHaveBeenCalledWith("/api/prayer/cohorts/15");
  });

  it("sends completion without a body and returns only status fields", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...status, adminNote: "제외" });

    await expect(dataSource.getCohortStatus("15")).resolves.toEqual(status);
    await expect(dataSource.completeCohort("15")).resolves.toEqual(status);
    await expect(dataSource.cancelCohortCompletion("15")).resolves.toEqual(
      status,
    );
    expect(request).toHaveBeenNthCalledWith(1, "/api/prayer/cohorts/15/status");
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/api/prayer/cohorts/15/completion",
      { method: "POST" },
    );
    expect(request).toHaveBeenNthCalledWith(
      3,
      "/api/prayer/cohorts/15/completion",
      { method: "DELETE" },
    );
  });

  it("likes a completion without sending a body", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ liked: true, likeCount: 2 });

    await dataSource.likeCompletion("9");
    await dataSource.unlikeCompletion("9");

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/api/prayer/completions/9/like",
      { method: "POST" },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/api/prayer/completions/9/like",
      { method: "DELETE" },
    );
  });

  it("sends an application with only the fields the caller provided", async () => {
    const { request, dataSource } = setup();
    request
      .mockResolvedValueOnce([
        {
          id: 3,
          cohortId: 15,
          cohortName: "월요일 오전",
          yoil: 1,
          timeSlot: "AM",
          applicantName: "김성도",
          applicantPhone: "010",
          applyMemo: null,
          status: "UNKNOWN",
          rejectReason: null,
          createdAt: "2026-10-02T00:00:00",
          processedAt: null,
        },
      ])
      .mockResolvedValueOnce(21)
      .mockResolvedValueOnce(null);

    await expect(dataSource.getMyApplications()).resolves.toEqual([
      {
        id: 3,
        cohortId: 15,
        cohortName: "월요일 오전",
        yoil: 1,
        timeSlot: "AM",
        applicantName: "김성도",
        applicantPhone: "010",
        applyMemo: null,
        status: "UNKNOWN",
        rejectReason: null,
        createdAt: "2026-10-02T00:00:00",
        processedAt: null,
      },
    ]);
    await expect(
      dataSource.createApplication({ yoil: 1, timeSlot: "AM" }),
    ).resolves.toBe(21);
    await dataSource.cancelApplication("3");

    expect(request).toHaveBeenNthCalledWith(2, "/api/prayer/applications", {
      method: "POST",
      body: JSON.stringify({ yoil: 1, timeSlot: "AM" }),
    });
    expect(request).toHaveBeenNthCalledWith(3, "/api/prayer/applications/3", {
      method: "DELETE",
    });
  });

  it("includes optional application fields only when they are set", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(4);

    await dataSource.createApplication({
      yoil: 6,
      timeSlot: "PM",
      applicantName: "김성도",
      applicantPhone: "010",
      applyMemo: "참여하고 싶습니다",
    });

    expect(request).toHaveBeenCalledWith("/api/prayer/applications", {
      method: "POST",
      body: JSON.stringify({
        yoil: 6,
        timeSlot: "PM",
        applicantName: "김성도",
        applicantPhone: "010",
        applyMemo: "참여하고 싶습니다",
      }),
    });
  });

  it("reads history, categories, and the topic board", async () => {
    const { request, dataSource } = setup();
    const history = {
      cohortId: 15,
      cohortName: "월요일 오전",
      cohortYear: 2026,
      yoil: 1,
      timeSlot: "PM",
      memberRole: "MEMBER",
      joinedAt: "2026-01-05",
      leftAt: "2026-06-01",
      leaveReason: "기간 종료",
      active: false,
    };
    const category = {
      id: 1,
      categoryCode: "HEAL",
      categoryName: "치유",
      orderNum: 2,
    };
    request
      .mockResolvedValueOnce([history])
      .mockResolvedValueOnce([category])
      .mockResolvedValueOnce({
        emergency: [topic],
        recentAnswers: [],
        ongoing: [],
      });

    await expect(dataSource.getMyHistory()).resolves.toEqual([history]);
    await expect(dataSource.getCategories()).resolves.toEqual([category]);
    await expect(dataSource.getTopicBoard()).resolves.toEqual({
      emergency: [topic],
      recentAnswers: [],
      ongoing: [],
    });
    expect(pathsOf(request)).toEqual([
      "/api/prayer/me/history",
      "/api/prayer/categories",
      "/api/prayer/topics/board",
    ]);
  });

  it("writes a topic with category, title, and content only", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValueOnce(12).mockResolvedValue(null);
    const input = {
      categoryId: 2,
      title: "어머니 회복",
      content: "수술이 잘 끝나기를",
    };

    await expect(dataSource.createTopic(input)).resolves.toBe(12);
    await dataSource.updateTopic("12", input);
    await dataSource.deleteTopic("12");
    await dataSource.requestTopicAnswer("12", {
      answerContent: "회복되었습니다",
    });

    expect(request).toHaveBeenNthCalledWith(1, "/api/prayer/topics", {
      method: "POST",
      body: JSON.stringify(input),
    });
    expect(request).toHaveBeenNthCalledWith(2, "/api/prayer/topics/12", {
      method: "PUT",
      body: JSON.stringify(input),
    });
    expect(request).toHaveBeenNthCalledWith(3, "/api/prayer/topics/12", {
      method: "DELETE",
    });
    expect(request).toHaveBeenNthCalledWith(
      4,
      "/api/prayer/topics/12/answer-request",
      {
        method: "POST",
        body: JSON.stringify({ answerContent: "회복되었습니다" }),
      },
    );
  });

  it("keeps the screen create action off the topic endpoint", async () => {
    const { request, dataSource } = setup();

    await expect(
      dataSource.createPrayerTopic({
        roomId: "missing",
        title: "제목",
        content: "내용입니다",
        isAnonymous: false,
      }),
    ).rejects.toThrow("존재하지 않는 기도방입니다.");
    const created = await dataSource.createPrayerTopic({
      roomId: "prayer-room-001",
      title: "제목",
      content: "내용입니다",
      isAnonymous: true,
    });

    expect(created).toMatchObject({
      roomId: "prayer-room-001",
      title: "제목",
      content: "내용입니다",
      isAnonymous: true,
      prayerCount: 0,
      hasPrayed: false,
      isAnswered: false,
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("does not call admin or mypage prayer paths", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValueOnce(status).mockResolvedValueOnce([]);

    await dataSource.completeCohort("15");
    await dataSource.getMyTopics();

    const paths = pathsOf(request);
    expect(paths.some((path) => path.startsWith("/api/admin"))).toBe(false);
    expect(paths.some((path) => path.includes("/api/mypage/"))).toBe(false);
    expect(paths).toEqual([
      "/api/prayer/cohorts/15/completion",
      "/api/prayer/topics/my",
    ]);
  });

  it("rejects a completion response that is not the status dto", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ cohortId: 15 });

    await expect(dataSource.completeCohort("15")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
