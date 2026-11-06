import { Skeleton } from "@/components/ui/Skeleton";

/** Same proportions as MenuCard, so nothing jumps when the real cards appear */
export function MenuCardSkeleton() {
  return (
    <div className="h-full rounded-md bg-card border border-line overflow-hidden flex flex-col">
      <Skeleton className="aspect-[4/3] w-full !rounded-none" />
      <div className="p-6 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20 mt-auto" />
      </div>
    </div>
  );
}
