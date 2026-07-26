"use client";

import { memo, useMemo } from "react";
import { ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";

export type QuestionNavItem = {
  index: number;
  number: number;
  isAnswered: boolean;
  isMarked: boolean;
  isActive: boolean;
};

type DimMathQuestionNavigatorProps = {
  items: QuestionNavItem[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: (index: number) => void;
};

const NavCell = memo(function NavCell({
  item,
  onSelect,
}: {
  item: QuestionNavItem;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.index)}
      aria-label={`Sual ${item.number}${
        item.isMarked ? ", işarələnib" : ""
      }${item.isAnswered ? ", cavablanıb" : ""}${
        item.isActive ? ", cari sual" : ""
      }`}
      aria-current={item.isActive ? "step" : undefined}
      className={`relative flex h-9 w-full items-center justify-center rounded-lg border text-sm font-semibold transition ${
        item.isActive
          ? "border-accent bg-accent text-white shadow-md ring-2 ring-accent/40 ring-offset-1 ring-offset-background"
          : item.isAnswered
            ? "border-accent bg-accent text-white"
            : "border-card-border bg-card text-foreground hover:border-accent/50 hover:bg-accent-soft"
      } ${item.isMarked && !item.isActive ? "border-amber-400" : ""}`}
    >
      {item.number}
      {item.isMarked && (
        <span
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-background"
          aria-hidden
        />
      )}
    </button>
  );
});

export const DimMathQuestionNavigator = memo(function DimMathQuestionNavigator({
  items,
  isOpen,
  onToggleOpen,
  onSelect,
}: DimMathQuestionNavigatorProps) {
  const answeredCount = useMemo(
    () => items.filter((item) => item.isAnswered).length,
    [items]
  );
  const markedCount = useMemo(
    () => items.filter((item) => item.isMarked).length,
    [items]
  );

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-card">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <LayoutGrid className="h-4 w-4 text-accent" aria-hidden />
          Sual naviqatoru
        </span>
        <span className="flex items-center gap-3 text-xs text-muted">
          <span>{answeredCount}/{items.length} cavablanıb</span>
          {markedCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
              {markedCount} işarəli
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-card-border px-4 pb-4 pt-3">
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
            {items.map((item) => (
              <NavCell key={item.index} item={item} onSelect={onSelect} />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-4 rounded border border-card-border bg-card" />
              Cavablanmayıb
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-4 rounded border border-accent bg-accent" />
              Cavablanıb
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-4 w-4 rounded border border-accent bg-accent ring-2 ring-accent/40" />
              Cari sual
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative h-4 w-4 rounded border border-card-border bg-card">
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
              </span>
              İşarəli
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
