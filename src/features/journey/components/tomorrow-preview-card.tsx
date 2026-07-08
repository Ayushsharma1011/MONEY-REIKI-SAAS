"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Lock } from "lucide-react";
import type { TomorrowPreviewViewModel } from "@/features/journey/types";

type TomorrowPreviewCardProps = {
  preview: TomorrowPreviewViewModel;
};

function TomorrowPreviewCardComponent({ preview }: TomorrowPreviewCardProps) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Tomorrow preview"
      className="bg-muted/30 rounded-2xl border border-dashed p-5"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="text-muted-foreground size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Tomorrow Preview
        </h2>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Next Day</span>
          <span className="font-medium">Day {preview.dayNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Estimated Time</span>
          <span className="font-medium">{preview.estimatedMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            <Lock className="size-3.5" aria-hidden />
            Locked Tasks
          </span>
          <span className="font-medium">{preview.lockedTasksCount}</span>
        </div>
        <p className="text-muted-foreground border-t pt-3 text-xs leading-relaxed">
          {preview.unlockRequirement}
        </p>
      </div>
    </motion.section>
  );
}

export const TomorrowPreviewCard = memo(TomorrowPreviewCardComponent);
TomorrowPreviewCard.displayName = "TomorrowPreviewCard";
