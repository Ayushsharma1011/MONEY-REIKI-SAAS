import { NotFoundError, ValidationError } from "@/lib/errors";
import type { DashboardJourneySummary } from "@/types/core";
import type { UUID } from "@/types/core";
import type {
  DailyMission,
  Journey,
  JourneyDay,
  JourneyProgress,
  JourneyReward,
  JourneyTask,
  UserJourneyProgress,
  XpLevel
} from "@/types/journey";
import { journeyEventBus } from "./events";
import type {
  JourneyDayRepository,
  JourneyProgressRepository,
  JourneyRepository,
  JourneyTaskRepository,
  RewardRepository
} from "./repositories";
import { xpAwardSchema } from "./schemas";
import type {
  DailyMissionService,
  JourneyDayService,
  JourneyProgressService,
  JourneyService,
  JourneyTaskService,
  RewardService,
  XPService
} from "./services";

const XP_PER_LEVEL = 100;

function calculateLevel(xp: number): XpLevel {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
  const xpForNextLevel = level * XP_PER_LEVEL;
  const progressToNextLevel = Math.round(
    ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
  );

  return {
    level,
    currentXp: xp,
    xpForCurrentLevel,
    xpForNextLevel,
    progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel))
  };
}

function findTaskByType(tasks: JourneyTask[], taskType: JourneyTask["task_type"]) {
  return tasks.find((task) => task.task_type === taskType) ?? null;
}

/**
 * Production journey assignment and discovery service.
 */
export class CoreJourneyService implements JourneyService {
  constructor(
    private readonly journeys: JourneyRepository,
    private readonly progress: JourneyProgressRepository,
    private readonly days: JourneyDayRepository,
    private readonly tasks: JourneyTaskRepository
  ) {}

  /** Get the platform active journey. */
  async getActiveJourney(): Promise<Journey | null> {
    return this.journeys.findActive();
  }

  /** Assign an active journey to a user. */
  async assignJourney(userId: UUID, journeyId: UUID): Promise<UserJourneyProgress> {
    const journey = await this.journeys.findById(journeyId);
    if (!journey?.is_active) {
      throw new NotFoundError("Active journey was not found.");
    }

    const firstDay = await this.days.findByJourneyAndDay(journeyId, 1);
    const dayTasks = firstDay ? await this.tasks.listByDay(firstDay.id) : [];

    const assigned = await this.progress.assignJourney({
      user_id: userId,
      journey_id: journeyId,
      current_day: 1,
      current_task: dayTasks[0]?.id ?? null,
      completion_percentage: 0,
      xp: 0,
      total_practice_minutes: 0,
      started_at: new Date().toISOString(),
      completed_at: null
    });

    if (firstDay) {
      await this.progress.upsertDayProgress({
        user_id: userId,
        journey_day_id: firstDay.id,
        status: "available",
        started_at: null,
        completed_at: null,
        reward_claimed: false
      });
    }

    await journeyEventBus.emit("JourneyStarted", userId, { journeyId }, journeyId);
    return assigned;
  }

  /** Change the user's active journey. */
  async changeJourney(userId: UUID, journeyId: UUID): Promise<UserJourneyProgress> {
    return this.assignJourney(userId, journeyId);
  }

  /** Get the user's current journey progress snapshot. */
  async currentJourney(userId: UUID): Promise<JourneyProgress | null> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) return null;

    const journey = await this.journeys.findById(userProgress.journey_id);
    if (!journey) return null;

    const currentDay = await this.days.findByJourneyAndDay(
      journey.id,
      userProgress.current_day
    );
    const tasks = currentDay ? await this.tasks.listByDay(currentDay.id) : [];
    const taskProgress = await this.progress.listTaskProgressForDay(
      userId,
      tasks.map((task) => task.id)
    );
    const remainingTasks = tasks.length - taskProgress.filter((item) => item.completed).length;

    return {
      journey,
      userProgress,
      currentDay,
      remainingTasks
    };
  }
}

