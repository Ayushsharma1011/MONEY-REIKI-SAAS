import { NotFoundError, ValidationError } from "@/lib/errors";
import type { UUID } from "@/types/core";
import type {
  Bookmark,
  CourseCategory,
  FavoriteCourse,
  LearningPathCourse,
  LessonNote,
  LessonResource,
  LessonResume,
  RecentCourse,
  VideoPlaybackRequest,
  VideoProviderName
} from "@/types/learning";
import type {
  BookmarkRepository,
  CourseCategoryRepository,
  FavoriteCourseRepository,
  LearningPathRepository,
  LessonNotesRepository,
  LessonResourceRepository,
  LessonResumeRepository,
  RecentCourseRepository,
  VideoRepository
} from "./repositories";
import {
  bookmarkSchema,
  courseCategorySchema,
  favoriteCourseSchema,
  lessonNoteSchema,
  lessonResumeSchema,
  recentCourseSchema,
  videoPlaybackRequestSchema
} from "./schemas";
import type {
  BookmarkService,
  CourseCategoryService,
  FavoriteCourseService,
  LearningPathService,
  LessonNotesService,
  LessonResourceService,
  LessonResumeService,
  RecentCourseService,
  VideoService
} from "./services";
import {
  VIDEO_PROVIDER_NAMES,
  videoProviderRegistry
} from "./video-provider";

/**
 * Production course category business service.
 */
export class CoreCourseCategoryService implements CourseCategoryService {
  constructor(private readonly categories: CourseCategoryRepository) {}

  /** Get all course categories. */
  async getCategories(): Promise<CourseCategory[]> {
    return this.categories.list();
  }

  /** Create a validated course category. */
  async createCategory(
    input: Omit<CourseCategory, "id" | "created_at" | "updated_at">
  ): Promise<CourseCategory> {
    const parsed = courseCategorySchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError("Invalid category input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.categories.create({
      ...parsed.data,
      icon: parsed.data.icon ?? null,
      description: parsed.data.description ?? null,
      color: parsed.data.color ?? null
    });
  }

  /** Update a validated course category. */
  async updateCategory(
    id: UUID,
    input: Partial<Omit<CourseCategory, "id" | "created_at" | "updated_at">>
  ): Promise<CourseCategory> {
    if (Object.keys(input).length === 0) {
      throw new ValidationError("Category update payload is empty.");
    }
    return this.categories.update(id, input);
  }

  /** Delete a course category. */
  async deleteCategory(id: UUID): Promise<void> {
    await this.categories.delete(id);
  }

  /** List courses assigned to a category. */
  async listCoursesByCategory(categoryId: UUID, options?: Parameters<CourseCategoryRepository["listCoursesByCategory"]>[1]) {
    const category = await this.categories.findById(categoryId);
    if (!category) throw new NotFoundError("Category was not found.");
    return this.categories.listCoursesByCategory(categoryId, options);
  }
}

/**
 * Production bookmark business service.
 */
export class CoreBookmarkService implements BookmarkService {
  constructor(private readonly bookmarks: BookmarkRepository) {}

  /** Create a validated lesson bookmark. */
  async createBookmark(
    userId: UUID,
    input: Pick<Bookmark, "lesson_id" | "timestamp_seconds" | "note">
  ): Promise<Bookmark> {
    const parsed = bookmarkSchema.safeParse({ user_id: userId, ...input });
    if (!parsed.success) {
      throw new ValidationError("Invalid bookmark input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.bookmarks.create({
      ...parsed.data,
      note: parsed.data.note ?? null
    });
  }

  /** Delete a bookmark owned by the user. */
  async deleteBookmark(userId: UUID, bookmarkId: UUID): Promise<void> {
    await this.bookmarks.delete(bookmarkId, userId);
  }

  /** List bookmarks for a user. */
  async listBookmarks(userId: UUID, lessonId?: UUID): Promise<Bookmark[]> {
    return this.bookmarks.listByUser(userId, lessonId);
  }

  /** Resolve a bookmark at a timestamp for jump-to behavior. */
  async jumpToTimestamp(
    userId: UUID,
    lessonId: UUID,
    timestampSeconds: number
  ): Promise<Bookmark | null> {
    if (timestampSeconds < 0) {
      throw new ValidationError("Timestamp must be zero or greater.");
    }
    return this.bookmarks.findByTimestamp(userId, lessonId, timestampSeconds);
  }
}

/**
 * Production lesson resume business service.
 */
export class CoreLessonResumeService implements LessonResumeService {
  constructor(private readonly resume: LessonResumeRepository) {}

