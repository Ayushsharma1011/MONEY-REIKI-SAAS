"use client";

import dynamic from "next/dynamic";
import { memo, Suspense, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { JourneyEmptyState } from "@/features/journey/components/journey-empty-state";
import { JourneyHero } from "@/features/journey/components/journey-hero";
import { JourneyProgressCard } from "@/features/journey/components/journey-progress-card";
import { JourneySkeleton } from "@/features/journey/components/journey-skeleton";
import { JourneySummaryCard } from "@/features/journey/components/journey-summary-card";
import { JourneyTaskCard } from "@/features/journey/components/journey-task-card";
import { JourneyTimeline } from "@/features/journey/components/journey-timeline";
import { MotivationCard } from "@/features/journey/components/motivation-card";
import { RewardCard } from "@/features/journey/components/reward-card";
import { TomorrowPreviewCard } from "@/features/journey/components/tomorrow-preview-card";
import {
  useAssignJourney,
  useCompleteTask,
  useDailyRitual,
  useGenerateMission
} from "@/features/journey/hooks";
import type { DailyRitualViewModel } from "@/features/journey/types";

const CompletionCelebration = dynamic(
  () =>
    import("@/features/journey/components/completion-celebration").then(
      (mod) => mod.CompletionCelebration
    ),
  {
    loading: () => null,
    ssr: false
  }
);

type DailyRitualExperienceProps = {
  userId: string;
  data: DailyRitualViewModel;
};

function DailyRitualContent({ userId, data }: DailyRitualExperienceProps) {
  const tasksRef = useRef<HTMLDivElement>(null);
  const completeTask = useCompleteTask(userId);
  const assignJourney = useAssignJourney(userId);
  const generateMission = useGenerateMission(userId);

  const scrollToTasks = useCallback(() => {
    tasksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTaskAction = useCallback(
    (taskId: string) => {
      void completeTask.mutateAsync({ taskId, timeSpent: 5 });
    },
    [completeTask]
  );

  const showEmptyState = !data.hasActiveJourney || !data.hasMission;

  if (showEmptyState) {
    return (
      <JourneyEmptyState
        hasActiveJourney={data.hasActiveJourney}
        hasMission={data.hasMission}
        hasProgress={data.summary.tasksCompleted > 0}
        isLoading={assignJourney.isPending || generateMission.isPending}
        onGenerateMission={() => void generateMission.mutate()}
        onStartDayOne={() => void assignJourney.mutate()}
        onStartJourney={() => void assignJourney.mutate()}
      />
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-6"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {data.dailyMission && data.journey ? (
        <JourneyHero
          completionPercentage={data.dailyMission.completionPercentage}
          dayNumber={data.dailyMission.dayNumber}
          estimatedMinutes={data.dailyMission.estimatedMinutes}
          journeyName={data.dailyMission.title}
          onContinue={scrollToTasks}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7" ref={tasksRef}>
          <JourneyTimeline onTaskSelect={scrollToTasks} tasks={data.tasks} />
          <div className="space-y-3" id="journey-tasks">
            {data.tasks.map((task, index) => (
              <JourneyTaskCard
                index={index}
                key={task.id}
                onAction={handleTaskAction}
                task={task}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 xl:col-span-5">
          <JourneyProgressCard
            currentStreak={data.progress.currentStreak}
            journeyCompletionPercent={data.progress.journeyCompletionPercent}
            remainingTasks={data.progress.remainingTasks}
            todayCompletionPercent={data.progress.todayCompletionPercent}
            xpEarnedToday={data.progress.xpEarnedToday}
          />
          {data.dayCompleted && data.tomorrow ? (
            <Suspense fallback={null}>
              <CompletionCelebration tomorrow={data.tomorrow} />
            </Suspense>
          ) : data.reward ? (
            <RewardCard dayCompleted={data.dayCompleted} reward={data.reward} />
          ) : null}
          <MotivationCard affirmation={data.affirmation} seed={data.dailyMission?.dayNumber} />
          <JourneySummaryCard summary={data.summary} />
          {!data.dayCompleted && data.tomorrow ? (
            <TomorrowPreviewCard preview={data.tomorrow} />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function DailyRitualExperienceComponent({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch, isFetching } = useDailyRitual(userId);

  if (isLoading) {
    return <JourneySkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorStateCard
        description="We couldn't load your daily ritual. Please try again."
        onRetry={() => void refetch()}
        title="Daily ritual unavailable"
      />
    );
  }

  return (
    <>
      <DailyRitualContent data={data} userId={userId} />
      {isFetching ? (
        <p aria-live="polite" className="sr-only">
          Refreshing daily ritual
        </p>
      ) : null}
    </>
  );
}

export const DailyRitualExperience = memo(DailyRitualExperienceComponent);
DailyRitualExperience.displayName = "DailyRitualExperience";
