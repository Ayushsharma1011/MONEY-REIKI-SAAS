"use client";

import { useQuery } from "@tanstack/react-query";
import { DASHBOARD_QUERY_KEY } from "@/features/dashboard/constants";
import { dashboardQuery } from "@/features/dashboard/queries";
import type { DashboardViewModel } from "@/features/dashboard/types";

export function useDashboard(userId: string | undefined) {
  return useQuery<DashboardViewModel, Error>({
    queryKey: [DASHBOARD_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("User is required to load the dashboard.");
      }

      return dashboardQuery(userId);
    },
    enabled: Boolean(userId)
  });
}
