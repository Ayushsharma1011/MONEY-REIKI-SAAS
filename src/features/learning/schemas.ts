import { z } from "zod";

const uuidSchema = z.string().uuid();
const nonEmptyString = z.string().trim().min(1);

export const learningPathLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "custom"
]);

export const videoProviderNameSchema = z.enum([
  "mux",
  "cloudflare_stream",
  "vimeo",
  "bunny",
  "supabase_storage",
  "s3"
]);

export const lessonResourceTypeSchema = z.enum([
  "pdf",
  "zip",
  "image",
  "link",
  "external"
]);

export const courseCategorySchema = z.object({
  name: nonEmptyString.max(120),
  slug: nonEmptyString.max(160),
  icon: z.string().max(120).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  color: z.string().max(32).nullable().optional(),
  order_index: z.number().int().min(0).default(0)
});

export const bookmarkSchema = z.object({
  user_id: uuidSchema,
  lesson_id: uuidSchema,
  timestamp_seconds: z.number().int().min(0),
  note: z.string().max(500).nullable().optional()
});

export const lessonNoteSchema = z.object({
  user_id: uuidSchema,
  lesson_id: uuidSchema,
  content: nonEmptyString.max(5000)
});

export const lessonResumeSchema = z.object({
  user_id: uuidSchema,
  lesson_id: uuidSchema,
  last_position_seconds: z.number().int().min(0),
  duration_watched: z.number().int().min(0),
  completed: z.boolean(),
  playback_speed: z.number().positive().max(4),
  last_opened_at: z.string().datetime().optional()
});

export const learningPathSchema = z.object({
  title: nonEmptyString.max(160),
  slug: nonEmptyString.max(180),
  description: z.string().max(2000).nullable().optional(),
  level: learningPathLevelSchema,
  order_index: z.number().int().min(0).default(0)
});

export const favoriteCourseSchema = z.object({
  user_id: uuidSchema,
  course_id: uuidSchema
});

export const recentCourseSchema = z.object({
  user_id: uuidSchema,
  course_id: uuidSchema,
  last_lesson_id: uuidSchema.nullable().optional()
});

export const videoPlaybackRequestSchema = z.object({
  lessonId: uuidSchema,
  provider: videoProviderNameSchema,
  assetId: nonEmptyString.max(255),
  playbackId: z.string().max(255).nullable().optional()
});

export type CourseCategoryInput = z.infer<typeof courseCategorySchema>;
export type BookmarkInput = z.infer<typeof bookmarkSchema>;
export type LessonNoteInput = z.infer<typeof lessonNoteSchema>;
export type LessonResumeInput = z.infer<typeof lessonResumeSchema>;
export type LearningPathInput = z.infer<typeof learningPathSchema>;
export type FavoriteCourseInput = z.infer<typeof favoriteCourseSchema>;
export type RecentCourseInput = z.infer<typeof recentCourseSchema>;
