import { Skeleton } from "@/components/ui/skeleton";

export function JourneySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading daily ritual" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-72" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-56 w-full rounded-3xl" />
      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <Skeleton className="h-8 w-40" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex gap-4" key={index}>
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <Skeleton className="h-16 flex-1 rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="space-y-4 xl:col-span-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-40 w-full rounded-2xl" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
