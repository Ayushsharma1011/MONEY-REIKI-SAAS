"use client";

import { memo } from "react";
import { AchievementCard } from "@/features/dashboard/components/achievement-card";
import { AffirmationCard } from "@/features/dashboard/components/affirmation-card";
import { CourseCard } from "@/features/dashboard/components/course-card";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { HeroCard } from "@/features/dashboard/components/hero-card";
import { JournalCard } from "@/features/dashboard/components/journal-card";
import { LiveSessionCard } from "@/features/dashboard/components/live-session-card";
import { MeditationCard } from "@/features/dashboard/components/meditation-card";
import { QuickActionsGrid } from "@/features/dashboard/components/quick-actions-grid";
import { StreakCard } from "@/features/dashboard/components/streak-card";
import { WishBoxCard } from "@/features/dashboard/components/wish-box-card";
import { useDashboard } from "@/features/dashboard/hooks";
import { useAuth } from "@/providers/auth-provider";

const MemoizedQuickActions = memo(QuickActionsGrid);
MemoizedQuickActions.displayName = "MemoizedQuickActions";

export function StudentHome() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch, isFetching } = useDashboard(user?.id);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorStateCard
        description="We couldn't load your daily command center. Please try again."
        onRetry={() => void refetch()}
        title="Dashboard unavailable"
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <DashboardHeader
        avatarUrl={data.profile?.avatarUrl ?? null}
        greeting={data.greeting}
        profileName={data.profile?.fullName ?? "Student"}
        unreadNotifications={data.unreadNotifications}
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div id="practice">
            <HeroCard practice={data.todaysPractice} />
          </div>
          <StreakCard streak={data.streak} />
          <div className="grid gap-4 md:grid-cols-2">
            <CourseCard course={data.course} />
            <JournalCard
              prompt={data.journalPrompt}
              recentJournal={data.recentJournal}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MeditationCard meditation={data.meditation} />
            <WishBoxCard wish={data.wishBox} />
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <AffirmationCard affirmation={data.affirmation} />
          {data.liveSession ? <LiveSessionCard session={data.liveSession} /> : null}
          <AchievementCard achievement={data.achievement} />
          <MemoizedQuickActions actions={data.quickActions} />
        </div>
      </div>

      {isFetching ? (
        <p aria-live="polite" className="sr-only">
          Refreshing dashboard
        </p>
      ) : null}
    </div>
  );
}
