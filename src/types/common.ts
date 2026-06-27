export interface Member {
  id: string;
  name: string;
  profileImage?: string;
  department?: string;
  role: "member" | "leader" | "staff" | "admin";
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface Report {
  id: string;
  targetType: "market" | "group" | "prayer";
  targetId: string;
  reporterId: string;
  reason: "inappropriate" | "spam" | "abuse" | "no_show" | "other";
  detail?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: Member;
  content: string;
  createdAt: string;
}
