"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileArchive, FileImage, FileText, Link2 } from "lucide-react";
import type { GroupedResourcesViewModel } from "@/features/lesson-player/types";
import { resourceTypeLabel } from "@/features/lesson-player/utils";

const RESOURCE_ICONS = {
  pdf: FileText,
  zip: FileArchive,
  image: FileImage,
  link: Link2,
  external: ExternalLink
} as const;

type LessonResourcesProps = {
  grouped: GroupedResourcesViewModel;
  isLoading?: boolean;
};

function LessonResourcesComponent({ grouped, isLoading }: LessonResourcesProps) {
  const sections = (Object.keys(grouped) as Array<keyof GroupedResourcesViewModel>).filter(
    (key) => grouped[key].length > 0
  );

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading resources...</p>;
  }

  if (sections.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No downloadable resources for this lesson yet.
      </p>
    );
  }

  return (
    <section aria-label="Lesson resources" className="space-y-6">
      {sections.map((type) => {
        const Icon = RESOURCE_ICONS[type];
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 6 }}
            key={type}
          >
            <h3 className="mb-3 text-xs font-semibold tracking-wide uppercase">
              {resourceTypeLabel(type)}
            </h3>
            <ul className="space-y-2">
              {grouped[type].map((resource) => (
                <li
                  className="bg-card/70 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  key={resource.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    <span className="truncate text-sm font-medium">{resource.title}</span>
                  </div>
                  {resource.url ? (
                    <a
                      className="text-primary text-xs font-medium hover:underline"
                      href={resource.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-xs uppercase">{type}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </section>
  );
}

export const LessonResources = memo(LessonResourcesComponent);
LessonResources.displayName = "LessonResources";
