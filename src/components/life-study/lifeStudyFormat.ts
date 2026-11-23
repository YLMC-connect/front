import type { LifeStudyOverviewCourse } from "../../types/lifeStudy";
import type { MyPageLifeStudyHistoryDto } from "../../types/mypageApi";

const YOIL = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** `YYYY-MM-DD` → `MM.DD`. 형식이 다르면 undefined. */
export function formatMonthDay(date?: string | null) {
  const match = date ? /^\d{4}-(\d{2})-(\d{2})/.exec(date) : null;
  return match ? `${match[1]}.${match[2]}` : undefined;
}

/** "2026-06-01 ~ 2026-06-14" → "06.01 ~ 06.14". 날짜가 아닌 칸은 그대로. */
export function formatPeriod(period?: string) {
  if (!period) return undefined;
  return period
    .split(" ~ ")
    .map((date) => formatMonthDay(date) ?? date)
    .join(" ~ ");
}

/** 수업 요일(0=일 ~ 6=토) → "수요일". */
export function yoilLabel(yoil?: number | null) {
  return yoil != null && YOIL[yoil] ? `${YOIL[yoil]}요일` : undefined;
}

/** 일정: "06.17 개강 · 수요일" 처럼 있는 값만 잇는다. */
export function courseScheduleLabel(course: LifeStudyOverviewCourse) {
  const start = formatMonthDay(course.lifeStudyDate);
  return joinParts([
    start ? `${start} 개강` : undefined,
    yoilLabel(course.yoil),
  ]);
}

/** 정원에서 신청 인원을 뺀 남은 자리. 정원을 모르면 undefined. */
export function seatsLeft(course: LifeStudyOverviewCourse) {
  if (course.capacity == null) return undefined;
  return Math.max(0, course.capacity - (course.enrolledCount ?? 0));
}

export function joinParts(parts: (string | undefined | null | false)[]) {
  return parts.filter(Boolean).join(" · ");
}

export function courseKindLabel(kind: LifeStudyOverviewCourse["kind"]) {
  return kind === "required" ? "필수 과정" : "선택 과정";
}

export type MyLifeStudyRow = {
  key: string;
  courseId?: string;
  name: string;
  meta: string;
};

export type MyLifeStudySection = {
  key: "applications" | "ongoing" | "completed";
  title: string;
  rows: MyLifeStudyRow[];
};

/** 수강 내역 원소는 값 타입이 정해지지 않아(unknown) 글자·숫자일 때만 쓴다. */
export function textOf(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

export function cohortLabel(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}기`;
  return textOf(value);
}

/** 마이페이지 수강 내역(`/api/mypage/activities/life-studies`)을 신청 중·수강 중·수료 세 묶음으로. */
export function buildMyLifeStudySections(
  data: MyPageLifeStudyHistoryDto | undefined,
): MyLifeStudySection[] {
  if (!data) return [];
  const sections: MyLifeStudySection[] = [
    {
      key: "applications",
      title: "신청 중",
      rows: data.applications.map((item, index) => {
        const start = formatMonthDay(textOf(item.startDate));
        return {
          key: `applications-${textOf(item.cohortId) ?? index}`,
          courseId: textOf(item.lifeStudyId),
          name: textOf(item.name) ?? "이름 없는 과정",
          meta: joinParts([
            cohortLabel(item.cohortNumber),
            start ? `${start} 개강` : undefined,
          ]),
        };
      }),
    },
    {
      key: "ongoing",
      title: "수강 중",
      rows: data.ongoing.map((item, index) => ({
        key: `ongoing-${textOf(item.cohortId) ?? index}`,
        courseId: textOf(item.lifeStudyId),
        name: textOf(item.name) ?? "이름 없는 과정",
        meta: joinParts([cohortLabel(item.cohortNumber), textOf(item.period)]),
      })),
    },
    {
      key: "completed",
      title: "수료",
      rows: data.completed.map((item, index) => {
        const completedAt = textOf(item.completedAt);
        return {
          key: `completed-${textOf(item.cohortId) ?? index}`,
          courseId: textOf(item.lifeStudyId),
          name: textOf(item.name) ?? "이름 없는 과정",
          meta: joinParts([
            cohortLabel(item.cohortNumber),
            completedAt ? `${completedAt} 수료` : undefined,
          ]),
        };
      }),
    },
  ];
  return sections.filter((section) => section.rows.length > 0);
}
