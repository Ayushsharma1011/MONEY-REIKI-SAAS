"use client";

import { motion } from "framer-motion";
import { Flame, Star, Timer, Zap } from "lucide-react";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { DashboardStreakStats } from "@/features/dashboard/types";

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      key={value}
      transition={{ duration: 0.35 }}
    >
      {value}
    </motion.span>
  );
}

export function StreakCard({ streak }: { streak: DashboardStreakStats }) {
  const ringValue = Math.min(100, streak.currentStreak * 10);

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.05, duration: 0.4 }}
    >
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">
        Current Streak
      </h2>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <ProgressRing label="days" max={100} value={ringValue} />
        <div className="grid w-full flex-1 grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="size-3.5" aria-hidden />}
            label="Current"
            value={<AnimatedNumber value={streak.currentStreak} />}
          />
          <StatCard
            icon={<Star className="size-3.5" aria-hidden />}
            label="Longest"
            value={<AnimatedNumber value={streak.longestStreak} />}
          />
          <StatCard
            icon={<Timer className="size-3.5" aria-hidden />}
            label="Minutes"
            value={<AnimatedNumber value={streak.practiceMinutes} />}
          />
          <StatCard
            icon={<Zap className="size-3.5" aria-hidden />}
            label="XP"
            value={<AnimatedNumber value={streak.xp} />}
          />
        </div>
      </div>
    </motion.article>
  );
}
