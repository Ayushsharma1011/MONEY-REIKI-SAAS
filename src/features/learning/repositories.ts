import type { Course, PaginatedResult, QueryOptions, UUID } from "@/types/core";
import type {
  Bookmark,
  CourseCategory,
  FavoriteCourse,
  LearningPath,
  LearningPathCourse,
  LessonNote,
  LessonResume,
  LessonVideoAsset,
  RecentCourse,
  UserLearningPath,
  VideoProviderName
} from "@/types/learning";

export interface CourseCategoryRepository {
  list(): Promise<CourseCategory[]>;
  findById(id: UUID): Promise<CourseCategory | null>;
  findBySlug(slug: string): Promise<CourseCategory | null>;
  create(
    input: Omit<CourseCategory, "id" | "created_at" | "updated_at">
  ): Promise<CourseCategory>;
  update(
    id: UUID,
    input: Partial<Omit<CourseCategory, "id" | "created_at" | "updated_at">>
  ): Promise<CourseCategory>;
  delete(id: UUID): Promise<void>;
  listCoursesByCategory(
    categoryId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Course>>;
}

export interface BookmarkRepository {
  create(
    input: Omit<Bookmark, "id" | "created_at" | "updated_at">
  ): Promise<Bookmark>;
  delete(id: UUID, userId: UUID): Promise<void>;
  listByUser(userId: UUID, lessonId?: UUID): Promise<Bookmark[]>;
  findByTimestamp(
    userId: UUID,
    lessonId: UUID,
    timestampSeconds: number
  ): Promise<Bookmark | null>;
}

export interface LessonResumeRepository {
  save(
    input: Omit<LessonResume, "id" | "created_at" | "updated_at">
  ): Promise<LessonResume>;
  load(userId: UUID, lessonId: UUID): Promise<LessonResume | null>;
  markComplete(userId: UUID, lessonId: UUID): Promise<LessonResume>;
}

export interface LessonNotesRepository {
  create(
    input: Omit<LessonNote, "id" | "created_at" | "updated_at">
  ): Promise<LessonNote>;
  update(id: UUID, userId: UUID, content: string): Promise<LessonNote>;
  delete(id: UUID, userId: UUID): Promise<void>;
  search(
    userId: UUID,
    query: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<LessonNote>>;
  listByLesson(userId: UUID, lessonId: UUID): Promise<LessonNote[]>;
}

export interface LearningPathRepository {
  findById(id: UUID): Promise<LearningPath | null>;
  findBySlug(slug: string): Promise<LearningPath | null>;
  listCourses(learningPathId: UUID): Promise<LearningPathCourse[]>;
  getUserProgress(
    userId: UUID,
    learningPathId: UUID
  ): Promise<UserLearningPath | null>;
  upsertUserProgress(
    input: Omit<UserLearningPath, "id" | "created_at" | "updated_at">
  ): Promise<UserLearningPath>;
}

export interface FavoriteCourseRepository {
  favorite(userId: UUID, courseId: UUID): Promise<FavoriteCourse>;
  unfavorite(userId: UUID, courseId: UUID): Promise<void>;
  listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<FavoriteCourse>>;
  isFavorite(userId: UUID, courseId: UUID): Promise<boolean>;
}

export interface RecentCourseRepository {
  upsert(
    input: Omit<RecentCourse, "id" | "viewed_at"> & {
      viewed_at?: string;
    }
  ): Promise<RecentCourse>;
  listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<RecentCourse>>;
  clearHistory(userId: UUID): Promise<void>;
}

export interface VideoRepository {
  findByLesson(lessonId: UUID): Promise<LessonVideoAsset[]>;
  findByLessonAndProvider(
    lessonId: UUID,
    provider: VideoProviderName
  ): Promise<LessonVideoAsset | null>;
}
