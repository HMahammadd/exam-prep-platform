import { ComingSoonPageSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <ComingSoonPageSkeleton
      examName="BLOK"
      backHref="/dashboard/dim"
      backLabel="DIM Practice"
    />
  );
}
