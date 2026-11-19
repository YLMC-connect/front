import {
  invalidResponse as invalid,
  keepValidItems,
  reportResponseIssue,
} from "../lib/reportResponseIssue";
import type { Member } from "../types/common";
import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyOverview,
  LifeStudyOverviewCourse,
  LifeStudyPathOverview,
} from "../types/lifeStudy";
import type {
  LifeStudyCohortDetailDto,
  LifeStudyCohortDto,
  LifeStudyDto,
  LifeStudyLessonDto,
  LifeStudyMyCompletion,
} from "../types/lifeStudyApi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function requireKey(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  if (!(key in data)) invalid(source, key);
}

function requireInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readInteger(data[key]);
  if (value == null) invalid(source, key);
  return value;
}

function requireNullableInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  const value = readInteger(data[key]);
  if (value == null) invalid(source, key);
  return value;
}

function requireNullableString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (typeof data[key] !== "string") invalid(source, key);
  return data[key];
}

/** 화면에서 쓰지 않는 필드. 없거나 형식이 다르면 null. */
function optionalInteger(data: Record<string, unknown>, key: string) {
  return readInteger(data[key]);
}

export function readMyCompletions(data: unknown): LifeStudyMyCompletion[] {
  if (data == null) return [];
  if (!Array.isArray(data)) invalid(data);
  return keepValidItems(data, "lifeStudy.myCompletions", (item) => {
    if (!isRecord(item)) invalid(data);
    return {
      lifeStudyId: requireInteger(item, "lifeStudyId", data),
      lifeStudyName: requireNullableString(item, "lifeStudyName", data),
      cohortId: requireInteger(item, "cohortId", data),
      cohortNumber: optionalInteger(item, "cohortNumber"),
      attendCount: optionalInteger(item, "attendCount"),
      totalClassCount: requireNullableInteger(item, "totalClassCount", data),
      completedAt: requireNullableString(item, "completedAt", data),
    };
  });
}

const emptyMember: Member = {
  id: "",
  name: "",
  role: "USER",
};

function overviewCourseFromCompletion(
  row: LifeStudyMyCompletion,
): LifeStudyOverviewCourse {
  const completed = typeof row.completedAt === "string";
  return {
    id: String(row.lifeStudyId),
    title: row.lifeStudyName ?? "",
    kind: "optional",
    weekCount: 0,
    instructorName: "",
    summary: "",
    status: completed ? "completed" : "pending",
  };
}

function courseFromCompletion(row: LifeStudyMyCompletion): LifeStudyCourse {
  const completed = typeof row.completedAt === "string";
  return {
    id: String(row.lifeStudyId),
    title: row.lifeStudyName ?? "",
    description: "",
    instructor: emptyMember,
    schedule: "",
    location: "",
    status: completed ? "completed" : "ongoing",
    sessions: row.totalClassCount ?? 0,
    currentSession: 0,
    capacity: 0,
    enrolledCount: 0,
    isEnrolled: true,
    isCompleted: completed,
    curriculum: [],
  };
}

function historyFromCompletion(row: LifeStudyMyCompletion): LifeStudyHistory {
  const history: LifeStudyHistory = {
    id: `${row.lifeStudyId}-${row.cohortId}`,
    courseId: String(row.lifeStudyId),
    title: row.lifeStudyName ?? "",
    enrolledAt: "",
    completedSessions: 0,
    certificateIssued: false,
  };
  if (typeof row.completedAt === "string")
    history.completedAt = row.completedAt;
  return history;
}

const emptyPath = {
  completedRequired: 0,
  totalRequired: 0,
  nextRecommendation: "",
  eligibility: "",
};

export function tryReadLifeStudyList(data: unknown): LifeStudyDto[] {
  if (data == null || !Array.isArray(data)) return [];
  const result: LifeStudyDto[] = [];
  for (const [index, item] of data.entries()) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      typeof item.name !== "string"
    ) {
      reportResponseIssue({
        source: `lifeStudy.list[${index}]`,
        reason: "id·name 형식 오류",
      });
      continue;
    }
    result.push({
      id: item.id,
      name: item.name,
      studyContent:
        typeof item.studyContent === "string" ? item.studyContent : null,
      weekCount: typeof item.weekCount === "number" ? item.weekCount : 0,
      teamLeader: typeof item.teamLeader === "string" ? item.teamLeader : null,
      bookName: typeof item.bookName === "string" ? item.bookName : null,
      studyTarget:
        typeof item.studyTarget === "string" ? item.studyTarget : null,
      eligibility:
        typeof item.eligibility === "string" ? item.eligibility : null,
      required: typeof item.required === "boolean" ? item.required : false,
      officialMokja:
        typeof item.officialMokja === "boolean" ? item.officialMokja : false,
    });
  }
  return result;
}

