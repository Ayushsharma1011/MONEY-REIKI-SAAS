"use client";

import { memo } from "react";
import { CourseEmptyState } from "@/features/courses/components/course-empty-state";
import { CourseGrid } from "@/features/courses/components/course-grid";
import type { CourseCardViewModel } from "@/features/courses/types";

type FavoriteCoursesProps = {
  courses: CourseCardViewModel[];
  onContinue?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string, isFavorite: boolean) => void;
  onBrowse?: () => void;
};

function FavoriteCoursesComponent({
  courses,
  onContinue,
  onToggleFavorite,
  onBrowse
}: FavoriteCoursesProps) {
  return (
    <section aria-label="Favorite courses">
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Favorites</h2>
      {courses.length === 0 ? (
        <CourseEmptyState onAction={onBrowse} variant="no-favorites" />
      ) : (
        <CourseGrid
          courses={courses}
          onContinue={onContinue}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </section>
  );
}

export const FavoriteCourses = memo(FavoriteCoursesComponent);
FavoriteCourses.displayName = "FavoriteCourses";
