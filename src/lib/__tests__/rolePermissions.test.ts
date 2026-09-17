import { canManageAdminDomain } from "../rolePermissions";

describe("canManageAdminDomain", () => {
  it("allows an administrator in every domain", () => {
    expect(canManageAdminDomain("ADMIN", "communion")).toBe(true);
    expect(canManageAdminDomain("ADMIN", "share")).toBe(true);
    expect(canManageAdminDomain("ADMIN", "life-study")).toBe(true);
    expect(canManageAdminDomain("ADMIN", "prayer")).toBe(true);
  });

  it("allows a life-study manager only in life-study", () => {
    expect(canManageAdminDomain("MANAGER_LIFESTUDY", "life-study")).toBe(true);
    expect(canManageAdminDomain("MANAGER_LIFESTUDY", "communion")).toBe(false);
    expect(canManageAdminDomain("MANAGER_LIFESTUDY", "share")).toBe(false);
    expect(canManageAdminDomain("MANAGER_LIFESTUDY", "prayer")).toBe(false);
  });

  it("does not allow a general user to manage an admin domain", () => {
    expect(canManageAdminDomain("USER", "life-study")).toBe(false);
  });
});
