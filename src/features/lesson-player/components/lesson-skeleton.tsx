"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function LessonSkeletonComponent() {
  return (
    <div aria-busy="true" aria-label="Loading lesson" className="space-y-6">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="hidden h-96 rounded-2xl xl:block" />
      </div>
    </div>
  );
}

export const LessonSkeleton = memo(LessonSkeletonComponent);
LessonSkeleton.displayName = "LessonSkeleton";
