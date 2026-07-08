"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LessonList } from "@/features/courses/components/detail/lesson-list";
import type { LessonSidebarViewModel } from "@/features/lesson-player/types";
import { cn } from "@/lib/utils";

type LessonSidebarProps = {
  sidebar: LessonSidebarViewModel;
  onLessonSelect: (lessonSlug: string) => void;
  onBackToCourse: () => void;
  collapsed?: boolean;
};

function LessonSidebarComponent({
  sidebar,
  onLessonSelect,
  onBackToCourse,
  collapsed = false
}: LessonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentModule =
    sidebar.modules.find((module) =>
      module.lessons.some((lesson) => lesson.id === sidebar.currentLessonId)
    ) ?? sidebar.modules[0];

  const content = (
    <aside aria-label="Course progress sidebar" className="space-y-5">
      <button
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        onClick={onBackToCourse}
        type="button"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {sidebar.courseTitle}
      </button>

      <div className="bg-card/70 rounded-2xl border p-4">
        <p className="text-muted-foreground text-xs uppercase">Course progress</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{sidebar.progressPercent}%</p>
        <div className="mt-3">
          <Progress value={sidebar.progressPercent} />
        </div>
        {sidebar.journeyTitle ? (
          <p className="text-muted-foreground mt-3 text-xs">
            {sidebar.journeyTitle}
            {sidebar.journeyDay ? ` · Day ${sidebar.journeyDay}` : ""} ·{" "}
            {sidebar.journeyProgressPercent}% journey
          </p>
        ) : null}
      </div>

      {currentModule ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase">
            {currentModule.title}
          </h2>
          <LessonList
            lessons={currentModule.lessons}
            onLessonAction={(lessonId) => {
              const lesson = currentModule.lessons.find((item) => item.id === lessonId);
              if (lesson && lesson.status !== "locked") onLessonSelect(lesson.slug);
            }}
          />
        </div>
      ) : null}
    </aside>
  );

  if (collapsed) {
    return (
      <>
        <button
          aria-expanded={mobileOpen}
          className="bg-card flex w-full items-center justify-between rounded-xl border px-4 py-3 xl:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          type="button"
        >
          <span className="text-sm font-medium">Lessons</span>
          <ChevronDown className={cn("size-4 transition-transform", mobileOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              className="overflow-hidden xl:hidden"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
            >
              <div className="pt-4">{content}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="hidden xl:block">{content}</div>
      </>
    );
  }

  return content;
}

export const LessonSidebar = memo(LessonSidebarComponent);
LessonSidebar.displayName = "LessonSidebar";
