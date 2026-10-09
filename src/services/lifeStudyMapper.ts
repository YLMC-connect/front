import { ApiError } from "../lib/apiClient";
import type { Member } from "../types/common";
import type {
  LifeStudyCourse,
  LifeStudyHistory,
  LifeStudyOverview,
  LifeStudyOverviewCourse,
} from "../types/lifeStudy";
import type {
  LifeStudyAttendanceRoster,
  LifeStudyClassList,
  LifeStudyCompletionRoster,
  LifeStudyCompletionStudent,
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

/** 수료 목록만으로 화면 목록을 만든다. 과정 카탈로그 필드는 비운다. */
export function buildLifeStudyOverview(data: unknown): LifeStudyOverview {
  return {
    path: { ...emptyPath },
    openCourses: [],
    courses: readMyCompletions(data).map(overviewCourseFromCompletion),
  };
}

export function buildLifeStudyCourses(data: unknown): LifeStudyCourse[] {
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
