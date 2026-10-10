import { ApiError } from "../lib/apiClient";
import type { Member } from "../types/common";
import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyOverview,
  LifeStudyOverviewCourse,
  LifeStudyPathOverview,
} from "../types/lifeStudy";
import type {
  LifeStudyAttendanceRoster,
  LifeStudyClassList,
  LifeStudyCohortDto,
  LifeStudyCompletionRoster,
  LifeStudyCompletionStudent,
  LifeStudyDto,
  LifeStudyMyCompletion,
} from "../types/lifeStudyApi";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function invalid(data: unknown): never {
  throw new ApiError({
    code: "INVALID_RESPONSE",
    message: "서버 응답 형식을 확인할 수 없습니다.",
    status: 200,
    data,
  });
}

function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function readFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requireKey(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  if (!(key in data)) invalid(source);
}

function requireInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readInteger(data[key]);
  if (value == null) invalid(source);
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
  if (value == null) invalid(source);
  return value;
}

function requireFiniteNumber(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readFiniteNumber(data[key]);
  if (value == null) invalid(source);
  return value;
}

function requireString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "string") invalid(source);
  return data[key];
}

function requireNullableString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (typeof data[key] !== "string") invalid(source);
  return data[key];
}

function requireBoolean(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "boolean") invalid(source);
  return data[key];
}

function readStudent(
  value: unknown,
  source: unknown,
): LifeStudyCompletionStudent {
  if (!isRecord(value)) invalid(source);
  return {
    userId: requireString(value, "userId", source),
    userName: requireNullableString(value, "userName", source),
    userPhone: requireNullableString(value, "userPhone", source),
    attendCount: requireInteger(value, "attendCount", source),
    absentCount: requireInteger(value, "absentCount", source),
    completed: requireBoolean(value, "completed", source),
    completedAt: requireNullableString(value, "completedAt", source),
  };
}

export function readMyCompletions(data: unknown): LifeStudyMyCompletion[] {
  if (data == null) return [];
  if (!Array.isArray(data)) invalid(data);
  return data.map((item) => {
    if (!isRecord(item)) invalid(data);
    return {
      lifeStudyId: requireInteger(item, "lifeStudyId", data),
      lifeStudyName: requireNullableString(item, "lifeStudyName", data),
      cohortId: requireInteger(item, "cohortId", data),
      cohortNumber: requireNullableInteger(item, "cohortNumber", data),
      attendCount: requireNullableInteger(item, "attendCount", data),
      totalClassCount: requireNullableInteger(item, "totalClassCount", data),
      completedAt: requireNullableString(item, "completedAt", data),
    };
  });
}

export function readClassList(data: unknown): LifeStudyClassList | null {
  if (data == null) return null;
  if (!isRecord(data) || !Array.isArray(data.classes)) invalid(data);
  return {
    cohortId: requireInteger(data, "cohortId", data),
    weekCount: requireFiniteNumber(data, "weekCount", data),
    classes: [...data.classes],
  };
}

export function readAttendanceRoster(
  data: unknown,
): LifeStudyAttendanceRoster | null {
  if (data == null) return null;
  if (!isRecord(data)) invalid(data);
  return {};
}

export function readCompletionRoster(
  data: unknown,
): LifeStudyCompletionRoster | null {
  if (data == null) return null;
  if (!isRecord(data) || !Array.isArray(data.students)) invalid(data);
  return {
    cohortId: requireInteger(data, "cohortId", data),
    lifeStudyId: requireInteger(data, "lifeStudyId", data),
    lifeStudyName: requireNullableString(data, "lifeStudyName", data),
    cohortNumber: requireNullableInteger(data, "cohortNumber", data),
    totalClassCount: requireInteger(data, "totalClassCount", data),
    students: data.students.map((student) => readStudent(student, data)),
  };
}

export function requireCompletionRoster(
  data: unknown,
): LifeStudyCompletionRoster {
  const roster = readCompletionRoster(data);
  if (!roster) invalid(data);
  return roster;
}

