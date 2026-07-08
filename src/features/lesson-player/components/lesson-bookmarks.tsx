"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { BookmarkPlus, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LessonBookmarkViewModel } from "@/features/lesson-player/types";

type LessonBookmarksProps = {
  bookmarks: LessonBookmarkViewModel[];
  currentTime: number;
  onAdd: (timestampSeconds: number, note?: string) => Promise<void>;
  onJump: (timestampSeconds: number) => void;
  onDelete: (bookmarkId: string) => Promise<void>;
};

function LessonBookmarksComponent({
  bookmarks,
  currentTime,
  onAdd,
  onJump,
  onDelete
}: LessonBookmarksProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await onAdd(Math.floor(currentTime), note.trim() || undefined);
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-label="Lesson bookmarks" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Bookmarks</h2>
        <div className="flex flex-1 flex-wrap items-end gap-2 sm:max-w-md">
          <Input
            aria-label="Bookmark note"
            className="flex-1"
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note..."
            value={note}
          />
          <Button disabled={saving} onClick={() => void handleAdd()} type="button">
            <BookmarkPlus className="mr-1.5 size-4" aria-hidden />
            Bookmark
          </Button>
        </div>
      </div>

      <ul className="space-y-2">
        {bookmarks.map((bookmark, index) => (
          <motion.li
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/70 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
            initial={{ opacity: 0, x: -6 }}
            key={bookmark.id}
            transition={{ delay: index * 0.03 }}
          >
            <div className="min-w-0">
              <p className="font-medium tabular-nums">{bookmark.formattedTime}</p>
              {bookmark.note ? (
                <p className="text-muted-foreground truncate text-xs">{bookmark.note}</p>
              ) : null}
            </div>
            <div className="flex gap-1">
              <Button
                aria-label={`Jump to ${bookmark.formattedTime}`}
                onClick={() => onJump(bookmark.timestampSeconds)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Play className="size-4" />
              </Button>
              <Button
                aria-label="Delete bookmark"
                onClick={() => void onDelete(bookmark.id)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </motion.li>
        ))}
      </ul>

      {bookmarks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Bookmark key moments to revisit later.
        </p>
      ) : null}
    </section>
  );
}

export const LessonBookmarks = memo(LessonBookmarksComponent);
LessonBookmarks.displayName = "LessonBookmarks";
