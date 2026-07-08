"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NextLessonViewModel } from "@/features/lesson-player/types";

type CompletionCelebrationProps = {
  xpAwarded: number;
  nextLesson: NextLessonViewModel | null;
  journeyProgressPercent: number | null;
  onContinue?: () => void;
  onDismiss: () => void;
};

const CONFETTI_COLORS = [
  "bg-violet-400",
  "bg-fuchsia-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-rose-400"
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  return (
    <motion.span
      animate={{
        y: [0, 120 + (index % 3) * 20],
        x: [(index % 2 === 0 ? -1 : 1) * 10, (index % 2 === 0 ? 1 : -1) * 30],
        opacity: [1, 0],
        rotate: [0, 180 + index * 30]
      }}
      aria-hidden
      className={`pointer-events-none absolute top-0 size-2 rounded-sm ${color}`}
      initial={{ y: 0, opacity: 1 }}
      style={{ left: `${(index * 17) % 100}%` }}
      transition={{ duration: 1.2 + (index % 3) * 0.2, ease: "easeOut" }}
    />
  );
}

function XpCounter({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) return undefined;
    const steps = 20;
    const increment = target / steps;
    let current = 0;
    const interval = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        window.clearInterval(interval);
      } else {
        setValue(Math.floor(current));
      }
    }, 40);
    return () => window.clearInterval(interval);
  }, [target]);

  return (
    <motion.p
      animate={{ scale: 1 }}
      className="text-accent text-3xl font-bold tabular-nums"
      initial={{ scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      +{value} XP
    </motion.p>
  );
}

function CompletionCelebrationComponent({
  xpAwarded,
  nextLesson,
  journeyProgressPercent,
  onContinue,
  onDismiss
}: CompletionCelebrationProps) {
  const confetti = useMemo(() => Array.from({ length: 18 }), []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-label="Lesson completed celebration"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      role="dialog"
    >
      <motion.section
        animate={{ opacity: 1, scale: 1 }}
        className="from-accent/20 via-card to-primary/10 relative max-w-md overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.35 }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((_, index) => (
            <ConfettiPiece index={index} key={index} />
          ))}
        </div>

        <div className="relative text-center">
          <motion.div
            animate={{ scale: 1 }}
            className="bg-accent/20 mx-auto mb-4 flex size-16 items-center justify-center rounded-full"
            initial={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <Check className="text-accent size-8" aria-hidden />
          </motion.div>
          <div className="text-accent mb-2 flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="size-4" aria-hidden />
            Lesson complete
          </div>
          <h3 className="text-xl font-semibold">Beautiful work!</h3>
          {xpAwarded > 0 ? (
            <div className="mt-4">
              <XpCounter target={xpAwarded} />
            </div>
          ) : null}
          <div className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm">
            <Award className="size-4" aria-hidden />
            Badge rewards coming soon
          </div>
          {journeyProgressPercent !== null ? (
            <p className="text-muted-foreground mt-2 text-sm">
              Journey progress updated to {journeyProgressPercent}%
            </p>
          ) : null}
          {nextLesson ? (
            <p className="mt-3 text-sm">
              Up next: <span className="font-medium">{nextLesson.title}</span>
            </p>
          ) : null}
        </div>

        <div className="relative mt-6 flex flex-wrap justify-center gap-3">
          {nextLesson && onContinue ? (
            <Button onClick={onContinue} type="button">
              Continue journey
            </Button>
          ) : null}
          <Button onClick={onDismiss} type="button" variant="outline">
            Close
          </Button>
        </div>
      </motion.section>
    </motion.div>
  );
}

export const CompletionCelebration = memo(CompletionCelebrationComponent);
CompletionCelebration.displayName = "CompletionCelebration";
