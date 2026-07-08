"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JourneyTaskViewModel } from "@/features/journey/types";
import { getTaskButtonLabel, getTaskMeta } from "@/features/journey/utils";
import { Clock } from "lucide-react";

type JourneyTaskCardProps = {
  task: JourneyTaskViewModel;
  onAction?: (taskId: string) => void;
  index?: number;
};

function JourneyTaskCardComponent({ task, onAction, index = 0 }: JourneyTaskCardProps) {
  const meta = getTaskMeta(task.taskType);
  const Icon = meta.icon;
  const buttonLabel = getTaskButtonLabel(task.status);
  const isDisabled = task.status === "completed" || task.status === "locked";

  const statusBadge =
    task.status === "completed"
      ? "Completed"
      : task.status === "current"
        ? "In Progress"
        : task.status === "available"
          ? "Available"
          : "Locked";

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby={`task-title-${task.id}`}
      className={cn(
        "bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition-shadow",
        task.status === "current" && "border-primary/40 ring-primary/10 ring-2",
        task.status === "completed" && "opacity-80"
      )}
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            task.status === "completed"
              ? "bg-accent/15 text-accent"
              : task.status === "current"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold" id={`task-title-${task.id}`}>
              {task.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                task.status === "completed" && "bg-accent/15 text-accent",
                task.status === "current" && "bg-primary/15 text-primary",
                task.status === "locked" && "bg-muted text-muted-foreground"
              )}
            >
              {statusBadge}
            </span>
          </div>
          {task.description ? (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {task.description}
            </p>
          ) : null}
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {task.estimatedMinutes} min
            </span>
            <span>{task.difficulty}</span>
            <span>{meta.label}</span>
          </div>
          <Button
            className="mt-4"
            disabled={isDisabled}
            onClick={() => onAction?.(task.id)}
            size="sm"
            type="button"
            variant={task.status === "current" ? "default" : "outline"}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export const JourneyTaskCard = memo(JourneyTaskCardComponent);
JourneyTaskCard.displayName = "JourneyTaskCard";
