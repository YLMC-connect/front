import type { Member } from "./common";

export type LifeStudyStatus = "all" | "upcoming" | "ongoing" | "completed";

export interface LifeStudyCourse {
  id: string;
  title: string;
  description: string;
  instructor: Member;
  schedule: string;
  location: string;
  status: Exclude<LifeStudyStatus, "all">;
  sessions: number;
  currentSession: number;
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  curriculum: string[];
}

export interface LifeStudyHistory {
  id: string;
  courseId: string;
  title: string;
  enrolledAt: string;
  completedSessions: number;
  completedAt?: string;
  certificateIssued: boolean;
}

export type LifeStudyCourseKind = "required" | "optional";
export type LifeStudyOverviewStatus = "completed" | "recommended" | "pending";

export interface LifeStudyOverviewCourse {
  id: string;
  title: string;
  kind: LifeStudyCourseKind;
  weekCount: number;
  instructorName: string;
  summary: string;
  applicationPeriod?: string;
  capacity?: number;
  enrolledCount?: number;
  status?: LifeStudyOverviewStatus;
  target?: string;
}

export interface LifeStudyPathOverview {
  completedRequired: number;
  totalRequired: number;
  nextRecommendation: string;
  eligibility: string;
}

export interface LifeStudyOverview {
  path: LifeStudyPathOverview;
  openCourses: readonly LifeStudyOverviewCourse[];
  courses: readonly LifeStudyOverviewCourse[];
}
