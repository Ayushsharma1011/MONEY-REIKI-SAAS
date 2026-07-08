"use client";

import { memo } from "react";
import { MessageSquare } from "lucide-react";

function LessonTranscriptPlaceholderComponent() {
  return (
    <section
      aria-label="Transcript placeholder"
      className="bg-card/50 rounded-2xl border border-dashed p-8 text-center"
    >
      <p className="text-muted-foreground text-sm">
        Interactive transcripts are coming soon. Follow along with captions while you watch.
      </p>
    </section>
  );
}

function LessonDiscussionPlaceholderComponent() {
  return (
    <section
      aria-label="Discussion placeholder"
      className="bg-card/50 flex flex-col items-center rounded-2xl border border-dashed p-8 text-center"
    >
      <MessageSquare className="text-muted-foreground mb-3 size-8" aria-hidden />
      <h3 className="font-medium">Community discussion</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Connect with fellow students and share insights. Discussion threads will appear here.
      </p>
    </section>
  );
}

export const LessonTranscriptPlaceholder = memo(LessonTranscriptPlaceholderComponent);
LessonTranscriptPlaceholder.displayName = "LessonTranscriptPlaceholder";

export const LessonDiscussionPlaceholder = memo(LessonDiscussionPlaceholderComponent);
LessonDiscussionPlaceholder.displayName = "LessonDiscussionPlaceholder";
