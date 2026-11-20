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

export interface LifeStudyMyCompletion {
  lifeStudyId: number;
  lifeStudyName: string | null;
  cohortId: number;
  cohortNumber: number | null;
  attendCount: number | null;
  totalClassCount: number | null;
  completedAt: string | null;
}

export interface LifeStudyLessonDto {
  id: number;
  lessonName: string;
  orderNum: number;
}

export interface LifeStudyCohortDetailDto extends LifeStudyCohortDto {
  applied: boolean;
  lessons: LifeStudyLessonDto[];
}

/** 세 필드 모두 선택(빈 바디 `{}` 가능). 앱 신청 화면은 보내지 않는다. */
export interface LifeStudyAttendRequest {
  userYear?: string;
  userFaithYears?: string;
  userPart?: string;
}
