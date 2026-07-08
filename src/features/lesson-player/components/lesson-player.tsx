"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { ROUTES } from "@/constants/app";
import { XP_PER_LESSON } from "@/features/courses/constants";
import { CompletionCelebration } from "@/features/lesson-player/components/completion-celebration";
import { getVariantFromStates, LessonError } from "@/features/lesson-player/components/lesson-error";
import { LessonHeader } from "@/features/lesson-player/components/lesson-header";
import { LessonNavigation } from "@/features/lesson-player/components/lesson-navigation";
import { LessonSidebar } from "@/features/lesson-player/components/lesson-sidebar";
import { LessonSkeleton } from "@/features/lesson-player/components/lesson-skeleton";
import { LessonTabs } from "@/features/lesson-player/components/lesson-tabs";
import { LessonOverview } from "@/features/lesson-player/components/lesson-overview";
import { LessonNotes } from "@/features/lesson-player/components/lesson-notes";
import { LessonBookmarks } from "@/features/lesson-player/components/lesson-bookmarks";
import { LessonResources } from "@/features/lesson-player/components/lesson-resources";
import { NextLessonCard } from "@/features/lesson-player/components/next-lesson-card";
import { VideoPlayer } from "@/features/lesson-player/components/video-player";
import {
  useCompleteLesson,
  useLesson,
  useLessonBookmarks,
  useLessonNotes,
  useLessonResources,
  useLessonResume
} from "@/features/lesson-player/hooks";
import type { CompleteLessonResult, VideoPlayerRef } from "@/features/lesson-player/types";
import { groupResourcesByType } from "@/features/lesson-player/utils";
import { ErrorStateCard } from "@/features/dashboard/components/empty-state-card";
import { useAuth } from "@/providers/auth-provider";

type LessonPlayerProps = {
  courseSlug: string;
  lessonSlug: string;
};

