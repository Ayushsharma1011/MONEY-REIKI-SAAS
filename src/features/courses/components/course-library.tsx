"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { CategoryChips } from "@/features/courses/components/category-chips";
import { ContinueLearningCard } from "@/features/courses/components/continue-learning-card";
import { CourseEmptyState } from "@/features/courses/components/course-empty-state";
import { CourseFilters } from "@/features/courses/components/course-filters";
import { CourseGrid } from "@/features/courses/components/course-grid";
import { CourseSearch } from "@/features/courses/components/course-search";
import { CourseSkeleton } from "@/features/courses/components/course-skeleton";
import { FavoriteCourses } from "@/features/courses/components/favorite-courses";
import { FeaturedCourseHero } from "@/features/courses/components/featured-course-hero";
import { LearningPathCard } from "@/features/courses/components/learning-path-card";
import { RecentlyViewedCarousel } from "@/features/courses/components/recently-viewed-carousel";
import { useCourses, useCoursesByCategory, useToggleFavorite } from "@/features/courses/hooks";
import type { CourseFilterState } from "@/features/courses/types";
import { DEFAULT_FILTERS, filterCourses } from "@/features/courses/utils";
import { useAuth } from "@/providers/auth-provider";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">{children}</h2>
  );
}

function CourseLibraryComponent() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<CourseFilterState>(DEFAULT_FILTERS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, filteredCourses, activeFilters } = useCourses(
    user?.id,
    filters
  );
  const { data: categoryCourses } = useCoursesByCategory(user?.id, selectedCategoryId);
  const toggleFavorite = useToggleFavorite(user?.id);

  const handleContinue = useCallback((courseId: string) => {
    void courseId;
  }, []);

  const handleToggleFavorite = useCallback(
    (courseId: string, isFavorite: boolean) => {
      void toggleFavorite.mutate({ courseId, isFavorite });
    },
    [toggleFavorite]
  );

  const displayCourses = useMemo(() => {
    if (!data) return filteredCourses;
    const base = filterCourses(data.courses, activeFilters);
    if (!selectedCategoryId || !categoryCourses) return base;
    const categoryIds = new Set(categoryCourses.map((course) => course.id));
    return base.filter((course) => categoryIds.has(course.id));
  }, [data, filteredCourses, activeFilters, selectedCategoryId, categoryCourses]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCategoryId(null);
  }, []);

  if (isLoading) return <CourseSkeleton />;

  if (error || !data) {
    return (
      <ErrorStateCard
        description="We couldn't load the course library. Please try again."
        onRetry={() => void refetch()}
        title="Course library unavailable"
      />
    );
  }

  if (data.courses.length === 0) {
    return <CourseEmptyState variant="no-courses" />;
  }

  const hasSearchResults = displayCourses.length > 0;
  const isFiltering =
    activeFilters.search ||
    activeFilters.favoritesOnly ||
    activeFilters.difficulty !== "all" ||
    activeFilters.duration !== "all" ||
    activeFilters.progress !== "all" ||
    activeFilters.instructor ||
    activeFilters.tag ||
    selectedCategoryId;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-10 pb-6"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-accent size-5" aria-hidden />
          <h1 className="text-2xl font-semibold tracking-tight">Course Library</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Premium Money Reiki learning paths designed for transformation, abundance, and daily
          growth.
        </p>
      </header>

      <CourseSearch
        onChange={(search) => setFilters((current) => ({ ...current, search }))}
        onClear={clearFilters}
        value={filters.search}
      />

      <CourseFilters
        filters={filters}
        instructors={data.instructors}
        onChange={setFilters}
        tags={data.tags}
      />

      {data.continueCourse ? (
        <section aria-label="Continue learning">
          <ContinueLearningCard course={data.continueCourse} onContinue={handleContinue} />
        </section>
      ) : null}

      {data.featuredCourse ? (
        <FeaturedCourseHero course={data.featuredCourse} onContinue={handleContinue} />
      ) : null}

      {data.recommendedCourses.length > 0 ? (
        <section aria-label="Recommended for you">
          <SectionTitle>Recommended For You</SectionTitle>
          <CourseGrid
            courses={data.recommendedCourses}
            onContinue={handleContinue}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      ) : null}

      {data.learningPaths.length > 0 ? (
        <section aria-label="Learning paths">
          <SectionTitle>Learning Paths</SectionTitle>
          <div className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {data.learningPaths.map((path, index) => (
              <LearningPathCard index={index} key={path.id} onOpen={() => undefined} path={path} />
            ))}
          </div>
        </section>
      ) : null}

      {data.categories.length > 0 ? (
        <section aria-label="Categories">
          <SectionTitle>Categories</SectionTitle>
          <CategoryChips
            categories={data.categories}
            onSelect={setSelectedCategoryId}
            selectedId={selectedCategoryId}
          />
        </section>
      ) : null}

      <RecentlyViewedCarousel
        courses={data.recentlyViewed}
        onContinue={handleContinue}
        onToggleFavorite={handleToggleFavorite}
      />

      <FavoriteCourses
        courses={data.favorites}
        onBrowse={clearFilters}
        onContinue={handleContinue}
        onToggleFavorite={handleToggleFavorite}
      />

      <section aria-label="All courses">
        <SectionTitle>All Courses</SectionTitle>
        {!hasSearchResults && isFiltering ? (
          <CourseEmptyState onAction={clearFilters} variant="no-search" />
        ) : (
          <CourseGrid
            courses={displayCourses}
            onContinue={handleContinue}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </section>
    </motion.div>
  );
}

export const CourseLibrary = memo(CourseLibraryComponent);
CourseLibrary.displayName = "CourseLibrary";
