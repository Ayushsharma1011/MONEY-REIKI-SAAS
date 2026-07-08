"use client";

import { memo } from "react";
import { motion } from "framer-motion";

type LessonOverviewProps = {
  description: string | null;
};

function LessonOverviewComponent({ description }: LessonOverviewProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Lesson overview"
      className="bg-card/70 rounded-2xl border p-5"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">Overview</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description ??
          "Explore this lesson to deepen your Money Reiki practice and build daily abundance rituals."}
      </p>
    </motion.section>
  );
}

export const LessonOverview = memo(LessonOverviewComponent);
LessonOverview.displayName = "LessonOverview";
