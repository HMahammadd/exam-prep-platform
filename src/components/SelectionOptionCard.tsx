import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { DimOption } from "@/lib/dim";

type SelectionOptionCardProps = {
  option: DimOption;
};

export function SelectionOptionCard({ option }: SelectionOptionCardProps) {
  const isAvailable = option.status === "available";

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-wide text-foreground">
          {option.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isAvailable
              ? "bg-accent-soft text-accent"
              : "bg-card-border text-muted"
          }`}
        >
          {isAvailable ? "Available" : "Coming Soon"}
        </span>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {option.description}
      </p>
      <span
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
          isAvailable
            ? "bg-accent text-white group-hover:bg-accent-hover"
            : "border border-card-border bg-background text-muted"
        }`}
      >
        {!isAvailable && <Clock className="h-4 w-4" aria-hidden />}
        {isAvailable ? "Continue" : "Coming Soon"}
        {isAvailable && <ArrowRight className="h-4 w-4" aria-hidden />}
      </span>
    </>
  );

  if (!isAvailable) {
    return (
      <div className="flex flex-col rounded-2xl border border-card-border bg-card p-6 opacity-75 shadow-card">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={option.href}
      className="group flex flex-col rounded-2xl border border-card-border bg-card p-6 shadow-card transition hover:border-accent hover:shadow-lg"
    >
      {cardContent}
    </Link>
  );
}
