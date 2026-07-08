"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LessonStatusBadge } from "@/features/courses/components/detail/lesson-status-badge";
import type { LessonCardViewModel } from "@/features/courses/detail-types";
import { cn } from "@/lib/utils";

type LessonCardProps = {
  lesson: LessonCardViewModel;
  index?: number;
  onAction?: (lessonId: string) => void;
};

function LessonCardComponent({ lesson, index = 0, onAction }: LessonCardProps) {
  const isDisabled = lesson.status === "locked" || lesson.status === "completed";

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card/70 flex gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm",
        lesson.status === "current" && "border-primary/40",
        lesson.status === "locked" && "opacity-75"
      )}
      initial={{ opacity: 0, y: 8 }}
      transition={{ delay: (index % 20) * 0.02, duration: 0.25 }}
      whileHover={lesson.status !== "locked" ? { x: 2 } : undefined}
    >
      <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {lesson.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="size-full object-cover" src={lesson.thumbnailUrl} />
        ) : (
          <PlayCircle className="text-muted-foreground size-6" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium">{lesson.title}</h4>
          <LessonStatusBadge status={lesson.status} />
        </div>
        <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs capitalize">
          <Clock className="size-3.5" aria-hidden />
          {lesson.durationMinutes} min · {lesson.lessonType.replace(/_/g, " ")}
        </p>
        {lesson.progressPercent > 0 && lesson.status !== "completed" ? (
          <div className="mt-2 max-w-xs">
            <Progress value={lesson.progressPercent} />
          </div>
        ) : null}
        {lesson.unlockRequirement ? (
          <p className="text-muted-foreground mt-2 text-xs">{lesson.unlockRequirement}</p>
        ) : null}
        <Button
          className="mt-3"
          disabled={isDisabled}
          onClick={() => onAction?.(lesson.id)}
          size="sm"
          type="button"
          variant={lesson.status === "current" || lesson.status === "resume" ? "default" : "outline"}
        >
          {lesson.buttonLabel}
        </Button>
      </div>
    </motion.article>
  );
}

export const LessonCard = memo(LessonCardComponent);
LessonCard.displayName = "LessonCard";
