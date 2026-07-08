"use client";

import { motion } from "framer-motion";
import { Compass, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEmptyStateType } from "@/features/journey/utils";

type JourneyEmptyStateProps = {
  hasActiveJourney: boolean;
  hasMission: boolean;
  hasProgress: boolean;
  onStartJourney?: () => void;
  onGenerateMission?: () => void;
  onStartDayOne?: () => void;
  isLoading?: boolean;
};

export function JourneyEmptyState({
  hasActiveJourney,
  hasMission,
  hasProgress,
  onStartJourney,
  onGenerateMission,
  onStartDayOne,
  isLoading = false
}: JourneyEmptyStateProps) {
  const stateType = getEmptyStateType(hasActiveJourney, hasMission, hasProgress);

  if (stateType === "ready") return null;

  const config = {
    "no-journey": {
      icon: Compass,
      title: "Start Your Transformation Journey",
      description:
        "Choose your first journey and begin a guided daily ritual designed for abundance and growth.",
      actionLabel: "Explore First Journey",
      onAction: onStartJourney
    },
    "no-mission": {
      icon: Sparkles,
      title: "Generate Today's Mission",
      description:
        "Your journey is ready. Let's create today's guided ritual so you always know what to do next.",
      actionLabel: "Generate Starter Mission",
      onAction: onGenerateMission
    },
    "no-progress": {
      icon: Play,
      title: "Begin Day 1",
      description:
        "You're all set. Start your first day and unlock the power of daily transformation.",
      actionLabel: "Start Day 1",
      onAction: onStartDayOne ?? onStartJourney
    }
  }[stateType];

  const Icon = config.icon;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/70 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4 }}
    >
      <Icon className="text-accent mb-4 size-10" aria-hidden />
      <h3 className="text-lg font-semibold">{config.title}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        {config.description}
      </p>
      {config.onAction ? (
        <Button
          className="mt-5"
          disabled={isLoading}
          onClick={config.onAction}
          type="button"
        >
          {isLoading ? "Loading..." : config.actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
}
