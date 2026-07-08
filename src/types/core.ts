export type UUID = string;
export type ISODateTime = string;
export type JsonValue =
  string | number | boolean | null | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type TimestampedEntity = {
  id: UUID;
  created_at: ISODateTime;
  updated_at: ISODateTime;
  deleted_at?: ISODateTime | null;
};

export type Course = TimestampedEntity & {
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  cover_image: string | null;
  level: string;
  duration_minutes: number;
  is_published: boolean;
  created_by: UUID | null;
};

export type CourseModule = TimestampedEntity & {
  course_id: UUID;
  title: string;
  description: string | null;
  order_index: number;
};

export type Lesson = TimestampedEntity & {
  module_id: UUID;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  thumbnail: string | null;
  duration: number;
  lesson_type: string;
  order_index: number;
  is_preview: boolean;
};

export type LessonProgress = TimestampedEntity & {
  user_id: UUID;
  lesson_id: UUID;
  completed: boolean;
  watch_time: number;
  completed_at: ISODateTime | null;
};

export type JournalEntry = TimestampedEntity & {
  user_id: UUID;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
};

export type GratitudeEntry = Omit<TimestampedEntity, "updated_at"> & {
  user_id: UUID;
  content: string;
};

export type WishBoxItem = TimestampedEntity & {
  user_id: UUID;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  target_date: string | null;
};

export type VisionBoardItem = TimestampedEntity & {
  user_id: UUID;
  title: string;
  image_url: string;
  notes: string | null;
  position: JsonObject;
};

export type Meditation = TimestampedEntity & {
  title: string;
  description: string | null;
  audio_url: string;
  thumbnail: string | null;
  duration: number;
  category: string;
};

export type DailyPractice = TimestampedEntity & {
  title: string;
  description: string | null;
  estimated_minutes: number;
  difficulty: string;
  practice_type: string;
};

export type UserDailyPractice = Omit<TimestampedEntity, "updated_at"> & {
  user_id: UUID;
  practice_id: UUID;
  completed: boolean;
  completed_at: ISODateTime | null;
};

export type Affirmation = Omit<TimestampedEntity, "updated_at"> & {
  title: string;
  content: string;
  category: string;
  language: string;
};

export type Challenge = TimestampedEntity & {
  title: string;
  description: string | null;
  duration_days: number;
  difficulty: string;
};

export type ChallengeProgress = {
  id: UUID;
  challenge_id: UUID;
  user_id: UUID;
  current_day: number;
  completed: boolean;
  started_at: ISODateTime;
  completed_at: ISODateTime | null;
};

export type Notification = {
  id: UUID;
  user_id: UUID;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: ISODateTime;
  deleted_at?: ISODateTime | null;
};

export type DashboardWidget = {
  id: UUID;
  widget_key: string;
  title: string;
  enabled: boolean;
  order_index: number;
  created_at: ISODateTime;
};

export type AnalyticsEvent = {
  id: UUID;
  user_id: UUID | null;
  event_name: string;
  payload: JsonObject;
  created_at: ISODateTime;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type QueryOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  mood?: string;
  tags?: string[];
};

export type DashboardSnapshot = {
  profile: {
    id: UUID;
    full_name: string;
    avatar_url: string | null;
    onboarding_completed: boolean;
  } | null;
  progress: JsonObject | null;
  currentStreak: number;
  todaysPractice: DailyPractice | null;
  continueCourse: Course | null;
  latestMeditation: Meditation | null;
  unreadNotifications: number;
  recentJournal: JournalEntry | null;
  currentChallenge: ChallengeProgress | null;
  upcomingLiveSession: {
    title: string;
    startsAt: ISODateTime | null;
    status: "placeholder";
  };
};
