"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const controlClassName =
  "rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

type QuestionFiltersProps = {
  exams: { slug: string; name: string }[];
  groups: string[];
};

export function QuestionFilters({ exams, groups }: QuestionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Group keys are exam-specific, so switching exams invalidates the group.
    if (key === "exam") {
      params.delete("group");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${isPending ? "opacity-60" : ""}`}
    >
      <select
        aria-label="Filter by exam"
        value={searchParams.get("exam") ?? ""}
        onChange={(event) => setParam("exam", event.target.value)}
        className={controlClassName}
      >
        <option value="">All exams</option>
        {exams.map((exam) => (
          <option key={exam.slug} value={exam.slug}>
            {exam.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by question set"
        value={searchParams.get("group") ?? ""}
        onChange={(event) => setParam("group", event.target.value)}
        className={controlClassName}
      >
        <option value="">All sets</option>
        {groups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by status"
        value={searchParams.get("status") ?? ""}
        onChange={(event) => setParam("status", event.target.value)}
        className={controlClassName}
      >
        <option value="">Any status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      <input
        type="search"
        aria-label="Search question text"
        placeholder="Search question text…"
        defaultValue={searchParams.get("q") ?? ""}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setParam("q", event.currentTarget.value.trim());
          }
        }}
        className={`${controlClassName} min-w-56 flex-1`}
      />
    </div>
  );
}
