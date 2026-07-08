"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CourseMobileCTAProps = {
  lessonTitle: string | null;
  onContinue?: () => void;
};

function CourseMobileCTAComponent({ lessonTitle, onContinue }: CourseMobileCTAProps) {
  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="bg-background/95 fixed inset-x-0 bottom-16 z-30 border-t p-4 backdrop-blur-xl lg:hidden"
      initial={{ y: 24, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide uppercase">Continue Learning</p>
          <p className="truncate text-sm font-medium">
            {lessonTitle ?? "Start your first lesson"}
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={onContinue} type="button">
          <PlayCircle className="size-4" aria-hidden />
          Continue
        </Button>
      </div>
    </motion.div>
  );
}

export const CourseMobileCTA = memo(CourseMobileCTAComponent);
CourseMobileCTA.displayName = "CourseMobileCTA";
