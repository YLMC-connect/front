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
  content: string | null;
  status: MyPagePostStatus;
  statusName: MyPagePostStatusName;
  categoryCode: string | null;
  /** 값 목록은 Notion에 없다. */
  itemStatus: string | null;
  viewCount: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface MyPageCommentDto {
  id: number;
  shareId: number | null;
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
  type: MyPageGroupType | null;
  categoryCode: string | null;
  maxParticipants: number | null;
  currentParticipants: number;
  /** RECRUITING, CLOSED 등. 닫힌 목록이 아니다. */
  status: string | null;
  leaderId: string | null;
  leaderName: string | null;
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
  completionCount: number | null;
  applications: MyPageLifeStudyApplication[];
  ongoing: MyPageLifeStudyOngoing[];
  completed: MyPageLifeStudyCompleted[];
}
