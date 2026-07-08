"use client";

import { motion } from "framer-motion";
import { BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyStateCard } from "@/features/dashboard/components/empty-state-card";
import type { DashboardCourseProgress } from "@/features/dashboard/types";

export function CourseCard({ course }: { course: DashboardCourseProgress }) {
  if (!course.course) {
    return (
      <EmptyStateCard
        actionLabel="Explore First Course"
        description="Begin your Money Reiki journey with the foundational course."
        title="No course started yet"
      />
    );
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      id="courses"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.08, duration: 0.4 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Continue Learning
        </h2>
      </div>
      <h3 className="text-lg font-semibold">{course.course.title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {course.moduleTitle ?? "Current module"} ·{" "}
        {course.lessonTitle ?? "Resume your next lesson"}
      </p>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{course.completionPercent}%</span>
        </div>
        <Progress value={course.completionPercent} />
      </div>
      <Button className="mt-5 gap-2" variant="secondary">
        <PlayCircle className="size-4" aria-hidden />
        Resume Lesson
      </Button>
    </motion.article>
  );
}
