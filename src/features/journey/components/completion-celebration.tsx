"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import type { TomorrowPreviewViewModel } from "@/features/journey/types";
import { TomorrowPreviewCard } from "@/features/journey/components/tomorrow-preview-card";

type CompletionCelebrationProps = {
  tomorrow: TomorrowPreviewViewModel | null;
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
  const style = useMemo(
    () => ({
      left: `${(index * 17) % 100}%`,
      animationDelay: `${(index % 5) * 0.1}s`,
      backgroundColor: undefined as string | undefined
    }),
    [index]
  );

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
      style={{ left: style.left }}
      transition={{ duration: 1.2 + (index % 3) * 0.2, ease: "easeOut" }}
    />
  );
}

function CompletionCelebrationComponent({ tomorrow }: CompletionCelebrationProps) {
  return (
    <motion.section
      animate={{ opacity: 1, scale: 1 }}
      aria-label="Day completed celebration"
      className="from-accent/20 via-card to-primary/10 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-md"
      initial={{ opacity: 0, scale: 0.98 }}
      role="status"
      transition={{ duration: 0.45 }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, index) => (
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
          Day Complete
        </div>
        <h3 className="text-xl font-semibold">Beautiful work today!</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          You&apos;ve completed today&apos;s journey. Rest, reflect, and return tomorrow.
        </p>
      </div>

      {tomorrow ? (
        <div className="relative mt-5">
          <TomorrowPreviewCard preview={tomorrow} />
        </div>
      ) : null}
    </motion.section>
  );
}

export const CompletionCelebration = memo(CompletionCelebrationComponent);
CompletionCelebration.displayName = "CompletionCelebration";
