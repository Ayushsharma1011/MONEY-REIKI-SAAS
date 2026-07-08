import type { LucideIcon } from "lucide-react";
import type { DashboardGreeting } from "@/features/dashboard/types";
import type { Affirmation } from "@/types/core";
import type { JourneyTaskType } from "@/types/journey";

export type JourneyTaskStatus = "locked" | "available" | "completed" | "current";

export type JourneyTaskViewModel = {
  id: string;
  taskType: JourneyTaskType;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  difficulty: string;
  status: JourneyTaskStatus;
  orderIndex: number;
};

export type JourneyRewardViewModel = {
  xp: number;
  badgeTitle: string;
  unlockMessage: string;
};

export type TomorrowPreviewViewModel = {
  dayNumber: number;
  estimatedMinutes: number;
  lockedTasksCount: number;
  unlockRequirement: string;
};

export type JourneySummaryViewModel = {
  tasksCompleted: number;
  totalTasks: number;
  timePracticedMinutes: number;
  xpEarned: number;
  currentLevel: number;
  rewardPreview: string;
};

export type DailyRitualViewModel = {
  greeting: DashboardGreeting;
  profile: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
  unreadNotifications: number;
  affirmation: Affirmation | string;
  hasActiveJourney: boolean;
  hasMission: boolean;
  activeJourneyId: string | null;
  journey: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
  } | null;
  dailyMission: {
    dayNumber: number;
    title: string;
    estimatedMinutes: number;
    completionPercentage: number;
    remainingTasks: number;
    rewardXp: number;
  } | null;
  tasks: JourneyTaskViewModel[];
  progress: {
    journeyCompletionPercent: number;
    todayCompletionPercent: number;
    xpEarnedToday: number;
    remainingTasks: number;
    currentStreak: number;
    currentLevel: number;
    currentXp: number;
    levelProgress: number;
    timePracticedMinutes: number;
  };
  reward: JourneyRewardViewModel | null;
  tomorrow: TomorrowPreviewViewModel | null;
  dayCompleted: boolean;
  summary: JourneySummaryViewModel;
};

export type JourneyTaskMeta = {
  icon: LucideIcon;
  label: string;
  difficulty: string;
};
