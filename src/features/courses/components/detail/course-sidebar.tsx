"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Gift, PlayCircle, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/features/dashboard/components/progress-ring";
import { formatDuration } from "@/features/courses/utils";
import type { CourseSidebarViewModel } from "@/features/courses/detail-types";

type CourseSidebarProps = {
  sidebar: CourseSidebarViewModel;
  onContinue?: () => void;
};

function CourseSidebarComponent({ sidebar, onContinue }: CourseSidebarProps) {
  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      aria-label="Course progress sidebar"
      className="bg-card/80 space-y-5 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.1, duration: 0.35 }}
    >
      <h2 className="text-sm font-semibold tracking-wide uppercase">Your Progress</h2>
      <div className="flex justify-center">
        <ProgressRing
          label="Course"
          size={100}
          strokeWidth={8}
          value={sidebar.progressPercent}
        />
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="size-3.5" aria-hidden />
            XP
          </dt>
          <dd className="font-medium">
            {sidebar.currentXp} · Lvl {sidebar.currentLevel}
          </dd>
        </div>
        {sidebar.currentDay ? (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden />
              Current Day
            </dt>
            <dd className="font-medium">Day {sidebar.currentDay}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden />
            Remaining
          </dt>
          <dd className="font-medium">{formatDuration(sidebar.remainingMinutes)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground inline-flex items-center gap-1">
            <Gift className="size-3.5" aria-hidden />
            Next Reward
          </dt>
          <dd className="text-accent font-medium">+{sidebar.nextRewardXp} XP</dd>
        </div>
      </dl>
      {sidebar.journeyTitle ? (
        <div className="border-t pt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <Trophy className="size-3.5" aria-hidden />
              {sidebar.journeyTitle}
            </span>
            <span>{sidebar.journeyProgressPercent}%</span>
          </div>
          <Progress value={sidebar.journeyProgressPercent} />
        </div>
      ) : null}
      {sidebar.continueLessonTitle ? (
        <p className="text-muted-foreground text-xs">
          Up next: <span className="text-foreground font-medium">{sidebar.continueLessonTitle}</span>
        </p>
      ) : null}
      <Button className="w-full gap-2" onClick={onContinue} type="button">
        <PlayCircle className="size-4" aria-hidden />
        Continue Learning
      </Button>
    </motion.aside>
  );
}

export const CourseSidebar = memo(CourseSidebarComponent);
CourseSidebar.displayName = "CourseSidebar";

export { CourseSidebar as CourseProgressCard };
