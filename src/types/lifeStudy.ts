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