/**
 * Production journey day progression service.
 */
export class CoreJourneyDayService implements JourneyDayService {
  constructor(
    private readonly progress: JourneyProgressRepository,
    private readonly days: JourneyDayRepository
  ) {}

  /** Resolve today's journey day for the user. */
  async todaysDay(userId: UUID): Promise<JourneyDay | null> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) return null;
    return this.days.findByJourneyAndDay(userProgress.journey_id, userProgress.current_day);
  }

  /** Resolve the next journey day. */
  async nextDay(userId: UUID): Promise<JourneyDay | null> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) return null;
    return this.days.findByJourneyAndDay(
      userProgress.journey_id,
      userProgress.current_day + 1
    );
  }

  /** Resolve the previous journey day. */
  async previousDay(userId: UUID): Promise<JourneyDay | null> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress || userProgress.current_day <= 1) return null;
    return this.days.findByJourneyAndDay(
      userProgress.journey_id,
      userProgress.current_day - 1
    );
  }

  /** Unlock a journey day based on unlock rules. */
  async unlockDay(userId: UUID, journeyDayId: UUID): Promise<void> {
    const day = await this.days.findById(journeyDayId);
    if (!day) throw new NotFoundError("Journey day was not found.");

    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress || userProgress.journey_id !== day.journey_id) {
      throw new ValidationError("Journey day does not belong to the active journey.");
    }

    if (day.unlock_type === "sequential" && day.day_number > userProgress.current_day) {
      throw new ValidationError("Previous days must be completed first.");
    }

    await this.progress.upsertDayProgress({
      user_id: userId,
      journey_day_id: journeyDayId,
      status: "available",
      started_at: new Date().toISOString(),
      completed_at: null,
      reward_claimed: false
    });
  }

  /** Complete a journey day and advance the user. */
  async completeDay(userId: UUID, journeyDayId: UUID): Promise<void> {
    const day = await this.days.findById(journeyDayId);
    if (!day) throw new NotFoundError("Journey day was not found.");

    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) throw new NotFoundError("Journey progress was not found.");

    await this.progress.upsertDayProgress({
      user_id: userId,
      journey_day_id: journeyDayId,
      status: "completed",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      reward_claimed: false
    });

    const nextDay = await this.days.findByJourneyAndDay(day.journey_id, day.day_number + 1);
    const allDays = await this.days.listByJourney(day.journey_id);
    const completionPercentage = Math.min(
      100,
      Math.round((day.day_number / Math.max(allDays.length, 1)) * 100)
    );

    await this.progress.updateUserJourney(userProgress.id, {
      current_day: nextDay?.day_number ?? day.day_number,
      xp: userProgress.xp + day.reward_xp,
      completion_percentage: completionPercentage
    });

    await journeyEventBus.emit(
      "DayCompleted",
      userId,
      { journeyDayId, rewardXp: day.reward_xp },
      day.journey_id
    );

    if (!nextDay) {
      await this.progress.updateUserJourney(userProgress.id, {
        completed_at: new Date().toISOString(),
        completion_percentage: 100
      });
      await journeyEventBus.emit("JourneyCompleted", userId, {}, day.journey_id);
    } else {
      await this.progress.upsertDayProgress({
        user_id: userId,
        journey_day_id: nextDay.id,
        status: "available",
        started_at: null,
        completed_at: null,
        reward_claimed: false
      });
    }
  }
}

/**
 * Production journey task execution service.
 */
export class CoreJourneyTaskService implements JourneyTaskService {
  constructor(
    private readonly progress: JourneyProgressRepository,
    private readonly tasks: JourneyTaskRepository,
    private readonly days: JourneyDayRepository
  ) {}

