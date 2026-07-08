"use client";

import { memo } from "react";
import type { CourseCardViewModel } from "@/features/courses/types";
import { CourseCard } from "@/features/courses/components/course-card";

type CourseGridProps = {
  courses: CourseCardViewModel[];
  onContinue?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string, isFavorite: boolean) => void;
};

function CourseGridComponent({ courses, onContinue, onToggleFavorite }: CourseGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course, index) => (
        <CourseCard
          course={course}
          index={index}
          key={course.id}
          onContinue={onContinue}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export const CourseGrid = memo(CourseGridComponent);
CourseGrid.displayName = "CourseGrid";
