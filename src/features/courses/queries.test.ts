import { describe, expect, it, vi } from "vitest";
import type { Course } from "@/types/core";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

vi.mock("@/features/courses/service", () => ({
  createCourseLibraryServices: vi.fn()
}));

const sampleCourse: Course = {
  id: "course-1",
  title: "Money Reiki Foundations",
  slug: "money-reiki-foundations",
  description: "Build abundance.",
  thumbnail_url: null,
  cover_image: null,
  level: "beginner",
  duration_minutes: 90,
  is_published: true,
  created_by: null,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

describe("courseLibraryQuery", () => {
  it("composes course library data through services", async () => {
    const { createCourseLibraryServices } = await import("@/features/courses/service");
    vi.mocked(createCourseLibraryServices).mockReturnValue({
      courses: {
        getPublishedCourses: vi.fn().mockResolvedValue({
          data: [sampleCourse],
          total: 1,
          page: 1,
          pageSize: 100
        }),
        getModules: vi.fn().mockResolvedValue([{ id: "module-1" }]),
        getLessons: vi.fn().mockResolvedValue([{ id: "lesson-1" }, { id: "lesson-2" }]),
        calculateCompletionPercentage: vi.fn().mockResolvedValue(25)
      },
      categories: {
        getCategories: vi.fn().mockResolvedValue([
          {
            id: "cat-1",
            name: "Foundations",
            slug: "foundations",
            icon: null,
            description: null,
            color: "#8b5cf6",
            order_index: 0,
            created_at: "2026-07-08T00:00:00.000Z",
            updated_at: "2026-07-08T00:00:00.000Z"
          }
        ]),
        listCoursesByCategory: vi.fn().mockResolvedValue({
          data: [sampleCourse],
          total: 1,
          page: 1,
          pageSize: 1
        })
      },
      favorites: {
        listFavorites: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 100 }),
        isFavorite: vi.fn().mockResolvedValue(false)
      },
      recent: {
        listRecentlyViewed: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 12 })
      },
      paths: {
        listLearningPaths: vi.fn().mockResolvedValue([
          {
            id: "path-1",
            title: "Abundance Track",
            slug: "abundance-track",
            description: "Guided path",
            level: "beginner",
            order_index: 0,
            created_at: "2026-07-08T00:00:00.000Z",
            updated_at: "2026-07-08T00:00:00.000Z"
          }
        ]),
        getLearningPath: vi.fn().mockResolvedValue({
          path: {
            id: "path-1",
            title: "Abundance Track",
            slug: "abundance-track",
            description: "Guided path",
            level: "beginner",
            order_index: 0,
            created_at: "2026-07-08T00:00:00.000Z",
            updated_at: "2026-07-08T00:00:00.000Z"
          },
          courses: [{ id: "lpc-1", learning_path_id: "path-1", course_id: "course-1", order_index: 0, created_at: "2026-07-08T00:00:00.000Z" }]
        }),
        calculateCompletion: vi.fn().mockResolvedValue(10)
      },
      courseRepository: {}
    } as never);

    const { courseLibraryQuery } = await import("@/features/courses/queries");
    const result = await courseLibraryQuery("user-1");

    expect(result.courses).toHaveLength(1);
    expect(result.courses[0]?.lessonCount).toBe(2);
    expect(result.categories).toHaveLength(1);
    expect(result.learningPaths).toHaveLength(1);
    expect(result.featuredCourse?.id).toBe("course-1");
  });
});
