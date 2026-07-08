"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CourseEmptyStateProps = {
  variant: "no-courses" | "no-favorites" | "no-search" | "no-recent";
  onAction?: () => void;
  className?: string;
};

const CONFIG = {
  "no-courses": {
    title: "No courses yet",
    description: "New Money Reiki courses are on the way. Check back soon.",
    actionLabel: undefined
  },
  "no-favorites": {
    title: "No favorites saved",
    description: "Tap the heart on any course to build your personal library.",
    actionLabel: "Browse Courses"
  },
  "no-search": {
    title: "No matching courses",
    description: "Try adjusting your search or filters to discover more content.",
    actionLabel: "Clear Filters"
  },
  "no-recent": {
    title: "Nothing viewed recently",
    description: "Courses you explore will appear here for quick access.",
    actionLabel: undefined
  }
} as const;

function CourseEmptyStateComponent({
  variant,
  onAction,
  className
}: CourseEmptyStateProps) {
  const config = CONFIG[variant];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card/60 flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center",
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      role="status"
    >
      <Inbox className="text-muted-foreground mb-3 size-7" aria-hidden />
      <h3 className="font-semibold">{config.title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">{config.description}</p>
      {config.actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction} size="sm" type="button" variant="outline">
          {config.actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
}

export const CourseEmptyState = memo(CourseEmptyStateComponent);
CourseEmptyState.displayName = "CourseEmptyState";
