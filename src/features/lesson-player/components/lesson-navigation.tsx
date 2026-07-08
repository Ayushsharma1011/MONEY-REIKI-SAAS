"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type LessonNavigationProps = {
  previousLessonSlug: string | null;
  nextLessonSlug: string | null;
  onNavigate: (lessonSlug: string) => void;
};

function LessonNavigationComponent({
  previousLessonSlug,
  nextLessonSlug,
  onNavigate
}: LessonNavigationProps) {
  return (
    <nav
      aria-label="Lesson navigation"
      className="flex flex-wrap items-center justify-between gap-3 border-t pt-6"
    >
      {previousLessonSlug ? (
        <Button
          onClick={() => onNavigate(previousLessonSlug)}
          type="button"
          variant="outline"
        >
          <ChevronLeft className="mr-1 size-4" aria-hidden />
          Previous
        </Button>
      ) : (
        <span />
      )}
      {nextLessonSlug ? (
        <Button onClick={() => onNavigate(nextLessonSlug)} type="button">
          Next lesson
          <ChevronRight className="ml-1 size-4" aria-hidden />
        </Button>
      ) : null}
    </nav>
  );
}

export const LessonNavigation = memo(LessonNavigationComponent);
LessonNavigation.displayName = "LessonNavigation";
