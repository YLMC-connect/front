import { createHttpLifeStudyDataSource } from "../lifeStudyHttpDataSource";

const completion = {
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶 (서버)",
  cohortId: 0,
  cohortNumber: null,
  attendCount: null,
  totalClassCount: null,
  completedAt: "2026-04-16",
};

function setup(
  overrides: Parameters<typeof createHttpLifeStudyDataSource>[0] = {},
) {
  const request = jest.fn();
  const dataSource = createHttpLifeStudyDataSource({
    client: { request },
    ...overrides,
  });
  return { request, dataSource };
}

function pathsOf(request: jest.Mock) {
  return request.mock.calls.map((call) => String(call[0]));
}

describe("httpLifeStudyDataSource", () => {
  it("builds the overview from my completions without mock courses", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([completion]);

    await expect(dataSource.getOverview()).resolves.toEqual({
      path: {
        completedRequired: 0,
        totalRequired: 0,
        nextRecommendation: "",
        eligibility: "",
      },
      openCourses: [],
      courses: [
        {
          id: "3",
          title: "경건의 삶 (서버)",
          kind: "optional",
          weekCount: 0,
          instructorName: "",
          summary: "",
          status: "completed",
        },
      ],
    });
    expect(pathsOf(request)).toEqual([
      "/api/life-study",
      "/api/life-study/cohorts",
      "/api/life-study/completions",
    ]);
  });

  it("builds overview with open courses and all courses from life-study API", async () => {
    const { request, dataSource } = setup();
    request.mockImplementation((path: string) => {
      if (path === "/api/life-study") {
        return Promise.resolve([
          {
            id: 1,
            name: "생명의 삶",
            studyContent: "기본 삶공부",
            weekCount: 13,
            teamLeader: "박귀원",
            bookName: "생명의 삶",
            studyTarget: "등록교인 누구나",
            eligibility: "누구나",
            required: true,
          },
        ]);
      }
      if (path === "/api/life-study/cohorts") {
        return Promise.resolve([
          {
            id: 10,
            lifeStudyId: 1,
            lifeStudyName: "생명의 삶",
            studyContent: "기본 삶공부",
            cohortNumber: 1,
            weekCount: 13,
            instructor: "박귀원",
            userNum: 20,
            appliedCount: 5,
            startDate: "2026-06-01",
            endDate: "2026-06-14",
            required: true,
          },
        ]);
      }
      if (path === "/api/life-study/completions") {
        return Promise.resolve([]);
      }
      return Promise.resolve(null);
    });

    const overview = await dataSource.getOverview();
    expect(overview.openCourses).toHaveLength(1);
    expect(overview.openCourses[0].title).toBe("생명의 삶");
    expect(overview.openCourses[0].cohortId).toBe("10");
    expect(overview.courses).toHaveLength(1);
    expect(overview.courses[0].title).toBe("생명의 삶");
    expect(overview.courses[0].cohortId).toBe("10");
    expect(overview.path.totalRequired).toBe(1);
    expect(overview.path.completedRequired).toBe(0);
    expect(overview.path.nextRecommendation).toBe("생명의 삶");
  });

  it("builds courses from completions and filters by that status", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([completion]);

    await expect(dataSource.getCourses("completed")).resolves.toEqual([
      {
        id: "3",
        title: "경건의 삶 (서버)",
        description: "",
        instructor: { id: "", name: "", role: "USER" },
        schedule: "",
        location: "",
        status: "completed",
        sessions: 0,
        currentSession: 0,
        capacity: 0,
        enrolledCount: 0,
        isEnrolled: true,
        isCompleted: true,
        curriculum: [],
      },
    ]);
    await expect(dataSource.getCourses("ongoing")).resolves.toEqual([]);
    expect(
      pathsOf(request).every(
        (path) =>
          path === "/api/life-study" || path === "/api/life-study/completions",
      ),
    ).toBe(true);
    expect(pathsOf(request)).toHaveLength(4);
  });

  it("builds history rows from my completions", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue([completion]);

    await expect(dataSource.getMyCompletions()).resolves.toEqual([
      {
        id: "3-0",
        courseId: "3",
        title: "경건의 삶 (서버)",
        enrolledAt: "",
        completedSessions: 0,
        completedAt: "2026-04-16",
        certificateIssued: false,
      },
    ]);
  });

  it("reads the weekly curriculum from the course detail API", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({
      id: 3,
      name: "생명의 삶",
      weekCount: 2,
      lessons: [
        { id: 11, lessonName: "구원의 확신", orderNum: 1, weekNo: 1 },
        { id: 12, lessonName: "기도의 삶", orderNum: 2, weekNo: 2 },
        { id: "bad", lessonName: "형식이 다른 행" },
      ],
    });

    await expect(dataSource.getCourseLessons?.("3")).resolves.toEqual([
      { id: 11, lessonName: "구원의 확신", orderNum: 1 },
      { id: 12, lessonName: "기도의 삶", orderNum: 2 },
    ]);
    expect(request).toHaveBeenCalledWith("/api/life-study/3");
  });

  it("submits cohort application to /api/life-study/cohorts/{id}/attend", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(101);

    const result = await dataSource.applyCohort("15", {
      userYear: "1994",
      userFaithYears: "3-5년",
      userPart: "청년1부",
    });

    expect(result).toBe(101);
    expect(request).toHaveBeenCalledWith("/api/life-study/cohorts/15/attend", {
      method: "POST",
      body: JSON.stringify({
        userYear: "1994",
        userFaithYears: "3-5년",
        userPart: "청년1부",
      }),
    });
  });

  it("throws error when applyCohort returns null", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(null);

    await expect(
      dataSource.applyCohort("15", {
        userYear: "1994",
        userFaithYears: "3-5년",
        userPart: "청년1부",
      }),
    ).rejects.toThrow("수강신청 처리 결과를 확인할 수 없습니다.");
  });
});
