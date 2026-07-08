import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CourseEmptyState } from "@/features/courses/components/course-empty-state";
import { CourseSearch } from "@/features/courses/components/course-search";
import { CourseSkeleton } from "@/features/courses/components/course-skeleton";
import { LearningPathCard } from "@/features/courses/components/learning-path-card";
import {
  buildCourseCardViewModel,
  filterCourses,
  formatDuration,
  getProgressStatus,
  pickContinueCourse,
  pickFeaturedCourse,
  pickRecommendedCourses
} from "@/features/courses/utils";
import { DEFAULT_FILTERS } from "@/features/courses/utils";
import type { Course } from "@/types/core";

const sampleCourse: Course = {
  id: "course-1",
  title: "Money Reiki Foundations",
  slug: "money-reiki-foundations",
  description: "Build your abundance mindset with daily practices.",
  thumbnail_url: null,
  cover_image: null,
  level: "beginner",
  duration_minutes: 120,
  is_published: true,
  created_by: null,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

describe("course utils", () => {
  it("formats duration labels", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("builds course card view models", () => {
    const card = buildCourseCardViewModel(sampleCourse, {
      lessonCount: 12,
      progressPercent: 35,
      isFavorite: true
    });
    expect(card.title).toBe("Money Reiki Foundations");
    expect(card.progressStatus).toBe("in_progress");
    expect(card.isFavorite).toBe(true);
  });

  it("resolves progress status", () => {
    expect(getProgressStatus(0)).toBe("not_started");
    expect(getProgressStatus(50)).toBe("in_progress");
    expect(getProgressStatus(100)).toBe("completed");
  });

  it("picks featured, continue, and recommended courses", () => {
    const cards = [
      buildCourseCardViewModel(sampleCourse, {
        lessonCount: 8,
        progressPercent: 40,
        isFavorite: false
      }),
      buildCourseCardViewModel(
        { ...sampleCourse, id: "course-2", title: "Advanced Flow" },
        { lessonCount: 6, progressPercent: 0, isFavorite: false }
      )
    ];

    expect(pickContinueCourse(cards)?.title).toBe("Money Reiki Foundations");
    expect(pickFeaturedCourse(cards)?.progressPercent).toBe(40);
    expect(pickRecommendedCourses(cards, cards[0]?.id ?? null)).toHaveLength(1);
  });

  it("filters courses by search and favorites", () => {
    const cards = [
      buildCourseCardViewModel(sampleCourse, {
        lessonCount: 8,
        progressPercent: 0,
        isFavorite: true
      }),
      buildCourseCardViewModel(
        { ...sampleCourse, id: "course-2", title: "Vision Board Mastery" },
        { lessonCount: 4, progressPercent: 0, isFavorite: false }
      )
    ];

    const searchResults = filterCourses(cards, {
      ...DEFAULT_FILTERS,
      search: "vision"
    });
    expect(searchResults).toHaveLength(1);

    const favoritesOnly = filterCourses(cards, {
      ...DEFAULT_FILTERS,
      favoritesOnly: true
    });
    expect(favoritesOnly).toHaveLength(1);
  });
});

describe("course components", () => {
  it("renders loading skeleton", () => {
    const html = renderToStaticMarkup(<CourseSkeleton />);
    expect(html).toContain("Loading course library");
  });

  it("renders search input", () => {
    const html = renderToStaticMarkup(
      <CourseSearch onChange={() => undefined} value="reiki" />
    );
    expect(html).toContain("Search courses");
    expect(html).toContain('value="reiki"');
  });

  it("renders empty states", () => {
    const html = renderToStaticMarkup(<CourseEmptyState variant="no-favorites" />);
    expect(html).toContain("No favorites saved");
  });

  it("renders learning path card", () => {
    const html = renderToStaticMarkup(
      <LearningPathCard
        path={{
          id: "path-1",
          slug: "abundance-track",
          title: "Abundance Track",
          description: "A guided path to wealth consciousness.",
          level: "beginner",
          courseCount: 4,
          completionPercent: 25
        }}
      />
    );
    expect(html).toContain("Abundance Track");
    expect(html).toContain("Open Path");
  });
});
