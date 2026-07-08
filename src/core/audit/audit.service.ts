import { logger } from "@/core/logger/logger";

export const AUDIT_EVENTS = [
  "Login",
  "Logout",
  "Signup",
  "Profile Update",
  "Lesson Complete",
  "Practice Complete",
  "Journal Create",
  "Challenge Join",
  "Notification Read",
  "Admin Action"
] as const;

export type AuditEventName = (typeof AUDIT_EVENTS)[number];

export type AuditActor = {
  userId?: string;
  role?: string;
  email?: string;
};

export type AuditEntry = {
  id: string;
  event: AuditEventName;
  actor: AuditActor;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type AuditSink = (entry: AuditEntry) => void | Promise<void>;

export type AuditServiceOptions = {
  sink?: AuditSink;
};

function createAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class AuditService {
  private readonly sink?: AuditSink;
  private readonly entries: AuditEntry[] = [];

  constructor(options: AuditServiceOptions = {}) {
    this.sink = options.sink;
  }

  async track(
    event: AuditEventName,
    actor: AuditActor,
    metadata?: Record<string, unknown>,
    context?: Pick<AuditEntry, "resource" | "ipAddress" | "userAgent">
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: createAuditId(),
      event,
      actor,
      metadata,
      resource: context?.resource,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      createdAt: new Date().toISOString()
    };

    this.entries.push(entry);

    logger.info("Audit event recorded", {
      auditId: entry.id,
      event: entry.event,
      userId: actor.userId
    });

    if (this.sink) {
      await this.sink(entry);
    }

    return entry;
  }

  list(): AuditEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

/** Default audit service for shared infrastructure. */
export const auditService = new AuditService();
