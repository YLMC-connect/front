/** 삶공부 API DTO */

export interface LifeStudyDto {
  id: number;
  name: string;
  studyContent?: string | null;
  weekCount: number;
  teamLeader?: string | null;
  bookName?: string | null;
  studyTarget?: string | null;
  eligibility?: string | null;
  required?: boolean;
  officialMokja?: boolean;
}

export interface LifeStudyCohortDto {
  id: number;
  lifeStudyId: number;
  lifeStudyName: string;
  studyContent?: string | null;
  cohortNumber?: number | null;
  weekCount: number;
  yoil?: number | null;
  userNum?: number | null;
  appliedCount?: number | null;
  instructor?: string | null;
  teamLeaderName?: string | null;
  bookName?: string | null;
  studyTarget?: string | null;
  eligibility?: string | null;
  studyPlace?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  lifeStudyDate?: string | null;
  status?: string | null;
  required?: boolean;
  officialMokja?: boolean;
}

export interface LifeStudyClassList {
  cohortId: number;
  weekCount: number;
  /** 원소 필드는 Notion에 없다. */
  classes: readonly unknown[];
}

/** 하위 필드명이 Notion에 없다. */
export type LifeStudyAttendanceRoster = Record<string, never>;

export interface LifeStudyAttendanceUpdateRequest {
  attendedUserIds: string[];
}

export interface LifeStudyAttendanceUserRequest {
  userId: string;
  attended: boolean;
}

/** Notion 표의 Student. */
export interface LifeStudyCompletionStudent {
  userId: string;
  userName: string | null;
  userPhone: string | null;
  attendCount: number;
  absentCount: number;
  completed: boolean;
  completedAt: string | null;
}

export interface LifeStudyCompletionRoster {
  cohortId: number;
  lifeStudyId: number;
  lifeStudyName: string | null;
  cohortNumber: number | null;
  totalClassCount: number;
  students: LifeStudyCompletionStudent[];
}

export interface LifeStudyCompletionUserRequest {
  userId: string;
  completed: boolean;
}

export interface LifeStudyMyCompletion {
  lifeStudyId: number;
  lifeStudyName: string | null;
  cohortId: number;
  cohortNumber: number | null;
  attendCount: number | null;
  totalClassCount: number | null;
  completedAt: string | null;
}
