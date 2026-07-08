"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bookmark, Clock, GraduationCap, Heart, PlayCircle, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { formatDuration } from "@/features/courses/utils";
import type { CourseCardViewModel } from "@/features/courses/types";
import { ROUTES } from "@/constants/app";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  course: CourseCardViewModel;
  index?: number;
  onContinue?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string, isFavorite: boolean) => void;
  compact?: boolean;
};

function CourseCardComponent({
  course,
  index = 0,
  onToggleFavorite,
  compact = false
}: CourseCardProps) {
  const imageUrl = course.thumbnailUrl ?? course.coverImageUrl;

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby={`course-${course.id}-title`}
      className={cn(
        "group bg-card/80 overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg",
        compact ? "min-w-[280px]" : "w-full"
      )}
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4 }}
    >
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden bg-gradient-to-br",
          course.gradientClass
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={imageUrl}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          {course.hasBookmark ? (
            <span
              aria-label="Bookmarked"
              className="bg-background/80 inline-flex size-8 items-center justify-center rounded-full backdrop-blur-sm"
            >
              <Bookmark className="text-accent size-4" aria-hidden />
            </span>
          ) : null}
          <button
            aria-label={course.isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={course.isFavorite}
            className="bg-background/80 inline-flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-transform hover:scale-105"
            onClick={() => onToggleFavorite?.(course.id, course.isFavorite)}
            type="button"
          >
            <Heart
              className={cn("size-4", course.isFavorite ? "fill-rose-500 text-rose-500" : "")}
              aria-hidden
            />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="bg-background/85 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">
            {course.difficulty}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug" id={`course-${course.id}-title`}>
              {course.title}
            </h3>
            {!compact ? (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {course.shortDescription}
              </p>
            ) : null}
          </div>
          <ProgressRing size={52} strokeWidth={5} value={course.progressPercent} />
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" aria-hidden />
            {course.instructor}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            {formatDuration(course.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="size-3.5" aria-hidden />
            {course.lessonCount} lessons
          </span>
          <span className="text-accent inline-flex items-center gap-1 font-medium">
            <Sparkles className="size-3.5" aria-hidden />+{course.xpReward} XP
          </span>
        </div>

        <Button asChild className="w-full gap-2" size="sm">
          <Link href={`${ROUTES.courses}/${course.slug}`}>
            <PlayCircle className="size-4" aria-hidden />
            {course.progressPercent > 0 ? "Continue" : "Start Course"}
          </Link>
        </Button>
      </div>
    </motion.article>
  );
}

export const CourseCard = memo(CourseCardComponent);
CourseCard.displayName = "CourseCard";