  /** Save validated lesson resume position. */
  async savePosition(
    userId: UUID,
    input: Pick<
      LessonResume,
      "lesson_id" | "last_position_seconds" | "duration_watched" | "playback_speed"
    >
  ): Promise<LessonResume> {
    const parsed = lessonResumeSchema.safeParse({
      user_id: userId,
      completed: false,
      last_opened_at: new Date().toISOString(),
      ...input
    });
    if (!parsed.success) {
      throw new ValidationError("Invalid resume input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.resume.save({
      ...parsed.data,
      last_opened_at: parsed.data.last_opened_at ?? new Date().toISOString()
    });
  }

  /** Load saved lesson resume position. */
  async loadPosition(userId: UUID, lessonId: UUID): Promise<LessonResume | null> {
    return this.resume.load(userId, lessonId);
  }

  /** Mark a lesson as complete in resume state. */
  async markComplete(userId: UUID, lessonId: UUID): Promise<LessonResume> {
    return this.resume.markComplete(userId, lessonId);
  }
}

/**
 * Production lesson notes business service.
 */
export class CoreLessonNotesService implements LessonNotesService {
  constructor(private readonly notes: LessonNotesRepository) {}

  /** Create a validated lesson note. */
  async createNote(
    userId: UUID,
    input: Pick<LessonNote, "lesson_id" | "content">
  ): Promise<LessonNote> {
    const parsed = lessonNoteSchema.safeParse({ user_id: userId, ...input });
    if (!parsed.success) {
      throw new ValidationError("Invalid note input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.notes.create(parsed.data);
  }

  /** Edit an existing lesson note. */
  async editNote(userId: UUID, noteId: UUID, content: string): Promise<LessonNote> {
    const parsed = lessonNoteSchema.pick({ content: true }).safeParse({ content });
    if (!parsed.success) {
      throw new ValidationError("Invalid note content.", {
        issues: parsed.error.flatten()
      });
    }
    return this.notes.update(noteId, userId, parsed.data.content);
  }

  /** Delete a lesson note. */
  async deleteNote(userId: UUID, noteId: UUID): Promise<void> {
    await this.notes.delete(noteId, userId);
  }

  /** List notes for a specific lesson. */
  async listNotesForLesson(userId: UUID, lessonId: UUID): Promise<LessonNote[]> {
    return this.notes.listByLesson(userId, lessonId);
  }

  /** Search lesson notes by query string. */
  async searchNotes(
    userId: UUID,
    query: string,
    options?: Parameters<LessonNotesRepository["search"]>[2]
  ) {
    if (!query.trim()) {
      throw new ValidationError("Search query is required.");
    }
    return this.notes.search(userId, query.trim(), options);
  }
}

/**
 * Production learning path business service.
 */
export class CoreLearningPathService implements LearningPathService {
  constructor(private readonly paths: LearningPathRepository) {}

  /** List all active learning paths. */
  async listLearningPaths() {
    return this.paths.list();
  }

  /** Get a learning path and ordered courses by slug. */
  async getLearningPath(slug: string) {
    const path = await this.paths.findBySlug(slug);
    if (!path) throw new NotFoundError("Learning path was not found.");
    const courses = await this.paths.listCourses(path.id);
    return { path, courses };
  }

  /** Calculate completion percentage for a user's learning path. */
  async calculateCompletion(userId: UUID, learningPathId: UUID): Promise<number> {
    const progress = await this.paths.getUserProgress(userId, learningPathId);
    return progress?.progress_percent ?? 0;
  }

  /** Unlock the next course in a learning path for the user. */
  async unlockNextCourse(
    userId: UUID,
    learningPathId: UUID
  ): Promise<LearningPathCourse | null> {
    const courses = await this.paths.listCourses(learningPathId);
    if (courses.length === 0) return null;

    const progress = await this.paths.getUserProgress(userId, learningPathId);
    const currentCourseId = progress?.current_course_id;

    if (!currentCourseId) {
      const first = courses[0] ?? null;
      if (!first) return null;
      await this.paths.upsertUserProgress({
        user_id: userId,
        learning_path_id: learningPathId,
        current_course_id: first.course_id,
        started_at: new Date().toISOString(),
        completed_at: null,
        progress_percent: 0
      });
      return first;
    }

    const currentIndex = courses.findIndex(
      (course) => course.course_id === currentCourseId
    );
    const next = courses[currentIndex + 1] ?? null;

    if (!next) return null;

    await this.paths.upsertUserProgress({
      user_id: userId,
      learning_path_id: learningPathId,
      current_course_id: next.course_id,
      started_at: progress?.started_at ?? new Date().toISOString(),
      completed_at: null,
      progress_percent: Math.min(
        100,
        Math.round(((currentIndex + 1) / courses.length) * 100)
      )
    });

    return next;
  }
}

/**
 * Production favorite course business service.
 */
export class CoreFavoriteCourseService implements FavoriteCourseService {
  constructor(private readonly favorites: FavoriteCourseRepository) {}

  /** Favorite a course for a user. */
  async favorite(userId: UUID, courseId: UUID): Promise<FavoriteCourse> {
    const parsed = favoriteCourseSchema.safeParse({ user_id: userId, course_id: courseId });
    if (!parsed.success) {
      throw new ValidationError("Invalid favorite input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.favorites.favorite(userId, courseId);
  }

  /** Unfavorite a course for a user. */
  async unfavorite(userId: UUID, courseId: UUID): Promise<void> {
    await this.favorites.unfavorite(userId, courseId);
  }

  /** List favorite courses for a user. */
  async listFavorites(userId: UUID, options?: Parameters<FavoriteCourseRepository["listByUser"]>[1]) {
    return this.favorites.listByUser(userId, options);
  }

  /** Check whether a course is favorited. */
  async isFavorite(userId: UUID, courseId: UUID): Promise<boolean> {
    return this.favorites.isFavorite(userId, courseId);
  }
}

/**
 * Production recently viewed course business service.
 */
export class CoreRecentCourseService implements RecentCourseService {
  constructor(private readonly recent: RecentCourseRepository) {}

  /** Track a recently viewed course for a user. */
  async trackRecentlyViewed(
    userId: UUID,
    courseId: UUID,
    lastLessonId?: UUID | null
  ): Promise<RecentCourse> {
    const parsed = recentCourseSchema.safeParse({
      user_id: userId,
      course_id: courseId,
      last_lesson_id: lastLessonId ?? null
    });
    if (!parsed.success) {
      throw new ValidationError("Invalid recently viewed input.", {
        issues: parsed.error.flatten()
      });
    }
    return this.recent.upsert({
      ...parsed.data,
      last_lesson_id: parsed.data.last_lesson_id ?? null
    });
  }

  /** List recently viewed courses for a user. */
  async listRecentlyViewed(
    userId: UUID,
    options?: Parameters<RecentCourseRepository["listByUser"]>[1]
  ) {
    return this.recent.listByUser(userId, options);
  }

  /** Clear recently viewed history for a user. */
  async clearHistory(userId: UUID): Promise<void> {
    await this.recent.clearHistory(userId);
  }
}

/**
 * Production lesson resource business service.
 */
export class CoreLessonResourceService implements LessonResourceService {
  constructor(private readonly resources: LessonResourceRepository) {}

  /** List downloadable resources for a lesson. */
  async listResources(lessonId: UUID): Promise<LessonResource[]> {
    return this.resources.listByLesson(lessonId);
  }
}

/**
 * Production video playback business service.
 */
export class CoreVideoService implements VideoService {
  constructor(private readonly videos: VideoRepository) {}

  /** Validate whether a provider name is supported. */
  validateProvider(provider: VideoProviderName): boolean {
    return VIDEO_PROVIDER_NAMES.includes(provider);
  }

  /** Resolve a playback URL for a lesson through a registered provider. */
  async getPlaybackUrl(lessonId: UUID, provider?: VideoProviderName) {
    const assets = await this.videos.findByLesson(lessonId);
    if (assets.length === 0) {
      throw new NotFoundError("No video assets found for this lesson.");
    }

    const asset =
      (provider
        ? assets.find((item) => item.provider === provider)
        : assets[0]) ?? null;

    if (!asset) {
      throw new NotFoundError("Video provider asset was not found.");
    }

    const request: VideoPlaybackRequest = {
      lessonId,
      provider: asset.provider,
      assetId: asset.provider_asset_id,
      playbackId: asset.playback_id
    };

    return videoProviderRegistry.getPlaybackUrl(request);
  }

  /** Resolve a signed playback URL for a video asset. */
  async getSignedUrl(request: VideoPlaybackRequest, expiresInSeconds = 3600) {
    const parsed = videoPlaybackRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new ValidationError("Invalid video playback request.", {
        issues: parsed.error.flatten()
      });
    }

    if (!this.validateProvider(parsed.data.provider)) {
      throw new ValidationError("Unsupported video provider.");
    }

    return videoProviderRegistry.getSignedUrl(parsed.data, expiresInSeconds);
  }

  /** Resolve a placeholder playback token when supported by the provider. */
  async getPlaybackTokenPlaceholder(request: VideoPlaybackRequest) {
    const parsed = videoPlaybackRequestSchema.safeParse(request);
    if (!parsed.success) {
      throw new ValidationError("Invalid video playback request.", {
        issues: parsed.error.flatten()
      });
    }

    return videoProviderRegistry.getPlaybackToken(parsed.data);
  }
}
