"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Clock, ListChecks, Sparkles, Trophy } from "lucide-react";
import type { JourneySummaryViewModel } from "@/features/journey/types";
import { RewardPreviewBadge } from "@/features/journey/components/reward-card";

type JourneySummaryCardProps = {
  summary: JourneySummaryViewModel;
};

function JourneySummaryCardComponent({ summary }: JourneySummaryCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Journey summary"
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.16, duration: 0.4 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Journey Summary
        </h2>
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Tasks Completed</dt>
          <dd className="font-medium">
            {summary.tasksCompleted}/{summary.totalTasks}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            Time Practiced
          </dt>
          <dd className="font-medium">{summary.timePracticedMinutes} min</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="size-3.5" aria-hidden />
            XP Earned
          </dt>
          <dd className="text-accent font-medium">+{summary.xpEarned} XP</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Trophy className="size-3.5" aria-hidden />
            Current Level
          </dt>
          <dd className="font-medium">Level {summary.currentLevel}</dd>
        </div>
        <div className="border-t pt-3">
          <dt className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
            Reward Preview
          </dt>
          <dd className="flex items-center justify-between gap-2">
            <span className="text-sm">{summary.rewardPreview}</span>
            <RewardPreviewBadge xp={summary.xpEarned > 0 ? summary.xpEarned : 50} />
          </dd>
        </div>
      </dl>
    </motion.section>
  );
}

export const JourneySummaryCard = memo(JourneySummaryCardComponent);
JourneySummaryCard.displayName = "JourneySummaryCard";
