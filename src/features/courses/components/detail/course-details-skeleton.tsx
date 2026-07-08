import { Skeleton } from "@/components/ui/skeleton";

export function CourseDetailsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading course details" className="space-y-8">
      <Skeleton className="h-72 w-full rounded-3xl" />
      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-32 w-full rounded-2xl" key={index} />
          ))}
        </div>
        <Skeleton className="hidden h-80 rounded-2xl xl:block" />
      </div>
    </div>
  );
}
