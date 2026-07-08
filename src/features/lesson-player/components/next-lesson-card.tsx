"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NextLessonViewModel } from "@/features/lesson-player/types";

type NextLessonCardProps = {
  nextLesson: NextLessonViewModel;
  onContinue: () => void;
};

function NextLessonCardComponent({ nextLesson, onContinue }: NextLessonCardProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="from-primary/10 via-card to-accent/10 sticky bottom-20 z-20 rounded-2xl border bg-gradient-to-r p-4 shadow-md lg:bottom-6"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
    >
      <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
        Up next
      </p>
      <h3 className="mt-1 font-semibold">{nextLesson.title}</h3>
      <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {nextLesson.durationMinutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="size-3.5" aria-hidden />
          +{nextLesson.xpReward} XP
        </span>
      </div>
      <Button className="mt-4 w-full sm:w-auto" onClick={onContinue} type="button">
        Continue journey
        <ArrowRight className="ml-1.5 size-4" aria-hidden />
      </Button>
    </motion.div>
  );
}

export const NextLessonCard = memo(NextLessonCardComponent);
NextLessonCard.displayName = "NextLessonCard";
