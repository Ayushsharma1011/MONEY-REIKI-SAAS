"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { hasRoleAccess } from "@/features/auth/authorization";
import type { UserRole } from "@/features/auth/types";
import { useAuth } from "@/providers/auth-provider";

export function RoleGuard({
  minimumRole,
  children
}: {
  minimumRole: UserRole;
  children: ReactNode;
}) {
  const { profile } = useAuth();

  if (!hasRoleAccess(profile?.role, minimumRole)) {
    return (
      <EmptyState
        title="Access restricted"
        description="Your account does not have permission to open this area."
      />
    );
  }

  return children;
}
