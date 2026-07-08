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

export interface JourneyService {
  getActiveJourney(): Promise<Journey | null>;
  assignJourney(userId: UUID, journeyId: UUID): Promise<UserJourneyProgress>;
  changeJourney(userId: UUID, journeyId: UUID): Promise<UserJourneyProgress>;
  currentJourney(userId: UUID): Promise<JourneyProgress | null>;
}

export interface JourneyDayService {
  todaysDay(userId: UUID): Promise<JourneyDay | null>;
  nextDay(userId: UUID): Promise<JourneyDay | null>;
  previousDay(userId: UUID): Promise<JourneyDay | null>;
  unlockDay(userId: UUID, journeyDayId: UUID): Promise<void>;
  completeDay(userId: UUID, journeyDayId: UUID): Promise<void>;
}

export interface JourneyTaskService {
  todaysTasks(userId: UUID): Promise<JourneyTask[]>;
  listTasksForDay(journeyDayId: UUID): Promise<JourneyTask[]>;
  completeTask(userId: UUID, taskId: UUID, timeSpent?: number): Promise<void>;
  skipTask(userId: UUID, taskId: UUID): Promise<void>;
  validateCompletion(userId: UUID, taskId: UUID): Promise<boolean>;
  calculateProgress(userId: UUID, journeyId: UUID): Promise<number>;
}

export interface JourneyProgressService {
  progress(userId: UUID): Promise<JourneyProgress | null>;
  xp(userId: UUID): Promise<number>;
  currentDay(userId: UUID): Promise<number>;
  completion(userId: UUID): Promise<number>;
  timeSpent(userId: UUID): Promise<number>;
  history(userId: UUID): Promise<UserJourneyProgress[]>;
}

export interface XPService {
  awardXp(userId: UUID, journeyId: UUID, amount: number, reason: string): Promise<number>;
  removeXp(userId: UUID, journeyId: UUID, amount: number, reason: string): Promise<number>;
  calculateTotalXp(userId: UUID): Promise<number>;
  currentLevel(userId: UUID): Promise<XpLevel>;
  nextLevel(userId: UUID): Promise<XpLevel>;
}

export interface RewardService {
  badges(userId: UUID, journeyId: UUID): Promise<JourneyReward[]>;
  achievements(userId: UUID, journeyId: UUID): Promise<JourneyReward[]>;
  unlockReward(userId: UUID, journeyId: UUID, rewardKey: string): Promise<JourneyReward>;
  dailyReward(userId: UUID, journeyId: UUID): Promise<JourneyReward | null>;
  completionReward(userId: UUID, journeyId: UUID): Promise<JourneyReward | null>;
}

export interface DailyMissionService {
  generateTodaysMission(userId: UUID): Promise<DailyMission | null>;
  getDashboardJourneySummary(userId: UUID): Promise<DashboardJourneySummary | null>;
}
