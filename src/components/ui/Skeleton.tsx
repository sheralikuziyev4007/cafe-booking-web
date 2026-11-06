/** Grey placeholder shown while data loads. Decorative, so it is hidden from screen readers. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-sm bg-line/60 ${className}`} />;
}
