"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LessonList } from "@/features/courses/components/detail/lesson-list";
import type { ModuleViewModel } from "@/features/courses/detail-types";
import { cn } from "@/lib/utils";

type ModuleAccordionProps = {
  modules: ModuleViewModel[];
  onLessonAction?: (lessonId: string) => void;
};

function ModuleAccordionItem({
  module,
  defaultOpen,
  onLessonAction
}: {
  module: ModuleViewModel;
  defaultOpen: boolean;
  onLessonAction?: (lessonId: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border">
      <button
        aria-expanded={open}
        className="hover:bg-muted/40 flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{module.title}</h3>
          {module.description ? (
            <p className="text-muted-foreground mt-1 text-sm">{module.description}</p>
          ) : null}
          <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-xs">
            <span>{module.lessonCount} lessons</span>
            <span>{module.completionPercent}% complete</span>
          </div>
          <div className="mt-2 max-w-xs">
            <Progress value={module.completionPercent} />
          </div>
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="border-t px-5 py-4"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LessonList lessons={module.lessons} onLessonAction={onLessonAction} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ModuleAccordionComponent({ modules, onLessonAction }: ModuleAccordionProps) {
  return (
    <section aria-label="Course modules">
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Modules</h2>
      <div className="space-y-3">
        {modules.map((module, index) => (
          <ModuleAccordionItem
            defaultOpen={index === 0}
            key={module.id}
            module={module}
            onLessonAction={onLessonAction}
          />
        ))}
      </div>
    </section>
  );
}

export const ModuleAccordion = memo(ModuleAccordionComponent);
ModuleAccordion.displayName = "ModuleAccordion";
