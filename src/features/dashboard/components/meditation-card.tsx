"use client";

import { motion } from "framer-motion";
import { Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyStateCard } from "@/features/dashboard/components/empty-state-card";
import type { Meditation } from "@/types/core";

export function MeditationCard({ meditation }: { meditation: Meditation | null }) {
  if (!meditation) {
    return (
      <div id="meditation">
        <EmptyStateCard
          actionLabel="Start Recommended Meditation"
          description="A calming Money Reiki meditation is ready for you."
          title="Recommended meditation"
        />
      </div>
    );
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      id="meditation"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.12, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Headphones className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">Meditation</h2>
      </div>
      <h3 className="text-lg font-semibold">{meditation.title}</h3>
      <p className="text-muted-foreground mt-1 text-sm capitalize">
        {meditation.category} · {meditation.duration} min
      </p>
      <Button className="mt-5 gap-2">
        <Play className="size-4" aria-hidden />
        Play Meditation
      </Button>
      <p className="text-muted-foreground mt-4 text-xs uppercase tracking-wide">
        Recently played
      </p>
    </motion.article>
  );
}
