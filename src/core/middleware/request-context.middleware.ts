import type { PlatformRole } from "@/core/constants/platform.constants";
import { createUuid } from "@/core/helpers/uuid";

export type RequestContext = {
  requestId: string;
  userId?: string;
  role?: PlatformRole;
  ipAddress?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  startedAt: number;
};

export type RequestContextInput = Partial<
  Omit<RequestContext, "requestId" | "startedAt">
>;

export function createRequestContext(
  input: RequestContextInput = {}
): RequestContext {
  return {
    requestId: createUuid(),
    startedAt: Date.now(),
    ...input
  };
}

export function withRequestUser(
  context: RequestContext,
  userId: string,
  role?: PlatformRole
): RequestContext {
  return {
    ...context,
    userId,
    role
  };
}

export function getRequestDurationMs(context: RequestContext): number {
  return Date.now() - context.startedAt;
}
