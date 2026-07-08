"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Spinner } from "@/components/ui/loader";
import type { LessonNoteViewModel } from "@/features/lesson-player/types";

type LessonNotesProps = {
  notes: LessonNoteViewModel[];
  isLoading?: boolean;
  onCreate: (content: string) => Promise<void>;
  onEdit: (noteId: string, content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
};

function LessonNotesComponent({ notes, isLoading, onCreate, onEdit, onDelete }: LessonNotesProps) {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => note.content.toLowerCase().includes(normalized));
  }, [notes, search]);

  const handleCreate = useCallback(async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onCreate(draft.trim());
      setDraft("");
    } finally {
      setSaving(false);
    }
  }, [draft, onCreate]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editDraft.trim()) return;
    setSaving(true);
    try {
      await onEdit(editingId, editDraft.trim());
      setEditingId(null);
      setEditDraft("");
    } finally {
      setSaving(false);
    }
  }, [editDraft, editingId, onEdit]);

  return (
    <section aria-label="Lesson notes" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Notes</h2>
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Search notes"
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes..."
            value={search}
          />
        </div>
      </div>

      <textarea
        aria-label="Write a note"
        className="bg-background min-h-[120px] w-full rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Capture insights as you learn. Auto-saves longer notes."
        value={draft}
      />
      <div className="flex justify-end">
        <Button disabled={!draft.trim() || saving} onClick={() => void handleCreate()} type="button">
          {saving ? <Spinner className="size-4" /> : "Save note"}
        </Button>
      </div>

      {isLoading ? <Loader aria-label="Loading notes" /> : null}

      <ul className="space-y-3">
        {filtered.map((note, index) => (
          <motion.li
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/70 rounded-xl border p-4"
            initial={{ opacity: 0, y: 6 }}
            key={note.id}
            transition={{ delay: index * 0.03 }}
          >
            {editingId === note.id ? (
              <div className="space-y-3">
                <textarea
                  className="bg-background min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm"
                  onChange={(event) => setEditDraft(event.target.value)}
                  value={editDraft}
                />
                <div className="flex gap-2">
                  <Button onClick={() => void handleSaveEdit()} size="sm" type="button">
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingId(null)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    {new Date(note.updatedAt).toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      aria-label="Edit note"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditDraft(note.content);
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      aria-label="Delete note"
                      onClick={() => void onDelete(note.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.li>
        ))}
      </ul>

      {!isLoading && filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notes yet. Start capturing your insights.</p>
      ) : null}
    </section>
  );
}

export const LessonNotes = memo(LessonNotesComponent);
LessonNotes.displayName = "LessonNotes";
