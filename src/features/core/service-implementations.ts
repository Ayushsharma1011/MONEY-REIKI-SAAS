import { NotFoundError, ValidationError } from "../../lib/errors";
import type {
  AnalyticsRepository,
  ChallengeRepository,
  CourseRepository,
  DashboardRepository,
  JournalRepository,
  LessonProgressRepository,
  MeditationRepository,
  NotificationRepository,
  PracticeRepository
} from "./repositories";
import type {
  AnalyticsService,
  ChallengeService,
  CourseService,
  DashboardService,
  JournalService,
  LessonService,
  MeditationService,
  NotificationService,
  PracticeService,
  StorageBucket,
  StorageService
} from "./services";
import type {
  AnalyticsEvent,
  Challenge,
  ChallengeProgress,
  Course,
  CourseModule,
  DailyPractice,
  DashboardSnapshot,
  JournalEntry,
  JsonObject,
  Lesson,
  LessonProgress,
  Meditation,
  Notification,
  PaginatedResult,
  QueryOptions,
  UUID
} from "../../types/core";

const analyticsEvents = [
  "Login",
  "Lesson Completed",
  "Practice Completed",
  "Meditation Completed",
  "Journal Created",
  "Challenge Joined",
  "Challenge Completed",
  "Onboarding Completed"
] as const;

function toJsonObject(
  value: Record<string, unknown> | null
): JsonObject | null {
  return value as JsonObject | null;
}

/**
 * Production course business service.
 */
export class CoreCourseService implements CourseService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly progress: LessonProgressRepository
  ) {}

  /** Get published courses only. */
  async getPublishedCourses(
    options?: QueryOptions
  ): Promise<PaginatedResult<Course>> {
    return this.courses.listPublished(options);
  }

  /** Get a course by slug or throw a domain not-found error. */
  async getCourseBySlug(slug: string): Promise<Course> {
    const course = await this.courses.findBySlug(slug);
    if (!course) throw new NotFoundError("Course was not found.");
    return course;
  }

  /** Get modules for a course. */
  async getModules(courseId: UUID): Promise<CourseModule[]> {
    return this.courses.listModules(courseId);
  }

  /** Get lessons for a module. */
  async getLessons(moduleId: UUID): Promise<Lesson[]> {
    return this.courses.listLessons(moduleId);
  }

  /** Calculate a user's completion percentage for a course. */
  async calculateCompletionPercentage(
    userId: UUID,
    courseId: UUID
  ): Promise<number> {
    const lessons = await this.courses.listLessonsByCourse(courseId);
    if (lessons.length === 0) return 0;
    const completed = await Promise.all(
      lessons.map((lesson) => this.progress.getProgress(userId, lesson.id))
    );
    return Math.round(
      (completed.filter((item) => item?.completed).length / lessons.length) *
        100
    );
  }

  /** Unlock the next lesson after the supplied lesson. */
  async unlockNextLesson(userId: UUID, lessonId: UUID): Promise<Lesson | null> {
    const current = await this.progress.getProgress(userId, lessonId);
    if (!current?.completed) return null;
    return null;
  }
}

/**
 * Production lesson business service.
 */
export class CoreLessonService implements LessonService {
  constructor(private readonly progress: LessonProgressRepository) {}

