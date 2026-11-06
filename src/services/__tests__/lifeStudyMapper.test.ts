import { ApiError } from "../../lib/apiClient";
import type { LifeStudyCourse } from "../../types/lifeStudy";
import {
  applyClassListToOverviewCourse,
  applyCompletionRosterToCourse,
  buildLifeStudyCourses,
  buildLifeStudyHistories,
  buildLifeStudyOverview,
  readAttendanceRoster,
  readMyCompletions,
  requireCompletionRoster,
  tryReadLifeStudyCohortList,
  tryReadLifeStudyList,
} from "../lifeStudyMapper";

const course: LifeStudyCourse = {
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
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("builds overview, courses, and histories from myCompletions", () => {
    const overview = buildLifeStudyOverview([myCompletion]);
    expect(overview.courses).toEqual([
      {
        id: "3",
        title: "경건의 삶 (서버)",
        kind: "optional",
        weekCount: 0,
        instructorName: "",
        summary: "",
        status: "completed",
      },
    ]);

    const courses = buildLifeStudyCourses([myCompletion]);
    expect(courses[0]).toMatchObject({
      id: "3",
      title: "경건의 삶 (서버)",
      status: "completed",
      isCompleted: true,
    });

    const histories = buildLifeStudyHistories([myCompletion]);
    expect(histories).toEqual([
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
      readMyCompletions({
        code: "SUCCESS",
        message: "ok",
        data: [myCompletion],
      }),
    ).toThrow(ApiError);
    expect(() => readAttendanceRoster([])).toThrow(ApiError);
    expect(() =>
      requireCompletionRoster({ ...completionRoster, students: null }),
    ).toThrow(ApiError);
    expect(() =>
      requireCompletionRoster({ ...completionRoster, lifeStudyId: "3" }),
    ).toThrow(ApiError);
    expect(
      readAttendanceRoster({
        attended: true,
        students: [{ userId: "user-1" }],
      }),
    ).toEqual({});
    expect(readAttendanceRoster(null)).toBeNull();
  });

  it("reads null or missing fields that no screen uses", () => {
    const {
      cohortNumber: _cohortNumber,
      attendCount: _attendCount,
      ...completionWithout
    } = myCompletion;
    expect(readMyCompletions([completionWithout])).toEqual([myCompletion]);
    expect(
      requireCompletionRoster({
        ...completionRoster,
        totalClassCount: null,
        students: [{ userId: "user-1", completed: true }],
      }),
    ).toMatchObject({
      totalClassCount: null,
      students: [
        {
          userId: "user-1",
          userName: null,
          userPhone: null,
          attendCount: null,
          absentCount: null,
          completed: true,
          completedAt: null,
        },
      ],
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("drops only the list items whose screen fields are wrong", () => {
    expect(
      readMyCompletions([{ ...myCompletion, lifeStudyId: "3" }, myCompletion]),
    ).toEqual([myCompletion]);
    expect(
      requireCompletionRoster({
        ...completionRoster,
        students: [{ userId: "user-2" }, ...completionRoster.students],
      }).students.map((student) => student.userId),
    ).toEqual(["user-1"]);
    expect(
      tryReadLifeStudyList([
        { id: "1", name: "생명의 삶" },
        { id: 2, name: "경건의 삶" },
      ]).map((study) => study.id),
    ).toEqual([2]);
    expect(
      tryReadLifeStudyCohortList([
        null,
        { id: 9, lifeStudyId: 2, lifeStudyName: "경건의 삶" },
      ]).map((cohort) => cohort.id),
    ).toEqual([9]);

    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] lifeStudy.myCompletions[0]: lifeStudyId 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] lifeStudy.completionRoster.students[0]: completed 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] lifeStudy.list[0]: id·name 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] lifeStudy.cohorts[0]: id·lifeStudyId·lifeStudyName 형식 오류",
    );
  });
});
