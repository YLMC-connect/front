import type { Member } from "./common";

export type GroupCategory =
  | "all"
  | "bible"
  | "pray"
  | "volunteer"
  | "hobby"
  | "sport"
  | "cell"
  | "mission"
  | "carpool"
  | "etc";

export type GroupStatus = "open" | "closed";

export interface GroupNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  leader: Member;
  members: Member[];
  maxMembers: number;
  schedule: string;
  location: string;
  coverImage?: string;
  status: GroupStatus;
  isJoined: boolean;
  isFavorite: boolean;
  notices: GroupNotice[];
}

export interface GroupInput {
  name: string;
  description: string;
  category: Exclude<GroupCategory, "all">;
  maxMembers: number;
  schedule: string;
  location: string;
  coverImage?: string;
}
