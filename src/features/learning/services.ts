import type { Course, PaginatedResult, QueryOptions, UUID } from "@/types/core";
import type {
  Bookmark,
  CourseCategory,
  FavoriteCourse,
  LearningPath,
  LearningPathCourse,
  LessonNote,
  LessonResource,
  LessonResume,
  RecentCourse,
  VideoPlaybackRequest,
  VideoPlaybackResult,
  VideoProviderName
} from "@/types/learning";

export interface CourseCategoryService {
  getCategories(): Promise<CourseCategory[]>;
  createCategory(
    input: Omit<CourseCategory, "id" | "created_at" | "updated_at">
  ): Promise<CourseCategory>;
  updateCategory(
    id: UUID,
    input: Partial<Omit<CourseCategory, "id" | "created_at" | "updated_at">>
  ): Promise<CourseCategory>;
  deleteCategory(id: UUID): Promise<void>;
  listCoursesByCategory(
    categoryId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Course>>;
}

export interface BookmarkService {
  createBookmark(
    userId: UUID,
    input: Pick<Bookmark, "lesson_id" | "timestamp_seconds" | "note">
  ): Promise<Bookmark>;
  deleteBookmark(userId: UUID, bookmarkId: UUID): Promise<void>;
  listBookmarks(userId: UUID, lessonId?: UUID): Promise<Bookmark[]>;
  jumpToTimestamp(
    userId: UUID,
    lessonId: UUID,
    timestampSeconds: number
  ): Promise<Bookmark | null>;
}

export interface LessonResumeService {
  savePosition(
    userId: UUID,
    input: Pick<
      LessonResume,
      | "lesson_id"
      | "last_position_seconds"
      | "duration_watched"
      | "playback_speed"
    >
  ): Promise<LessonResume>;
  loadPosition(userId: UUID, lessonId: UUID): Promise<LessonResume | null>;
  markComplete(userId: UUID, lessonId: UUID): Promise<LessonResume>;
}

export interface LessonNotesService {
  createNote(
    userId: UUID,
    input: Pick<LessonNote, "lesson_id" | "content">
  ): Promise<LessonNote>;
  editNote(userId: UUID, noteId: UUID, content: string): Promise<LessonNote>;
  deleteNote(userId: UUID, noteId: UUID): Promise<void>;
  listNotesForLesson(userId: UUID, lessonId: UUID): Promise<LessonNote[]>;
  searchNotes(
    userId: UUID,
    query: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<LessonNote>>;
}

export interface LessonResourceService {
  listResources(lessonId: UUID): Promise<LessonResource[]>;
}

export interface LearningPathService {
  listLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(slug: string): Promise<{
    path: LearningPath;
    courses: LearningPathCourse[];
  }>;
  calculateCompletion(userId: UUID, learningPathId: UUID): Promise<number>;
  unlockNextCourse(
    userId: UUID,
    learningPathId: UUID
  ): Promise<LearningPathCourse | null>;
}

export interface FavoriteCourseService {
  favorite(userId: UUID, courseId: UUID): Promise<FavoriteCourse>;
  unfavorite(userId: UUID, courseId: UUID): Promise<void>;
  listFavorites(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<FavoriteCourse>>;
  isFavorite(userId: UUID, courseId: UUID): Promise<boolean>;
}

export interface RecentCourseService {
  trackRecentlyViewed(
    userId: UUID,
    courseId: UUID,
    lastLessonId?: UUID | null
  ): Promise<RecentCourse>;
  listRecentlyViewed(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<RecentCourse>>;
  clearHistory(userId: UUID): Promise<void>;
}

export interface VideoService {
  getPlaybackUrl(
    lessonId: UUID,
    provider?: VideoProviderName
  ): Promise<VideoPlaybackResult>;
  validateProvider(provider: VideoProviderName): boolean;
  getSignedUrl(
    request: VideoPlaybackRequest,
    expiresInSeconds?: number
  ): Promise<string>;
  getPlaybackTokenPlaceholder(
    request: VideoPlaybackRequest
  ): Promise<string | null>;
}
