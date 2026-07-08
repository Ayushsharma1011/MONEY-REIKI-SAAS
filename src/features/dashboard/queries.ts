import { createDashboardServices } from "@/features/dashboard/service";
import type { DashboardViewModel } from "@/features/dashboard/types";
import { mapSnapshotToViewModel } from "@/features/dashboard/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UUID } from "@/types/core";

export async function dashboardQuery(userId: UUID): Promise<DashboardViewModel> {
  const supabase = createSupabaseBrowserClient();
  const { dashboard, courses } = createDashboardServices(supabase);
  const snapshot = await dashboard.getDashboard(userId);

  let courseCompletionPercent = 0;

  if (snapshot.continueCourse) {
    courseCompletionPercent = await courses.calculateCompletionPercentage(
      userId,
      snapshot.continueCourse.id
    );
  }

  return mapSnapshotToViewModel(snapshot, courseCompletionPercent);
}
