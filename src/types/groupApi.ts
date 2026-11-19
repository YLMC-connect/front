export interface CommunionListItemDto {
  id: number;
  type: string;
  title: string;
  categoryCode: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
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
  leaderId: string;
  leaderName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunionMemberDto {
  userId: string;
  userName: string;
  joinedAt: string;
}

export interface CommunionNoticeDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
