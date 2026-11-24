export interface CommunionListItemDto {
  id: number;
  type: string;
  title: string;
  categoryCode: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  schedule?: string | null;
  location?: string | null;
  requiresApproval?: boolean | null;
  leaderName: string;
  createdAt: string;
}

export interface CommunionListResponseDto {
  content: CommunionListItemDto[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CommunionDetailDto {
  id: number;
  type: string;
  title: string;
  content: string;
  categoryCode: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  schedule?: string | null;
  location?: string | null;
  requiresApproval?: boolean | null;
  leaderId: string;
  leaderName: string;
  /** 로그인 사용자의 참여 상태. null 이면 미신청. PENDING·APPROVED·REJECTED */
  myMemberStatus?: string | null;
  /** 로그인 사용자가 방장인지 */
  isLeader?: boolean | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunionMemberDto {
  userId: string;
  userName: string;
  joinedAt: string;
  /** PENDING(승인대기)·APPROVED(참여완료)·REJECTED(승인거절) */
  status?: string | null;
}

export interface CommunionNoticeDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
