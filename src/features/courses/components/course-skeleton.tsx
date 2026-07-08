import { Skeleton } from "@/components/ui/skeleton";

export function CourseSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading course library" className="space-y-8">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-9 w-24 shrink-0 rounded-full" key={index} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-72 w-full rounded-2xl" key={index} />
        ))}
      </div>
    </div>
  );
}