function LessonPlayerComponent({ courseSlug, lessonSlug }: LessonPlayerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<VideoPlayerRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [celebration, setCelebration] = useState<CompleteLessonResult | null>(null);

  const { data, error, isLoading, refetch } = useLesson(user?.id, courseSlug, lessonSlug);

  const resumeState = useMemo(
    () => ({
      positionSeconds: data?.video.resumePositionSeconds ?? 0,
      watchTimeSeconds: data?.watchTimeSeconds ?? 0,
      playbackSpeed: data?.video.playbackSpeed ?? 1
    }),
    [data]
  );

  const { updateState, saveNow } = useLessonResume(user?.id, data?.lessonId, resumeState);

  const notes = useLessonNotes(user?.id, data?.lessonId);
  const bookmarks = useLessonBookmarks(user?.id, data?.lessonId);
  const resources = useLessonResources(data?.lessonId);
  const completeLesson = useCompleteLesson(user?.id, courseSlug, lessonSlug);

  useEffect(() => {
    if (!data) return;
    setWatchTime(data.watchTimeSeconds);
    setPlaybackSpeed(data.video.playbackSpeed);
  }, [data]);

  const navigateToLesson = useCallback(
    (slug: string) => {
      router.push(ROUTES.lesson(courseSlug, slug));
    },
    [courseSlug, router]
  );

  const handleBackToCourse = useCallback(() => {
    router.push(`${ROUTES.courses}/${courseSlug}`);
  }, [courseSlug, router]);

  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTime(time);
      setWatchTime((prev) => Math.max(prev, Math.floor(time)));
      updateState({
        positionSeconds: time,
        watchTimeSeconds: Math.max(watchTime, Math.floor(time)),
        playbackSpeed
      });
    },
    [playbackSpeed, updateState, watchTime]
  );

  const handleComplete = useCallback(async () => {
    if (!data || data.isCompleted) return;
    await saveNow();
    const result = await completeLesson.mutateAsync({
      lessonId: data.lessonId,
      watchTimeSeconds: Math.max(watchTime, Math.floor(currentTime)),
      journeyTaskId: data.journeyTaskId,
      journeyId: data.journeyId,
      xpAmount: data.header.xpReward || XP_PER_LESSON
    });
    setCelebration(result);
  }, [completeLesson, currentTime, data, saveNow, watchTime]);

  const previousLessonSlug = useMemo(() => {
    if (!data) return null;
    const index = data.allLessons.findIndex((lesson) => lesson.id === data.lessonId);
    if (index <= 0) return null;
    return data.allLessons[index - 1]?.slug ?? null;
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          videoRef.current?.togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          videoRef.current?.seekTo(Math.max(0, (videoRef.current.getCurrentTime() ?? 0) - 10));
          break;
        case "ArrowRight":
          event.preventDefault();
          videoRef.current?.seekTo((videoRef.current.getCurrentTime() ?? 0) + 10);
          break;
        case "m":
        case "M":
          event.preventDefault();
          break;
        case "f":
        case "F":
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) return <LessonSkeleton />;

  if (error?.message.toLowerCase().includes("not found")) {
    return (
      <LessonError onBack={handleBackToCourse} variant="not-found" />
    );
  }

  if (error || !data) {
    return (
      <ErrorStateCard
        description="We couldn't load this lesson. Please try again."
        onRetry={() => void refetch()}
        title="Lesson unavailable"
      />
    );
  }

  if (data.accessState === "locked") {
    return (
      <div className="space-y-4">
        <LessonError onBack={handleBackToCourse} variant="locked" />
      </div>
    );
  }

  const videoErrorVariant = getVariantFromStates(data.accessState, data.video.state);

  const groupedResources = groupResourcesByType(resources.data ?? []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-6 pb-32 lg:pb-8"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {videoErrorVariant && data.video.state !== "ready" ? (
        <LessonError
          message={data.video.errorMessage ?? undefined}
          onBack={handleBackToCourse}
          variant={videoErrorVariant}
        />
      ) : (
        <VideoPlayer
          onPlaybackSpeedChange={setPlaybackSpeed}
          onTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          video={data.video}
        />
      )}

      <LessonHeader courseTitle={data.courseTitle} header={data.header} />

      {!data.isCompleted ? (
        <Button
          className="w-full sm:w-auto"
          disabled={completeLesson.isPending}
          onClick={() => void handleComplete()}
          type="button"
        >
          {completeLesson.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <CheckCircle2 className="mr-2 size-4" aria-hidden />
              Complete lesson
            </>
          )}
        </Button>
      ) : (
        <p className="text-accent text-sm font-medium">You&apos;ve completed this lesson.</p>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <LessonSidebar
            collapsed
            onBackToCourse={handleBackToCourse}
            onLessonSelect={navigateToLesson}
            sidebar={data.sidebar}
          />

          <LessonTabs
            notes={
              <div className="space-y-8">
                <LessonNotes
                  isLoading={notes.isLoading}
                  notes={notes.data ?? []}
                  onCreate={async (content) => {
                    await notes.createNote.mutateAsync(content);
                  }}
                  onDelete={async (noteId) => {
                    await notes.removeNote.mutateAsync(noteId);
                  }}
                  onEdit={async (noteId, content) => {
                    await notes.editNote.mutateAsync({ noteId, content });
                  }}
                />
                <LessonBookmarks
                  bookmarks={bookmarks.data ?? []}
                  currentTime={currentTime}
                  onAdd={async (timestampSeconds, note) => {
                    await bookmarks.addBookmark.mutateAsync({ timestampSeconds, note });
                  }}
                  onDelete={async (bookmarkId) => {
                    await bookmarks.removeBookmark.mutateAsync(bookmarkId);
                  }}
                  onJump={(timestamp) => videoRef.current?.seekTo(timestamp)}
                />
              </div>
            }
            overview={<LessonOverview description={data.overview.description} />}
            resources={
              <LessonResources grouped={groupedResources} isLoading={resources.isLoading} />
            }
          />

          <LessonNavigation
            nextLessonSlug={data.nextLesson?.slug ?? null}
            onNavigate={navigateToLesson}
            previousLessonSlug={previousLessonSlug}
          />
        </div>

        <div className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            <LessonSidebar
              onBackToCourse={handleBackToCourse}
              onLessonSelect={navigateToLesson}
              sidebar={data.sidebar}
            />
          </div>
        </div>
      </div>

      {data.nextLesson && !data.isCompleted ? (
        <NextLessonCard
          nextLesson={data.nextLesson}
          onContinue={() => navigateToLesson(data.nextLesson!.slug)}
        />
      ) : null}

      {celebration ? (
        <CompletionCelebration
          journeyProgressPercent={celebration.journeyProgressPercent}
          nextLesson={celebration.nextLesson}
          onContinue={
            celebration.nextLesson
              ? () => {
                  setCelebration(null);
                  navigateToLesson(celebration.nextLesson!.slug);
                }
              : undefined
          }
          onDismiss={() => setCelebration(null)}
          xpAwarded={celebration.xpAwarded}
        />
      ) : null}

      <div className="bg-card fixed inset-x-0 bottom-16 z-30 border-t p-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <Button onClick={() => videoRef.current?.togglePlay()} size="sm" type="button" variant="outline">
            Play / Pause
          </Button>
          <Button
            disabled={data.isCompleted || completeLesson.isPending}
            onClick={() => void handleComplete()}
            size="sm"
            type="button"
          >
            Complete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export const LessonPlayer = memo(LessonPlayerComponent);
LessonPlayer.displayName = "LessonPlayer";
