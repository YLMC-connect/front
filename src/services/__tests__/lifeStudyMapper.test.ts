import { ApiError } from "../../lib/apiClient";
import { mockLifeStudyCourses } from "../../mocks/lifeStudy";
import type { LifeStudyHistory } from "../../types/lifeStudy";
import {
  applyClassListToOverviewCourse,
  applyCompletionRosterToCourse,
  applyMyCompletionsToCourses,
  applyMyCompletionsToHistories,
  applyMyCompletionsToOverview,
  readAttendanceRoster,
} from "../lifeStudyMapper";

const course = {
  ...mockLifeStudyCourses[2],
  id: "3",
  isCompleted: false,
};

const history: LifeStudyHistory = {
  id: "history-001",
  courseId: "3",
  title: "경건의 삶",
  enrolledAt: "2026-02-04T10:00:00.000Z",
  completedSessions: 10,
  completedAt: "2026-04-16T10:00:00.000Z",
  certificateIssued: true,
};

const myCompletion = {
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶 (서버)",
  cohortId: 0,
  cohortNumber: null,
  attendCount: null,
  totalClassCount: null,
  completedAt: "2026-04-16",
};

const completionRoster = {
  cohortId: 15,
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶",
  cohortNumber: 2,
  totalClassCount: 8,
  note: "화면 모델에 없는 값",
  students: [
    {
      userId: "user-1",
      userName: "김성도",
      userPhone: "010-1111-2222",
      attendCount: 7,
      absentCount: 1,
      completed: false,
      completedAt: null,
    },
  ],
};

describe("lifeStudyMapper", () => {
  it("maps a completion onto a course only when the course id matches", () => {
    const [mapped] = applyMyCompletionsToCourses([course], [myCompletion]);

    expect(mapped).toEqual({
      ...course,
      title: "경건의 삶 (서버)",
      isCompleted: true,
    });
    expect(course.isCompleted).toBe(false);
    expect(
      applyMyCompletionsToCourses(
        [{ ...course, id: "life-003", title: "경건의 삶" }],
        [myCompletion],
      )[0],
    ).toMatchObject({
      id: "life-003",
      title: "경건의 삶",
      isCompleted: false,
      sessions: 10,
      currentSession: 10,
    });
  });

  it("leaves the learning path on mock values", () => {
    const overview = {
      path: {
        completedRequired: 1,
        totalRequired: 5,
        nextRecommendation: "생명언어의 삶",
        eligibility: "생명의 삶 이후 가능",
      },
      openCourses: [
        {
          id: "life-overview-open-1",
          title: "생명의 삶",
          kind: "required" as const,
          weekCount: 13,
          instructorName: "박귀원",
          summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
        },
      ],
      courses: [
        {
          id: "3",
          title: "경건의 삶",
          kind: "required" as const,
          weekCount: 13,
          instructorName: "서상오",
          status: "pending" as const,
          summary: "경건 훈련",
        },
      ],
    };

    expect(applyMyCompletionsToOverview(overview, [myCompletion])).toEqual({
      ...overview,
      openCourses: overview.openCourses,
      courses: [{ ...overview.courses[0], title: "경건의 삶 (서버)" }],
    });
    expect(applyMyCompletionsToOverview(overview, [myCompletion]).path).toEqual(
      overview.path,
    );
    expect(
      applyMyCompletionsToOverview(overview, [
        myCompletion,
        { ...myCompletion, cohortId: 4, cohortNumber: 1 },
      ]).courses[0].title,
    ).toBe("경건의 삶");
  });

  it("maps completion date and title onto history without inventing the rest", () => {
    expect(applyMyCompletionsToHistories([history], [myCompletion])).toEqual([
      {
        ...history,
        title: "경건의 삶 (서버)",
        completedAt: "2026-04-16",
      },
    ]);

    const cleared = applyMyCompletionsToHistories(
      [history],
      [{ ...myCompletion, lifeStudyName: null, completedAt: null }],
    )[0];
    expect(cleared.title).toBe(history.title);
    expect(cleared.completedAt).toBeUndefined();
    expect(cleared.enrolledAt).toBe(history.enrolledAt);
    expect(cleared.completedSessions).toBe(10);
    expect(cleared.certificateIssued).toBe(true);

    expect(
      applyMyCompletionsToHistories(
        [history],
        [myCompletion, { ...myCompletion, cohortId: 9 }],
      ),
    ).toEqual([history]);
    expect(
      applyMyCompletionsToHistories(
        [history],
        [{ ...myCompletion, lifeStudyId: 99, lifeStudyName: "새 과정" }],
      ),
    ).toEqual([history]);
  });

  it("copies class weekCount and ignores undocumented class fields", () => {
    const overviewCourse = {
      id: "life-overview-open-1",
      title: "생명의 삶",
      kind: "required" as const,
      weekCount: 13,
      instructorName: "박귀원",
      summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
    };

    expect(
      applyClassListToOverviewCourse(overviewCourse, {
        cohortId: 15,
        weekCount: 8,
        classes: [{ title: "구원의 확신", attendance: "출석" }],
      }),
    ).toEqual({ ...overviewCourse, weekCount: 8 });
  });

  it("maps the current user's completed flag and leaves roster-only fields", () => {
    const enrolled = { ...course, isCompleted: true };

    expect(
      applyCompletionRosterToCourse(enrolled, completionRoster, "user-1"),
    ).toEqual({
      ...enrolled,
      isCompleted: false,
    });
    expect(
      applyCompletionRosterToCourse(course, completionRoster, "user-2"),
    ).toEqual(course);
    expect(
      applyCompletionRosterToCourse(
        { ...course, id: "life-003" },
        completionRoster,
        "user-1",
      ),
    ).toEqual({ ...course, id: "life-003" });
  });

  it("rejects shapes that are not the Notion data payload", () => {
    expect(() =>
      applyMyCompletionsToCourses([course], {
        code: "SUCCESS",
        message: "ok",
        data: [myCompletion],
      }),
    ).toThrow(ApiError);
    expect(() =>
      applyMyCompletionsToCourses(
        [course],
        [{ ...myCompletion, lifeStudyId: "3" }],
      ),
    ).toThrow(ApiError);
    expect(() => readAttendanceRoster([])).toThrow(ApiError);
    expect(
      readAttendanceRoster({
        attended: true,
        students: [{ userId: "user-1" }],
      }),
    ).toEqual({});
    expect(readAttendanceRoster(null)).toBeNull();
  });
});
