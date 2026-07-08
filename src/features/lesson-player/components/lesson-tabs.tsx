"use client";

import { lazy, memo, Suspense, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const LessonTranscriptPlaceholder = lazy(() =>
  import("@/features/lesson-player/components/lesson-transcript-placeholder").then((mod) => ({
    default: mod.LessonTranscriptPlaceholder
  }))
);

const LessonDiscussionPlaceholder = lazy(() =>
  import("@/features/lesson-player/components/lesson-transcript-placeholder").then((mod) => ({
    default: mod.LessonDiscussionPlaceholder
  }))
);

type TabId = "overview" | "notes" | "resources" | "transcript" | "discussion";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
  { id: "resources", label: "Resources" },
  { id: "transcript", label: "Transcript" },
  { id: "discussion", label: "Discussion" }
];

type LessonTabsProps = {
  overview: ReactNode;
  notes: ReactNode;
  resources: ReactNode;
};

function TabFallback() {
  return <p className="text-muted-foreground text-sm">Loading...</p>;
}

function LessonTabsComponent({ overview, notes, resources }: LessonTabsProps) {
  const [active, setActive] = useState<TabId>("overview");

  const panels: Record<TabId, ReactNode> = {
    overview: (
      <Suspense fallback={<TabFallback />}>
        {overview}
      </Suspense>
    ),
    notes: (
      <Suspense fallback={<TabFallback />}>
        {notes}
      </Suspense>
    ),
    resources: (
      <Suspense fallback={<TabFallback />}>
        {resources}
      </Suspense>
    ),
    transcript: (
      <Suspense fallback={<TabFallback />}>
        <LessonTranscriptPlaceholder />
      </Suspense>
    ),
    discussion: (
      <Suspense fallback={<TabFallback />}>
        <LessonDiscussionPlaceholder />
      </Suspense>
    )
  };

  return (
    <section aria-label="Lesson content tabs">
      <div
        className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            aria-selected={active === tab.id}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
              active === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
            key={tab.id}
            onClick={() => setActive(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5" role="tabpanel">
        {panels[active]}
      </div>
    </section>
  );
}

export const LessonTabs = memo(LessonTabsComponent);
LessonTabs.displayName = "LessonTabs";