  /** List today's tasks for the user. */
  async todaysTasks(userId: UUID): Promise<JourneyTask[]> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) return [];
    const day = await this.days.findByJourneyAndDay(
      userProgress.journey_id,
      userProgress.current_day
    );
    if (!day) return [];
    return this.tasks.listByDay(day.id);
  }

  /** Complete a journey task. */
  async completeTask(userId: UUID, taskId: UUID, timeSpent = 0): Promise<void> {
    const task = await this.tasks.findById(taskId);
    if (!task) throw new NotFoundError("Journey task was not found.");

    await this.progress.upsertTaskProgress({
      user_id: userId,
      task_id: taskId,
      completed: true,
      completed_at: new Date().toISOString(),
      time_spent: Math.max(0, timeSpent)
    });

    const userProgress = await this.progress.getUserJourney(userId);
    if (userProgress) {
      const completion = await this.calculateProgress(userId, userProgress.journey_id);
      await this.progress.updateUserJourney(userProgress.id, {
        completion_percentage: completion,
        total_practice_minutes:
          userProgress.total_practice_minutes + Math.max(0, timeSpent),
        current_task: taskId
      });
    }

    await journeyEventBus.emit("TaskCompleted", userId, { taskId, timeSpent });
  }

  /** Skip a journey task without awarding completion. */
  async skipTask(userId: UUID, taskId: UUID): Promise<void> {
    const task = await this.tasks.findById(taskId);
    if (!task) throw new NotFoundError("Journey task was not found.");

    await this.progress.upsertTaskProgress({
      user_id: userId,
      task_id: taskId,
      completed: false,
      completed_at: null,
      time_spent: 0
    });
  }

  /** Validate whether a task is completed. */
  async validateCompletion(userId: UUID, taskId: UUID): Promise<boolean> {
    const progress = await this.progress.getTaskProgress(userId, taskId);
    return Boolean(progress?.completed);
  }

  /** Calculate journey completion percentage from task progress. */
  async calculateProgress(userId: UUID, journeyId: UUID): Promise<number> {
    const days = await this.days.listByJourney(journeyId);
    const allTasks = (
      await Promise.all(days.map((day) => this.tasks.listByDay(day.id)))
    ).flat();

    if (allTasks.length === 0) return 0;

    const completed = await this.progress.listTaskProgressForDay(
      userId,
      allTasks.map((task) => task.id)
    );

    return Math.round(
      (completed.filter((item) => item.completed).length / allTasks.length) * 100
    );
  }
}

/**
 * Production journey progress reporting service.
 */
export class CoreJourneyProgressService implements JourneyProgressService {
  constructor(
    private readonly journeys: CoreJourneyService,
    private readonly progressRepo: JourneyProgressRepository
  ) {}

  /** Get full journey progress for a user. */
  async progress(userId: UUID): Promise<JourneyProgress | null> {
    return this.journeys.currentJourney(userId);
  }

  /** Get current XP for the user's journey. */
  async xp(userId: UUID): Promise<number> {
    const userProgress = await this.progressRepo.getUserJourney(userId);
    return userProgress?.xp ?? 0;
  }

  /** Get the user's current day number. */
  async currentDay(userId: UUID): Promise<number> {
    const userProgress = await this.progressRepo.getUserJourney(userId);
    return userProgress?.current_day ?? 0;
  }

  /** Get journey completion percentage. */
  async completion(userId: UUID): Promise<number> {
    const userProgress = await this.progressRepo.getUserJourney(userId);
    return userProgress?.completion_percentage ?? 0;
  }

  /** Get total practice minutes spent on the journey. */
  async timeSpent(userId: UUID): Promise<number> {
    const userProgress = await this.progressRepo.getUserJourney(userId);
    return userProgress?.total_practice_minutes ?? 0;
  }

  /** Get journey progress history for a user. */
  async history(userId: UUID): Promise<UserJourneyProgress[]> {
    const current = await this.progressRepo.getUserJourney(userId);
    return current ? [current] : [];
  }
}

