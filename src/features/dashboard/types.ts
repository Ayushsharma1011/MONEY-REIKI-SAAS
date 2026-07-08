import type { LucideIcon } from "lucide-react";
import type {
  Affirmation,
  Course,
  DailyPractice,
  JournalEntry,
  Meditation,
  WishBoxItem
} from "@/types/core";

export type DashboardGreeting = {
  label: string;
  firstName: string;
  quote: string;
  dateLabel: string;
};

export type DashboardStreakStats = {
  currentStreak: number;
  longestStreak: number;
  practiceMinutes: number;
  xp: number;
};

export type DashboardCourseProgress = {
  course: Course | null;
  moduleTitle: string | null;
  lessonTitle: string | null;
  completionPercent: number;
};

export type DashboardAchievement = {
  recentBadge: string;
  xp: number;
  nextBadge: string;
  nextBadgeProgress: number;
};

export type DashboardLiveSession = {
  title: string;
  facilitator: string;
  startsAt: string;
};

export type DashboardViewModel = {
  greeting: DashboardGreeting;
  todaysPractice: DailyPractice | null;
  streak: DashboardStreakStats;
  course: DashboardCourseProgress;
  journalPrompt: string;
  recentJournal: JournalEntry | null;
  meditation: Meditation | null;
  wishBox: WishBoxItem | null;
  affirmation: Affirmation | string;
  liveSession: DashboardLiveSession | null;
  achievement: DashboardAchievement;
  unreadNotifications: number;
  profile: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
  quickActions: Array<{
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
  }>;
};
