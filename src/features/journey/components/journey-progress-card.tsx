"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Target, Zap } from "lucide-react";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { Progress } from "@/components/ui/progress";

type JourneyProgressCardProps = {
  journeyCompletionPercent: number;
  todayCompletionPercent: number;
  xpEarnedToday: number;
  remainingTasks: number;
  currentStreak: number;
};

function AnimatedXp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;

    const steps = 20;
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) window.clearInterval(interval);
    }, 30);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <motion.span key={value} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
      +{display} XP
    </motion.span>
  );
}

function JourneyProgressCardComponent({
  journeyCompletionPercent,
  todayCompletionPercent,
  xpEarnedToday,
  remainingTasks,
  currentStreak
}: JourneyProgressCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Journey progress"
      className="bg-card/80 space-y-5 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <h2 className="text-sm font-semibold tracking-wide uppercase">Progress</h2>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ProgressRing
          label="Journey"
          size={100}
          strokeWidth={8}
          value={journeyCompletionPercent}
        />
        <div className="grid flex-1 gap-3 text-sm">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Target className="size-3.5" aria-hidden />
                Today&apos;s Progress
              </span>
              <span className="font-medium">{todayCompletionPercent}%</span>
            </div>
            <Progress aria-label="Today's progress" value={todayCompletionPercent} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Zap className="size-3.5" aria-hidden />
              XP Earned Today
            </span>
            <span className="text-accent font-semibold">
              <AnimatedXp value={xpEarnedToday} />
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Remaining Tasks</span>
            <span className="font-medium">{remainingTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Flame className="size-3.5" aria-hidden />
              Current Streak
            </span>
            <span className="font-medium">{currentStreak} days</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export const JourneyProgressCard = memo(JourneyProgressCardComponent);
JourneyProgressCard.displayName = "JourneyProgressCard";
