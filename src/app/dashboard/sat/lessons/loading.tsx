import { Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading lesson">
      <Skeleton className="h-8 w-56 max-w-full" />
      <span className="sr-only">Loading lesson…</span>
    </div>
  );
}
