"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JourneyTaskViewModel } from "@/features/journey/types";
import { getTaskMeta } from "@/features/journey/utils";
import { Check, Circle, Lock } from "lucide-react";

type JourneyTimelineProps = {
  tasks: JourneyTaskViewModel[];
  onTaskSelect?: (taskId: string) => void;
};

function TimelineTask({
  task,
  index,
  isLast,
  onSelect
}: {
  task: JourneyTaskViewModel;
  index: number;
  isLast: boolean;
  onSelect?: (taskId: string) => void;
}) {
  const meta = getTaskMeta(task.taskType);
  const Icon = meta.icon;

  const statusLabel =
    task.status === "completed"
      ? "Completed"
      : task.status === "current"
        ? "Current"
        : task.status === "available"
          ? "Available"
          : "Locked";

  return (
    <motion.li
      animate={{ opacity: 1, x: 0 }}
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -12 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <div className="flex flex-col items-center">
        <button
          aria-current={task.status === "current" ? "step" : undefined}
          aria-label={`${task.title}, ${statusLabel}, ${task.estimatedMinutes} minutes`}
          className={cn(
            "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            task.status === "completed" &&
              "border-accent bg-accent/15 text-accent",
            task.status === "current" &&
              "border-primary bg-primary/15 text-primary ring-primary/30 ring-4",
            task.status === "available" &&
              "border-muted-foreground/40 bg-card text-muted-foreground",
            task.status === "locked" &&
              "border-muted bg-muted/50 text-muted-foreground"
          )}
          disabled={task.status === "locked"}
          onClick={() => onSelect?.(task.id)}
          type="button"
        >
          {task.status === "completed" ? (
            <Check className="size-4" aria-hidden />
          ) : task.status === "locked" ? (
            <Lock className="size-3.5" aria-hidden />
          ) : (
            <Icon className="size-4" aria-hidden />
          )}
        </button>
        {!isLast ? (
          <motion.div
            animate={{ scaleY: 1 }}
            aria-hidden
            className={cn(
              "bg-border w-0.5 flex-1 origin-top",
              task.status === "completed" ? "bg-accent/60" : "bg-border"
            )}
            initial={{ scaleY: 0 }}
            style={{ minHeight: "2rem" }}
            transition={{ delay: index * 0.08 + 0.15, duration: 0.4 }}
          />
        ) : null}
      </div>

      <div className="pb-6 pt-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{task.title}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              task.status === "completed" && "bg-accent/15 text-accent",
              task.status === "current" && "bg-primary/15 text-primary",
              task.status === "available" && "bg-muted text-muted-foreground",
              task.status === "locked" && "bg-muted/80 text-muted-foreground"
            )}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
          <Icon className="size-3.5" aria-hidden />
          {meta.label} · {task.estimatedMinutes} min
        </p>
      </div>
    </motion.li>
  );
}

function JourneyTimelineComponent({ tasks, onTaskSelect }: JourneyTimelineProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
        No tasks scheduled for today.
      </div>
    );
  }

  return (
    <section aria-label="Today's ritual timeline">
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
        Today&apos;s Ritual
      </h2>
      <ol className="list-none space-y-0">
        {tasks.map((task, index) => (
          <TimelineTask
            index={index}
            isLast={index === tasks.length - 1}
            key={task.id}
            onSelect={onTaskSelect}
            task={task}
          />
        ))}
      </ol>
    </section>
  );
}

export const JourneyTimeline = memo(JourneyTimelineComponent);
JourneyTimeline.displayName = "JourneyTimeline";

export { Circle };
