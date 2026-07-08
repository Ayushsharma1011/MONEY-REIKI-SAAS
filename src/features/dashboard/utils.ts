import {
  DAILY_QUOTES,
  FALLBACK_AFFIRMATIONS,
  JOURNAL_PROMPTS,
  QUICK_ACTIONS
} from "@/features/dashboard/constants";
import type {
  DashboardAchievement,
  DashboardGreeting,
  DashboardStreakStats,
  DashboardViewModel
} from "@/features/dashboard/types";
import type { DashboardSnapshot } from "@/types/core";

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "Student";
}

export function getTimeGreeting(date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export function formatTodayDate(date = new Date(), timeZone?: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone
  }).format(date);
}

export function getDailyQuote(date = new Date()): string {
  const index = date.getDate() % DAILY_QUOTES.length;
  return DAILY_QUOTES[index] ?? DAILY_QUOTES[0];
}

export function getJournalPrompt(date = new Date()): string {
  const index = date.getDate() % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[index] ?? JOURNAL_PROMPTS[0];
}

export function getFallbackAffirmation(date = new Date()): string {
  const index = date.getDate() % FALLBACK_AFFIRMATIONS.length;
  return FALLBACK_AFFIRMATIONS[index] ?? FALLBACK_AFFIRMATIONS[0];
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buildStreakStats(snapshot: DashboardSnapshot): DashboardStreakStats {
  const progress = snapshot.progress;
  const meditationMinutes = readNumber(progress?.meditation_minutes);
  const journalEntries = readNumber(progress?.journal_entries);
  const longestStreak = readNumber(progress?.longest_streak, snapshot.currentStreak);
  const xp =
    snapshot.currentStreak * 25 +
    meditationMinutes * 2 +
    journalEntries * 10 +
    (snapshot.currentChallenge?.current_day ?? 0) * 15;

  return {
    currentStreak: snapshot.currentStreak,
    longestStreak: Math.max(longestStreak, snapshot.currentStreak),
    practiceMinutes: meditationMinutes,
    xp
  };
}

export function buildAchievement(snapshot: DashboardSnapshot): DashboardAchievement {
  const streak = buildStreakStats(snapshot);
  const recentBadge =
    streak.currentStreak >= 7
      ? "7-Day Streak"
      : streak.currentStreak >= 3
        ? "Momentum Builder"
        : "Getting Started";

  const nextBadge = streak.currentStreak >= 7 ? "30-Day Master" : "7-Day Streak";
  const nextBadgeProgress =
    streak.currentStreak >= 7
      ? Math.min(100, Math.round((streak.currentStreak / 30) * 100))
      : Math.min(100, Math.round((streak.currentStreak / 7) * 100));

  return {
    recentBadge,
    xp: streak.xp,
    nextBadge,
    nextBadgeProgress
  };
}

export function buildGreeting(
  snapshot: DashboardSnapshot,
  timeZone?: string
): DashboardGreeting {
  const now = new Date();
  const fullName = snapshot.profile?.full_name ?? "Student";

  return {
    label: getTimeGreeting(now),
    firstName: getFirstName(fullName),
    quote: getDailyQuote(now),
    dateLabel: formatTodayDate(now, timeZone)
  };
}

export function mapSnapshotToViewModel(
  snapshot: DashboardSnapshot,
  courseCompletionPercent = 0,
  timeZone?: string
): DashboardViewModel {
  const streak = buildStreakStats(snapshot);

  return {
    greeting: buildGreeting(snapshot, timeZone),
    todaysPractice: snapshot.todaysPractice,
    streak,
    course: {
      course: snapshot.continueCourse,
      moduleTitle: snapshot.continueCourse ? "Current Module" : null,
      lessonTitle: snapshot.continueCourse ? "Continue where you left off" : null,
      completionPercent: courseCompletionPercent
    },
    journalPrompt: getJournalPrompt(),
    recentJournal: snapshot.recentJournal,
    meditation: snapshot.latestMeditation,
    wishBox: snapshot.activeWish,
    affirmation: snapshot.dailyAffirmation ?? getFallbackAffirmation(),
    liveSession:
      snapshot.upcomingLiveSession?.status === "scheduled" &&
      snapshot.upcomingLiveSession.startsAt
        ? {
            title: snapshot.upcomingLiveSession.title,
            facilitator: snapshot.upcomingLiveSession.facilitator ?? "Facilitator",
            startsAt: snapshot.upcomingLiveSession.startsAt
          }
        : null,
    achievement: buildAchievement(snapshot),
    unreadNotifications: snapshot.unreadNotifications,
    profile: snapshot.profile
      ? {
          id: snapshot.profile.id,
          fullName: snapshot.profile.full_name,
          avatarUrl: snapshot.profile.avatar_url
        }
      : null,
    quickActions: QUICK_ACTIONS
  };
}