/**
 * Production XP calculation and award service.
 */
export class CoreXPService implements XPService {
  constructor(private readonly progress: JourneyProgressRepository) {}

  /** Award XP to a user's active journey. */
  async awardXp(
    userId: UUID,
    journeyId: UUID,
    amount: number,
    reason: string
  ): Promise<number> {
    const parsed = xpAwardSchema.safeParse({ userId, journeyId, amount, reason });
    if (!parsed.success) {
      throw new ValidationError("Invalid XP award payload.", {
        issues: parsed.error.flatten()
      });
    }

    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress || userProgress.journey_id !== journeyId) {
      throw new NotFoundError("Journey progress was not found.");
    }

    const nextXp = userProgress.xp + amount;
    await this.progress.updateUserJourney(userProgress.id, { xp: nextXp });
    await journeyEventBus.emit("XPAwarded", userId, { amount, reason }, journeyId);
    return nextXp;
  }

  /** Remove XP from a user's active journey. */
  async removeXp(
    userId: UUID,
    journeyId: UUID,
    amount: number,
    reason: string
  ): Promise<number> {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress || userProgress.journey_id !== journeyId) {
      throw new NotFoundError("Journey progress was not found.");
    }

    const nextXp = Math.max(0, userProgress.xp - amount);
    await this.progress.updateUserJourney(userProgress.id, { xp: nextXp });
    await journeyEventBus.emit("XPAwarded", userId, { amount: -amount, reason }, journeyId);
    return nextXp;
  }

  /** Calculate total XP for the user's active journey. */
  async calculateTotalXp(userId: UUID): Promise<number> {
    const userProgress = await this.progress.getUserJourney(userId);
    return userProgress?.xp ?? 0;
  }

  /** Get the user's current XP level. */
  async currentLevel(userId: UUID): Promise<XpLevel> {
    const xp = await this.calculateTotalXp(userId);
    return calculateLevel(xp);
  }

  /** Get the user's next XP level target. */
  async nextLevel(userId: UUID): Promise<XpLevel> {
    const current = await this.currentLevel(userId);
    return calculateLevel(current.xpForNextLevel);
  }
}

/**
 * Production journey reward service.
 */
export class CoreRewardService implements RewardService {
  constructor(
    private readonly rewards: RewardRepository,
    private readonly progress: JourneyProgressRepository,
    private readonly days: JourneyDayRepository
  ) {}

  /** List badge rewards for a journey. */
  async badges(userId: UUID, journeyId: UUID): Promise<JourneyReward[]> {
    void userId;
    const items = await this.rewards.listByJourney(journeyId);
    return items.filter((item) => item.reward_type === "badge");
  }

  /** List achievement rewards for a journey. */
  async achievements(userId: UUID, journeyId: UUID): Promise<JourneyReward[]> {
    void userId;
    const items = await this.rewards.listByJourney(journeyId);
    return items.filter((item) => item.reward_type === "achievement");
  }

  /** Unlock a reward for a user. */
  async unlockReward(userId: UUID, journeyId: UUID, rewardKey: string) {
    const reward = await this.rewards.findByKey(journeyId, rewardKey);
    if (!reward) throw new NotFoundError("Reward was not found.");

    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress || userProgress.journey_id !== journeyId) {
      throw new NotFoundError("Journey progress was not found.");
    }

    if (userProgress.rewards_unlocked.includes(rewardKey)) {
      return reward;
    }

    await this.progress.updateUserJourney(userProgress.id, {
      rewards_unlocked: [...userProgress.rewards_unlocked, rewardKey]
    });

    await journeyEventBus.emit(
      "RewardUnlocked",
      userId,
      { rewardKey, rewardId: reward.id },
      journeyId
    );

