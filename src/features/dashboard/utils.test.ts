import { describe, expect, it } from "vitest";
import type { DashboardSnapshot } from "@/types/core";
import {
  buildAchievement,
  buildGreeting,
  buildStreakStats,
  getJournalPrompt,
  getTimeGreeting,
  mapSnapshotToViewModel
} from "@/features/dashboard/utils";

const baseSnapshot: DashboardSnapshot = {
  profile: {
    id: "user-1",
    full_name: "Ayush Kumar",
    avatar_url: null,
    onboarding_completed: true
  },
  progress: {
    meditation_minutes: 20,
    journal_entries: 3,
    streak: 5,
    longest_streak: 8
  },
  currentStreak: 5,
  todaysPractice: null,
  continueCourse: null,
  latestMeditation: null,
  unreadNotifications: 2,
  recentJournal: null,
  currentChallenge: null,
  activeWish: null,
  dailyAffirmation: null,
  upcomingLiveSession: null,
  todaysJourney: null
};

describe("dashboard utils", () => {
  it("returns time-based greetings", () => {
    expect(getTimeGreeting(new Date("2026-07-08T09:00:00"))).toBe("Good Morning");
    expect(getTimeGreeting(new Date("2026-07-08T14:00:00"))).toBe("Good Afternoon");
    expect(getTimeGreeting(new Date("2026-07-08T19:00:00"))).toBe("Good Evening");
  });

  it("builds greeting with first name and quote", () => {
    const greeting = buildGreeting(baseSnapshot);
    expect(greeting.firstName).toBe("Ayush");
    expect(greeting.label).toMatch(/Good/);
    expect(greeting.quote.length).toBeGreaterThan(0);
  });

  it("calculates streak stats and xp", () => {
    const streak = buildStreakStats(baseSnapshot);
    expect(streak.currentStreak).toBe(5);
    expect(streak.longestStreak).toBe(8);
    expect(streak.practiceMinutes).toBe(20);
    expect(streak.xp).toBeGreaterThan(0);
  });

  it("maps snapshot into dashboard view model", () => {
    const viewModel = mapSnapshotToViewModel(baseSnapshot, 42);
    expect(viewModel.greeting.firstName).toBe("Ayush");
    expect(viewModel.course.completionPercent).toBe(42);
    expect(viewModel.journalPrompt).toBe(getJournalPrompt());
    expect(viewModel.quickActions.length).toBeGreaterThan(0);
    expect(viewModel.unreadNotifications).toBe(2);
  });

  it("derives achievement progress", () => {
    const achievement = buildAchievement(baseSnapshot);
    expect(achievement.recentBadge).toBe("Momentum Builder");
    expect(achievement.nextBadge).toBe("7-Day Streak");
  });
});
