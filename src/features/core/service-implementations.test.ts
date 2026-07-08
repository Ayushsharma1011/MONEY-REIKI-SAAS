import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "../../lib/errors";
import {
  CoreAnalyticsService,
  CoreCourseService,
  CoreJournalService,
  CoreLessonService
} from "./service-implementations";
import type {
  AnalyticsRepository,
  CourseRepository,
  JournalRepository,
  LessonProgressRepository
} from "./repositories";
import type {
  AnalyticsEvent,
  Course,
  JournalEntry,
  Lesson,
  LessonProgress
} from "../../types/core";

const now = "2026-07-08T00:00:00.000Z";

function course(id: string): Course {
  return {
    id,
    title: "Money Reiki",
    slug: id,
    description: null,
    thumbnail_url: null,
    cover_image: null,
    level: "beginner",
    duration_minutes: 10,
    is_published: true,
    created_by: null,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
}

function lesson(id: string): Lesson {
  return {
    id,
    module_id: "00000000-0000-0000-0000-000000000001",
    title: id,
    slug: id,
    description: null,
    video_url: null,
    thumbnail: null,
    duration: 10,
    lesson_type: "video",
    order_index: 1,
    is_preview: false,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
}

function progress(lessonId: string, completed: boolean): LessonProgress {
  return {
    id: lessonId,
    user_id: "user-1",
    lesson_id: lessonId,
    completed,
    watch_time: 10,
    completed_at: completed ? now : null,
    created_at: now,
    updated_at: now,
    deleted_at: null
  };
}

describe("CoreCourseService", () => {
  it("calculates course completion percentage from lesson progress", async () => {
    const lessons = [lesson("lesson-1"), lesson("lesson-2")];
    const courses = {
      listLessonsByCourse: vi.fn().mockResolvedValue(lessons)
    } as unknown as CourseRepository;
    const lessonProgress = {
      getProgress: vi
        .fn()
        .mockResolvedValueOnce(progress("lesson-1", true))
        .mockResolvedValueOnce(progress("lesson-2", false))
    } as unknown as LessonProgressRepository;

    const service = new CoreCourseService(courses, lessonProgress);

    await expect(
      service.calculateCompletionPercentage("user-1", "course-1")
    ).resolves.toBe(50);
  });

  it("returns published courses through the repository", async () => {
    const result = {
      data: [course("course-1")],
      total: 1,
      page: 1,
      pageSize: 20
    };
    const courses = {
      listPublished: vi.fn().mockResolvedValue(result)
    } as unknown as CourseRepository;
    const service = new CoreCourseService(
      courses,
      {} as LessonProgressRepository
    );

    await expect(service.getPublishedCourses()).resolves.toEqual(result);
  });
});

describe("CoreLessonService", () => {
  it("rejects negative watch time", async () => {
    const service = new CoreLessonService({} as LessonProgressRepository);

    await expect(
      service.markComplete("user-1", "lesson-1", -1)
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("CoreJournalService", () => {
  it("creates a journal entry with the current user id", async () => {
    const entry = { id: "entry-1" } as JournalEntry;
    const journals = {
      create: vi.fn().mockResolvedValue(entry)
    } as unknown as JournalRepository;
    const service = new CoreJournalService(journals);

    await expect(
      service.createEntry("user-1", {
        title: "Today",
        content: "I practiced.",
        mood: "calm",
        tags: ["practice"]
      })
    ).resolves.toBe(entry);
    expect(journals.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1" })
    );
  });
});

describe("CoreAnalyticsService", () => {
  it("rejects unsupported event names", async () => {
    const service = new CoreAnalyticsService({} as AnalyticsRepository);

    await expect(service.track("Unsupported", {})).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it("tracks supported events", async () => {
    const event = { id: "event-1" } as AnalyticsEvent;
    const analytics = {
      track: vi.fn().mockResolvedValue(event)
    } as unknown as AnalyticsRepository;
    const service = new CoreAnalyticsService(analytics);

    await expect(
      service.track("Login", { source: "test" }, "user-1")
    ).resolves.toBe(event);
  });
});
