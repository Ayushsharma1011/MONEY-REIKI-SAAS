"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/constants";
import { DAILY_RITUAL_QUERY_KEY } from "@/features/journey/constants";
import {
  assignActiveJourneyMutation,
  completeTaskMutation,
  dailyRitualQuery,
  generateStarterMissionMutation
} from "@/features/journey/queries";
import type { DailyRitualViewModel } from "@/features/journey/types";

export function useDailyRitual(userId: string | undefined) {
  return useQuery<DailyRitualViewModel, Error>({
    queryKey: [DAILY_RITUAL_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User is required to load the daily ritual.");
      }
      return dailyRitualQuery(userId);
    },
    enabled: Boolean(userId)
  });
}

export function useAssignJourney(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User is required.");
      return assignActiveJourneyMutation(userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DAILY_RITUAL_QUERY_KEY, userId] });
      void queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY, userId] });
    }
  });
}

export function useGenerateMission(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("User is required.");
      return generateStarterMissionMutation(userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DAILY_RITUAL_QUERY_KEY, userId] });
    }
  });
}

export function useCompleteTask(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, timeSpent }: { taskId: string; timeSpent?: number }) => {
      if (!userId) throw new Error("User is required.");
      return completeTaskMutation(userId, taskId, timeSpent);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DAILY_RITUAL_QUERY_KEY, userId] });
      void queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY, userId] });
    }
  });
}
