"use client";

import { memo } from "react";
import { FileArchive, FileImage, FileText, Link2 } from "lucide-react";
import type { CourseResourceViewModel } from "@/features/courses/detail-types";

const RESOURCE_ICONS = {
  pdf: FileText,
  zip: FileArchive,
  image: FileImage,
  link: Link2,
  external: Link2
} as const;

function CourseResourcesComponent({ resources }: { resources: CourseResourceViewModel[] }) {
  if (resources.length === 0) return null;

  return (
    <section aria-label="Course resources">
      <h2 className="mb-4 text-sm font-semibold tracking-wide uppercase">Resources</h2>
      <ul className="space-y-2">
        {resources.map((resource) => {
          const Icon = RESOURCE_ICONS[resource.resourceType] ?? FileText;
          return (
            <li
              className="bg-card/70 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
              key={resource.id}
            >
              <div className="flex items-center gap-3">
                <Icon className="text-muted-foreground size-4" aria-hidden />
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-muted-foreground text-xs">{resource.lessonTitle}</p>
                </div>
              </div>
              <span className="text-muted-foreground text-xs uppercase">{resource.resourceType}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const CourseResources = memo(CourseResourcesComponent);
CourseResources.displayName = "CourseResources";
