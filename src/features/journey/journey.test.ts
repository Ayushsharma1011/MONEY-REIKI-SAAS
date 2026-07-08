import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/lib/errors";
import {
  CoreDailyMissionService,
  CoreJourneyService,
  CoreJourneyTaskService,
  CoreRewardService,
  CoreXPService
} from "@/features/journey/service-implementations";
import { journeyEventBus } from "@/features/journey/events";
import type {
  JourneyDayRepository,
  JourneyProgressRepository,
  JourneyRepository,
  JourneyTaskRepository,
  RewardRepository
} from "@/features/journey/repositories";
import type { Journey, JourneyDay, JourneyTask, UserJourneyProgress } from "@/types/journey";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const JOURNEY_ID = "00000000-0000-4000-8000-000000000002";
const DAY_ID = "00000000-0000-4000-8000-000000000003";
const TASK_ID = "00000000-0000-4000-8000-000000000004";

const journey: Journey = {
  id: JOURNEY_ID,
  title: "Abundance Journey",
  slug: "abundance-journey",
  description: null,
  cover_image: null,
  difficulty: "beginner",
  estimated_days: 30,
  is_active: true,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

const day: JourneyDay = {
  id: DAY_ID,
  journey_id: JOURNEY_ID,
  day_number: 1,
  title: "Day 1",
  description: null,
  estimated_minutes: 20,
  reward_xp: 25,
  unlock_type: "sequential",
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

const task: JourneyTask = {
  id: TASK_ID,
  journey_day_id: DAY_ID,
  task_type: "lesson",
  title: "Lesson Task",
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
  estimated_minutes: 10,
  order_index: 0,
  created_at: "2026-07-08T00:00:00.000Z",
  updated_at: "2026-07-08T00:00:00.000Z"
};

describe("CoreJourneyService", () => {
  it("assigns an active journey to a user", async () => {
    const assigned: UserJourneyProgress = {
      id: "00000000-0000-4000-8000-000000000010",
      user_id: USER_ID,
      journey_id: JOURNEY_ID,
      current_day: 1,
      current_task: TASK_ID,
      completion_percentage: 0,
      xp: 0,
      total_practice_minutes: 0,
      rewards_unlocked: [],
      started_at: "2026-07-08T00:00:00.000Z",
      completed_at: null,
      updated_at: "2026-07-08T00:00:00.000Z"
    };

    const journeys = {
      findById: vi.fn().mockResolvedValue(journey)
    } as unknown as JourneyRepository;
    const days = {
      findByJourneyAndDay: vi.fn().mockResolvedValue(day)
    } as unknown as JourneyDayRepository;
    const tasks = {
      listByDay: vi.fn().mockResolvedValue([task])
    } as unknown as JourneyTaskRepository;
    const progress = {
      assignJourney: vi.fn().mockResolvedValue(assigned),
      upsertDayProgress: vi.fn().mockResolvedValue({})
    } as unknown as JourneyProgressRepository;

    const service = new CoreJourneyService(journeys, progress, days, tasks);
    await expect(service.assignJourney(USER_ID, JOURNEY_ID)).resolves.toBe(assigned);
  });
});

describe("CoreJourneyTaskService", () => {
  it("calculates task completion progress", async () => {
    const progress = {
      getUserJourney: vi.fn().mockResolvedValue({ journey_id: JOURNEY_ID, current_day: 1 }),
      listTaskProgressForDay: vi.fn().mockResolvedValue([{ completed: true }])
    } as unknown as JourneyProgressRepository;
    const days = {
      listByJourney: vi.fn().mockResolvedValue([day]),
      findByJourneyAndDay: vi.fn().mockResolvedValue(day)
    } as unknown as JourneyDayRepository;
    const tasks = {
      listByDay: vi.fn().mockResolvedValue([task, { ...task, id: "task-2" }])
    } as unknown as JourneyTaskRepository;

    const service = new CoreJourneyTaskService(progress, tasks, days);
    await expect(service.calculateProgress(USER_ID, JOURNEY_ID)).resolves.toBe(50);
  });

  it("completes a task and emits an event", async () => {
    const emitSpy = vi.spyOn(journeyEventBus, "emit");
    const progress = {
      getUserJourney: vi.fn().mockResolvedValue({
        id: "progress-1",
        journey_id: JOURNEY_ID,
        total_practice_minutes: 0
      }),
      upsertTaskProgress: vi.fn().mockResolvedValue({}),
      updateUserJourney: vi.fn().mockResolvedValue({}),
      listTaskProgressForDay: vi.fn().mockResolvedValue([{ completed: true }])
    } as unknown as JourneyProgressRepository;
    const tasks = {
      findById: vi.fn().mockResolvedValue(task),
      listByDay: vi.fn().mockResolvedValue([task])
    } as unknown as JourneyTaskRepository;
    const days = {
      listByJourney: vi.fn().mockResolvedValue([day])
    } as unknown as JourneyDayRepository;

    const service = new CoreJourneyTaskService(progress, tasks, days);
    await service.completeTask(USER_ID, TASK_ID, 10);
    expect(emitSpy).toHaveBeenCalledWith("TaskCompleted", USER_ID, {
      taskId: TASK_ID,
      timeSpent: 10
    });
    emitSpy.mockRestore();
  });
});

describe("CoreXPService", () => {
  it("awards xp to the active journey", async () => {
    const progress = {
      getUserJourney: vi.fn().mockResolvedValue({
        id: "progress-1",
        journey_id: JOURNEY_ID,
        xp: 20
      }),
      updateUserJourney: vi.fn().mockResolvedValue({})
    } as unknown as JourneyProgressRepository;

    const service = new CoreXPService(progress);
    await expect(
      service.awardXp(USER_ID, JOURNEY_ID, 10, "Day complete")
    ).resolves.toBe(30);
  });

  it("calculates current level", async () => {
    const progress = {
      getUserJourney: vi.fn().mockResolvedValue({ xp: 150 })
    } as unknown as JourneyProgressRepository;

    const service = new CoreXPService(progress);
    await expect(service.currentLevel(USER_ID)).resolves.toMatchObject({
      level: 2,
      currentXp: 150
    });
  });
});

describe("CoreDailyMissionService", () => {
  it("generates today's mission from current journey state", async () => {
    const journeys = {
      currentJourney: vi.fn().mockResolvedValue({
        journey,
        userProgress: {
          id: "progress-1",
          user_id: USER_ID,
          journey_id: JOURNEY_ID,
          current_day: 1,
          current_task: TASK_ID,
          completion_percentage: 0,
          xp: 10,
          total_practice_minutes: 0,
          rewards_unlocked: [],
          started_at: "2026-07-08T00:00:00.000Z",
          completed_at: null,
          updated_at: "2026-07-08T00:00:00.000Z"
        },
        currentDay: day,
        remainingTasks: 1
      })
    } as unknown as CoreJourneyService;

    const tasks = {
      listByDay: vi.fn().mockResolvedValue([
        task,
        { ...task, id: "task-2", task_type: "meditation" as const }
      ])
    } as unknown as JourneyTaskRepository;
    const progress = {
      listTaskProgressForDay: vi.fn().mockResolvedValue([])
    } as unknown as JourneyProgressRepository;
    const taskService = {
      calculateProgress: vi.fn().mockResolvedValue(0)
    } as unknown as CoreJourneyTaskService;

    const service = new CoreDailyMissionService(
      journeys,
      {} as JourneyDayRepository,
      tasks,
      progress,
      taskService
    );

    const mission = await service.generateTodaysMission(USER_ID);
    expect(mission?.lessonTask?.task_type).toBe("lesson");
    expect(mission?.meditationTask?.task_type).toBe("meditation");
    expect(mission?.remainingTasks).toBe(2);
  });
});

describe("CoreRewardService", () => {
  it("unlocks rewards once", async () => {
    const reward = {
      id: "reward-1",
      journey_id: JOURNEY_ID,
      reward_key: "day-1",
      title: "Day 1 Badge",
      description: null,
      reward_type: "badge" as const,
      xp_threshold: null,
      day_number: 1,
      created_at: "2026-07-08T00:00:00.000Z"
    };

    const rewards = {
      findByKey: vi.fn().mockResolvedValue(reward)
    } as unknown as RewardRepository;
    const progress = {
      getUserJourney: vi.fn().mockResolvedValue({
        id: "progress-1",
        journey_id: JOURNEY_ID,
        rewards_unlocked: []
      }),
      updateUserJourney: vi.fn().mockResolvedValue({})
    } as unknown as JourneyProgressRepository;

    const service = new CoreRewardService(rewards, progress, {} as JourneyDayRepository);
    await expect(service.unlockReward(USER_ID, JOURNEY_ID, "day-1")).resolves.toBe(reward);
  });
});

describe("journey schema validation", () => {
  it("rejects invalid xp awards", async () => {
    const service = new CoreXPService({} as JourneyProgressRepository);
    await expect(service.awardXp(USER_ID, JOURNEY_ID, 0, "")).rejects.toBeInstanceOf(
      ValidationError
    );
  });
});
