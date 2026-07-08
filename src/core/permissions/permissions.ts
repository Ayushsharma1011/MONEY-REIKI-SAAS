import {
  PLATFORM_PERMISSIONS,
  PLATFORM_ROLES,
  type PlatformPermission,
  type PlatformRole
} from "@/core/constants/platform.constants";

const ROLE_RANK: Record<PlatformRole, number> = {
  student: 1,
  mentor: 2,
  admin: 3,
  super_admin: 4
};

const STUDENT_PERMISSIONS: PlatformPermission[] = [
  "course:read",
  "journal:read",
  "journal:write",
  "practice:read",
  "practice:write",
  "notification:read"
];

const MENTOR_PERMISSIONS: PlatformPermission[] = [
  ...STUDENT_PERMISSIONS,
  "course:write",
  "notification:write"
];

const ADMIN_PERMISSIONS: PlatformPermission[] = [
  ...MENTOR_PERMISSIONS,
  "analytics:read",
  "admin:access"
];

const ROLE_PERMISSIONS: Record<PlatformRole, PlatformPermission[]> = {
  student: STUDENT_PERMISSIONS,
  mentor: MENTOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  super_admin: [...PLATFORM_PERMISSIONS]
};

export type AccessRequirement = {
  roles?: PlatformRole[];
  permissions?: PlatformPermission[];
};

export function getRolePermissions(role: PlatformRole): PlatformPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasRole(
  userRole: PlatformRole | null | undefined,
  requiredRole: PlatformRole
): boolean {
  if (!userRole) {
    return false;
  }

  return ROLE_RANK[userRole] >= ROLE_RANK[requiredRole];
}

export function hasPermission(
  userRole: PlatformRole | null | undefined,
  permission: PlatformPermission
): boolean {
  if (!userRole) {
    return false;
  }

  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function canAccess(
  userRole: PlatformRole | null | undefined,
  requirement: AccessRequirement
): boolean {
  if (!userRole) {
    return false;
  }

  const roleAllowed =
    !requirement.roles || requirement.roles.some((role) => hasRole(userRole, role));

  const permissionAllowed =
    !requirement.permissions ||
    requirement.permissions.every((permission) =>
      hasPermission(userRole, permission)
    );

  return roleAllowed && permissionAllowed;
}

export function isPlatformRole(value: string): value is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(value);
}

export function isPlatformPermission(
  value: string
): value is PlatformPermission {
  return (PLATFORM_PERMISSIONS as readonly string[]).includes(value);
}
