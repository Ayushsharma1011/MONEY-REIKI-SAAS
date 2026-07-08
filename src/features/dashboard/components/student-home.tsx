"use client";

import { memo } from "react";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { DailyRitualExperience } from "@/features/journey/components/daily-ritual-experience";
import { JourneySkeleton } from "@/features/journey/components/journey-skeleton";
import { useDailyRitual } from "@/features/journey/hooks";
import { useAuth } from "@/providers/auth-provider";

function StudentHomeComponent() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useDailyRitual(user?.id);

  if (isLoading) {
    return <JourneySkeleton />;
  }

  if (error) {
    return (
      <ErrorStateCard
        description="We couldn't load your daily ritual. Please try again."
        onRetry={() => void refetch()}
        title="Dashboard unavailable"
      />
    );
  }

  if (!user?.id) {
    return (
      <ErrorStateCard
        description="Please sign in to continue your journey."
        title="Authentication required"
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <DashboardHeader
        avatarUrl={data?.profile?.avatarUrl ?? null}
        currentDay={data?.dailyMission?.dayNumber ?? null}
        currentLevel={data?.progress.currentLevel}
        currentXp={data?.progress.currentXp}
        greeting={data?.greeting ?? { label: "Welcome", firstName: "Student", quote: "", dateLabel: "" }}
        journeyTitle={data?.journey?.title ?? null}
        profileName={data?.profile?.fullName ?? "Student"}
        unreadNotifications={data?.unreadNotifications ?? 0}
      />

      <DailyRitualExperience userId={user.id} />
    </div>
  );
}

export const StudentHome = memo(StudentHomeComponent);
StudentHome.displayName = "StudentHome";
