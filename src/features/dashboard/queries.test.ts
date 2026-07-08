import { describe, expect, it, vi } from "vitest";
import type { DashboardSnapshot } from "@/types/core";
import type { CoreCourseService, CoreDashboardService } from "@/features/core/service-implementations";

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

vi.mock("@/features/dashboard/service", () => ({
  createDashboardServices: vi.fn()
}));

describe("dashboardQuery", () => {
  it("composes dashboard data through services", async () => {
    const snapshot: DashboardSnapshot = {
      profile: {
        id: "user-1",
        full_name: "Ayush Kumar",
        avatar_url: null,
        onboarding_completed: true
      },
      progress: null,
      currentStreak: 2,
      todaysPractice: null,
      continueCourse: null,
      latestMeditation: null,
      unreadNotifications: 0,
      recentJournal: null,
      currentChallenge: null,
      activeWish: null,
      dailyAffirmation: null,
      upcomingLiveSession: null
    };

    const { createDashboardServices } = await import("@/features/dashboard/service");
    vi.mocked(createDashboardServices).mockReturnValue({
      dashboard: {
        getDashboard: vi.fn().mockResolvedValue(snapshot),
        listWidgets: vi.fn()
      } as unknown as CoreDashboardService,
      courses: {
        calculateCompletionPercentage: vi.fn().mockResolvedValue(0)
      } as unknown as CoreCourseService
    });

    const { dashboardQuery } = await import("@/features/dashboard/queries");
    const result = await dashboardQuery("user-1");

    expect(result.greeting.firstName).toBe("Ayush");
    expect(result.streak.currentStreak).toBe(2);
  });
});
