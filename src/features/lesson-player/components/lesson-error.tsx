"use client";

import { memo } from "react";
import { Lock, SearchX, VideoOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import type { LessonAccessState, LessonVideoState } from "@/features/lesson-player/types";

type LessonErrorProps = {
  variant: "not-found" | "locked" | "no-video" | "processing" | "playback";
  message?: string;
  onBack?: () => void;
  onRetry?: () => void;
};

function getVariantFromStates(
  accessState: LessonAccessState,
  videoState: LessonVideoState
): LessonErrorProps["variant"] | null {
  if (accessState === "missing") return "not-found";
  if (accessState === "locked") return "locked";
  if (videoState === "none") return "no-video";
  if (videoState === "processing") return "processing";
  if (videoState === "error") return "playback";
  return null;
}

function LessonErrorComponent({ variant, message, onBack, onRetry }: LessonErrorProps) {
  if (variant === "not-found") {
    return (
      <ErrorStateCard
        description="This lesson may have moved or is no longer available."
        onRetry={onBack}
        title="Lesson not found"
      />
    );
  }

  const icons = {
    locked: Lock,
    "no-video": VideoOff,
    processing: AlertCircle,
    playback: AlertCircle,
    "not-found": SearchX
  } as const;

  const titles = {
    locked: "Lesson locked",
    "no-video": "No video available",
    processing: "Video processing",
    playback: "Playback error",
    "not-found": "Lesson not found"
  } as const;

  const descriptions = {
    locked: "Complete the previous lesson to unlock this content.",
    "no-video": "This lesson does not include video content yet.",
    processing: "Your video is being prepared. Please check back shortly.",
    playback: message ?? "We couldn't load the video. Try again in a moment.",
    "not-found": "Lesson was not found."
  } as const;

  const Icon = icons[variant];

  return (
    <div
      className="bg-card/70 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border p-8 text-center"
      role="alert"
    >
      <div className="bg-muted mb-4 flex size-14 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-7" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{titles[variant]}</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">{descriptions[variant]}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onBack ? (
          <Button onClick={onBack} type="button" variant="outline">
            Back to course
          </Button>
        ) : null}
        {onRetry ? (
          <Button onClick={onRetry} type="button">
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export const LessonError = memo(LessonErrorComponent);
LessonError.displayName = "LessonError";
export { getVariantFromStates };
