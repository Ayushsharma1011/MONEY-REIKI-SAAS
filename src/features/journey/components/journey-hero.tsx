"use client";

import { motion } from "framer-motion";
import { ArrowRight, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type JourneyHeroProps = {
  dayNumber: number;
  journeyName: string;
  estimatedMinutes: number;
  completionPercentage: number;
  onContinue: () => void;
};

export function JourneyHero({
  dayNumber,
  journeyName,
  estimatedMinutes,
  completionPercentage,
  onContinue
}: JourneyHeroProps) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="from-primary/20 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-lg sm:p-8"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="bg-accent/20 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl" />
      <div className="relative">
        <div className="text-accent mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="size-4" aria-hidden />
          Today&apos;s Journey
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Day {dayNumber}</p>
            <h2 className="text-2xl font-semibold sm:text-3xl">{journeyName}</h2>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
              <Map className="size-4" aria-hidden />
              {estimatedMinutes} min estimated
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Progress</p>
            <p className="text-3xl font-semibold">{completionPercentage}%</p>
          </div>
        </div>
        <div className="mt-5 max-w-lg">
          <Progress aria-label="Today's journey completion" value={completionPercentage} />
        </div>
        <Button
          className="mt-6 gap-2 shadow-md"
          onClick={onContinue}
          size="lg"
          type="button"
        >
          Continue Today&apos;s Journey
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </motion.article>
  );
}
