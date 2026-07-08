"use client";

import { memo, useMemo, useRef, useState } from "react";
import { LessonCard } from "@/features/courses/components/detail/lesson-card";
import type { LessonCardViewModel } from "@/features/courses/detail-types";

const VIRTUAL_THRESHOLD = 100;
const VIRTUAL_WINDOW = 30;

type LessonListProps = {
  lessons: LessonCardViewModel[];
  onLessonAction?: (lessonId: string) => void;
};

function LessonListComponent({ lessons, onLessonAction }: LessonListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const shouldVirtualize = lessons.length > VIRTUAL_THRESHOLD;
  const itemHeight = 120;

  const visibleLessons = useMemo(() => {
    if (!shouldVirtualize) return lessons;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
    const end = Math.min(lessons.length, start + VIRTUAL_WINDOW);
    return lessons.slice(start, end).map((lesson, index) => ({
      lesson,
      index: start + index
    }));
  }, [lessons, scrollTop, shouldVirtualize]);

  if (shouldVirtualize) {
    const windowed = visibleLessons as Array<{ lesson: LessonCardViewModel; index: number }>;
    return (
      <div
        aria-label="Course lessons"
        className="max-h-[480px] overflow-y-auto"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        ref={containerRef}
        role="list"
        style={{ height: Math.min(lessons.length * itemHeight, 480) }}
      >
        <div style={{ height: lessons.length * itemHeight, position: "relative" }}>
          {windowed.map(({ lesson, index }) => (
            <div
              key={lesson.id}
              role="listitem"
              style={{
                position: "absolute",
                top: index * itemHeight,
                left: 0,
                right: 0
              }}
            >
              <LessonCard index={index} lesson={lesson} onAction={onLessonAction} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-label="Course lessons" className="space-y-3" role="list">
      {lessons.map((lesson, index) => (
        <div key={lesson.id} role="listitem">
          <LessonCard index={index} lesson={lesson} onAction={onLessonAction} />
        </div>
      ))}
    </div>
  );
}

export const LessonList = memo(LessonListComponent);
LessonList.displayName = "LessonList";
