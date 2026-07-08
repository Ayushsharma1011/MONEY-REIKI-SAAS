import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CourseDetailsSkeleton } from "@/features/courses/components/detail/course-details-skeleton";
import { CourseNotFound } from "@/features/courses/components/detail/course-not-found";
import { LessonStatusBadge } from "@/features/courses/components/detail/lesson-status-badge";
import { ModuleAccordion } from "@/features/courses/components/detail/module-accordion";
import {
  buildModuleViewModels,
  filterLessonsBySearch,
  flattenCourseLessons,
  getLessonButtonLabel,
  mapLessonStatuses
} from "@/features/courses/detail-utils";
import type { CourseModule, Lesson } from "@/types/core";

const courseModule: CourseModule = {
  id: "module-1",
  course_id: "course-1",
  title: "Foundations",
  description: "Core practices",
  order_index: 0,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

const lessons: Lesson[] = [
  {
    id: "lesson-1",
    module_id: "module-1",
    title: "Welcome",
    slug: "welcome",
    description: null,
    video_url: null,
    thumbnail: null,
    duration: 10,
    lesson_type: "video",
    order_index: 0,
    is_preview: true,
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z"
  },
  {
    id: "lesson-2",
    module_id: "module-1",
    title: "Breathwork",
    slug: "breathwork",
    description: null,
    video_url: null,
    thumbnail: null,
    duration: 8,
    lesson_type: "practice",
    order_index: 1,
    is_preview: false,
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z"
  },
  {
    id: "lesson-3",
    module_id: "module-1",
    title: "Integration",
    slug: "integration",
    description: null,
    video_url: null,
    thumbnail: null,
    duration: 12,
    lesson_type: "reflection",
    order_index: 2,
    is_preview: false,
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z"
  }
];

describe("course detail utils", () => {
  it("maps sequential lesson unlock states", () => {
    const ordered = flattenCourseLessons([courseModule], new Map([[courseModule.id, lessons]]));
    const mapped = mapLessonStatuses(ordered, new Set(["lesson-1"]), new Set(), null);

    expect(mapped[0]?.status).toBe("completed");
    expect(mapped[1]?.status).toBe("current");
    expect(mapped[2]?.status).toBe("locked");
    expect(mapped[2]?.unlockRequirement).toBeTruthy();
  });

  it("prioritizes journey current lesson", () => {
    const ordered = flattenCourseLessons([courseModule], new Map([[courseModule.id, lessons]]));
    const mapped = mapLessonStatuses(ordered, new Set(), new Set(), "lesson-3");
    expect(mapped.find((lesson) => lesson.id === "lesson-3")?.status).toBe("current");
  });

  it("returns lesson button labels", () => {
    expect(getLessonButtonLabel("completed", false)).toBe("Completed");
    expect(getLessonButtonLabel("locked", false)).toBe("Locked");
    expect(getLessonButtonLabel("current", true)).toBe("Resume");
  });

  it("filters lessons by search query", () => {
    const ordered = flattenCourseLessons([courseModule], new Map([[courseModule.id, lessons]]));
    const mapped = mapLessonStatuses(ordered, new Set(), new Set(), null);
    const filtered = filterLessonsBySearch(mapped, "breath");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toBe("Breathwork");
  });

  it("builds module view models with completion", () => {
    const ordered = flattenCourseLessons([courseModule], new Map([[courseModule.id, lessons]]));
    const mapped = mapLessonStatuses(ordered, new Set(["lesson-1"]), new Set(), null);
    const modules = buildModuleViewModels([courseModule], mapped);
    expect(modules[0]?.completionPercent).toBe(33);
  });
});

describe("course detail components", () => {
  it("renders course details skeleton", () => {
    const html = renderToStaticMarkup(<CourseDetailsSkeleton />);
    expect(html).toContain("Loading course details");
  });

  it("renders 404 state", () => {
    const html = renderToStaticMarkup(<CourseNotFound />);
    expect(html).toContain("Course Not Found");
  });

  it("renders lesson status badges", () => {
    const html = renderToStaticMarkup(<LessonStatusBadge status="locked" />);
    expect(html).toContain("Locked");
  });

  it("renders module accordion", () => {
    const ordered = flattenCourseLessons([courseModule], new Map([[courseModule.id, lessons]]));
    const mapped = mapLessonStatuses(ordered, new Set(), new Set(), null);
    const modules = buildModuleViewModels([courseModule], mapped);
    const html = renderToStaticMarkup(<ModuleAccordion modules={modules} />);
    expect(html).toContain("Foundations");
    expect(html).toContain("Welcome");
  });
});
