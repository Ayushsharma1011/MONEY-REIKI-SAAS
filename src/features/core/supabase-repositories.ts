import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
  ValidationError
} from "../../lib/errors";
import type {
  AnalyticsRepository,
  ChallengeRepository,
  CourseRepository,
  DashboardRepository,
  JournalRepository,
  LessonProgressRepository,
  LessonRepository,
  MeditationRepository,
  NotificationRepository,
  PracticeRepository,
  Repository
} from "./repositories";
import type {
  AnalyticsEvent,
  Challenge,
  ChallengeProgress,
  Course,
  CourseModule,
  DailyPractice,
  DashboardWidget,
  JournalEntry,
  Lesson,
  LessonProgress,
  Meditation,
  Notification,
  PaginatedResult,
  QueryOptions,
  UUID
} from "../../types/core";

type DbRecord = Record<string, unknown>;
type QueryResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

function mapDatabaseError(
  error: { message: string; code?: string } | null,
  fallback: string
) {
  if (!error) {
    return;
  }

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

/**
 * Shared Supabase repository primitives for table-backed records.
 */
abstract class SupabaseRepository<
  TRecord extends { id: UUID },
  TCreate extends DbRecord,
  TUpdate extends DbRecord
> implements Repository<TRecord, TCreate, TUpdate> {
  protected constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly table: string
  ) {}

  /** Find a non-deleted record by primary key. */
  async findById(id: UUID): Promise<TRecord | null> {
    const result = (await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle()) as QueryResult<unknown>;

    mapDatabaseError(result.error, `Unable to load ${this.table}.`);
    return result.data ? asRecord<TRecord>(result.data) : null;
  }

  /** List non-deleted records with standard pagination. */
  async list(options?: QueryOptions): Promise<PaginatedResult<TRecord>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from(this.table)
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;

    mapDatabaseError(result.error, `Unable to list ${this.table}.`);
    return {
      data: asRecord<TRecord[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** Insert a record and return the created row. */
  async create(input: TCreate): Promise<TRecord> {
    const result = (await this.supabase
      .from(this.table)
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;

    mapDatabaseError(result.error, `Unable to create ${this.table}.`);
    if (!result.data) {
      throw new DatabaseError(`Unable to create ${this.table}.`);
    }

    return asRecord<TRecord>(result.data);
  }

  /** Update a record and return the updated row. */
  async update(id: UUID, input: TUpdate): Promise<TRecord> {
    const result = (await this.supabase
      .from(this.table)
      .update(input as never)
      .eq("id", id)
      .select("*")
      .single()) as QueryResult<unknown>;

    mapDatabaseError(result.error, `Unable to update ${this.table}.`);
    if (!result.data) {
      throw new NotFoundError(`${this.table} record was not found.`);
    }

    return asRecord<TRecord>(result.data);
  }

  /** Soft delete a record by setting deleted_at. */
  async softDelete(id: UUID): Promise<void> {
    const result = (await this.supabase
      .from(this.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)) as QueryResult<unknown>;

    mapDatabaseError(result.error, `Unable to delete ${this.table}.`);
  }
}

/** Supabase implementation of course persistence. */
export class SupabaseCourseRepository
  extends SupabaseRepository<
    Course,
    Omit<Course, "id" | "created_at" | "updated_at">,
    Partial<Course>
  >
  implements CourseRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "courses");
  }

  /** Find a published or admin-visible course by slug. */
  async findBySlug(slug: string): Promise<Course | null> {
    const result = (await this.supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load course.");
    return result.data ? asRecord<Course>(result.data) : null;
  }

  /** List published courses. */
  async listPublished(
    options?: QueryOptions
  ): Promise<PaginatedResult<Course>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("courses")
      .select("*", { count: "exact" })
      .eq("is_published", true)
      .is("deleted_at", null)
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list courses.");
    return {
      data: asRecord<Course[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** List modules for a course. */
  async listModules(courseId: UUID): Promise<CourseModule[]> {
    const result = (await this.supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .is("deleted_at", null)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list course modules.");
    return asRecord<CourseModule[]>(result.data ?? []);
  }

  /** List lessons in a module. */
  async listLessons(moduleId: UUID): Promise<Lesson[]> {
    const result = (await this.supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .is("deleted_at", null)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list lessons.");
    return asRecord<Lesson[]>(result.data ?? []);
  }

  /** List all lessons for a course. */
  async listLessonsByCourse(courseId: UUID): Promise<Lesson[]> {
    const modules = await this.listModules(courseId);
    const lessons = await Promise.all(
      modules.map((module) => this.listLessons(module.id))
    );
    return lessons.flat();
  }
}

/** Supabase implementation of lesson persistence. */
export class SupabaseLessonRepository
  extends SupabaseRepository<
    Lesson,
    Omit<Lesson, "id" | "created_at" | "updated_at">,
    Partial<Lesson>
  >
  implements LessonRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "lessons");
  }

  /** Find a lesson by module and slug. */
  async findBySlug(moduleId: UUID, slug: string): Promise<Lesson | null> {
    const result = (await this.supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .eq("slug", slug)
      .is("deleted_at", null)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load lesson.");
    return result.data ? asRecord<Lesson>(result.data) : null;
  }

  /** List lessons by module. */
  async listByModule(moduleId: UUID): Promise<Lesson[]> {
    const result = (await this.supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .is("deleted_at", null)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list lessons.");
    return asRecord<Lesson[]>(result.data ?? []);
  }
}

/** Supabase implementation of lesson progress persistence. */
export class SupabaseLessonProgressRepository implements LessonProgressRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Complete a lesson through the database RPC transaction boundary. */
  async completeLesson(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void> {
    if (!userId || !lessonId) {
      throw new ValidationError("User and lesson are required.");
    }
    const result = (await this.supabase.rpc("complete_lesson", {
      target_lesson_id: lessonId,
      watched_seconds: watchTime
    })) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to complete lesson.");
  }

  /** Update watch time without marking completion. */
  async updateWatchTime(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void> {
    const result = (await this.supabase.from("lesson_progress").upsert({
      user_id: userId,
      lesson_id: lessonId,
      watch_time: Math.max(0, watchTime)
    })) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to update lesson watch time.");
  }

  /** Read lesson progress for a user. */
  async getProgress(
    userId: UUID,
    lessonId: UUID
  ): Promise<LessonProgress | null> {
    const result = (await this.supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load lesson progress.");
    return result.data ? asRecord<LessonProgress>(result.data) : null;
  }
}

/** Supabase implementation of journal persistence. */
export class SupabaseJournalRepository
  extends SupabaseRepository<
    JournalEntry,
    Omit<JournalEntry, "id" | "created_at" | "updated_at">,
    Partial<JournalEntry>
  >
  implements JournalRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "journal_entries");
  }

  /** List journal entries for one user. */
  async listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<JournalEntry>> {
    const { from, page, pageSize, to } = pagination(options);
    let query = this.supabase
      .from("journal_entries")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null);
    if (options?.search) query = query.textSearch("content", options.search);
    if (options?.mood) query = query.eq("mood", options.mood);
    if (options?.tags?.length) query = query.contains("tags", options.tags);
    const result = (await query
      .order("created_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list journal entries.");
    return {
      data: asRecord<JournalEntry[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }
}

/** Supabase implementation of meditation persistence. */
export class SupabaseMeditationRepository
  extends SupabaseRepository<
    Meditation,
    Omit<Meditation, "id" | "created_at" | "updated_at">,
    Partial<Meditation>
  >
  implements MeditationRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "meditations");
  }

  /** List meditations by category. */
  async listByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("meditations")
      .select("*", { count: "exact" })
      .eq("category", category)
      .is("deleted_at", null)
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list meditations.");
    return {
      data: asRecord<Meditation[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** List recently played meditations. */
  async listRecentlyPlayed(_userId: UUID): Promise<Meditation[]> {
    void _userId;
    const result = await this.list({ pageSize: 5 });
    return result.data;
  }

  /** List favorite meditations placeholder backed by readable content. */
  async listFavorites(_userId: UUID): Promise<Meditation[]> {
    void _userId;
    const result = await this.list({ pageSize: 10 });
    return result.data;
  }

  /** Track a completed meditation session. */
  async completeSession(
    userId: UUID,
    meditationId: UUID,
    duration: number
  ): Promise<void> {
    const result = (await this.supabase.from("analytics_events").insert({
      user_id: userId,
      event_name: "Meditation Completed",
      payload: { meditationId, duration }
    })) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to track meditation session.");
  }
}

/** Supabase implementation of daily practice persistence. */
export class SupabasePracticeRepository
  extends SupabaseRepository<
    DailyPractice,
    Omit<DailyPractice, "id" | "created_at" | "updated_at">,
    Partial<DailyPractice>
  >
  implements PracticeRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "daily_practices");
  }

  /** Complete a practice through the database RPC transaction boundary. */
  async completePractice(_userId: UUID, practiceId: UUID): Promise<void> {
    void _userId;
    const result = (await this.supabase.rpc("complete_practice", {
      target_practice_id: practiceId
    })) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to complete practice.");
  }

  /** Get today's practice recommendation. */
  async getTodayPractice(_userId: UUID): Promise<DailyPractice | null> {
    void _userId;
    const result = await this.list({ pageSize: 1 });
    return result.data[0] ?? null;
  }

  /** Get practice history. */
  async getPracticeHistory(
    _userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<DailyPractice>> {
    return this.list(options);
  }

  /** Calculate user streak through RPC. */
  async calculateStreak(userId: UUID): Promise<number> {
    const result = (await this.supabase.rpc("calculate_user_streak", {
      target_user_id: userId
    })) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to calculate streak.");
    return typeof result.data === "number" ? result.data : 0;
  }
}

/** Supabase implementation of challenge persistence. */
export class SupabaseChallengeRepository
  extends SupabaseRepository<
    Challenge,
    Omit<Challenge, "id" | "created_at" | "updated_at">,
    Partial<Challenge>
  >
  implements ChallengeRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, "challenges");
  }

  /** Get progress for one challenge. */
  async getProgress(
    userId: UUID,
    challengeId: UUID
  ): Promise<ChallengeProgress | null> {
    const result = (await this.supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load challenge progress.");
    return result.data ? asRecord<ChallengeProgress>(result.data) : null;
  }

  /** Get the current active challenge progress. */
  async getCurrentProgress(userId: UUID): Promise<ChallengeProgress | null> {
    const result = (await this.supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", false)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load current challenge.");
    return result.data ? asRecord<ChallengeProgress>(result.data) : null;
  }

  /** Join a challenge. */
  async joinChallenge(
    userId: UUID,
    challengeId: UUID
  ): Promise<ChallengeProgress> {
    const result = (await this.supabase
      .from("challenge_progress")
      .insert({ user_id: userId, challenge_id: challengeId })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to join challenge.");
    if (!result.data) throw new DatabaseError("Unable to join challenge.");
    return asRecord<ChallengeProgress>(result.data);
  }

  /** Complete the current challenge day. */
  async completeDay(
    userId: UUID,
    challengeId: UUID
  ): Promise<ChallengeProgress> {
    const current = await this.getProgress(userId, challengeId);
    if (!current) throw new NotFoundError("Challenge progress was not found.");
    const result = (await this.supabase
      .from("challenge_progress")
      .update({ current_day: current.current_day + 1 })
      .eq("id", current.id)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to complete challenge day.");
    if (!result.data)
      throw new DatabaseError("Unable to complete challenge day.");
    return asRecord<ChallengeProgress>(result.data);
  }
}

/** Supabase implementation of notifications. */
export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** List notifications for a user. */
  async listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Notification>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list notifications.");
    return {
      data: asRecord<Notification[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }

  /** Create a notification. */
  async create(
    input: Omit<Notification, "id" | "created_at">
  ): Promise<Notification> {
    const result = (await this.supabase
      .from("notifications")
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to create notification.");
    if (!result.data) throw new DatabaseError("Unable to create notification.");
    return asRecord<Notification>(result.data);
  }

  /** Mark a notification read. */
  async markRead(notificationId: UUID, userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to mark notification read.");
  }

  /** Mark all notifications read. */
  async markAllRead(userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to mark notifications read.");
  }

  /** Count unread notifications. */
  async unreadCount(userId: UUID): Promise<number> {
    const result = (await this.supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to count notifications.");
    return result.count ?? 0;
  }

  /** Soft delete a notification. */
  async delete(notificationId: UUID, userId: UUID): Promise<void> {
    const result = (await this.supabase
      .from("notifications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to delete notification.");
  }
}

/** Supabase implementation of dashboard persistence reads. */
export class SupabaseDashboardRepository implements DashboardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** List dashboard widgets. */
  async listWidgets(): Promise<DashboardWidget[]> {
    const result = (await this.supabase
      .from("dashboard_widgets")
      .select("*")
      .eq("enabled", true)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list dashboard widgets.");
    return asRecord<DashboardWidget[]>(result.data ?? []);
  }

  /** Update dashboard widget order. */
  async updateWidgetOrder(
    widgetId: UUID,
    orderIndex: number
  ): Promise<DashboardWidget> {
    const result = (await this.supabase
      .from("dashboard_widgets")
      .update({ order_index: orderIndex })
      .eq("id", widgetId)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to update dashboard widget.");
    if (!result.data)
      throw new NotFoundError("Dashboard widget was not found.");
    return asRecord<DashboardWidget>(result.data);
  }

  /** Get profile summary for dashboard composition. */
  async getProfile(userId: UUID): Promise<{
    id: UUID;
    full_name: string;
    avatar_url: string | null;
    onboarding_completed: boolean;
  } | null> {
    const result = (await this.supabase
      .from("profiles")
      .select("id,full_name,avatar_url,onboarding_completed")
      .eq("id", userId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load profile.");
    return result.data
      ? asRecord<{
          id: UUID;
          full_name: string;
          avatar_url: string | null;
          onboarding_completed: boolean;
        }>(result.data)
      : null;
  }

  /** Get progress summary for dashboard composition. */
  async getProgress(userId: UUID): Promise<Record<string, unknown> | null> {
    const result = (await this.supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load user progress.");
    return result.data ? asRecord<Record<string, unknown>>(result.data) : null;
  }
}

/** Supabase implementation of analytics events. */
export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Track an analytics event. */
  async track(
    input: Omit<AnalyticsEvent, "id" | "created_at">
  ): Promise<AnalyticsEvent> {
    const result = (await this.supabase
      .from("analytics_events")
      .insert(input)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to track analytics event.");
    if (!result.data)
      throw new DatabaseError("Unable to track analytics event.");
    return asRecord<AnalyticsEvent>(result.data);
  }

  /** List analytics events. */
  async listEvents(
    options?: QueryOptions
  ): Promise<PaginatedResult<AnalyticsEvent>> {
    const { from, page, pageSize, to } = pagination(options);
    const result = (await this.supabase
      .from("analytics_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list analytics events.");
    return {
      data: asRecord<AnalyticsEvent[]>(result.data ?? []),
      total: result.count ?? 0,
      page,
      pageSize
    };
  }
}