export function tryReadLifeStudyCohortList(
  data: unknown,
): LifeStudyCohortDto[] {
  if (data == null || !Array.isArray(data)) return [];
  const result: LifeStudyCohortDto[] = [];
  for (const [index, item] of data.entries()) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      typeof item.lifeStudyId !== "number" ||
      typeof item.lifeStudyName !== "string"
    ) {
      reportResponseIssue({
        source: `lifeStudy.cohorts[${index}]`,
        reason: "id·lifeStudyId·lifeStudyName 형식 오류",
      });
      continue;
    }
    result.push({
      id: item.id,
      lifeStudyId: item.lifeStudyId,
      lifeStudyName: item.lifeStudyName,
      studyContent:
        typeof item.studyContent === "string" ? item.studyContent : null,
      cohortNumber:
        typeof item.cohortNumber === "number" ? item.cohortNumber : null,
      weekCount: typeof item.weekCount === "number" ? item.weekCount : 0,
      yoil: typeof item.yoil === "number" ? item.yoil : null,
      userNum: typeof item.userNum === "number" ? item.userNum : null,
      appliedCount:
        typeof item.appliedCount === "number" ? item.appliedCount : null,
      instructor: typeof item.instructor === "string" ? item.instructor : null,
      teamLeaderName:
        typeof item.teamLeaderName === "string" ? item.teamLeaderName : null,
      bookName: typeof item.bookName === "string" ? item.bookName : null,
      studyTarget:
        typeof item.studyTarget === "string" ? item.studyTarget : null,
      eligibility:
        typeof item.eligibility === "string" ? item.eligibility : null,
      studyPlace: typeof item.studyPlace === "string" ? item.studyPlace : null,
      startDate: typeof item.startDate === "string" ? item.startDate : null,
      endDate: typeof item.endDate === "string" ? item.endDate : null,
      lifeStudyDate:
        typeof item.lifeStudyDate === "string" ? item.lifeStudyDate : null,
      status: typeof item.status === "string" ? item.status : null,
      required: typeof item.required === "boolean" ? item.required : false,
      officialMokja:
        typeof item.officialMokja === "boolean" ? item.officialMokja : false,
    });
  }
  return result;
}

export function tryReadLifeStudyCohortDetail(
  data: unknown,
): LifeStudyCohortDetailDto | null {
  if (!isRecord(data)) return null;
  const baseList = tryReadLifeStudyCohortList([data]);
  if (baseList.length === 0) return null;
  const base = baseList[0];
  return {
    ...base,
    applied: typeof data.applied === "boolean" ? data.applied : false,
    lessons: readLessons(data.lessons),
  };
}

function readLessons(value: unknown): LifeStudyLessonDto[] {
  const lessons: LifeStudyLessonDto[] = [];
  if (!Array.isArray(value)) return lessons;
  for (const item of value) {
    if (
      isRecord(item) &&
      typeof item.id === "number" &&
      typeof item.lessonName === "string"
    ) {
      lessons.push({
        id: item.id,
        lessonName: item.lessonName,
        orderNum:
          typeof item.weekNo === "number"
            ? item.weekNo
            : typeof item.orderNum === "number"
              ? item.orderNum
              : lessons.length + 1,
      });
    }
  }
  return lessons;
}

/** 과정 상세(`GET /api/life-study/{id}`)에서 주차별 커리큘럼만 읽는다. 형식이 다르면 null. */
export function tryReadLifeStudyCourseLessons(
  data: unknown,
): LifeStudyLessonDto[] | null {
  if (!isRecord(data)) return null;
  return readLessons(data.lessons);
}

export type LifeStudyOverviewSource =
  | unknown
  | {
      lifeStudies?: unknown;
      cohorts?: unknown;
      completions?: unknown;
    };

