"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getFallbackAffirmation } from "@/features/dashboard/utils";
import type { Affirmation } from "@/types/core";

function getAffirmationText(affirmation: Affirmation | string): string {
  return typeof affirmation === "string" ? affirmation : affirmation.content;
}

export function AffirmationCard({
  affirmation
}: {
  affirmation: Affirmation | string;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(getAffirmationText(affirmation));

  const refresh = () => {
    setIndex((value) => value + 1);
    setText(getFallbackAffirmation(new Date(Date.now() + index * 86_400_000)));
  };

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="from-accent/15 via-card to-card relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.16, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-accent size-4" aria-hidden />
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Daily Affirmation
          </h2>
        </div>
        <Button aria-label="Refresh affirmation" onClick={refresh} size="icon" variant="ghost">
          <RefreshCw className="size-4" aria-hidden />
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          animate={{ opacity: 1, scale: 1 }}
          className="text-lg leading-relaxed font-medium"
          exit={{ opacity: 0, scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.98 }}
          key={text}
          transition={{ duration: 0.25 }}
        >
          &ldquo;{text}&rdquo;
        </motion.p>
      </AnimatePresence>
    </motion.article>
  );
}
