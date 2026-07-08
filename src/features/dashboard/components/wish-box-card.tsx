"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyStateCard } from "@/features/dashboard/components/empty-state-card";
import type { WishBoxItem } from "@/types/core";

export function WishBoxCard({ wish }: { wish: WishBoxItem | null }) {
  if (!wish) {
    return (
      <div id="wish-box">
        <EmptyStateCard
          actionLabel="Create Your First Wish"
          description="Visualize your financial goals and track manifestation progress."
          title="Your wish box is empty"
        />
      </div>
    );
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      id="wish-box"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.14, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Gift className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">Wish Box</h2>
      </div>
      <h3 className="text-lg font-semibold">{wish.title}</h3>
      {wish.description ? (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
          {wish.description}
        </p>
      ) : null}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Visualization progress</span>
          <span>45%</span>
        </div>
        <Progress value={45} />
      </div>
      <Button className="mt-5" variant="secondary">
        Open Wish Box
      </Button>
    </motion.article>
  );
}
