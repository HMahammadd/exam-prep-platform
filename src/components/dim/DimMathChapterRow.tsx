import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { DimMathChapter } from "@/lib/dim-math-chapters";

type DimMathChapterRowProps = {
  chapter: DimMathChapter;
};

export function DimMathChapterRow({ chapter }: DimMathChapterRowProps) {
  const isAvailable = chapter.status === "available";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-card-border bg-card px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent">
          {chapter.id}
        </span>
        <h3 className="text-sm font-bold text-foreground sm:text-base">
          {chapter.title}
        </h3>
        {!isAvailable && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card-border px-2.5 py-0.5 text-xs font-medium text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Coming Soon
          </span>
        )}
      </div>

      {isAvailable ? (
        <Link
          href={`/dashboard/dim/buraxilis/math/${chapter.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover sm:shrink-0"
        >
          Start Practice
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted sm:shrink-0">
          <Clock className="h-4 w-4" aria-hidden />
          Coming Soon
        </span>
      )}
    </div>
  );
}
