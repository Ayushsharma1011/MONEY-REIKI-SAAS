"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { LessonDisplayStatus } from "@/features/courses/detail-types";

const STATUS_CONFIG: Record<
  LessonDisplayStatus,
  { label: string; className: string }
> = {
  completed: { label: "Completed", className: "bg-accent/15 text-accent" },
  current: { label: "Current", className: "bg-primary/15 text-primary" },
  resume: { label: "Resume", className: "bg-amber-500/15 text-amber-600" },
  preview: { label: "Preview", className: "bg-sky-500/15 text-sky-600" },
  locked: { label: "Locked", className: "bg-muted text-muted-foreground" },
  available: { label: "Available", className: "bg-muted text-muted-foreground" }
};

function LessonStatusBadgeComponent({ status }: { status: LessonDisplayStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export const LessonStatusBadge = memo(LessonStatusBadgeComponent);
LessonStatusBadge.displayName = "LessonStatusBadge";
