import type { PlatformRole } from "@/core/constants/platform.constants";
import { UnauthorizedError } from "@/lib/errors";

export type AuthenticatedUser = {
  id: string;
  role: PlatformRole;
  email?: string;
};

export type AuthContext = {
  user: AuthenticatedUser | null;
};

export function requireAuth(context: AuthContext): AuthenticatedUser {
  if (!context.user) {
    throw new UnauthorizedError();
  }

  return context.user;
}

export function isAuthenticated(context: AuthContext): boolean {
  return context.user !== null;
}

export function createAuthContext(user: AuthenticatedUser | null): AuthContext {
  return { user };
}
