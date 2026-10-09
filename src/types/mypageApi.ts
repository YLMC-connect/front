/** Notion 2026-10-06 마이페이지 활동 DTO. 페이지에 없는 필드는 두지 않는다. */

export interface MyPageActivityPageQuery {
  /** 0부터. 응답 currentPage와 다르다. */
  page?: number;
  size?: number;
  sort?: string;
}

export interface MyPageActivityPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** 1부터. 요청 page는 0부터. */
  currentPage: number;
  size: number;
  hasNext: boolean;
}

export type MyPagePostStatus = "AVAILABLE" | "RESERVED" | "COMPLETED";
export type MyPagePostStatusName = "나눔중" | "예약완료" | "나눔완료";

export interface MyPagePostDto {
  id: number;
  title: string;
  content: string;
  status: MyPagePostStatus;
  statusName: MyPagePostStatusName;
  categoryCode: string;
  /** 값 목록은 Notion에 없다. */
  itemStatus: string;
  viewCount: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface MyPageCommentDto {
  id: number;
  shareId: number;
  shareTitle: string;
  content: string;
  createdAt: string;
}

export type MyPageGroupType = "GROUP" | "VOLUNTEER";

export interface MyPageGroupPageQuery extends MyPageActivityPageQuery {
  /** 없으면 전체. */
  type?: MyPageGroupType;
}

export interface MyPageGroupDto {
  id: number;
  title: string;
  type: MyPageGroupType;
  categoryCode: string;
  maxParticipants: number;
  currentParticipants: number;
  /** RECRUITING, CLOSED 등. 닫힌 목록이 아니다. */
  status: string;
  leaderId: string;
  leaderName: string;
  joinedAt: string;
}

/** 설명 칸의 이름만 있고 값 타입은 없다. */
export interface MyPageLifeStudyApplication {
  cohortId: unknown;
  lifeStudyId: unknown;
  name: unknown;
  cohortNumber: unknown;
  startDate: unknown;
  status: unknown;
  description: unknown;
  appliedAt: unknown;
}

/** 설명 칸의 이름만 있고 값 타입은 없다. */
export interface MyPageLifeStudyOngoing {
  cohortId: unknown;
  lifeStudyId: unknown;
  name: unknown;
  cohortNumber: unknown;
  period: unknown;
  progress: unknown;
  week: unknown;
  status: unknown;
  nextClass: unknown;
  attendCount: unknown;
  totalClassCount: unknown;
}

/** 설명 칸의 이름만 있고 값 타입은 없다. */
export interface MyPageLifeStudyCompleted {
  lifeStudyId: unknown;
  name: unknown;
  cohortId: unknown;
  cohortNumber: unknown;
  status: unknown;
  completedAt: unknown;
  attendCount: unknown;
  totalClassCount: unknown;
}

export interface MyPageLifeStudyHistoryDto {
  completionCount: number;
  applications: MyPageLifeStudyApplication[];
  ongoing: MyPageLifeStudyOngoing[];
  completed: MyPageLifeStudyCompleted[];
}

export type MyPagePrayerTimeSlot = "AM" | "PM";
export type MyPagePrayerTimeSlotName = "오전" | "오후";
export type MyPagePrayerMemberRole = "LEADER" | "MEMBER";
export type MyPagePrayerMemberRoleName = "팀장" | "중보기도요원";

export interface MyPagePrayerActivityItem {
  cohortId: number;
  cohortName: string;
  cohortYear: number;
  /** 0=일 … 6=토. */
  yoil: number;
  yoilName: string;
  timeSlot: MyPagePrayerTimeSlot;
  timeSlotName: MyPagePrayerTimeSlotName;
  memberRole: MyPagePrayerMemberRole;
  memberRoleName: MyPagePrayerMemberRoleName;
  joinedAt: string;
  /** 활동중이면 null. */
  leftAt: string | null;
  period: string;
  /** 활동중이면 null. */
  leaveReason: string | null;
  active: boolean;
}

export interface MyPagePrayerHistoryDto {
  activeCount: number;
  totalPeriod: string;
  totalPeriodDays: number;
  totalRoomCount: number;
  currentActivities: MyPagePrayerActivityItem[];
  pastActivities: MyPagePrayerActivityItem[];
}
