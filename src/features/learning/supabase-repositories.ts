import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ConflictError,
  DatabaseError,
  NotFoundError
} from "@/lib/errors";
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
import type {
  BookmarkRepository,
  CourseCategoryRepository,
  FavoriteCourseRepository,
  LearningPathRepository,
  LessonNotesRepository,
  LessonResumeRepository,
  RecentCourseRepository,
  VideoRepository
} from "./repositories";

type QueryResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

function mapDatabaseError(
  error: { message: string; code?: string } | null,
  fallback: string
) {
  if (!error) return;
  if (error.code === "23505") {
    throw new ConflictError("A record with this unique value already exists.");
  }
  throw new DatabaseError(fallback, { reason: error.message });
}

function pagination(options?: QueryOptions) {
  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(options?.pageSize ?? 20, 1), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

function asRecord<T>(value: unknown): T {
  return value as T;
}

/** Supabase persistence for course categories. */
export class SupabaseCourseCategoryRepository implements CourseCategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** List all categories ordered for display. */
  async list(): Promise<CourseCategory[]> {
    const result = (await this.supabase
      .from("course_categories")
      .select("*")
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list categories.");
    return asRecord<CourseCategory[]>(result.data ?? []);
  }

  /** Find a category by id. */
  async findById(id: UUID): Promise<CourseCategory | null> {
    const result = (await this.supabase
      .from("course_categories")
      .select("*")
      .eq("id", id)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load category.");
    return result.data ? asRecord<CourseCategory>(result.data) : null;
  }

  /** Find a category by slug. */
  async findBySlug(slug: string): Promise<CourseCategory | null> {
    const result = (await this.supabase
      .from("course_categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load category.");
    return result.data ? asRecord<CourseCategory>(result.data) : null;
  }

  /** Create a category. */
  async create(
    input: Omit<CourseCategory, "id" | "created_at" | "updated_at">
  ): Promise<CourseCategory> {
    const result = (await this.supabase
      .from("course_categories")
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to create category.");
    if (!result.data) throw new DatabaseError("Unable to create category.");
    return asRecord<CourseCategory>(result.data);
  }

  /** Update a category. */
  async update(
    id: UUID,
    input: Partial<Omit<CourseCategory, "id" | "created_at" | "updated_at">>
  ): Promise<CourseCategory> {
    const result = (await this.supabase
      .from("course_categories")
      .update(input)
      .eq("id", id)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to update category.");
    if (!result.data) throw new NotFoundError("Category was not found.");
    return asRecord<CourseCategory>(result.data);
  }

  /** Delete a category. */
  async delete(id: UUID): Promise<void> {
    const result = (await this.supabase
      .from("course_categories")
      .delete()
      .eq("id", id)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to delete category.");
  }

  /** List published courses assigned to a category. */
  async listCoursesByCategory(
    categoryId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Course>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("course_category_courses")
      .select("course:courses(*)", { count: "exact" })
      .eq("category_id", categoryId)
      .range(from, to)) as QueryResult<Array<{ course: Course }>>;
    mapDatabaseError(result.error, "Unable to list courses by category.");
    const courses = (result.data ?? [])
      .map((row) => row.course)
      .filter((course) => course && !course.deleted_at);
    return { data: courses, total: result.count ?? courses.length, page, pageSize };
  }
}

/** Supabase persistence for lesson bookmarks. */
export class SupabaseBookmarkRepository implements BookmarkRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Create a bookmark. */
  async create(
    input: Omit<Bookmark, "id" | "created_at" | "updated_at">
  ): Promise<Bookmark> {
    const result = (await this.supabase
      .from("lesson_bookmarks")
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to create bookmark.");
    if (!result.data) throw new DatabaseError("Unable to create bookmark.");
    return asRecord<Bookmark>(result.data);
  }

  /** Delete a bookmark owned by the user. */
  async delete(id: UUID, userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("lesson_bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to delete bookmark.");
  }

  /** List bookmarks for a user, optionally scoped to a lesson. */
  async listByUser(userId: UUID, lessonId?: UUID): Promise<Bookmark[]> {
    let query = this.supabase
      .from("lesson_bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp_seconds");
    if (lessonId) query = query.eq("lesson_id", lessonId);
    const result = (await query) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list bookmarks.");
    return asRecord<Bookmark[]>(result.data ?? []);
  }

  /** Find a bookmark at an exact timestamp. */
  async findByTimestamp(
    userId: UUID,
    lessonId: UUID,
    timestampSeconds: number
  ): Promise<Bookmark | null> {
    const result = (await this.supabase
      .from("lesson_bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .eq("timestamp_seconds", timestampSeconds)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load bookmark.");
    return result.data ? asRecord<Bookmark>(result.data) : null;
  }
}

/** Supabase persistence for lesson resume state. */
export class SupabaseLessonResumeRepository implements LessonResumeRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Upsert lesson resume state. */
  async save(
    input: Omit<LessonResume, "id" | "created_at" | "updated_at">
  ): Promise<LessonResume> {
    const result = (await this.supabase
      .from("lesson_resume")
      .upsert(input, { onConflict: "user_id,lesson_id" })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to save lesson resume.");
    if (!result.data) throw new DatabaseError("Unable to save lesson resume.");
    return asRecord<LessonResume>(result.data);
  }

  /** Load resume state for a lesson. */
  async load(userId: UUID, lessonId: UUID): Promise<LessonResume | null> {
    const result = (await this.supabase
      .from("lesson_resume")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load lesson resume.");
    return result.data ? asRecord<LessonResume>(result.data) : null;
  }

  /** Mark a lesson as completed in resume state. */
  async markComplete(userId: UUID, lessonId: UUID): Promise<LessonResume> {
    const result = (await this.supabase
      .from("lesson_resume")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          last_opened_at: new Date().toISOString()
        },
        { onConflict: "user_id,lesson_id" }
      )
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to mark lesson complete.");
    if (!result.data) throw new DatabaseError("Unable to mark lesson complete.");
    return asRecord<LessonResume>(result.data);
  }
}

/** Supabase persistence for lesson notes. */
export class SupabaseLessonNotesRepository implements LessonNotesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Create a lesson note. */
  async create(
    input: Omit<LessonNote, "id" | "created_at" | "updated_at">
  ): Promise<LessonNote> {
    const result = (await this.supabase
      .from("lesson_notes")
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to create note.");
    if (!result.data) throw new DatabaseError("Unable to create note.");
    return asRecord<LessonNote>(result.data);
  }

  /** Update a lesson note. */
  async update(id: UUID, userId: UUID, content: string): Promise<LessonNote> {
    const result = (await this.supabase
      .from("lesson_notes")
      .update({ content })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to update note.");
    if (!result.data) throw new NotFoundError("Note was not found.");
    return asRecord<LessonNote>(result.data);
  }

  /** Delete a lesson note. */
  async delete(id: UUID, userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("lesson_notes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to delete note.");
  }

  /** Search lesson notes by content. */
  async search(
    userId: UUID,
    query: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<LessonNote>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("lesson_notes")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .ilike("content", `%${query}%`)
      .order("updated_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to search notes.");
    return {
      data: asRecord<LessonNote[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** List notes for a lesson. */
  async listByLesson(userId: UUID, lessonId: UUID): Promise<LessonNote[]> {
    const result = (await this.supabase
      .from("lesson_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list notes.");
    return asRecord<LessonNote[]>(result.data ?? []);
  }
}

/** Supabase persistence for learning paths. */
export class SupabaseLearningPathRepository implements LearningPathRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Find a learning path by id. */
  async findById(id: UUID): Promise<LearningPath | null> {
    const result = (await this.supabase
      .from("learning_paths")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load learning path.");
    return result.data ? asRecord<LearningPath>(result.data) : null;
  }

  /** Find a learning path by slug. */
  async findBySlug(slug: string): Promise<LearningPath | null> {
    const result = (await this.supabase
      .from("learning_paths")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load learning path.");
    return result.data ? asRecord<LearningPath>(result.data) : null;
  }

  /** List courses in a learning path. */
  async listCourses(learningPathId: UUID): Promise<LearningPathCourse[]> {
    const result = (await this.supabase
      .from("learning_path_courses")
      .select("*")
      .eq("learning_path_id", learningPathId)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list learning path courses.");
    return asRecord<LearningPathCourse[]>(result.data ?? []);
  }

  /** Get user progress for a learning path. */
  async getUserProgress(
    userId: UUID,
    learningPathId: UUID
  ): Promise<UserLearningPath | null> {
    const result = (await this.supabase
      .from("user_learning_path")
      .select("*")
      .eq("user_id", userId)
      .eq("learning_path_id", learningPathId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load learning path progress.");
    return result.data ? asRecord<UserLearningPath>(result.data) : null;
  }

  /** Upsert user progress for a learning path. */
  async upsertUserProgress(
    input: Omit<UserLearningPath, "id" | "created_at" | "updated_at">
  ): Promise<UserLearningPath> {
    const result = (await this.supabase
      .from("user_learning_path")
      .upsert(input, { onConflict: "user_id,learning_path_id" })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to save learning path progress.");
    if (!result.data) throw new DatabaseError("Unable to save learning path progress.");
    return asRecord<UserLearningPath>(result.data);
  }
}

/** Supabase persistence for course favorites. */
export class SupabaseFavoriteCourseRepository implements FavoriteCourseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Favorite a course. */
  async favorite(userId: UUID, courseId: UUID): Promise<FavoriteCourse> {
    const result = (await this.supabase
      .from("course_favorites")
      .upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id" })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to favorite course.");
    if (!result.data) throw new DatabaseError("Unable to favorite course.");
    return asRecord<FavoriteCourse>(result.data);
  }

  /** Unfavorite a course. */
  async unfavorite(userId: UUID, courseId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("course_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to unfavorite course.");
  }

  /** List favorite courses for a user. */
  async listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<FavoriteCourse>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("course_favorites")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list favorites.");
    return {
      data: asRecord<FavoriteCourse[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** Check whether a course is favorited. */
  async isFavorite(userId: UUID, courseId: UUID): Promise<boolean> {
    const result = (await this.supabase
      .from("course_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to check favorite.");
    return Boolean(result.data);
  }
}

/** Supabase persistence for recently viewed courses. */
export class SupabaseRecentCourseRepository implements RecentCourseRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Upsert a recently viewed course entry. */
  async upsert(
    input: Omit<RecentCourse, "id" | "viewed_at"> & { viewed_at?: string }
  ): Promise<RecentCourse> {
    const result = (await this.supabase
      .from("recently_viewed_courses")
      .upsert(
        {
          ...input,
          viewed_at: input.viewed_at ?? new Date().toISOString()
        },
        { onConflict: "user_id,course_id" }
      )
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to save recently viewed course.");
    if (!result.data) throw new DatabaseError("Unable to save recently viewed course.");
    return asRecord<RecentCourse>(result.data);
  }

  /** List recently viewed courses for a user. */
  async listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<RecentCourse>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("recently_viewed_courses")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list recently viewed courses.");
    return {
      data: asRecord<RecentCourse[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** Clear recently viewed history for a user. */
  async clearHistory(userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("recently_viewed_courses")
      .delete()
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to clear recently viewed history.");
  }
}

/** Supabase persistence for lesson video assets. */
export class SupabaseVideoRepository implements VideoRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** List video assets for a lesson. */
  async findByLesson(lessonId: UUID): Promise<LessonVideoAsset[]> {
    const result = (await this.supabase
      .from("lesson_video_assets")
      .select("*")
      .eq("lesson_id", lessonId)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to load video assets.");
    return asRecord<LessonVideoAsset[]>(result.data ?? []);
  }

  /** Find a video asset by lesson and provider. */
  async findByLessonAndProvider(
    lessonId: UUID,
    provider: VideoProviderName
  ): Promise<LessonVideoAsset | null> {
    const result = (await this.supabase
      .from("lesson_video_assets")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("provider", provider)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load video asset.");
    return result.data ? asRecord<LessonVideoAsset>(result.data) : null;
  }
}
