import { describe, expect, it, vi } from "vitest";
import type { DashboardSnapshot } from "@/types/core";
import type { JourneyTask } from "@/types/journey";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

vi.mock("@/features/dashboard/service", () => ({
  createDashboardServices: vi.fn()
}));

const sampleTask: JourneyTask = {
  id: "task-1",
  journey_day_id: "day-1",
  task_type: "practice",
  title: "Daily Practice",
  description: null,
  course_id: null,
  module_id: null,
  lesson_id: null,
  practice_id: null,
  meditation_id: null,
  journal_prompt: null,
  wish_box_required: false,
  vision_board_required: false,
  affirmation_required: false,
  estimated_minutes: 7,
  order_index: 0,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

describe("dailyRitualQuery", () => {
  it("composes daily ritual data through services", async () => {
    const snapshot: DashboardSnapshot = {
      profile: {
        id: "user-1",
        full_name: "Ayush Kumar",
        avatar_url: null,
        onboarding_completed: true
      },
      progress: null,
      currentStreak: 3,
      todaysPractice: null,
      continueCourse: null,
      latestMeditation: null,
      unreadNotifications: 1,
      recentJournal: null,
      currentChallenge: null,
      activeWish: null,
      dailyAffirmation: null,
      upcomingLiveSession: null,
      todaysJourney: {
        journey: {
          id: "journey-1",
          title: "Abundance Path",
          slug: "abundance-path",
          difficulty: "beginner"
        },
        dailyMission: {
          dayNumber: 1,
          title: "Day 1: Foundation",
          estimatedMinutes: 20,
          remainingTasks: 1,
          completionPercentage: 50,
          currentXp: 25
        },
        currentDay: 1,
        currentXp: 25,
        completionPercentage: 10,
        remainingTasks: 1
      }
    };

    const { createDashboardServices } = await import("@/features/dashboard/service");
    vi.mocked(createDashboardServices).mockReturnValue({
      dashboard: {
        getDashboard: vi.fn().mockResolvedValue(snapshot)
      },
      journey: {
        dailyMission: {
          generateTodaysMission: vi.fn().mockResolvedValue({
            journeyId: "journey-1",
            dayNumber: 1,
            title: "Day 1: Foundation",
            estimatedMinutes: 20,
            lessonTask: null,
            meditationTask: null,
            practiceTask: sampleTask,
            journalTask: null,
            affirmationTask: null,
            tasks: [sampleTask],
            remainingTasks: 1,
            completionPercentage: 50,
            currentXp: 25
          })
        },
        xp: {
          currentLevel: vi.fn().mockResolvedValue({
            level: 1,
            currentXp: 25,
            xpForCurrentLevel: 0,
            xpForNextLevel: 100,
            progressToNextLevel: 25
          })
        },
        journey: {
          currentJourney: vi.fn().mockResolvedValue({
            journey: {
              id: "journey-1",
              title: "Abundance Path",
              slug: "abundance-path",
              difficulty: "beginner",
              description: null,
              cover_image: null,
              estimated_days: 30,
              is_active: true,
              created_at: "2026-07-08T00:00:00.000Z",
              updated_at: "2026-07-08T00:00:00.000Z"
            },
            userProgress: {
              id: "progress-1",
              user_id: "user-1",
              journey_id: "journey-1",
              current_day: 1,
              current_task: null,
              completion_percentage: 10,
              xp: 25,
              total_practice_minutes: 7,
              rewards_unlocked: [],
              started_at: "2026-07-08T00:00:00.000Z",
              completed_at: null,
              updated_at: "2026-07-08T00:00:00.000Z"
            },
            currentDay: {
              id: "day-1",
              journey_id: "journey-1",
              day_number: 1,
              title: "Day 1",
              description: null,
              estimated_minutes: 20,
              reward_xp: 50,
              unlock_type: "sequential",
              created_at: "2026-07-08T00:00:00.000Z",
              updated_at: "2026-07-08T00:00:00.000Z"
            },
            remainingTasks: 1
          }),
          getActiveJourney: vi.fn().mockResolvedValue({
            id: "journey-1",
            title: "Abundance Path",
            slug: "abundance-path",
            difficulty: "beginner",
            description: null,
            cover_image: null,
            estimated_days: 30,
            is_active: true,
            created_at: "2026-07-08T00:00:00.000Z",
            updated_at: "2026-07-08T00:00:00.000Z"
          })
        },
        days: {
          nextDay: vi.fn().mockResolvedValue({
            id: "day-2",
            journey_id: "journey-1",
            day_number: 2,
            title: "Day 2",
            description: null,
            estimated_minutes: 25,
            reward_xp: 50,
            unlock_type: "sequential",
            created_at: "2026-07-08T00:00:00.000Z",
            updated_at: "2026-07-08T00:00:00.000Z"
          })
        },
        tasks: {
          validateCompletion: vi.fn().mockResolvedValue(false),
          listTasksForDay: vi.fn().mockResolvedValue([sampleTask, sampleTask])
        }
      }
    } as never);

    const { dailyRitualQuery } = await import("@/features/journey/queries");
    const result = await dailyRitualQuery("user-1");

    expect(result.greeting.firstName).toBe("Ayush");
    expect(result.journey?.title).toBe("Abundance Path");
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0]?.status).toBe("current");
    expect(result.tomorrow?.dayNumber).toBe(2);
    expect(result.progress.currentStreak).toBe(3);
  });
});
