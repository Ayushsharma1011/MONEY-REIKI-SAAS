"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateRemainingMinutes, formatDuration } from "@/features/courses/utils";
import type { CourseCardViewModel } from "@/features/courses/types";

type FeaturedCourseHeroProps = {
  course: CourseCardViewModel;
  onContinue?: (courseId: string) => void;
};

function FeaturedCourseHeroComponent({ course, onContinue }: FeaturedCourseHeroProps) {
  const imageUrl = course.coverImageUrl ?? course.thumbnailUrl;
  const remainingMinutes = calculateRemainingMinutes(
    course.durationMinutes,
    course.progressPercent
  );

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Featured course"
      className="relative overflow-hidden rounded-3xl border shadow-lg"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${course.gradientClass}`} />
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
          src={imageUrl}
        />
      ) : null}
      <div className="from-background via-background/80 absolute inset-0 bg-gradient-to-r to-transparent" />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="text-accent mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="size-4" aria-hidden />
            Featured Course
          </div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            {course.shortDescription}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>{course.instructor}</span>
            <span>{course.difficulty}</span>
            <span>{formatDuration(course.durationMinutes)}</span>
            <span className="text-accent font-medium">+{course.xpReward} XP</span>
          </div>
        </div>

        <div className="bg-card/80 rounded-2xl border p-5 backdrop-blur-md">
          <p className="text-sm font-medium">Continue Learning</p>
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-semibold">{course.progressPercent}%</span>
            </div>
            <Progress aria-label="Featured course progress" value={course.progressPercent} />
          </div>
          <p className="text-muted-foreground mt-3 inline-flex items-center gap-2 text-xs">
            <Clock className="size-3.5" aria-hidden />
            {remainingMinutes > 0
              ? `${formatDuration(remainingMinutes)} remaining`
              : "Ready to begin"}
          </p>
          <Button
            className="mt-5 w-full gap-2"
            onClick={() => onContinue?.(course.id)}
            size="lg"
            type="button"
          >
            <PlayCircle className="size-4" aria-hidden />
            {course.progressPercent > 0 ? "Resume Course" : "Start Course"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

export const FeaturedCourseHero = memo(FeaturedCourseHeroComponent);
FeaturedCourseHero.displayName = "FeaturedCourseHero";
