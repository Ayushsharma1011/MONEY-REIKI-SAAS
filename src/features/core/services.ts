import type {
  AnalyticsEvent,
  Challenge,
  ChallengeProgress,
  Course,
  CourseModule,
  DailyPractice,
  DashboardSnapshot,
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

export type StorageBucket =
  | "avatars"
  | "course-thumbnails"
  | "lesson-assets"
  | "journal-images"
  | "vision-board"
  | "wish-box"
  | "certificates";

export interface CourseService {
  getPublishedCourses(options?: QueryOptions): Promise<PaginatedResult<Course>>;
  getCourseBySlug(slug: string): Promise<Course>;
  getModules(courseId: UUID): Promise<CourseModule[]>;
  getLessons(moduleId: UUID): Promise<Lesson[]>;
  calculateCompletionPercentage(userId: UUID, courseId: UUID): Promise<number>;
  unlockNextLesson(userId: UUID, lessonId: UUID): Promise<Lesson | null>;
}

export interface LessonService {
  markComplete(userId: UUID, lessonId: UUID, watchTime: number): Promise<void>;
  updateWatchTime(
    userId: UUID,
    lessonId: UUID,
    watchTime: number
  ): Promise<void>;
  resumeLesson(userId: UUID, lessonId: UUID): Promise<LessonProgress | null>;
  checkCompletion(userId: UUID, lessonId: UUID): Promise<boolean>;
}

export interface JournalService {
  listEntries(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<JournalEntry>>;
  createEntry(
    userId: UUID,
    input: Pick<JournalEntry, "title" | "content" | "mood" | "tags">
  ): Promise<JournalEntry>;
  editEntry(
    entryId: UUID,
    input: Partial<Pick<JournalEntry, "title" | "content" | "mood" | "tags">>
  ): Promise<JournalEntry>;
  deleteEntry(entryId: UUID): Promise<void>;
  searchEntries(
    userId: UUID,
    query: string
  ): Promise<PaginatedResult<JournalEntry>>;
  filterByMood(
    userId: UUID,
    mood: string
  ): Promise<PaginatedResult<JournalEntry>>;
  filterByTags(
    userId: UUID,
    tags: string[]
  ): Promise<PaginatedResult<JournalEntry>>;
}

export interface MeditationService {
  listMeditations(options?: QueryOptions): Promise<PaginatedResult<Meditation>>;
  listByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>>;
  recentlyPlayed(userId: UUID): Promise<Meditation[]>;
  favorites(userId: UUID): Promise<Meditation[]>;
  completeSession(
    userId: UUID,
    meditationId: UUID,
    duration: number
  ): Promise<void>;
  trackDuration(
    userId: UUID,
    meditationId: UUID,
    duration: number
  ): Promise<void>;
}

export interface PracticeService {
  listPractices(
    options?: QueryOptions
  ): Promise<PaginatedResult<DailyPractice>>;
  completePractice(userId: UUID, practiceId: UUID): Promise<void>;
  calculateStreak(userId: UUID): Promise<number>;
  getTodayPractice(userId: UUID): Promise<DailyPractice | null>;
  getPracticeHistory(userId: UUID): Promise<PaginatedResult<DailyPractice>>;
}

export interface ChallengeService {
  listChallenges(options?: QueryOptions): Promise<PaginatedResult<Challenge>>;
  joinChallenge(userId: UUID, challengeId: UUID): Promise<void>;
  completeDay(userId: UUID, challengeId: UUID): Promise<void>;
  progress(userId: UUID, challengeId: UUID): Promise<ChallengeProgress | null>;
  currentStreak(userId: UUID): Promise<number>;
  completion(userId: UUID, challengeId: UUID): Promise<number>;
}

export interface NotificationService {
  listNotifications(
    userId: UUID,
    options?: QueryOptions
  ): Promise<PaginatedResult<Notification>>;
  createNotification(
    input: Omit<Notification, "id" | "created_at">
  ): Promise<Notification>;
  markRead(userId: UUID, notificationId: UUID): Promise<void>;
  markAllRead(userId: UUID): Promise<void>;
  unreadCount(userId: UUID): Promise<number>;
  deleteNotification(userId: UUID, notificationId: UUID): Promise<void>;
}

export interface DashboardService {
  listWidgets(): Promise<DashboardWidget[]>;
  getDashboard(userId: UUID): Promise<DashboardSnapshot>;
}

export interface AnalyticsService {
  track(
    eventName: string,
    payload: Record<string, unknown>,
    userId?: UUID
  ): Promise<AnalyticsEvent>;
}

export interface StorageService {
  upload(bucket: StorageBucket, path: string, file: File): Promise<string>;
  remove(bucket: StorageBucket, path: string): Promise<void>;
  getPublicUrl(bucket: StorageBucket, path: string): string;
  createSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresInSeconds: number
  ): Promise<string>;
}
