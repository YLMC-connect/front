/** Notion 2026-10-02 사용자 중보기도 DTO. 페이지에 없는 필드는 두지 않는다. */

export type PrayerTimeSlot = "AM" | "PM";
export type PrayerCohortStatus = "ACTIVE" | "CLOSED";
export type PrayerMemberRole = "LEADER" | "MEMBER";
export type PrayerTopicStatus =
  | "REVIEW"
  | "OPEN"
  | "ANSWER_REQUESTED"
  | "ANSWERED"
  | "REJECTED"
  | "HIDDEN";

export interface PrayerCohortDto {
  id: number;
  cohortYear: number;
  yoil: number;
  timeSlot: PrayerTimeSlot;
  cohortName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: PrayerCohortStatus;
  memberCount: number;
  weekCompletedCount: number;
  completionRate: number;
  myCompleted: boolean;
  /** 멤버가 아니면 null. */
  myRole: PrayerMemberRole | null;
  emergencyCount: number;
}

export interface PrayerCompletionMemberDto {
  userId: string;
  userName: string;
  userPhone: string;
  memberRole: PrayerMemberRole;
  /** 미완료면 null. */
  completionId: number | null;
  completedAt: string;
  likeCount: number;
  liked: boolean;
}

export interface PrayerCohortStatusDto {
  cohortId: number;
  cohortName: string;
  weekStartDate: string;
  scheduledDate: string;
  totalMembers: number;
  completedCount: number;
  notCompletedCount: number;
  completionRate: number;
  myCompleted: boolean;
  canComplete: boolean;
  completed: PrayerCompletionMemberDto[];
  notCompleted: PrayerCompletionMemberDto[];
}

/** 성공 필드 표가 없다. PrayerCohortDto로 단정하지 않는다. */
export type PrayerCohortDetail = Record<string, never>;

export interface PrayerTopicDto {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  content: string;
  status: PrayerTopicStatus;
  rejectReason: string;
  writerName: string;
  mine: boolean;
  emergency: boolean;
  emergencyEndAt: string;
  answerContent: string;
  answeredAt: string;
  createdAt: string;
}

/** 이름만 있고 값 타입은 페이지에 없다. */
export interface PrayerApplicationDto {
  id: unknown;
  cohortId: unknown;
  cohortName: unknown;
  yoil: unknown;
  timeSlot: unknown;
  applicantName: unknown;
  applicantPhone: unknown;
  applyMemo: unknown;
  status: unknown;
  rejectReason: unknown;
  createdAt: unknown;
  processedAt: unknown;
}

export interface PrayerApplicationCreateRequest {
  yoil: number;
  timeSlot: PrayerTimeSlot;
  applicantName?: string;
  applicantPhone?: string;
  applyMemo?: string;
}

/**
 * 응답 표에 data[] 행은 없다.
 * 현재·지난 활동을 최신순으로 돌려준다는 문장만 있어 원소 필드만 둔다.
 */
export interface PrayerHistoryItem {
  cohortId: number;
  cohortName: string;
  cohortYear: number;
  yoil: number;
  timeSlot: PrayerTimeSlot;
  memberRole: PrayerMemberRole;
  joinedAt: string;
  /** 활동중이면 null. */
  leftAt: string | null;
  leaveReason: string;
  active: boolean;
}

/** 이름만 있고 값 타입은 페이지에 없다. */
export interface PrayerCategoryDto {
  id: unknown;
  categoryCode: unknown;
  categoryName: unknown;
  orderNum: unknown;
}

/** 래퍼 이름 없이 세 배열만 있다. */
export interface PrayerTopicBoard {
  emergency: PrayerTopicDto[];
  recentAnswers: PrayerTopicDto[];
  ongoing: PrayerTopicDto[];
}

export interface PrayerTopicWriteRequest {
  categoryId: number;
  title: string;
  content: string;
}

export interface PrayerAnswerRequest {
  answerContent: string;
}