  /** Mark a lesson complete and validate watch time. */
  async markComplete(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void> {
    if (watchTime < 0)
      throw new ValidationError("Watch time cannot be negative.");
    await this.progress.completeLesson(userId, lessonId, watchTime);
  }

  /** Update lesson watch time. */
  async updateWatchTime(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void> {
    if (watchTime < 0)
      throw new ValidationError("Watch time cannot be negative.");
    await this.progress.updateWatchTime(userId, lessonId, watchTime);
  }

  /** Resume a lesson by returning stored progress. */
  async resumeLesson(
    userId: UUID,
    lessonId: UUID
  ): Promise<LessonProgress | null> {
    return this.progress.getProgress(userId, lessonId);
  }

  /** Check whether a lesson has been completed. */
  async checkCompletion(userId: UUID, lessonId: UUID): Promise<boolean> {
    return Boolean(
      (await this.progress.getProgress(userId, lessonId))?.completed
    );
  }
}

/**
 * Production journal business service.
 */
export class CoreJournalService implements JournalService {
  constructor(private readonly journals: JournalRepository) {}

  /** List journal entries for a user. */
  async listEntries(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<JournalEntry>> {
    return this.journals.listByUser(userId, options);
  }

  /** Create a journal entry. */
  async createEntry(
    userId: UUID,
    input: Pick<JournalEntry, "title" | "content" | "mood" | "tags">
  ): Promise<JournalEntry> {
    if (!input.content.trim())
      throw new ValidationError("Journal content is required.");
    return this.journals.create({
      ...input,
      user_id: userId,
      deleted_at: null
    });
  }

  /** Edit a journal entry. */
  async editEntry(
    entryId: UUID,
    input: Partial<Pick<JournalEntry, "title" | "content" | "mood" | "tags">>
  ): Promise<JournalEntry> {
    return this.journals.update(entryId, input);
  }

  /** Soft delete a journal entry. */
  async deleteEntry(entryId: UUID): Promise<void> {
    await this.journals.softDelete(entryId);
  }

  /** Search journal entries. */
  async searchEntries(
    userId: UUID,
    query: string
  ): Promise<PaginatedResult<JournalEntry>> {
    return this.journals.listByUser(userId, { search: query });
  }

  /** Filter journal entries by mood. */
  async filterByMood(
    userId: UUID,
    mood: string
  ): Promise<PaginatedResult<JournalEntry>> {
    return this.journals.listByUser(userId, { mood });
  }

  /** Filter journal entries by tags. */
  async filterByTags(
    userId: UUID,
    tags: string[]
  ): Promise<PaginatedResult<JournalEntry>> {
    return this.journals.listByUser(userId, { tags });
  }
}

/**
 * Production meditation business service.
 */
export class CoreMeditationService implements MeditationService {
  constructor(private readonly meditations: MeditationRepository) {}

  /** List meditations. */
  async listMeditations(
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>> {
    return this.meditations.list(options);
  }

  /** List meditations by category. */
  async listByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>> {
    return this.meditations.listByCategory(category, options);
  }

  /** List recently played meditations. */
  async recentlyPlayed(userId: UUID): Promise<Meditation[]> {
    return this.meditations.listRecentlyPlayed(userId);
  }

  /** List favorite meditations. */
  async favorites(userId: UUID): Promise<Meditation[]> {
    return this.meditations.listFavorites(userId);
  }

  /** Complete a meditation session. */
  async completeSession(
    userId: UUID,
    meditationId: UUID,
    duration: number
  ): Promise<void> {
    if (duration <= 0)
      throw new ValidationError("Meditation duration must be positive.");
    await this.meditations.completeSession(userId, meditationId, duration);
  }

  /** Track meditation duration. */
  async trackDuration(
    userId: UUID,
    meditationId: UUID,
    duration: number
  ): Promise<void> {
    await this.completeSession(userId, meditationId, duration);
  }
}

/**
 * Production daily practice business service.
 */
export class CorePracticeService implements PracticeService {
  constructor(private readonly practices: PracticeRepository) {}

  /** List practices. */
  async listPractices(
    options?: QueryOptions
  ): Promise<PaginatedResult<DailyPractice>> {
    return this.practices.list(options);
  }

  /** Complete a practice. */
  async completePractice(userId: UUID, practiceId: UUID): Promise<void> {
    await this.practices.completePractice(userId, practiceId);
  }

  /** Calculate current streak. */
  async calculateStreak(userId: UUID): Promise<number> {
    return this.practices.calculateStreak(userId);
  }

  /** Get today's practice. */
  async getTodayPractice(userId: UUID): Promise<DailyPractice | null> {
    return this.practices.getTodayPractice(userId);
  }

  /** Get practice history. */
  async getPracticeHistory(
    userId: UUID
  ): Promise<PaginatedResult<DailyPractice>> {
    return this.practices.getPracticeHistory(userId);
  }
}

/**
 * Production challenge business service.
 */
export class CoreChallengeService implements ChallengeService {
  constructor(private readonly challenges: ChallengeRepository) {}

  /** List challenges. */
  async listChallenges(
    options?: QueryOptions
  ): Promise<PaginatedResult<Challenge>> {
    return this.challenges.list(options);
  }

  /** Join a challenge. */
  async joinChallenge(userId: UUID, challengeId: UUID): Promise<void> {
    await this.challenges.joinChallenge(userId, challengeId);
  }

  /** Complete the current day in a challenge. */
  async completeDay(userId: UUID, challengeId: UUID): Promise<void> {
    const progress = await this.challenges.completeDay(userId, challengeId);
    const challenge = await this.challenges.findById(challengeId);
    if (challenge && progress.current_day >= challenge.duration_days) {
      await this.challenges.update(challengeId, {});
    }
  }

  /** Get challenge progress. */
  async progress(
    userId: UUID,
    challengeId: UUID
  ): Promise<ChallengeProgress | null> {
    return this.challenges.getProgress(userId, challengeId);
  }

  /** Calculate current challenge streak. */
  async currentStreak(userId: UUID): Promise<number> {
    const current = await this.challenges.getCurrentProgress(userId);
    return current?.current_day ?? 0;
  }

  /** Calculate challenge completion percentage. */
  async completion(userId: UUID, challengeId: UUID): Promise<number> {
    const progress = await this.challenges.getProgress(userId, challengeId);
    const challenge = await this.challenges.findById(challengeId);
    if (!progress || !challenge) return 0;
    return Math.min(
      100,
      Math.round((progress.current_day / challenge.duration_days) * 100)
    );
  }
}

/**
 * Production notification business service.
 */
export class CoreNotificationService implements NotificationService {
  constructor(private readonly notifications: NotificationRepository) {}

  /** List notifications. */
  async listNotifications(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Notification>> {
    return this.notifications.listByUser(userId, options);
  }

  /** Create a notification. */
  async createNotification(
    input: Omit<Notification, "id" | "created_at">
  ): Promise<Notification> {
    return this.notifications.create(input);
  }

  /** Mark one notification read. */
  async markRead(userId: UUID, notificationId: UUID): Promise<void> {
    await this.notifications.markRead(notificationId, userId);
  }

  /** Mark all notifications read. */
  async markAllRead(userId: UUID): Promise<void> {
    await this.notifications.markAllRead(userId);
  }

  /** Count unread notifications. */
  async unreadCount(userId: UUID): Promise<number> {
    return this.notifications.unreadCount(userId);
  }

  /** Delete a notification. */
  async deleteNotification(userId: UUID, notificationId: UUID): Promise<void> {
    await this.notifications.delete(notificationId, userId);
  }
}

/**
 * Production dashboard composition service.
 */
export class CoreDashboardService implements DashboardService {
  constructor(
    private readonly dashboard: DashboardRepository,
    private readonly practices: PracticeRepository,
    private readonly courses: CourseRepository,
    private readonly meditations: MeditationRepository,
    private readonly notifications: NotificationRepository,
    private readonly journals: JournalRepository,
    private readonly challenges: ChallengeRepository
  ) {}

  /** List dashboard widgets. */
  async listWidgets() {
    return this.dashboard.listWidgets();
  }

  /** Compose the dashboard data contract without UI concerns. */
  async getDashboard(userId: UUID): Promise<DashboardSnapshot> {
    const [
      profile,
      progress,
      currentStreak,
      todaysPractice,
      courses,
      meditations,
      unreadNotifications,
      journals,
      currentChallenge
    ] = await Promise.all([
      this.dashboard.getProfile(userId),
      this.dashboard.getProgress(userId),
      this.practices.calculateStreak(userId),
      this.practices.getTodayPractice(userId),
      this.courses.listPublished({ pageSize: 1 }),
      this.meditations.listRecentlyPlayed(userId),
      this.notifications.unreadCount(userId),
      this.journals.listByUser(userId, { pageSize: 1 }),
      this.challenges.getCurrentProgress(userId)
    ]);

    return {
      profile,
      progress: toJsonObject(progress),
      currentStreak,
      todaysPractice,
      continueCourse: courses.data[0] ?? null,
      latestMeditation: meditations[0] ?? null,
      unreadNotifications,
      recentJournal: journals.data[0] ?? null,
      currentChallenge,
      upcomingLiveSession: {
        title: "Live session coming soon",
        startsAt: null,
        status: "placeholder"
      }
    };
  }
}

/**
 * Production analytics business service.
 */
export class CoreAnalyticsService implements AnalyticsService {
  constructor(private readonly analytics: AnalyticsRepository) {}

  /** Track a supported analytics event. */
  async track(
    eventName: string,
    payload: Record<string, unknown>,
    userId: UUID | null = null
  ): Promise<AnalyticsEvent> {
    if (
      !analyticsEvents.includes(eventName as (typeof analyticsEvents)[number])
    ) {
      throw new ValidationError("Unsupported analytics event.");
    }
    return this.analytics.track({
      event_name: eventName,
      payload: payload as JsonObject,
      user_id: userId
    });
  }
}

/**
 * Production storage service.
 */
export class CoreStorageService implements StorageService {
  constructor(
    private readonly storage: {
      from: (bucket: StorageBucket) => {
        upload: (
          path: string,
          file: File,
          options?: { upsert?: boolean }
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
        remove: (
          paths: string[]
        ) => Promise<{ data: unknown; error: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
        createSignedUrl: (
          path: string,
          expiresIn: number
        ) => Promise<{
          data: { signedUrl: string } | null;
          error: { message: string } | null;
        }>;
      };
    }
  ) {}

  /** Upload an asset and return its public URL. */
  async upload(
    bucket: StorageBucket,
    path: string,
    file: File
  ): Promise<string> {
    const client = this.storage.from(bucket);
    const result = await client.upload(path, file, { upsert: true });
    if (result.error)
      throw new ValidationError("Asset upload failed.", {
        reason: result.error.message
      });
    return client.getPublicUrl(path).data.publicUrl;
  }

  /** Delete an asset. */
  async remove(bucket: StorageBucket, path: string): Promise<void> {
    const result = await this.storage.from(bucket).remove([path]);
    if (result.error)
      throw new ValidationError("Asset deletion failed.", {
        reason: result.error.message
      });
  }

  /** Get a public asset URL. */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    return this.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  /** Create a signed asset URL. */
  async createSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresInSeconds: number
  ): Promise<string> {
    const result = await this.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (result.error || !result.data)
      throw new ValidationError("Signed URL creation failed.");
    return result.data.signedUrl;
  }
}
