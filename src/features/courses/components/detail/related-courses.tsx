"use client";

import { memo } from "react";
import { CourseGrid } from "@/features/courses/components/course-grid";
import type { CourseCardViewModel } from "@/features/courses/types";

type RelatedCoursesProps = {
  courses: CourseCardViewModel[];
  onContinue?: (courseId: string) => void;
};

function RelatedCoursesComponent({ courses, onContinue }: RelatedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <section aria-label="Related courses">
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Related Courses</h2>
      <CourseGrid courses={courses} onContinue={onContinue} />
    </section>
  );
}

export const RelatedCourses = memo(RelatedCoursesComponent);
RelatedCourses.displayName = "RelatedCourses";
