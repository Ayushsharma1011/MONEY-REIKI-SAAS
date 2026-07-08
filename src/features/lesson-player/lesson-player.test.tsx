import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LessonError, getVariantFromStates } from "@/features/lesson-player/components/lesson-error";
import { LessonHeader } from "@/features/lesson-player/components/lesson-header";
import { LessonNavigation } from "@/features/lesson-player/components/lesson-navigation";
import { LessonSkeleton } from "@/features/lesson-player/components/lesson-skeleton";
import { NextLessonCard } from "@/features/lesson-player/components/next-lesson-card";
import {
  formatTimestamp,
  groupResourcesByType,
  mapLessonResource
} from "@/features/lesson-player/utils";
import type { LessonResource } from "@/types/learning";

describe("lesson player utils", () => {
  it("formats timestamps for controls", () => {
    expect(formatTimestamp(65)).toBe("1:05");
    expect(formatTimestamp(3661)).toBe("1:01:01");
  });

  it("groups resources by type", () => {
    const grouped = groupResourcesByType([
      {
        id: "1",
        title: "Workbook",
        resourceType: "pdf",
        url: null,
        filePath: null
      },
      {
        id: "2",
        title: "Assets",
        resourceType: "zip",
        url: null,
        filePath: null
      }
    ]);

    expect(grouped.pdf).toHaveLength(1);
    expect(grouped.zip).toHaveLength(1);
  });

  it("maps lesson resource entities", () => {
    const resource: LessonResource = {
      id: "res-1",
      lesson_id: "lesson-1",
      title: "Guide",
      resource_type: "pdf",
      url: "https://example.com/guide.pdf",
      file_path: null,
      mime_type: "application/pdf",
      order_index: 0,
      created_at: "2026-07-08T00:00:00.000Z",
      updated_at: "2026-07-08T00:00:00.000Z"
    };

    expect(mapLessonResource(resource).title).toBe("Guide");
  });
});

describe("lesson player components", () => {
  it("renders skeleton markup", () => {
    const html = renderToStaticMarkup(<LessonSkeleton />);
    expect(html).toContain("Loading lesson");
  });

  it("renders locked lesson error", () => {
    const html = renderToStaticMarkup(
      <LessonError onBack={() => undefined} variant="locked" />
    );
    expect(html).toContain("Lesson locked");
  });

  it("renders lesson header metadata", () => {
    const html = renderToStaticMarkup(
      <LessonHeader
        courseTitle="Abundance Foundations"
        header={{
          title: "Welcome",
          moduleTitle: "Module 1",
          lessonNumber: 1,
          totalLessons: 8,
          journeyDay: 3,
          xpReward: 25,
          difficulty: "Beginner",
          estimatedMinutes: 12,
          lessonType: "video"
        }}
      />
    );
    expect(html).toContain("Welcome");
    expect(html).toContain("Day 3");
  });

  it("renders navigation controls", () => {
    const html = renderToStaticMarkup(
      <LessonNavigation
        nextLessonSlug="next-lesson"
        onNavigate={() => undefined}
        previousLessonSlug="prev-lesson"
      />
    );
    expect(html).toContain("Previous");
    expect(html).toContain("Next lesson");
  });

  it("renders next lesson card", () => {
    const html = renderToStaticMarkup(
      <NextLessonCard
        nextLesson={{
          id: "2",
          slug: "breathwork",
          title: "Breathwork",
          durationMinutes: 8,
          xpReward: 25
        }}
        onContinue={() => undefined}
      />
    );
    expect(html).toContain("Breathwork");
    expect(html).toContain("Continue journey");
  });

  it("maps access and video states to error variants", () => {
    expect(getVariantFromStates("locked", "ready")).toBe("locked");
    expect(getVariantFromStates("available", "none")).toBe("no-video");
    expect(getVariantFromStates("available", "processing")).toBe("processing");
  });
});

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({})
}));

describe("lesson player queries", () => {
  it("throws when lesson is missing", async () => {
    vi.resetModules();
    vi.doMock("@/features/lesson-player/service", () => ({
      createLessonPlayerServices: () => ({
        courses: {
          getCourseBySlug: async () => ({
            id: "course-1",
            slug: "course",
            title: "Course",
            is_published: true,
            level: "beginner"
          }),
          getModules: async () => [{ id: "mod-1", order_index: 0, title: "Mod" }],
          getLessons: async () => [],
          calculateCompletionPercentage: async () => 0
        },
        lessonProgress: { getProgress: async () => null },
        resume: { loadPosition: async () => null },
        journey: { currentJourney: async () => null },
        dailyMission: { generateTodaysMission: async () => null },
        recent: { trackRecentlyViewed: async () => ({}) },
        video: { getPlaybackUrl: vi.fn() }
      })
    }));

    const { lessonPlayerQuery } = await import("@/features/lesson-player/queries");
    await expect(lessonPlayerQuery("user-1", "course", "missing")).rejects.toThrow(
      "Lesson was not found."
    );
  });
});
