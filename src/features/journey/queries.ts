import { createDashboardServices } from "@/features/dashboard/service";
import { mapSnapshotToViewModel } from "@/features/dashboard/utils";
import {
  DEFAULT_REWARD_BADGE,
  DEFAULT_UNLOCK_MESSAGE,
  TASK_XP_REWARD,
  TOMORROW_UNLOCK_REQUIREMENT
} from "@/features/journey/constants";
import type { DailyRitualViewModel } from "@/features/journey/types";
import {
  buildRewardPreview,
  calculateTodayCompletion,
  calculateXpEarnedToday,
  isDayCompleted,
  mapTaskStatuses
} from "@/features/journey/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UUID } from "@/types/core";

export async function dailyRitualQuery(userId: UUID): Promise<DailyRitualViewModel> {
  const supabase = createSupabaseBrowserClient();
  const { dashboard, journey } = createDashboardServices(supabase);

  const [snapshot, mission, xpLevel, currentJourney, activeJourney, nextDay] =
    await Promise.all([
      dashboard.getDashboard(userId),
      journey.dailyMission.generateTodaysMission(userId),
      journey.xp.currentLevel(userId),
      journey.journey.currentJourney(userId),
      journey.journey.getActiveJourney(),
      journey.days.nextDay(userId)
    ]);

  const dashboardVm = mapSnapshotToViewModel(snapshot);

  const completedChecks = mission
    ? await Promise.all(
        mission.tasks.map(async (task) => ({
          id: task.id,
          completed: await journey.tasks.validateCompletion(userId, task.id)
        }))
      )
    : [];

  const completedTaskIds = new Set(
    completedChecks.filter((item) => item.completed).map((item) => item.id)
  );

  const journeyDifficulty =
    currentJourney?.journey.difficulty ?? activeJourney?.difficulty ?? "beginner";

  const tasks = mission
    ? mapTaskStatuses(mission.tasks, completedTaskIds, journeyDifficulty)
    : [];

  const todayCompletionPercent = calculateTodayCompletion(tasks);
  const xpEarnedToday = calculateXpEarnedToday(tasks, TASK_XP_REWARD);
  const dayCompleted = isDayCompleted(mission);
  const rewardXp = currentJourney?.currentDay?.reward_xp ?? 50;

  let tomorrow = null;
  if (nextDay) {
    const nextDayTasks = await journey.tasks.listTasksForDay(nextDay.id);
    tomorrow = {
      dayNumber: nextDay.day_number,
      estimatedMinutes: nextDay.estimated_minutes,
      lockedTasksCount: nextDayTasks.length,
      unlockRequirement: TOMORROW_UNLOCK_REQUIREMENT
    };
  }

  const tasksCompleted = tasks.filter((task) => task.status === "completed").length;

  return {
    greeting: dashboardVm.greeting,
    profile: dashboardVm.profile,
    unreadNotifications: dashboardVm.unreadNotifications,
    affirmation: dashboardVm.affirmation,
    hasActiveJourney: Boolean(currentJourney),
    hasMission: Boolean(mission),
    activeJourneyId: activeJourney?.id ?? null,
    journey: snapshot.todaysJourney?.journey ?? (currentJourney
      ? {
          id: currentJourney.journey.id,
          title: currentJourney.journey.title,
          slug: currentJourney.journey.slug,
          difficulty: currentJourney.journey.difficulty
        }
      : null),
    dailyMission: mission
      ? {
          dayNumber: mission.dayNumber,
          title: mission.title,
          estimatedMinutes: mission.estimatedMinutes,
          completionPercentage: mission.completionPercentage,
          remainingTasks: mission.remainingTasks,
          rewardXp
        }
      : null,
    tasks,
    progress: {
      journeyCompletionPercent:
        snapshot.todaysJourney?.completionPercentage ??
        currentJourney?.userProgress.completion_percentage ??
        0,
      todayCompletionPercent,
      xpEarnedToday,
      remainingTasks: mission?.remainingTasks ?? 0,
      currentStreak: snapshot.currentStreak,
      currentLevel: xpLevel.level,
      currentXp: xpLevel.currentXp,
      levelProgress: xpLevel.progressToNextLevel,
      timePracticedMinutes: currentJourney?.userProgress.total_practice_minutes ?? 0
    },
    reward: mission
      ? {
          xp: rewardXp,
          badgeTitle: DEFAULT_REWARD_BADGE,
          unlockMessage: dayCompleted
            ? "You've unlocked today's reward!"
            : DEFAULT_UNLOCK_MESSAGE
        }
      : null,
    tomorrow,
    dayCompleted,
    summary: {
      tasksCompleted,
      totalTasks: tasks.length,
      timePracticedMinutes: currentJourney?.userProgress.total_practice_minutes ?? 0,
      xpEarned: xpEarnedToday,
      currentLevel: xpLevel.level,
      rewardPreview: mission
        ? buildRewardPreview(mission.dayNumber, rewardXp)
        : "Complete your first day to earn rewards"
    }
  };
}

export async function assignActiveJourneyMutation(userId: UUID): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { journey } = createDashboardServices(supabase);
  const activeJourney = await journey.journey.getActiveJourney();

  if (!activeJourney) {
    throw new Error("No active journey is available.");
  }

  await journey.journey.assignJourney(userId, activeJourney.id);
}

export async function generateStarterMissionMutation(userId: UUID): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { journey } = createDashboardServices(supabase);
  await journey.dailyMission.generateTodaysMission(userId);
}

export async function completeTaskMutation(
  userId: UUID,
  taskId: UUID,
  timeSpent = 0
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { journey } = createDashboardServices(supabase);
  await journey.tasks.completeTask(userId, taskId, timeSpent);
}
