import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import type { UUID } from "@/types/core";
import type {
  Journey,
  JourneyDay,
  JourneyReward,
  JourneyTask,
  UserDayProgress,
  UserJourneyProgress,
  UserTaskProgress
} from "@/types/journey";
import type {
  JourneyDayRepository,
  JourneyProgressRepository,
  JourneyRepository,
  JourneyTaskRepository,
  RewardRepository
} from "./repositories";

type QueryResult<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

function mapDatabaseError(
  error: { message: string; code?: string } | null,
  fallback: string
) {
  if (!error) return;
  throw new DatabaseError(fallback, { reason: error.message });
}

function asRecord<T>(value: unknown): T {
  return value as T;
}

function parseRewards(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function normalizeUserJourney(value: unknown): UserJourneyProgress {
  const record = asRecord<UserJourneyProgress & { rewards_unlocked: unknown }>(value);
  return {
    ...record,
    rewards_unlocked: parseRewards(record.rewards_unlocked)
  };
}

/** Supabase persistence for learning journeys. */
export class SupabaseJourneyRepository implements JourneyRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Find the primary active journey. */
  async findActive(): Promise<Journey | null> {
    const result = (await this.supabase
      .from("learning_journeys")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load active journey.");
    return result.data ? asRecord<Journey>(result.data) : null;
  }

  /** Find a journey by id. */
  async findById(id: UUID): Promise<Journey | null> {
    const result = (await this.supabase
      .from("learning_journeys")
      .select("*")
      .eq("id", id)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey.");
    return result.data ? asRecord<Journey>(result.data) : null;
  }

  /** Find a journey by slug. */
  async findBySlug(slug: string): Promise<Journey | null> {
    const result = (await this.supabase
      .from("learning_journeys")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey.");
    return result.data ? asRecord<Journey>(result.data) : null;
  }

  /** List active journeys. */
  async listActive(): Promise<Journey[]> {
    const result = (await this.supabase
      .from("learning_journeys")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list journeys.");
    return asRecord<Journey[]>(result.data ?? []);
  }
}

/** Supabase persistence for journey days. */
export class SupabaseJourneyDayRepository implements JourneyDayRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Find a journey day by id. */
  async findById(id: UUID): Promise<JourneyDay | null> {
    const result = (await this.supabase
      .from("journey_days")
      .select("*")
      .eq("id", id)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey day.");
    return result.data ? asRecord<JourneyDay>(result.data) : null;
  }

  /** Find a journey day by journey and day number. */
  async findByJourneyAndDay(
    journeyId: UUID,
    dayNumber: number
  ): Promise<JourneyDay | null> {
    const result = (await this.supabase
      .from("journey_days")
      .select("*")
      .eq("journey_id", journeyId)
      .eq("day_number", dayNumber)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey day.");
    return result.data ? asRecord<JourneyDay>(result.data) : null;
  }

  /** List all days for a journey. */
  async listByJourney(journeyId: UUID): Promise<JourneyDay[]> {
    const result = (await this.supabase
      .from("journey_days")
      .select("*")
      .eq("journey_id", journeyId)
      .order("day_number")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list journey days.");
    return asRecord<JourneyDay[]>(result.data ?? []);
  }
}

/** Supabase persistence for journey tasks. */
export class SupabaseJourneyTaskRepository implements JourneyTaskRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Find a journey task by id. */
  async findById(id: UUID): Promise<JourneyTask | null> {
    const result = (await this.supabase
      .from("journey_tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey task.");
    return result.data ? asRecord<JourneyTask>(result.data) : null;
  }

  /** List tasks for a journey day. */
  async listByDay(journeyDayId: UUID): Promise<JourneyTask[]> {
    const result = (await this.supabase
      .from("journey_tasks")
      .select("*")
      .eq("journey_day_id", journeyDayId)
      .order("order_index")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list journey tasks.");
    return asRecord<JourneyTask[]>(result.data ?? []);
  }
}

/** Supabase persistence for journey progress. */
export class SupabaseJourneyProgressRepository implements JourneyProgressRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** Get the user's current journey progress. */
  async getUserJourney(userId: UUID): Promise<UserJourneyProgress | null> {
    const result = (await this.supabase
      .from("user_journey_progress")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey progress.");
    return result.data ? normalizeUserJourney(result.data) : null;
  }

  /** Assign a journey to a user. */
  async assignJourney(
    input: Omit<UserJourneyProgress, "id" | "updated_at" | "rewards_unlocked"> & {
      rewards_unlocked?: string[];
    }
  ): Promise<UserJourneyProgress> {
    const result = (await this.supabase
      .from("user_journey_progress")
      .upsert(
        {
          ...input,
          rewards_unlocked: input.rewards_unlocked ?? []
        },
        { onConflict: "user_id,journey_id" }
      )
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to assign journey.");
    if (!result.data) throw new DatabaseError("Unable to assign journey.");
    return normalizeUserJourney(result.data);
  }

  /** Update user journey progress. */
  async updateUserJourney(
    id: UUID,
    input: Partial<UserJourneyProgress>
  ): Promise<UserJourneyProgress> {
    const result = (await this.supabase
      .from("user_journey_progress")
      .update(input)
      .eq("id", id)
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to update journey progress.");
    if (!result.data) throw new NotFoundError("Journey progress was not found.");
    return normalizeUserJourney(result.data);
  }

  /** Get day progress for a user. */
  async getDayProgress(
    userId: UUID,
    journeyDayId: UUID
  ): Promise<UserDayProgress | null> {
    const result = (await this.supabase
      .from("user_day_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("journey_day_id", journeyDayId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load day progress.");
    return result.data ? asRecord<UserDayProgress>(result.data) : null;
  }

  /** Upsert day progress for a user. */
  async upsertDayProgress(
    input: Omit<UserDayProgress, "id" | "updated_at">
  ): Promise<UserDayProgress> {
    const result = (await this.supabase
      .from("user_day_progress")
      .upsert(input, { onConflict: "user_id,journey_day_id" })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to save day progress.");
    if (!result.data) throw new DatabaseError("Unable to save day progress.");
    return asRecord<UserDayProgress>(result.data);
  }

  /** Get task progress for a user. */
  async getTaskProgress(userId: UUID, taskId: UUID): Promise<UserTaskProgress | null> {
    const result = (await this.supabase
      .from("user_task_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load task progress.");
    return result.data ? asRecord<UserTaskProgress>(result.data) : null;
  }

  /** List task progress rows for specific tasks. */
  async listTaskProgressForDay(
    userId: UUID,
    taskIds: UUID[]
  ): Promise<UserTaskProgress[]> {
    if (taskIds.length === 0) return [];
    const result = (await this.supabase
      .from("user_task_progress")
      .select("*")
      .eq("user_id", userId)
      .in("task_id", taskIds)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list task progress.");
    return asRecord<UserTaskProgress[]>(result.data ?? []);
  }

  /** Upsert task progress for a user. */
  async upsertTaskProgress(
    input: Omit<UserTaskProgress, "id" | "updated_at">
  ): Promise<UserTaskProgress> {
    const result = (await this.supabase
      .from("user_task_progress")
      .upsert(input, { onConflict: "user_id,task_id" })
      .select("*")
      .single()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to save task progress.");
    if (!result.data) throw new DatabaseError("Unable to save task progress.");
    return asRecord<UserTaskProgress>(result.data);
  }

  /** List day progress rows for a journey. */
  async listDayProgress(userId: UUID, journeyId: UUID): Promise<UserDayProgress[]> {
    const result = (await this.supabase
      .from("user_day_progress")
      .select("*, journey_days!inner(journey_id)")
      .eq("user_id", userId)
      .eq("journey_days.journey_id", journeyId)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list day progress.");
    return asRecord<UserDayProgress[]>(result.data ?? []);
  }

  /** List task progress rows for a journey. */
  async listTaskProgress(userId: UUID, journeyId: UUID): Promise<UserTaskProgress[]> {
    const result = (await this.supabase
      .from("user_task_progress")
      .select("*, journey_tasks!inner(journey_days!inner(journey_id))")
      .eq("user_id", userId)
      .eq("journey_tasks.journey_days.journey_id", journeyId)) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list task progress.");
    return asRecord<UserTaskProgress[]>(result.data ?? []);
  }
}

/** Supabase persistence for journey rewards. */
export class SupabaseRewardRepository implements RewardRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /** List rewards configured for a journey. */
  async listByJourney(journeyId: UUID): Promise<JourneyReward[]> {
    const result = (await this.supabase
      .from("journey_rewards")
      .select("*")
      .eq("journey_id", journeyId)
      .order("created_at")) as QueryResult<unknown[]>;
    mapDatabaseError(result.error, "Unable to list journey rewards.");
    return asRecord<JourneyReward[]>(result.data ?? []);
  }

  /** Find a reward by key within a journey. */
  async findByKey(journeyId: UUID, rewardKey: string): Promise<JourneyReward | null> {
    const result = (await this.supabase
      .from("journey_rewards")
      .select("*")
      .eq("journey_id", journeyId)
      .eq("reward_key", rewardKey)
      .maybeSingle()) as QueryResult<unknown>;
    mapDatabaseError(result.error, "Unable to load journey reward.");
    return result.data ? asRecord<JourneyReward>(result.data) : null;
  }
}
