import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";
import {
  CoreBookmarkService,
  CoreCourseCategoryService,
  CoreFavoriteCourseService,
  CoreLearningPathService,
  CoreLessonNotesService,
  CoreLessonResumeService,
  CoreRecentCourseService,
  CoreVideoService
} from "@/features/learning/service-implementations";
import type {
  BookmarkRepository,
  CourseCategoryRepository,
  FavoriteCourseRepository,
  LearningPathRepository,
  LessonNotesRepository,
  LessonResumeRepository,
  RecentCourseRepository,
  VideoRepository
} from "@/features/learning/repositories";
import {
  VIDEO_PROVIDER_NAMES,
  VideoProviderRegistry
} from "@/features/learning/video-provider";
import {
  bookmarkSchema,
  courseCategorySchema,
  favoriteCourseSchema,
  lessonNoteSchema,
  lessonResumeSchema,
  videoPlaybackRequestSchema
} from "@/features/learning/schemas";
import type { VideoProvider } from "@/types/learning";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const LESSON_ID = "00000000-0000-4000-8000-000000000002";
const COURSE_ID = "00000000-0000-4000-8000-000000000003";

describe("learning schemas", () => {
  it("validates category input", () => {
    expect(
      courseCategorySchema.safeParse({
        name: "Abundance",
        slug: "abundance",
        order_index: 1
      }).success
    ).toBe(true);
  });

  it("validates bookmark input", () => {
    expect(
      bookmarkSchema.safeParse({
        user_id: "00000000-0000-4000-8000-000000000001",
        lesson_id: "00000000-0000-4000-8000-000000000002",
        timestamp_seconds: 120
      }).success
    ).toBe(true);
  });

  it("validates note, resume, favorite, and video request schemas", () => {
    expect(
      lessonNoteSchema.safeParse({
        user_id: "00000000-0000-4000-8000-000000000001",
        lesson_id: "00000000-0000-4000-8000-000000000002",
        content: "Important insight"
      }).success
    ).toBe(true);
    expect(
      lessonResumeSchema.safeParse({
        user_id: "00000000-0000-4000-8000-000000000001",
        lesson_id: "00000000-0000-4000-8000-000000000002",
        last_position_seconds: 30,
        duration_watched: 30,
        completed: false,
        playback_speed: 1
      }).success
    ).toBe(true);
    expect(
      favoriteCourseSchema.safeParse({
        user_id: "00000000-0000-4000-8000-000000000001",
        course_id: "00000000-0000-4000-8000-000000000003"
      }).success
    ).toBe(true);
    expect(
      videoPlaybackRequestSchema.safeParse({
        lessonId: "00000000-0000-4000-8000-000000000002",
        provider: "mux",
        assetId: "asset-123"
      }).success
    ).toBe(true);
  });
});

describe("VideoProviderRegistry", () => {
  it("registers providers and resolves playback urls", async () => {
    const registry = new VideoProviderRegistry();
    const provider: VideoProvider = {
      name: "mux",
      validateAsset: (assetId) => assetId.length > 0,
      getPlaybackUrl: vi.fn().mockResolvedValue({
        url: "https://stream.example.com/video.m3u8",
        provider: "mux"
      }),
      getSignedUrl: vi.fn().mockResolvedValue("https://signed.example.com"),
      getPlaybackToken: vi.fn().mockResolvedValue("token-123")
    };

    registry.register(provider);

    expect(registry.has("mux")).toBe(true);
    expect(registry.validateAsset("mux", "asset-1")).toBe(true);
    expect(VIDEO_PROVIDER_NAMES).toContain("mux");

    await expect(
      registry.getPlaybackUrl({
        lessonId: "00000000-0000-4000-8000-000000000002",
        provider: "mux",
        assetId: "asset-1"
      })
    ).resolves.toMatchObject({ provider: "mux" });
  });
});

