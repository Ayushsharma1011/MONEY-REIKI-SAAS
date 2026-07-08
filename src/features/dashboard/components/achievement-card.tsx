"use client";

import { motion } from "framer-motion";
import { Award, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DashboardAchievement } from "@/features/dashboard/types";

export function AchievementCard({ achievement }: { achievement: DashboardAchievement }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">Achievements</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-accent/15 text-accent flex size-12 items-center justify-center rounded-full">
          <Award className="size-5" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">{achievement.recentBadge}</p>
          <p className="text-muted-foreground text-sm">{achievement.xp} XP earned</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Next: {achievement.nextBadge}</span>
          <span>{achievement.nextBadgeProgress}%</span>
        </div>
        <Progress value={achievement.nextBadgeProgress} />
      </div>
    </motion.article>
  );
}
