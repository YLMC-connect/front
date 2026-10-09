import { ApiError } from "../../lib/apiClient";
import {
  mockLifeStudyCourses,
  mockLifeStudyOverview,
} from "../../mocks/lifeStudy";
import type { LifeStudyCourse } from "../../types/lifeStudy";
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
    expect(pathsOf(request)).toEqual(["/api/life-study/completions"]);
    expect(mockLifeStudyOverview.path.completedRequired).toBe(1);
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
      pathsOf(request).every((path) => path === "/api/life-study/completions"),
    ).toBe(true);
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

  it("calls the class list endpoint and copies weekCount only", async () => {
    const course = mockLifeStudyOverview.openCourses[0];
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
    const base: LifeStudyCourse = {
      ...mockLifeStudyCourses[2],
      id: "3",
      isCompleted: false,
    };
    const { request, dataSource } = setup();
    request.mockResolvedValue(roster);

    await expect(
      dataSource.applyRosterToCourse("15", base, "user-1"),
    ).resolves.toEqual({ ...base, isCompleted: true });
    expect(request).toHaveBeenCalledWith(
      "/api/life-study/cohorts/15/completions",
    );
    expect(base.instructor).toBe(mockLifeStudyCourses[2].instructor);
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
      dataSource.applyClassesToCourse(
        "15",
        mockLifeStudyOverview.openCourses[0],
      ),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
