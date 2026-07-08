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
} from "@/types/core";

export interface Repository<TRecord, TCreate, TUpdate> {
  findById(id: UUID): Promise<TRecord | null>;
  list(options?: QueryOptions): Promise<PaginatedResult<TRecord>>;
  create(input: TCreate): Promise<TRecord>;
  update(id: UUID, input: TUpdate): Promise<TRecord>;
  softDelete(id: UUID): Promise<void>;
}

export interface CourseRepository extends Repository<
  Course,
  Omit<Course, "id" | "created_at" | "updated_at">,
  Partial<Course>
> {
  findBySlug(slug: string): Promise<Course | null>;
  listPublished(options?: QueryOptions): Promise<PaginatedResult<Course>>;
  listModules(courseId: UUID): Promise<CourseModule[]>;
  listLessons(moduleId: UUID): Promise<Lesson[]>;
}

export interface JournalRepository extends Repository<
  JournalEntry,
  Omit<JournalEntry, "id" | "created_at" | "updated_at">,
  Partial<JournalEntry>
> {
  listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<JournalEntry>>;
}

export interface MeditationRepository extends Repository<
  Meditation,
  Omit<Meditation, "id" | "created_at" | "updated_at">,
  Partial<Meditation>
> {
  listByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>>;
}

export interface PracticeRepository extends Repository<
  DailyPractice,
  Omit<DailyPractice, "id" | "created_at" | "updated_at">,
  Partial<DailyPractice>
> {
  completePractice(userId: UUID, practiceId: UUID): Promise<void>;
}

export interface DashboardRepository {
  listWidgets(): Promise<DashboardWidget[]>;
  updateWidgetOrder(
    widgetId: UUID,
    orderIndex: number
  ): Promise<DashboardWidget>;
}

export interface NotificationRepository {
  listByUser(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Notification>>;
  markRead(notificationId: UUID, userId: UUID): Promise<void>;
  create(input: Omit<Notification, "id" | "created_at">): Promise<Notification>;
}

export interface ChallengeRepository extends Repository<
  Challenge,
  Omit<Challenge, "id" | "created_at" | "updated_at">,
  Partial<Challenge>
> {
  getProgress(
    userId: UUID,
    challengeId: UUID
  ): Promise<ChallengeProgress | null>;
}

export interface AnalyticsRepository {
  track(
    input: Omit<AnalyticsEvent, "id" | "created_at">
  ): Promise<AnalyticsEvent>;
  listEvents(options?: QueryOptions): Promise<PaginatedResult<AnalyticsEvent>>;
}

export interface LessonProgressRepository {
  completeLesson(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void>;
  getProgress(userId: UUID, lessonId: UUID): Promise<LessonProgress | null>;
}
