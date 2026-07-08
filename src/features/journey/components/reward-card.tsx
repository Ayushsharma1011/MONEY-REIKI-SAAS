"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Award, Gift, Sparkles } from "lucide-react";
import type { JourneyRewardViewModel } from "@/features/journey/types";

type RewardCardProps = {
  reward: JourneyRewardViewModel;
  dayCompleted: boolean;
};

function RewardCardPending({ reward }: { reward: JourneyRewardViewModel }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      aria-label="Today's reward"
      className="from-accent/10 via-card to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.18, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Gift className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Today&apos;s Reward
        </h2>
      </div>
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-3"
        initial={{ opacity: 0, scale: 0.96 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-accent/15 flex size-12 items-center justify-center rounded-xl">
            <Award className="text-accent size-6" aria-hidden />
          </div>
          <div>
            <p className="font-semibold">{reward.badgeTitle}</p>
            <p className="text-accent text-sm font-medium">+{reward.xp} XP</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{reward.unlockMessage}</p>
      </motion.div>
    </motion.section>
  );
}

function RewardCardComponent({ reward, dayCompleted }: RewardCardProps) {
  if (dayCompleted) {
    return null;
  }

  return <RewardCardPending reward={reward} />;
}

export const RewardCard = memo(RewardCardComponent);
RewardCard.displayName = "RewardCard";

export function RewardPreviewBadge({ xp }: { xp: number }) {
  return (
    <span className="bg-accent/15 text-accent inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
      <Sparkles className="size-3" aria-hidden />
      +{xp} XP
    </span>
  );
}
