import { useI18n } from "@/hooks/useI18n";
import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder cards for the bookings and messages lists while they load */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useI18n();
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        {t.states.loading}
      </span>
      <ul className="space-y-3" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="p-4 sm:p-5 rounded-md bg-card border border-line space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-32" />
          </li>
        ))}
      </ul>
    </div>
  );
}
