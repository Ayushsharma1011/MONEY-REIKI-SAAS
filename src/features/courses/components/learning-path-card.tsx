"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LearningPathViewModel } from "@/features/courses/types";

type LearningPathCardProps = {
  path: LearningPathViewModel;
  index?: number;
  onOpen?: (slug: string) => void;
};

function LearningPathCardComponent({ path, index = 0, onOpen }: LearningPathCardProps) {
  return (
    <motion.article
      animate={{ opacity: 1, x: 0 }}
      className="bg-card/80 min-w-[300px] shrink-0 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      initial={{ opacity: 0, x: 16 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Map className="text-accent size-4" aria-hidden />
        <span className="text-muted-foreground text-xs capitalize">{path.level}</span>
      </div>
      <h3 className="text-lg font-semibold">{path.title}</h3>
      {path.description ? (
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{path.description}</p>
      ) : null}
      <div className="text-muted-foreground mt-4 flex items-center justify-between text-xs">
        <span>{path.courseCount} courses</span>
        <span className="text-accent inline-flex items-center gap-1 font-medium">
          <Sparkles className="size-3.5" aria-hidden />
          {path.completionPercent}% complete
        </span>
      </div>
      <div className="mt-3">
        <Progress value={path.completionPercent} />
      </div>
      <Button
        className="mt-4 w-full gap-2"
        onClick={() => onOpen?.(path.slug)}
        size="sm"
        type="button"
        variant="outline"
      >
        Open Path
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </motion.article>
  );
}

export const LearningPathCard = memo(LearningPathCardComponent);
LearningPathCard.displayName = "LearningPathCard";
