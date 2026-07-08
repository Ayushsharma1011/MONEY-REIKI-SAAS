"use client";

import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/types/core";

export function JournalCard({
  prompt,
  recentJournal
}: {
  prompt: string;
  recentJournal: JournalEntry | null;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur-sm"
      id="journal"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <NotebookPen className="text-accent size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          Today&apos;s Journal
        </h2>
      </div>
      <p className="text-base leading-relaxed italic">&ldquo;{prompt}&rdquo;</p>
      {recentJournal ? (
        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm">
          Last entry: {recentJournal.title}
        </p>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          Start your first journal entry and capture today&apos;s abundance.
        </p>
      )}
      <Button className="mt-5" variant="outline">
        {recentJournal ? "Write Journal" : "Create First Journal"}
      </Button>
    </motion.article>
  );
}
