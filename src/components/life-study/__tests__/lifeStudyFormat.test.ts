import {
  buildMyLifeStudySections,
  courseScheduleLabel,
  formatMonthDay,
  formatPeriod,
  seatsLeft,
  yoilLabel,
} from "../lifeStudyFormat";

const course = {
  id: "1",
  title: "생명의 삶",
  kind: "required" as const,
  weekCount: 13,
  instructorName: "박귀원",
  summary: "",
};

describe("lifeStudyFormat", () => {
  it("formats dates, periods and weekdays", () => {
    expect(formatMonthDay("2026-06-14")).toBe("06.14");
    expect(formatMonthDay("6월")).toBeUndefined();
    expect(formatPeriod("2026-06-01 ~ 2026-06-14")).toBe("06.01 ~ 06.14");
    expect(yoilLabel(0)).toBe("일요일");
    expect(yoilLabel(3)).toBe("수요일");
    expect(yoilLabel(7)).toBeUndefined();
  });

  it("builds the schedule only from known values", () => {
    expect(
      courseScheduleLabel({ ...course, lifeStudyDate: "2026-06-17", yoil: 3 }),
    ).toBe("06.17 개강 · 수요일");
    expect(courseScheduleLabel(course)).toBe("");
  });

  it("counts seats left and never goes below zero", () => {
    expect(seatsLeft({ ...course, capacity: 24, enrolledCount: 18 })).toBe(6);
    expect(seatsLeft({ ...course, capacity: 10, enrolledCount: 12 })).toBe(0);
    expect(seatsLeft(course)).toBeUndefined();
  });

  it("drops empty my-course sections", () => {
    const sections = buildMyLifeStudySections({
      completionCount: 0,
      applications: [],
      ongoing: [
        {
          cohortId: 3,
          lifeStudyId: 2,
          name: "새가족의 삶",
          cohortNumber: 5,
          period: "06.01 ~ 08.31",
          progress: null,
          week: null,
          status: null,
          nextClass: null,
          attendCount: null,
          totalClassCount: null,
        },
      ],
      completed: [],
    });
    expect(sections).toEqual([
      {
        key: "ongoing",
        title: "수강 중",
        rows: [
          {
            key: "ongoing-3",
            courseId: "2",
            name: "새가족의 삶",
            meta: "5기 · 06.01 ~ 08.31",
          },
        ],
      },
    ]);
  });
});
