"use client";

import { memo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/features/courses/components/course-card";
import { CourseEmptyState } from "@/features/courses/components/course-empty-state";
import type { CourseCardViewModel } from "@/features/courses/types";

type RecentlyViewedCarouselProps = {
  courses: CourseCardViewModel[];
  onContinue?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string, isFavorite: boolean) => void;
};

function RecentlyViewedCarouselComponent({
  courses,
  onContinue,
  onToggleFavorite
}: RecentlyViewedCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth"
    });
  };

  if (courses.length === 0) {
    return <CourseEmptyState variant="no-recent" />;
  }

  return (
    <section aria-label="Recently viewed courses">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Recently Viewed</h2>
        <div className="flex gap-1">
          <Button
            aria-label="Scroll recently viewed left"
            onClick={() => scroll("left")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            aria-label="Scroll recently viewed right"
            onClick={() => scroll("right")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <div
        className="scrollbar-hide -mx-1 flex gap-4 overflow-x-auto px-1 pb-2"
        ref={scrollerRef}
      >
        {courses.map((course, index) => (
          <CourseCard
            compact
            course={course}
            index={index}
            key={course.id}
            onContinue={onContinue}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

export const RecentlyViewedCarousel = memo(RecentlyViewedCarouselComponent);
RecentlyViewedCarousel.displayName = "RecentlyViewedCarousel";