    return reward;
  }

  /** Claim the daily reward for the current day. */
  async dailyReward(userId: UUID, journeyId: UUID) {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress) return null;

    const day = await this.days.findByJourneyAndDay(journeyId, userProgress.current_day);
    if (!day) return null;

    const dayProgress = await this.progress.getDayProgress(userId, day.id);
    if (!dayProgress || dayProgress.status !== "completed" || dayProgress.reward_claimed) {
      return null;
    }

    await this.progress.upsertDayProgress({
      ...dayProgress,
      reward_claimed: true
    });

    return this.rewards.findByKey(journeyId, `day-${day.day_number}`).then(async (reward) => {
      if (reward) {
        await this.unlockReward(userId, journeyId, reward.reward_key);
      }
      return reward;
    });
  }

  /** Claim the journey completion reward. */
  async completionReward(userId: UUID, journeyId: UUID) {
    const userProgress = await this.progress.getUserJourney(userId);
    if (!userProgress?.completed_at) return null;
    return this.unlockReward(userId, journeyId, "journey-complete");
  }
}

/**
 * Production daily mission generation service.
 */
export class CoreDailyMissionService implements DailyMissionService {
  private readonly missionCache = new Map<string, { mission: DailyMission; expiresAt: number }>();

  constructor(
    private readonly journeys: CoreJourneyService,
    private readonly days: JourneyDayRepository,
    private readonly tasks: JourneyTaskRepository,
    private readonly progress: JourneyProgressRepository,
    private readonly taskService: CoreJourneyTaskService
  ) {}

  /** Generate today's mission for the user. */
  async generateTodaysMission(userId: UUID): Promise<DailyMission | null> {
    const cacheKey = `${userId}:${new Date().toISOString().slice(0, 10)}`;
    const cached = this.missionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.mission;
    }

    const current = await this.journeys.currentJourney(userId);
    if (!current?.currentDay) return null;

    const tasks = await this.tasks.listByDay(current.currentDay.id);
    const taskProgress = await this.progress.listTaskProgressForDay(
      userId,
      tasks.map((task) => task.id)
    );
    const remainingTasks = tasks.length - taskProgress.filter((item) => item.completed).length;
    const completionPercentage = await this.taskService.calculateProgress(
      userId,
      current.journey.id
    );

    const mission: DailyMission = {
      journeyId: current.journey.id,
      dayNumber: current.currentDay.day_number,
      title: current.currentDay.title,
      estimatedMinutes: current.currentDay.estimated_minutes,
      lessonTask: findTaskByType(tasks, "lesson"),
      meditationTask: findTaskByType(tasks, "meditation"),
      practiceTask: findTaskByType(tasks, "practice"),
      journalTask: findTaskByType(tasks, "journal"),
      affirmationTask: findTaskByType(tasks, "affirmation"),
      tasks,
      remainingTasks,
      completionPercentage,
      currentXp: current.userProgress.xp
    };

    this.missionCache.set(cacheKey, {
      mission,
      expiresAt: Date.now() + 60_000
    });

    return mission;
  }

  /** Build dashboard journey summary for backend integration. */
  async getDashboardJourneySummary(userId: UUID): Promise<DashboardJourneySummary | null> {
    const current = await this.journeys.currentJourney(userId);
    if (!current) return null;

    const mission = await this.generateTodaysMission(userId);

    return {
      journey: {
        id: current.journey.id,
        title: current.journey.title,
        slug: current.journey.slug,
        difficulty: current.journey.difficulty
      },
      dailyMission: mission
        ? {
            dayNumber: mission.dayNumber,
            title: mission.title,
            estimatedMinutes: mission.estimatedMinutes,
            remainingTasks: mission.remainingTasks,
            completionPercentage: mission.completionPercentage,
            currentXp: mission.currentXp
          }
        : null,
      currentDay: current.userProgress.current_day,
      currentXp: current.userProgress.xp,
      completionPercentage: current.userProgress.completion_percentage,
      remainingTasks: current.remainingTasks
    };
  }
}
