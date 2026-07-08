import { z } from "zod";

const uuidSchema = z.string().uuid();
const nonEmptyString = z.string().trim().min(1);

export const journeyDifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "custom"
]);

export const journeyUnlockTypeSchema = z.enum([
  "sequential",
  "date_based",
  "manual",
  "admin",
  "conditional"
]);

export const journeyTaskTypeSchema = z.enum([
  "lesson",
  "practice",
  "meditation",
  "journal",
  "wish_box",
  "vision_board",
  "affirmation",
  "challenge",
  "live_session"
]);

export const journeyDayStatusSchema = z.enum([
  "locked",
  "available",
  "in_progress",
  "completed"
]);

export const journeyRewardTypeSchema = z.enum([
  "badge",
  "achievement",
  "daily",
  "completion"
]);

export const journeySchema = z.object({
  title: nonEmptyString.max(160),
  slug: nonEmptyString.max(180),
  description: z.string().max(2000).nullable().optional(),
  cover_image: z.string().url().nullable().optional(),
  difficulty: journeyDifficultySchema,
  estimated_days: z.number().int().min(0),
  is_active: z.boolean().default(false)
});

export const journeyDaySchema = z.object({
  journey_id: uuidSchema,
  day_number: z.number().int().positive(),
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  estimated_minutes: z.number().int().min(0).default(0),
  reward_xp: z.number().int().min(0).default(0),
  unlock_type: journeyUnlockTypeSchema.default("sequential")
});

export const journeyTaskSchema = z.object({
  journey_day_id: uuidSchema,
  task_type: journeyTaskTypeSchema,
  title: nonEmptyString.max(160),
  description: z.string().max(1000).nullable().optional(),
  course_id: uuidSchema.nullable().optional(),
  module_id: uuidSchema.nullable().optional(),
  lesson_id: uuidSchema.nullable().optional(),
  practice_id: uuidSchema.nullable().optional(),
  meditation_id: uuidSchema.nullable().optional(),
  journal_prompt: z.string().max(500).nullable().optional(),
  wish_box_required: z.boolean().default(false),
  vision_board_required: z.boolean().default(false),
  affirmation_required: z.boolean().default(false),
  estimated_minutes: z.number().int().min(0).default(0),
  order_index: z.number().int().min(0).default(0)
});

export const xpAwardSchema = z.object({
  userId: uuidSchema,
  journeyId: uuidSchema,
  amount: z.number().int().positive(),
  reason: nonEmptyString.max(120)
});

export const rewardUnlockSchema = z.object({
  userId: uuidSchema,
  journeyId: uuidSchema,
  rewardKey: nonEmptyString.max(120)
});

export const missionQuerySchema = z.object({
  userId: uuidSchema,
  journeyId: uuidSchema.optional()
});

export type JourneyInput = z.infer<typeof journeySchema>;
export type JourneyDayInput = z.infer<typeof journeyDaySchema>;
export type JourneyTaskInput = z.infer<typeof journeyTaskSchema>;
