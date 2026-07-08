import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CoreDailyMissionService,
  CoreJourneyDayService,
  CoreJourneyProgressService,
  CoreJourneyService,
  CoreJourneyTaskService,
  CoreRewardService,
  CoreXPService
} from "@/features/journey/service-implementations";
import {
  SupabaseJourneyDayRepository,
  SupabaseJourneyProgressRepository,
  SupabaseJourneyRepository,
  SupabaseJourneyTaskRepository,
  SupabaseRewardRepository
} from "@/features/journey/supabase-repositories";

export function createJourneyServices(supabase: SupabaseClient) {
  const journeys = new SupabaseJourneyRepository(supabase);
  const days = new SupabaseJourneyDayRepository(supabase);
  const tasks = new SupabaseJourneyTaskRepository(supabase);
  const progress = new SupabaseJourneyProgressRepository(supabase);
  const rewards = new SupabaseRewardRepository(supabase);

  const journey = new CoreJourneyService(journeys, progress, days, tasks);
  const taskService = new CoreJourneyTaskService(progress, tasks, days);

  return {
    journey,
    days: new CoreJourneyDayService(progress, days),
    tasks: taskService,
    progress: new CoreJourneyProgressService(journey, progress),
    xp: new CoreXPService(progress),
    rewards: new CoreRewardService(rewards, progress, days),
    dailyMission: new CoreDailyMissionService(journey, days, tasks, progress, taskService)
  };
}
