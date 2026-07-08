import { z } from "zod";

const uuidSchema = z.string().uuid();
const nonEmptyString = z.string().trim().min(1);

export const courseSchema = z.object({
  title: nonEmptyString.max(160),
  slug: nonEmptyString.max(180),
  description: z.string().max(2000).nullable().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  level: nonEmptyString,
  duration_minutes: z.number().int().min(0),
  is_published: z.boolean(),
  created_by: uuidSchema.nullable().optional()
});

export const courseModuleSchema = z.object({
  course_id: uuidSchema,
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  order_index: z.number().int().min(0)
});

export const lessonSchema = z.object({
  module_id: uuidSchema,
  title: nonEmptyString.max(160),
  slug: nonEmptyString.max(180),
  description: z.string().max(2000).nullable().optional(),
  video_url: z.string().url().nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  duration: z.number().int().min(0),
  lesson_type: nonEmptyString,
  order_index: z.number().int().min(0),
  is_preview: z.boolean()
});

export const lessonProgressSchema = z.object({
  user_id: uuidSchema,
  lesson_id: uuidSchema,
  completed: z.boolean(),
  watch_time: z.number().int().min(0),
  completed_at: z.string().datetime().nullable().optional()
});

export const journalEntrySchema = z.object({
  user_id: uuidSchema,
  title: nonEmptyString.max(180),
  content: nonEmptyString,
  mood: z.string().max(60).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20)
});

export const gratitudeEntrySchema = z.object({
  user_id: uuidSchema,
  content: nonEmptyString.max(1000)
});

export const wishBoxItemSchema = z.object({
  user_id: uuidSchema,
  title: nonEmptyString.max(180),
  description: z.string().max(1000).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  status: nonEmptyString,
  target_date: z.string().date().nullable().optional()
});

export const visionBoardItemSchema = z.object({
  user_id: uuidSchema,
  title: nonEmptyString.max(180),
  image_url: z.string().url(),
  notes: z.string().max(1000).nullable().optional(),
  position: z.object({ x: z.number(), y: z.number() })
});

export const meditationSchema = z.object({
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  audio_url: z.string().url(),
  thumbnail: z.string().url().nullable().optional(),
  duration: z.number().int().min(0),
  category: nonEmptyString
});

export const dailyPracticeSchema = z.object({
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  estimated_minutes: z.number().int().positive(),
  difficulty: nonEmptyString,
  practice_type: nonEmptyString
});

export const userDailyPracticeSchema = z.object({
  user_id: uuidSchema,
  practice_id: uuidSchema,
  completed: z.boolean(),
  completed_at: z.string().datetime().nullable().optional()
});

export const affirmationSchema = z.object({
  title: nonEmptyString.max(160),
  content: nonEmptyString.max(1000),
  category: nonEmptyString,
  language: nonEmptyString
});

export const challengeSchema = z.object({
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  duration_days: z.number().int().positive(),
  difficulty: nonEmptyString
});

export const challengeProgressSchema = z.object({
  challenge_id: uuidSchema,
  user_id: uuidSchema,
  current_day: z.number().int().positive(),
  completed: z.boolean(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().nullable().optional()
});

export const notificationSchema = z.object({
  user_id: uuidSchema,
  title: nonEmptyString.max(160),
  message: nonEmptyString.max(1000),
  type: nonEmptyString,
  read: z.boolean()
});

export const dashboardWidgetSchema = z.object({
  widget_key: nonEmptyString.max(120),
  title: nonEmptyString.max(160),
  enabled: z.boolean(),
  order_index: z.number().int().min(0)
});

export const analyticsEventSchema = z.object({
  user_id: uuidSchema.nullable().optional(),
  event_name: nonEmptyString.max(160),
  payload: z.record(z.unknown())
});

export type CourseInput = z.infer<typeof courseSchema>;
export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
