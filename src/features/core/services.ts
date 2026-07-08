import type {
  AnalyticsEvent,
  Challenge,
  Course,
  DailyPractice,
  DashboardWidget,
  JournalEntry,
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
  getCourseBySlug(slug: string): Promise<Course>;
  listCourses(options?: QueryOptions): Promise<PaginatedResult<Course>>;
  completeLesson(lessonId: UUID, watchTime: number): Promise<void>;
}

export interface JournalService {
  listEntries(options?: QueryOptions): Promise<PaginatedResult<JournalEntry>>;
  createEntry(
    input: Pick<JournalEntry, "title" | "content" | "mood" | "tags">
  ): Promise<JournalEntry>;
}

export interface MeditationService {
  listMeditations(options?: QueryOptions): Promise<PaginatedResult<Meditation>>;
  listByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<Meditation>>;
}

export interface PracticeService {
  listPractices(
    options?: QueryOptions
  ): Promise<PaginatedResult<DailyPractice>>;
  completePractice(practiceId: UUID): Promise<void>;
}

export interface DashboardService {
  listWidgets(): Promise<DashboardWidget[]>;
}

export interface NotificationService {
  listNotifications(
    options?: QueryOptions
  ): Promise<PaginatedResult<Notification>>;
  markRead(notificationId: UUID): Promise<void>;
}

export interface ChallengeService {
  listChallenges(options?: QueryOptions): Promise<PaginatedResult<Challenge>>;
  startChallenge(challengeId: UUID): Promise<void>;
  completeCurrentDay(challengeId: UUID): Promise<void>;
}

export interface AnalyticsService {
  track(
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<AnalyticsEvent>;
}

export interface StorageService {
  upload(bucket: StorageBucket, path: string, file: File): Promise<string>;
  remove(bucket: StorageBucket, path: string): Promise<void>;
  getPublicUrl(bucket: StorageBucket, path: string): string;
}
