import {
  canAccess,
  hasPermission,
  hasRole,
  type AccessRequirement
} from "@/core/permissions/permissions";
import type { PlatformPermission, PlatformRole } from "@/core/constants/platform.constants";
import { ForbiddenError } from "@/lib/errors";
import type { AuthenticatedUser } from "@/core/middleware/auth.middleware";

export function requireRole(
  user: AuthenticatedUser,
  requiredRole: PlatformRole
): void {
  if (!hasRole(user.role, requiredRole)) {
    throw new ForbiddenError();
  }
}

export function requirePermission(
  user: AuthenticatedUser,
  permission: PlatformPermission
): void {
  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError();
  }
}

export function requireAccess(
  user: AuthenticatedUser,
  requirement: AccessRequirement
): void {
  if (!canAccess(user.role, requirement)) {
    throw new ForbiddenError();
  }
}

export function withPermission(
  user: AuthenticatedUser | null,
  requirement: AccessRequirement
): boolean {
  if (!user) {
    return false;
  }

  return canAccess(user.role, requirement);
}
