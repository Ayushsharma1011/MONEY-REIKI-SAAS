"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { formatDuration } from "@/features/courses/utils";
import type { CourseCardViewModel } from "@/features/courses/types";

type ContinueLearningCardProps = {
  course: CourseCardViewModel;
  onContinue?: (courseId: string) => void;
};

function ContinueLearningCardComponent({ course, onContinue }: ContinueLearningCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 flex flex-col gap-4 rounded-2xl border p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <ProgressRing label="Done" size={88} strokeWidth={7} value={course.progressPercent} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="text-accent size-4" aria-hidden />
          <h2 className="text-sm font-semibold tracking-wide uppercase">Continue Learning</h2>
        </div>
        <h3 className="text-lg font-semibold">{course.title}</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {course.instructor} · {formatDuration(course.durationMinutes)} · {course.lessonCount}{" "}
          lessons
        </p>
        <div className="mt-3 max-w-md">
          <Progress value={course.progressPercent} />
        </div>
      </div>
      <Button className="gap-2 sm:shrink-0" onClick={() => onContinue?.(course.id)} type="button">
        <PlayCircle className="size-4" aria-hidden />
        Resume
      </Button>
    </motion.article>
  );
}

export const ContinueLearningCard = memo(ContinueLearningCardComponent);
ContinueLearningCard.displayName = "ContinueLearningCard";
