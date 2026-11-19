export const USER_ROLES = [
  "ADMIN",
  "USER",
  "MANAGER_COMMUNION",
  "MANAGER_SHARE",
  "MANAGER_LIFESTUDY",
  "MANAGER_PRAYER",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface Member {
  id: string;
  name: string;
  profileImage?: string;
  department?: string;
  role: UserRole;
  phone?: string;
  email?: string;
  point?: number;
}
