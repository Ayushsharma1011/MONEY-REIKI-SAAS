import type { ISODateTime, TimestampedEntity, UUID } from "@/types/core";

export type LearningPathLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "custom";

export type VideoProviderName =
  | "mux"
  | "cloudflare_stream"
  | "vimeo"
  | "bunny"
  | "supabase_storage"
  | "s3";

export type LessonResourceType = "pdf" | "zip" | "image" | "link" | "external";

export type CourseCategory = {
  id: UUID;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  color: string | null;
  order_index: number;
  created_at: ISODateTime;
  updated_at: ISODateTime;
};

export type CourseTag = {
  id: UUID;
  name: string;
  slug: string;
  created_at: ISODateTime;
};

export type CourseInstructor = TimestampedEntity & {
  course_id: UUID;
  instructor_name: string;
  instructor_bio: string | null;
  instructor_avatar_url: string | null;
  order_index: number;
};

export type CoursePrerequisite = {
  id: UUID;
  course_id: UUID;
  prerequisite_course_id: UUID;
  created_at: ISODateTime;
};

export type FavoriteCourse = {
  id: UUID;
  user_id: UUID;
  course_id: UUID;
  created_at: ISODateTime;
};

export type RecentCourse = {
  id: UUID;
  user_id: UUID;
  course_id: UUID;
  last_lesson_id: UUID | null;
  viewed_at: ISODateTime;
};

export type CourseReviewPlaceholder = TimestampedEntity & {
  user_id: UUID;
  course_id: UUID;
  rating: number | null;
  review_text: string | null;
};

export type LessonNote = TimestampedEntity & {
  user_id: UUID;
  lesson_id: UUID;
  content: string;
};

export type Bookmark = TimestampedEntity & {
  user_id: UUID;
  lesson_id: UUID;
  timestamp_seconds: number;
  note: string | null;
};

export type LessonResume = TimestampedEntity & {
  user_id: UUID;
  lesson_id: UUID;
  last_position_seconds: number;
  duration_watched: number;
  completed: boolean;
  playback_speed: number;
  last_opened_at: ISODateTime;
};

export type LessonResource = TimestampedEntity & {
  lesson_id: UUID;
  title: string;
  resource_type: LessonResourceType;
  url: string | null;
  file_path: string | null;
  mime_type: string | null;
  order_index: number;
};

export type LessonDownload = {
  id: UUID;
  user_id: UUID;
  lesson_id: UUID;
  resource_id: UUID | null;
  file_type: string;
  downloaded_at: ISODateTime;
  created_at: ISODateTime;
};

export type LearningPath = TimestampedEntity & {
  title: string;
  slug: string;
  description: string | null;
  level: LearningPathLevel;
  order_index: number;
  deleted_at?: ISODateTime | null;
};

export type LearningPathCourse = {
  id: UUID;
  learning_path_id: UUID;
  course_id: UUID;
  order_index: number;
  created_at: ISODateTime;
};

export type UserLearningPath = TimestampedEntity & {
  user_id: UUID;
  learning_path_id: UUID;
  current_course_id: UUID | null;
  started_at: ISODateTime;
  completed_at: ISODateTime | null;
  progress_percent: number;
};

export type LessonVideoAsset = TimestampedEntity & {
  lesson_id: UUID;
  provider: VideoProviderName;
  provider_asset_id: string;
  playback_id: string | null;
};

export type VideoPlaybackRequest = {
  lessonId: UUID;
  provider: VideoProviderName;
  assetId: string;
  playbackId?: string | null;
};

export type VideoPlaybackResult = {
  url: string;
  provider: VideoProviderName;
  expiresAt?: ISODateTime | null;
  token?: string | null;
};

export type VideoProvider = {
  readonly name: VideoProviderName;
  validateAsset(assetId: string): boolean;
  getPlaybackUrl(request: VideoPlaybackRequest): Promise<VideoPlaybackResult>;
  getSignedUrl(request: VideoPlaybackRequest, expiresInSeconds: number): Promise<string>;
  getPlaybackToken?(request: VideoPlaybackRequest): Promise<string | null>;
};
