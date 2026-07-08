import type { UserRole } from "@/features/auth/types";

const roleRank: Record<UserRole, number> = {
  student: 1,
  admin: 2,
  super_admin: 3
};

export function hasRoleAccess(
  userRole: UserRole | null | undefined,
  minimumRole: UserRole
) {
  if (!userRole) {
    return false;
  }

  return roleRank[userRole] >= roleRank[minimumRole];
}
