import type { UUID } from "@/types/core";
import type {
  DailyMission,
  Journey,
  JourneyDay,
  JourneyProgress,
  JourneyReward,
  JourneyTask,
  UserDayProgress,
  UserJourneyProgress,
  UserTaskProgress
} from "@/types/journey";

export interface JourneyRepository {
  findActive(): Promise<Journey | null>;
  findById(id: UUID): Promise<Journey | null>;
  findBySlug(slug: string): Promise<Journey | null>;
  listActive(): Promise<Journey[]>;
}

export interface JourneyDayRepository {
  findById(id: UUID): Promise<JourneyDay | null>;
  findByJourneyAndDay(journeyId: UUID, dayNumber: number): Promise<JourneyDay | null>;
  listByJourney(journeyId: UUID): Promise<JourneyDay[]>;
}

export interface JourneyTaskRepository {
  findById(id: UUID): Promise<JourneyTask | null>;
  listByDay(journeyDayId: UUID): Promise<JourneyTask[]>;
}

export interface JourneyProgressRepository {
  getUserJourney(userId: UUID): Promise<UserJourneyProgress | null>;
  assignJourney(
    input: Omit<UserJourneyProgress, "id" | "updated_at" | "rewards_unlocked"> & {
      rewards_unlocked?: string[];
    }
  ): Promise<UserJourneyProgress>;
  updateUserJourney(
    id: UUID,
    input: Partial<UserJourneyProgress>
  ): Promise<UserJourneyProgress>;
  getDayProgress(userId: UUID, journeyDayId: UUID): Promise<UserDayProgress | null>;
  upsertDayProgress(
    input: Omit<UserDayProgress, "id" | "updated_at">
  ): Promise<UserDayProgress>;
  getTaskProgress(userId: UUID, taskId: UUID): Promise<UserTaskProgress | null>;
  listTaskProgressForDay(userId: UUID, taskIds: UUID[]): Promise<UserTaskProgress[]>;
  upsertTaskProgress(
    input: Omit<UserTaskProgress, "id" | "updated_at">
  ): Promise<UserTaskProgress>;
  listDayProgress(userId: UUID, journeyId: UUID): Promise<UserDayProgress[]>;
  listTaskProgress(userId: UUID, journeyId: UUID): Promise<UserTaskProgress[]>;
}

export interface RewardRepository {
  listByJourney(journeyId: UUID): Promise<JourneyReward[]>;
  findByKey(journeyId: UUID, rewardKey: string): Promise<JourneyReward | null>;
}

export type DashboardMissionProvider = {
  getDashboardSummary(userId: UUID): Promise<{
    progress: JourneyProgress | null;
    mission: DailyMission | null;
  }>;
};
