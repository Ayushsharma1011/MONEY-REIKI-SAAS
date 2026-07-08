import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { JourneyEmptyState } from "@/features/journey/components/journey-empty-state";
import { JourneyProgressCard } from "@/features/journey/components/journey-progress-card";
import { JourneySkeleton } from "@/features/journey/components/journey-skeleton";
import { JourneyTaskCard } from "@/features/journey/components/journey-task-card";
import { JourneyTimeline } from "@/features/journey/components/journey-timeline";
import { RewardCard } from "@/features/journey/components/reward-card";
import {
  calculateTodayCompletion,
  calculateXpEarnedToday,
  getEmptyStateType,
  getTaskButtonLabel,
  getTaskMeta,
  isDayCompleted,
  mapTaskStatuses
} from "@/features/journey/utils";
import type { DailyMission, JourneyTask } from "@/types/journey";

const sampleTasks: JourneyTask[] = [
  {
    id: "task-1",
    journey_day_id: "day-1",
    task_type: "lesson",
    title: "Welcome Lesson",
    description: "Introduction to Money Reiki",
    course_id: null,
    module_id: null,
    lesson_id: null,
    practice_id: null,
    meditation_id: null,
    journal_prompt: null,
    wish_box_required: false,
    vision_board_required: false,
    affirmation_required: false,
    estimated_minutes: 10,
    order_index: 0,
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z"
  },
  {
    id: "task-2",
    journey_day_id: "day-1",
    task_type: "meditation",
    title: "Abundance Meditation",
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
    estimated_minutes: 8,
    order_index: 1,
    created_at: "2026-07-08T00:00:00.000Z",
    updated_at: "2026-07-08T00:00:00.000Z"
  }
];

describe("journey utils", () => {
  it("maps task statuses sequentially", () => {
    const mapped = mapTaskStatuses(sampleTasks, new Set(["task-1"]));
    expect(mapped[0]?.status).toBe("completed");
    expect(mapped[1]?.status).toBe("current");
  });

  it("returns task button labels by status", () => {
    expect(getTaskButtonLabel("completed")).toBe("Completed");
    expect(getTaskButtonLabel("current")).toBe("Start");
    expect(getTaskButtonLabel("locked")).toBe("Locked");
  });

  it("calculates today completion and xp", () => {
    const mapped = mapTaskStatuses(sampleTasks, new Set(["task-1"]));
    expect(calculateTodayCompletion(mapped)).toBe(50);
    expect(calculateXpEarnedToday(mapped, 15)).toBe(15);
  });

  it("detects day completion from mission", () => {
    const mission: DailyMission = {
      journeyId: "journey-1",
      dayNumber: 1,
      title: "Day 1",
      estimatedMinutes: 20,
      lessonTask: sampleTasks[0] ?? null,
      meditationTask: sampleTasks[1] ?? null,
      practiceTask: null,
      journalTask: null,
      affirmationTask: null,
      tasks: sampleTasks,
      remainingTasks: 0,
      completionPercentage: 100,
      currentXp: 50
    };
    expect(isDayCompleted(mission)).toBe(true);
  });

  it("resolves empty state type", () => {
    expect(getEmptyStateType(false, false, false)).toBe("no-journey");
    expect(getEmptyStateType(true, false, false)).toBe("no-mission");
    expect(getEmptyStateType(true, true, false)).toBe("no-progress");
    expect(getEmptyStateType(true, true, true)).toBe("ready");
  });

  it("maps task metadata for all supported types", () => {
    expect(getTaskMeta("lesson").label).toBe("Lesson");
    expect(getTaskMeta("wish_box").label).toBe("Wish Box");
    expect(getTaskMeta("live_session").label).toBe("Live Session");
  });
});

describe("journey components", () => {
  it("renders loading skeleton", () => {
    const html = renderToStaticMarkup(<JourneySkeleton />);
    expect(html).toContain("Loading daily ritual");
  });

  it("renders journey timeline", () => {
    const tasks = mapTaskStatuses(sampleTasks, new Set());
    const html = renderToStaticMarkup(<JourneyTimeline tasks={tasks} />);
    expect(html).toContain("Today&#x27;s Ritual");
    expect(html).toContain("Welcome Lesson");
    expect(html).toContain("Abundance Meditation");
  });

  it("renders task card with status badge", () => {
    const task = mapTaskStatuses(sampleTasks, new Set())[0]!;
    const html = renderToStaticMarkup(<JourneyTaskCard task={task} />);
    expect(html).toContain("Welcome Lesson");
    expect(html).toContain("Start");
  });

  it("renders progress card metrics", () => {
    const html = renderToStaticMarkup(
      <JourneyProgressCard
        currentStreak={5}
        journeyCompletionPercent={42}
        remainingTasks={2}
        todayCompletionPercent={50}
        xpEarnedToday={30}
      />
    );
    expect(html).toContain("Progress");
    expect(html).toContain("5 days");
    expect(html).toContain("Remaining Tasks");
  });

  it("renders reward card for incomplete day", () => {
    const html = renderToStaticMarkup(
      <RewardCard
        dayCompleted={false}
        reward={{
          xp: 50,
          badgeTitle: "Daily Ritual Badge",
          unlockMessage: "Complete all tasks"
        }}
      />
    );
    expect(html).toContain("Today&#x27;s Reward");
    expect(html).toContain("+50 XP");
  });

  it("renders empty states", () => {
    const noJourney = renderToStaticMarkup(
      <JourneyEmptyState
        hasActiveJourney={false}
        hasMission={false}
        hasProgress={false}
      />
    );
    const noMission = renderToStaticMarkup(
      <JourneyEmptyState hasActiveJourney hasMission={false} hasProgress={false} />
    );

    expect(noJourney).toContain("Start Your Transformation Journey");
    expect(noMission).toContain("Generate Today&#x27;s Mission");
  });
});
