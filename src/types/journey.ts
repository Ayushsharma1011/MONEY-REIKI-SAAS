import type { ISODateTime, TimestampedEntity, UUID } from "@/types/core";

export type JourneyDifficulty = "beginner" | "intermediate" | "advanced" | "custom";

export type JourneyUnlockType =
  | "sequential"
  | "date_based"
  | "manual"
  | "admin"
  | "conditional";

export type JourneyTaskType =
  | "lesson"
  | "practice"
  | "meditation"
  | "journal"
  | "wish_box"
  | "vision_board"
  | "affirmation"
  | "challenge"
  | "live_session";

export type JourneyDayStatus = "locked" | "available" | "in_progress" | "completed";

export type JourneyRewardType = "badge" | "achievement" | "daily" | "completion";

export type Journey = TimestampedEntity & {
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  difficulty: JourneyDifficulty;
  estimated_days: number;
  is_active: boolean;
};

export type JourneyDay = TimestampedEntity & {
  journey_id: UUID;
  day_number: number;
  title: string;
  description: string | null;
  estimated_minutes: number;
  reward_xp: number;
  unlock_type: JourneyUnlockType;
};

export type JourneyTask = TimestampedEntity & {
  journey_day_id: UUID;
  task_type: JourneyTaskType;
  title: string;
  description: string | null;
  course_id: UUID | null;
  module_id: UUID | null;
  lesson_id: UUID | null;
  practice_id: UUID | null;
  meditation_id: UUID | null;
  journal_prompt: string | null;
  wish_box_required: boolean;
  vision_board_required: boolean;
  affirmation_required: boolean;
  estimated_minutes: number;
  order_index: number;
};

export type UserJourneyProgress = {
  id: UUID;
  user_id: UUID;
  journey_id: UUID;
  current_day: number;
  current_task: UUID | null;
  completion_percentage: number;
  xp: number;
  total_practice_minutes: number;
  rewards_unlocked: string[];
  started_at: ISODateTime;
  completed_at: ISODateTime | null;
  updated_at: ISODateTime;
};

export type UserDayProgress = {
  id: UUID;
  user_id: UUID;
  journey_day_id: UUID;
  status: JourneyDayStatus;
  started_at: ISODateTime | null;
  completed_at: ISODateTime | null;
  reward_claimed: boolean;
  updated_at: ISODateTime;
};

export type UserTaskProgress = {
  id: UUID;
  user_id: UUID;
  task_id: UUID;
  completed: boolean;
  completed_at: ISODateTime | null;
  time_spent: number;
  updated_at: ISODateTime;
};

export type JourneyReward = {
  id: UUID;
  journey_id: UUID;
  reward_key: string;
  title: string;
  description: string | null;
  reward_type: JourneyRewardType;
  xp_threshold: number | null;
  day_number: number | null;
  created_at: ISODateTime;
};

export type JourneyProgress = {
  journey: Journey;
  userProgress: UserJourneyProgress;
  currentDay: JourneyDay | null;
  remainingTasks: number;
};

export type DailyMission = {
  journeyId: UUID;
  dayNumber: number;
  title: string;
  estimatedMinutes: number;
  lessonTask: JourneyTask | null;
  meditationTask: JourneyTask | null;
  practiceTask: JourneyTask | null;
  journalTask: JourneyTask | null;
  affirmationTask: JourneyTask | null;
  tasks: JourneyTask[];
  remainingTasks: number;
  completionPercentage: number;
  currentXp: number;
};

export type XpLevel = {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
};

export type JourneyEventName =
  | "JourneyStarted"
  | "TaskCompleted"
  | "DayCompleted"
  | "JourneyCompleted"
  | "XPAwarded"
  | "RewardUnlocked";

export type JourneyEvent = {
  name: JourneyEventName;
  userId: UUID;
  journeyId?: UUID;
  payload: Record<string, unknown>;
  createdAt: ISODateTime;
};
