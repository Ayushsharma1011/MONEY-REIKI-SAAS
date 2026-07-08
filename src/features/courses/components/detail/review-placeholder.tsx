"use client";

import { memo } from "react";
import { Star } from "lucide-react";

function ReviewPlaceholderComponent() {
  return (
    <section
      aria-label="Course reviews placeholder"
      className="bg-muted/30 rounded-2xl border border-dashed p-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Star className="text-muted-foreground size-4" aria-hidden />
        <h2 className="text-sm font-semibold tracking-wide uppercase">Reviews</h2>
      </div>
      <p className="text-muted-foreground text-sm">
        Student reviews are coming soon. Complete this course and be among the first to share
        your transformation story.
      </p>
    </section>
  );
}

export const ReviewPlaceholder = memo(ReviewPlaceholderComponent);
ReviewPlaceholder.displayName = "ReviewPlaceholder";
