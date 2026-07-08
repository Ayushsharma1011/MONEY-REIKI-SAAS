import { describe, expect, it } from "vitest";
import {
  canAccess,
  getRolePermissions,
  hasPermission,
  hasRole
} from "@/core/permissions/permissions";

describe("core permissions", () => {
  it("evaluates role hierarchy", () => {
    expect(hasRole("student", "student")).toBe(true);
    expect(hasRole("student", "admin")).toBe(false);
    expect(hasRole("admin", "mentor")).toBe(true);
    expect(hasRole("super_admin", "admin")).toBe(true);
  });

  it("checks permissions by role", () => {
    expect(hasPermission("student", "journal:write")).toBe(true);
    expect(hasPermission("student", "admin:access")).toBe(false);
    expect(hasPermission("mentor", "course:write")).toBe(true);
    expect(hasPermission("super_admin", "admin:access")).toBe(true);
  });

  it("requires both role and permission access", () => {
    expect(
      canAccess("admin", {
        roles: ["mentor"],
        permissions: ["analytics:read"]
      })
    ).toBe(true);

    expect(
      canAccess("student", {
        roles: ["mentor"],
        permissions: ["journal:write"]
      })
    ).toBe(false);
  });

  it("returns role permissions", () => {
    expect(getRolePermissions("student")).toContain("course:read");
    expect(getRolePermissions("super_admin")).toContain("admin:access");
  });
});
