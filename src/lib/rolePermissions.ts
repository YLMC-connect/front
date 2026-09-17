import type { UserRole } from "../types/common";

export type AdminDomain = "communion" | "share" | "life-study" | "prayer";

const managerRoleByDomain: Readonly<Record<AdminDomain, UserRole>> = {
  communion: "MANAGER_COMMUNION",
  share: "MANAGER_SHARE",
  "life-study": "MANAGER_LIFESTUDY",
  prayer: "MANAGER_PRAYER",
};

export function canManageAdminDomain(
  role: UserRole,
  domain: AdminDomain,
): boolean {
  return role === "ADMIN" || role === managerRoleByDomain[domain];
}
