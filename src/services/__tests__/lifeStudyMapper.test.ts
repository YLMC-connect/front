import { ApiError } from "../../lib/apiClient";
import {
  buildLifeStudyCourses,
  buildLifeStudyHistories,
  buildLifeStudyOverview,
  readMyCompletions,
  tryReadLifeStudyCohortList,
  tryReadLifeStudyList,
} from "../lifeStudyMapper";

const myCompletion = {
  lifeStudyId: 3,
  lifeStudyName: "경건의 삶 (서버)",
  cohortId: 0,
  cohortNumber: null,
  attendCount: null,
  totalClassCount: null,
  completedAt: "2026-04-16",
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

  it("rejects shapes that are not the Notion data payload", () => {
    expect(() =>
      readMyCompletions({
        code: "SUCCESS",
        message: "ok",
        data: [myCompletion],
      }),
    ).toThrow(ApiError);
  });

  it("reads null or missing fields that no screen uses", () => {
    const {
      cohortNumber: _cohortNumber,
      attendCount: _attendCount,
      ...completionWithout
    } = myCompletion;
    expect(readMyCompletions([completionWithout])).toEqual([myCompletion]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("drops only the list items whose screen fields are wrong", () => {
    expect(
      readMyCompletions([{ ...myCompletion, lifeStudyId: "3" }, myCompletion]),
    ).toEqual([myCompletion]);
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
      "[응답 형식] lifeStudy.list[0]: id·name 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] lifeStudy.cohorts[0]: id·lifeStudyId·lifeStudyName 형식 오류",
    );
  });
});
