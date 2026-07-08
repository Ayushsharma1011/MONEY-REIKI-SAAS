"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_PRACTICE } from "@/features/dashboard/constants";
import type { DailyPractice } from "@/types/core";

export function HeroCard({ practice }: { practice: DailyPractice | null }) {
  const title = practice?.title ?? DEFAULT_PRACTICE.title;
  const minutes = practice?.estimated_minutes ?? DEFAULT_PRACTICE.estimatedMinutes;
  const practiceType = practice?.practice_type ?? DEFAULT_PRACTICE.practiceType;

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
          Today&apos;s Focus
        </div>
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="text-muted-foreground mt-2 text-sm capitalize">
          {practiceType.replace(/_/g, " ")} · {minutes} minutes
        </p>
        <div className="mt-5 max-w-sm">
          <Progress value={practice ? 35 : 0} />
          <p className="text-muted-foreground mt-2 text-xs">
            {practice ? "Ready to continue your daily ritual" : "Start your first practice today"}
          </p>
        </div>
        <Button className="mt-6 gap-2 shadow-md" size="lg">
          Start Practice
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </motion.article>
  );
}

export function PracticeCard({ practice }: { practice: DailyPractice | null }) {
  return <HeroCard practice={practice} />;
}
