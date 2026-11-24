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

/** 화면에서 쓰지 않는 필드는 없거나 형식이 다르면 null 로 읽는다. */
export interface PrayerCohortDto {
  id: number;
  cohortYear: number | null;
  yoil: number;
  timeSlot: PrayerTimeSlot;
  cohortName: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: PrayerCohortStatus | null;
  memberCount: number;
  weekCompletedCount: number;
  completionRate: number;
  myCompleted: boolean | null;
  /** 멤버가 아니면 null. */
  myRole: PrayerMemberRole | null;
  emergencyCount: number | null;
}

export interface PrayerCompletionMemberDto {
  userId: string;
  userName: string;
  userPhone: string | null;
  memberRole: PrayerMemberRole | null;
  /** 미완료면 null. */
  completionId: number | null;
  /** 미완료면 null. */
  completedAt: string | null;
  likeCount: number | null;
  liked: boolean | null;
}

export interface PrayerCohortStatusDto {
  cohortId: number;
  cohortName: string;
  /** 0=일 … 6=토. 없으면 null. */
  yoil: number | null;
  /** "AM" / "PM". 없으면 null. */
  timeSlot: string | null;
  weekStartDate: string | null;
  scheduledDate: string | null;
  totalMembers: number;
  completedCount: number;
  notCompletedCount: number;
  completionRate: number;
  myCompleted: boolean;
  canComplete: boolean | null;
  completed: PrayerCompletionMemberDto[];
  notCompleted: PrayerCompletionMemberDto[];
}

export interface PrayerTopicDto {
  id: number;
  categoryId: number | null;
  categoryName: string;
  title: string;
  content: string;
  status: PrayerTopicStatus;
  rejectReason: string | null;
  /** 없으면 화면에서 "성도". */
  writerName: string | null;
  mine: boolean | null;
  /** 익명 등록이면 true. 이때 writerName 은 서버가 "익명" 으로 가려 준다. */
  anonymous?: boolean | null;
  emergency: boolean | null;
  emergencyEndAt: string | null;
  answerContent: string | null;
  answeredAt: string | null;
  /** 접수일(yyyy-MM-dd). 서버가 없으면 등록일로 채워 준다. */
  receivedAt: string | null;
  createdAt: string | null;
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
  cohortName: string | null;
  cohortYear: number | null;
  yoil: number | null;
  timeSlot: PrayerTimeSlot | null;
  memberRole: PrayerMemberRole | null;
  joinedAt: string | null;
  /** 활동중이면 null. */
  leftAt: string | null;
  leaveReason: string | null;
  active: boolean | null;
}

export interface PrayerCategoryDto {
  id: number;
  categoryCode: string | null;
  categoryName: string;
  orderNum: number | null;
}

/** 래퍼 이름 없이 세 배열만 있다. */
export interface PrayerTopicBoard {
  emergency: PrayerTopicDto[];
  recentAnswers: PrayerTopicDto[];
  ongoing: PrayerTopicDto[];
}

/** GET /api/prayer/topics/answers — 응답완료 기도제목 최신순 무한 스크롤. */
export interface PrayerAnswerPage {
  content: PrayerTopicDto[];
  /** 다음 페이지 lastId. 더 없으면 null */
  nextCursor: number | null;
  hasNext: boolean;
}

export interface PrayerTopicWriteRequest {
  categoryId: number;
  title: string;
  content: string;
  /** 익명 등록 여부. 빼면 서버는 실명으로 저장한다. */
  anonymous: boolean;
}

export interface PrayerAnswerRequest {
  answerContent: string;
}