describe("CoreBookmarkService", () => {
  it("creates validated bookmarks", async () => {
    const bookmark = {
      id: "00000000-0000-4000-8000-000000000010",
      user_id: USER_ID,
      lesson_id: LESSON_ID,
      timestamp_seconds: 90,
      note: "Key moment",
      created_at: "2026-07-08T00:00:00.000Z",
      updated_at: "2026-07-08T00:00:00.000Z"
    };
    const repo = {
      create: vi.fn().mockResolvedValue(bookmark),
      delete: vi.fn(),
      listByUser: vi.fn(),
      findByTimestamp: vi.fn()
    } as unknown as BookmarkRepository;

    const service = new CoreBookmarkService(repo);
    await expect(
      service.createBookmark(USER_ID, {
        lesson_id: LESSON_ID,
        timestamp_seconds: 90,
        note: "Key moment"
      })
    ).resolves.toBe(bookmark);
  });

  it("rejects invalid timestamps", async () => {
    const service = new CoreBookmarkService({} as BookmarkRepository);
    await expect(service.jumpToTimestamp(USER_ID, LESSON_ID, -1)).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});

describe("CoreLessonResumeService", () => {
  it("saves resume position", async () => {
    const resume = {
      id: "00000000-0000-4000-8000-000000000011",
      user_id: USER_ID,
      lesson_id: LESSON_ID,
      last_position_seconds: 45,
      duration_watched: 45,
      completed: false,
      playback_speed: 1,
      last_opened_at: "2026-07-08T00:00:00.000Z",
      created_at: "2026-07-08T00:00:00.000Z",
      updated_at: "2026-07-08T00:00:00.000Z"
    };
    const repo = {
      save: vi.fn().mockResolvedValue(resume),
      load: vi.fn(),
      markComplete: vi.fn()
    } as unknown as LessonResumeRepository;

    const service = new CoreLessonResumeService(repo);
    await expect(
      service.savePosition(USER_ID, {
        lesson_id: LESSON_ID,
        last_position_seconds: 45,
        duration_watched: 45,
        playback_speed: 1
      })
    ).resolves.toBe(resume);
  });
});

describe("CoreLessonNotesService", () => {
  it("requires a search query", async () => {
    const service = new CoreLessonNotesService({} as LessonNotesRepository);
    await expect(service.searchNotes(USER_ID, "  ")).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});

describe("CoreCourseCategoryService", () => {
  it("rejects invalid category payloads", async () => {
    const service = new CoreCourseCategoryService({} as CourseCategoryRepository);
    await expect(
      service.createCategory({ name: "", slug: "", order_index: 0, icon: null, description: null, color: null })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("CoreLearningPathService", () => {
  it("unlocks the first course when no progress exists", async () => {
    const courses = [
      {
        id: "lpc-1",
        learning_path_id: "path-1",
        course_id: "course-1",
        order_index: 0,
        created_at: "2026-07-08T00:00:00.000Z"
      }
    ];
    const repo = {
      listCourses: vi.fn().mockResolvedValue(courses),
      getUserProgress: vi.fn().mockResolvedValue(null),
      upsertUserProgress: vi.fn().mockResolvedValue({}),
      findById: vi.fn(),
      findBySlug: vi.fn()
    } as unknown as LearningPathRepository;

    const service = new CoreLearningPathService(repo);
    await expect(service.unlockNextCourse("user-1", "path-1")).resolves.toEqual(courses[0]);
  });
});

describe("CoreFavoriteCourseService", () => {
  it("favorites a course", async () => {
    const favorite = {
      id: "00000000-0000-4000-8000-000000000012",
      user_id: USER_ID,
      course_id: COURSE_ID,
      created_at: "2026-07-08T00:00:00.000Z"
    };
    const repo = {
      favorite: vi.fn().mockResolvedValue(favorite),
      unfavorite: vi.fn(),
      listByUser: vi.fn(),
      isFavorite: vi.fn()
    } as unknown as FavoriteCourseRepository;

    const service = new CoreFavoriteCourseService(repo);
    await expect(service.favorite(USER_ID, COURSE_ID)).resolves.toBe(favorite);
  });
});

describe("CoreRecentCourseService", () => {
  it("tracks recently viewed courses", async () => {
    const recent = {
      id: "00000000-0000-4000-8000-000000000013",
      user_id: USER_ID,
      course_id: COURSE_ID,
      last_lesson_id: null,
      viewed_at: "2026-07-08T00:00:00.000Z"
    };
    const repo = {
      upsert: vi.fn().mockResolvedValue(recent),
      listByUser: vi.fn(),
      clearHistory: vi.fn()
    } as unknown as RecentCourseRepository;

    const service = new CoreRecentCourseService(repo);
    await expect(service.trackRecentlyViewed(USER_ID, COURSE_ID)).resolves.toBe(recent);
  });
});

describe("CoreVideoService", () => {
  it("validates supported providers", () => {
    const service = new CoreVideoService({} as VideoRepository);
    expect(service.validateProvider("mux")).toBe(true);
    expect(service.validateProvider("s3")).toBe(true);
  });
});