/** 수료 목록 및 전체 과정, 기수 목록을 병합하여 화면 개요를 만든다. */
export function buildLifeStudyOverview(
  data: LifeStudyOverviewSource,
): LifeStudyOverview {
  let lifeStudiesRaw: unknown = null;
  let cohortsRaw: unknown = null;
  let completionsRaw: unknown = null;

  if (Array.isArray(data)) {
    completionsRaw = data;
  } else if (isRecord(data)) {
    lifeStudiesRaw = data.lifeStudies;
    cohortsRaw = data.cohorts;
    completionsRaw = data.completions;
  }

  const myCompletions = readMyCompletions(completionsRaw);
  const completedIds = new Set(
    myCompletions
      .filter((c) => typeof c.completedAt === "string")
      .map((c) => String(c.lifeStudyId)),
  );

  const lifeStudies = tryReadLifeStudyList(lifeStudiesRaw);
  const cohorts = tryReadLifeStudyCohortList(cohortsRaw);

  const openCourses: LifeStudyOverviewCourse[] = cohorts.map((cohort) => {
    const appPeriod =
      cohort.startDate && cohort.endDate
        ? `${cohort.startDate} ~ ${cohort.endDate}`
        : undefined;
    return {
      id: String(cohort.lifeStudyId),
      cohortId: String(cohort.id),
      cohortNumber: cohort.cohortNumber ?? undefined,
      title: cohort.lifeStudyName,
      kind: cohort.required ? "required" : "optional",
      weekCount: cohort.weekCount ?? 0,
      instructorName: cohort.instructor ?? cohort.teamLeaderName ?? "",
      teamLeaderName: cohort.teamLeaderName ?? undefined,
      bookName: cohort.bookName ?? undefined,
      summary: cohort.studyContent ?? "",
      applicationPeriod: appPeriod,
      lifeStudyDate: cohort.lifeStudyDate ?? undefined,
      studyPlace: cohort.studyPlace ?? undefined,
      eligibility: cohort.eligibility ?? undefined,
      capacity: cohort.userNum ?? undefined,
      enrolledCount:
        cohort.appliedCount != null ? Number(cohort.appliedCount) : undefined,
      status: "recommended",
      target: cohort.studyTarget ?? undefined,
    };
  });

  let courses: LifeStudyOverviewCourse[];
  if (lifeStudies.length > 0) {
    courses = lifeStudies.map((study) => {
      const isCompleted = completedIds.has(String(study.id));
      const matchingOpen = openCourses.find((c) => c.id === String(study.id));
      return {
        id: String(study.id),
        cohortId: matchingOpen?.cohortId,
        title: study.name,
        kind: study.required ? "required" : "optional",
        weekCount: study.weekCount ?? 0,
        instructorName: study.teamLeader ?? "",
        teamLeaderName: study.teamLeader ?? undefined,
        bookName: study.bookName ?? undefined,
        eligibility: study.eligibility ?? undefined,
        summary: study.studyContent ?? "",
        status: isCompleted ? "completed" : "pending",
        target: study.studyTarget ?? undefined,
      };
    });
  } else {
    courses = myCompletions.map(overviewCourseFromCompletion);
  }

  let path: LifeStudyPathOverview;
  if (lifeStudies.length > 0) {
    const requiredStudies = lifeStudies.filter((s) => s.required);
    const totalRequired = requiredStudies.length;
    const completedRequired = requiredStudies.filter((s) =>
      completedIds.has(String(s.id)),
    ).length;
    const nextRequired = requiredStudies.find(
      (s) => !completedIds.has(String(s.id)),
    );
    path = {
      completedRequired,
      totalRequired,
      nextRecommendation: nextRequired
        ? nextRequired.name
        : totalRequired > 0
          ? "모든 필수 과정 수료 완료"
          : "",
      eligibility:
        nextRequired?.eligibility ||
        (totalRequired > 0 ? "등록교인 누구나" : ""),
    };
  } else {
    path = { ...emptyPath };
  }

  return {
    path,
    openCourses,
    courses,
  };
}

export function buildLifeStudyCourses(data: unknown): LifeStudyCourse[] {
  const studies = tryReadLifeStudyList(data);
  if (studies.length > 0) {
    return studies.map((study) => ({
      id: String(study.id),
      title: study.name,
      description: study.studyContent ?? "",
      instructor: {
        id: "",
        name: study.teamLeader ?? "",
        role: "USER",
      },
      schedule: "",
      location: "",
      status: "ongoing",
      sessions: study.weekCount ?? 0,
      currentSession: 0,
      capacity: 0,
      enrolledCount: 0,
      isEnrolled: false,
      isCompleted: false,
      curriculum: [],
    }));
  }
  return readMyCompletions(data).map(courseFromCompletion);
}

export function buildLifeStudyHistories(data: unknown): LifeStudyHistory[] {
  return readMyCompletions(data).map(historyFromCompletion);
}
