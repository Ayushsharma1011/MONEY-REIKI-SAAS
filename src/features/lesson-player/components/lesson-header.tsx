"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Clock, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LessonPlayerHeaderViewModel } from "@/features/lesson-player/types";

type LessonHeaderProps = {
  header: LessonPlayerHeaderViewModel;
  courseTitle: string;
};

function LessonHeaderComponent({ header, courseTitle }: LessonHeaderProps) {
  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-muted-foreground text-sm">{courseTitle}</p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{header.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {header.moduleTitle} · Lesson {header.lessonNumber} of {header.totalLessons}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {header.journeyDay ? (
            <Badge className="bg-secondary text-secondary-foreground">Day {header.journeyDay}</Badge>
          ) : null}
          <Badge className="border-primary/30">+{header.xpReward} XP</Badge>
        </div>
      </div>
      <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Target className="size-3.5" aria-hidden />
          {header.difficulty}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {header.estimatedMinutes} min
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Sparkles className="size-3.5" aria-hidden />
          {header.lessonType.replace(/_/g, " ")}
        </span>
      </div>
    </motion.header>
  );
}

export const LessonHeader = memo(LessonHeaderComponent);
LessonHeader.displayName = "LessonHeader";
