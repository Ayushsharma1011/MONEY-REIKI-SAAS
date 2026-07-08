"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app";
import { CourseDetailsSkeleton } from "@/features/courses/components/detail/course-details-skeleton";
import { CourseHero } from "@/features/courses/components/detail/course-hero";
import { CourseLessonSearch } from "@/features/courses/components/detail/course-lesson-search";
import { CourseMobileCTA } from "@/features/courses/components/detail/course-mobile-cta";
import { CourseNotFound } from "@/features/courses/components/detail/course-not-found";
import { CourseOverview } from "@/features/courses/components/detail/course-overview";
import { CourseResources } from "@/features/courses/components/detail/course-resources";
import { CourseSidebar } from "@/features/courses/components/detail/course-sidebar";
import { ModuleAccordion } from "@/features/courses/components/detail/module-accordion";
import { RelatedCourses } from "@/features/courses/components/detail/related-courses";
import { ReviewPlaceholder } from "@/features/courses/components/detail/review-placeholder";
import { filterLessonsBySearch, findContinueLesson } from "@/features/courses/detail-utils";
import { useCourse, useToggleCourseFavorite } from "@/features/courses/detail-hooks";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { useAuth } from "@/providers/auth-provider";
import type { ModuleViewModel } from "@/features/courses/detail-types";

function filterModulesBySearch(
  modules: ModuleViewModel[],
  query: string
): ModuleViewModel[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return modules;

  return modules
    .map((module) => ({
      ...module,
      lessons: filterLessonsBySearch(module.lessons, query)
    }))
    .filter((module) => module.lessons.length > 0);
}

function CourseDetailsPageComponent({ courseSlug }: { courseSlug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [lessonSearch, setLessonSearch] = useState("");
  const { data, error, isLoading, refetch } = useCourse(user?.id, courseSlug);
  const toggleFavorite = useToggleCourseFavorite(user?.id, courseSlug);

  const filteredModules = useMemo(
    () => (data ? filterModulesBySearch(data.modules, lessonSearch) : []),
    [data, lessonSearch]
  );

  const handleContinue = useCallback(() => {
    if (!data) return;
    const lesson = findContinueLesson(data.allLessons);
    if (lesson) {
      router.push(ROUTES.lesson(courseSlug, lesson.slug));
    }
  }, [courseSlug, data, router]);

  const handleLessonAction = useCallback(
    (lessonId: string) => {
      const lesson = data?.allLessons.find((item) => item.id === lessonId);
      if (lesson && lesson.status !== "locked") {
        router.push(ROUTES.lesson(courseSlug, lesson.slug));
      }
    },
    [courseSlug, data, router]
  );

  const handleToggleFavorite = useCallback(() => {
    if (!data) return;
    void toggleFavorite.mutate({
      courseId: data.hero.id,
      isFavorite: data.hero.isFavorite
    });
  }, [data, toggleFavorite]);

  const handleRelatedCourse = useCallback(
    (courseId: string) => {
      const related = data?.relatedCourses.find((course) => course.id === courseId);
      if (related) {
        router.push(`${ROUTES.courses}/${related.slug}`);
      }
    },
    [data, router]
  );

  if (isLoading) return <CourseDetailsSkeleton />;

  if (error?.message.toLowerCase().includes("not found")) {
    return <CourseNotFound />;
  }

  if (error || !data) {
    return (
      <ErrorStateCard
        description="We couldn't load this course. Please try again."
        onRetry={() => void refetch()}
        title="Course unavailable"
      />
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-8 pb-28 lg:pb-8"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <CourseHero
        hero={data.hero}
        onContinue={handleContinue}
        onToggleFavorite={handleToggleFavorite}
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <CourseOverview overview={data.overview} />
          <CourseLessonSearch onChange={setLessonSearch} value={lessonSearch} />
          <ModuleAccordion modules={filteredModules} onLessonAction={handleLessonAction} />
          <CourseResources resources={data.resources} />
          <ReviewPlaceholder />
          <RelatedCourses courses={data.relatedCourses} onContinue={handleRelatedCourse} />
        </div>
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <CourseSidebar onContinue={handleContinue} sidebar={data.sidebar} />
          </div>
        </div>
      </div>

      <CourseMobileCTA
        lessonTitle={data.sidebar.continueLessonTitle}
        onContinue={handleContinue}
      />
    </motion.div>
  );
}

export const CourseDetailsPage = memo(CourseDetailsPageComponent);
CourseDetailsPage.displayName = "CourseDetailsPage";
