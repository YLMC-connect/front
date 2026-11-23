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