function groupByCourseId(rows: readonly LifeStudyMyCompletion[]) {
  const grouped = new Map<string, LifeStudyMyCompletion[]>();
  for (const row of rows) {
    const key = String(row.lifeStudyId);
    const current = grouped.get(key);
    if (current) current.push(row);
    else grouped.set(key, [row]);
  }
  return grouped;
}

function uniqueCompletion(
  grouped: ReadonlyMap<string, LifeStudyMyCompletion[]>,
  courseId: string,
) {
  const matches = grouped.get(courseId);
  return matches?.length === 1 ? matches[0] : undefined;
}

function withTitle<T extends { title: string }>(
  model: T,
  lifeStudyName: string | null,
): T {
  if (lifeStudyName == null) return model;
  return { ...model, title: lifeStudyName };
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
  for (const item of data) {
    if (!isRecord(item)) return [];
    if (typeof item.id !== "number" || typeof item.name !== "string") return [];
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
  for (const item of data) {
    if (!isRecord(item)) return [];
    if (
      typeof item.id !== "number" ||
      typeof item.lifeStudyId !== "number" ||
      typeof item.lifeStudyName !== "string"
    ) {
      return [];
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
      title: cohort.lifeStudyName,
      kind: cohort.required ? "required" : "optional",
      weekCount: cohort.weekCount ?? 0,
      instructorName: cohort.instructor ?? cohort.teamLeaderName ?? "",
      summary: cohort.studyContent ?? "",
      applicationPeriod: appPeriod,
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
      return {
        id: String(study.id),
        title: study.name,
        kind: study.required ? "required" : "optional",
        weekCount: study.weekCount ?? 0,
        instructorName: study.teamLeader ?? "",
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

export function applyMyCompletionsToOverview(
  overview: LifeStudyOverview,
  data: unknown,
): LifeStudyOverview {
  const grouped = groupByCourseId(readMyCompletions(data));
  const mapCourse = (course: LifeStudyOverviewCourse) => {
    const row = uniqueCompletion(grouped, course.id);
    return row ? withTitle({ ...course }, row.lifeStudyName) : { ...course };
  };
  return {
    path: { ...overview.path },
    openCourses: overview.openCourses.map(mapCourse),
    courses: overview.courses.map(mapCourse),
  };
}

export function applyMyCompletionsToCourses(
  courses: readonly LifeStudyCourse[],
  data: unknown,
): LifeStudyCourse[] {
  const grouped = groupByCourseId(readMyCompletions(data));
  return courses.map((course) => {
    const row = uniqueCompletion(grouped, course.id);
    if (!row) return { ...course };
    return withTitle({ ...course, isCompleted: true }, row.lifeStudyName);
  });
}

export function applyMyCompletionsToHistories(
  histories: readonly LifeStudyHistory[],
  data: unknown,
): LifeStudyHistory[] {
  const grouped = groupByCourseId(readMyCompletions(data));
  return histories.map((history) => {
    const row = uniqueCompletion(grouped, history.courseId);
    if (!row) return { ...history };
    const next: LifeStudyHistory = {
      id: history.id,
      courseId: history.courseId,
      title: history.title,
      enrolledAt: history.enrolledAt,
      completedSessions: history.completedSessions,
      certificateIssued: history.certificateIssued,
    };
    const titled = withTitle(next, row.lifeStudyName);
    if (typeof row.completedAt === "string") {
      titled.completedAt = row.completedAt;
    }
    return titled;
  });
}

export function applyClassListToOverviewCourse(
  course: LifeStudyOverviewCourse,
  data: unknown,
): LifeStudyOverviewCourse {
  const list = readClassList(data);
  if (!list) return { ...course };
  return { ...course, weekCount: list.weekCount };
}

export function applyCompletionRosterToCourse(
  course: LifeStudyCourse,
  data: unknown,
  currentUserId: string | null,
): LifeStudyCourse {
  const roster = readCompletionRoster(data);
  if (!roster || String(roster.lifeStudyId) !== course.id) return { ...course };
  const next = withTitle({ ...course }, roster.lifeStudyName);
  if (!currentUserId) return next;
  const mine = roster.students.filter(
    (student) => student.userId === currentUserId,
  );
  if (mine.length !== 1) return next;
  return { ...next, isCompleted: mine[0].completed };
}
