import { ApiError } from "../../lib/apiClient";
import type {
  LifeStudyCourse,
  LifeStudyOverviewCourse,
} from "../../types/lifeStudy";
import { createHttpLifeStudyDataSource } from "../lifeStudyHttpDataSource";

const baseOverviewCourse: LifeStudyOverviewCourse = {
  id: "life-overview-open-1",
  title: "생명의 삶",
  kind: "required",
  weekCount: 13,
  instructorName: "박귀원",
  summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
  applicationPeriod: "6.24 ~ 7.05",
  capacity: 24,
  enrolledCount: 18,
};

const baseCourse: LifeStudyCourse = {
  id: "3",
  title: "경건의 삶",
  description: "매일의 QT, 기도, 말씀 묵상 습관을 세우는 경건 훈련입니다.",
  instructor: {
    id: "member-006",
    name: "정다윗",
    role: "USER",
  },
  schedule: "매주 목요일 20:00",
  location: "교육관 202호",
  status: "completed",
  sessions: 10,
  currentSession: 10,
  capacity: 15,
  enrolledCount: 15,
  isEnrolled: true,
  isCompleted: false,
  curriculum: [],
};

const completion = {
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶 (서버)",
  cohortId: 0,
  cohortNumber: null,
  attendCount: null,
  totalClassCount: null,
  completedAt: "2026-04-16",
};

const roster = {
  cohortId: 15,
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶",
  cohortNumber: 2,
  totalClassCount: 8,
  students: [
    {
      userId: "user-1",
      userName: "김성도",
      userPhone: null,
      attendCount: 7,
      absentCount: 1,
      completed: true,
      completedAt: "2026-09-30",
    },
  ],
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

  it("calls the class list endpoint and copies weekCount only", async () => {
    const course = { ...baseOverviewCourse };
    const { request, dataSource } = setup();
    request.mockResolvedValue({
      cohortId: 15,
      weekCount: 8,
      classes: [{ title: "구원의 확신" }],
    });

    await expect(
      dataSource.applyClassesToCourse("15", course),
    ).resolves.toEqual({ ...course, weekCount: 8 });
    expect(request).toHaveBeenCalledWith("/api/life-study/cohorts/15/classes");
    expect(course.weekCount).toBe(13);
  });

  it("calls the attendance roster without reading undocumented fields", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ attendedUserIds: ["user-1"], present: true });

    await expect(dataSource.getAttendance("8")).resolves.toEqual({});
    expect(request).toHaveBeenCalledWith(
      "/api/life-study/classes/8/attendance",
    );
  });

  it("sends attendance requests with only the Notion fields", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue(null);

    await dataSource.replaceAttendance("8", ["user-1", "user-2"]);
    await dataSource.updateAttendanceUser("8", {
      userId: "user-1",
      attended: false,
    });

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/api/life-study/classes/8/attendance",
      {
        method: "PUT",
        body: JSON.stringify({ attendedUserIds: ["user-1", "user-2"] }),
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/api/life-study/classes/8/attendance/user",
      {
        method: "PUT",
        body: JSON.stringify({ userId: "user-1", attended: false }),
      },
    );
    const paths = pathsOf(request);
    expect(paths.some((path) => path.startsWith("/api/admin"))).toBe(false);
    expect(paths.some((path) => path.endsWith("/attend"))).toBe(false);
    expect(paths.some((path) => path.includes("/api/mypage/"))).toBe(false);
  });

  it("maps a completion roster onto the matching course", async () => {
    const base: LifeStudyCourse = { ...baseCourse };
    const { request, dataSource } = setup();
    request.mockResolvedValue(roster);

    await expect(
      dataSource.applyRosterToCourse("15", base, "user-1"),
    ).resolves.toEqual({ ...base, isCompleted: true });
    expect(request).toHaveBeenCalledWith(
      "/api/life-study/cohorts/15/completions",
    );
    expect(base.instructor).toBe(baseCourse.instructor);
    expect(base.sessions).toBe(10);
  });

  it("sends one user's completion and returns the roster fields Notion lists", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ ...roster, adminNote: "제외" });

    await expect(
      dataSource.updateCompletionUser("15", {
        userId: "user-1",
        completed: true,
      }),
    ).resolves.toEqual(roster);
    expect(request).toHaveBeenCalledWith(
      "/api/life-study/cohorts/15/completions/user",
      {
        method: "PUT",
        body: JSON.stringify({ userId: "user-1", completed: true }),
      },
    );
  });

  it("rejects a class list that does not match the Notion object", async () => {
    const { request, dataSource } = setup();
    request.mockResolvedValue({ cohortId: 15, weekCount: 8 });

    await expect(
      dataSource.applyClassesToCourse("15", baseOverviewCourse),
    ).rejects.toBeInstanceOf(ApiError);
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
