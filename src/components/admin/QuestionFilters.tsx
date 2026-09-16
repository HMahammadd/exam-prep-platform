"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import {
  QUESTION_CODE_NAMES,
  SAT_SKILL_CONFIGS,
  type ExamSectionConfig,
} from "@/lib/question-bank";

const controlClassName =
  "w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50";

type QuestionFiltersProps = {
  exams: ExamSectionConfig[];
};

export function QuestionFilters({ exams }: QuestionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedExam = searchParams.get("exam") ?? "";
  const selectedConfig = exams.find((exam) => exam.slug === selectedExam);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "exam") {
      params.delete("section");
      params.delete("skill");
      params.delete("difficulty");
      params.delete("codeName");
      params.delete("q");
      setSearch("");
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <aside
      className={`self-start rounded-2xl border border-card-border bg-card p-5 shadow-card transition-opacity lg:sticky lg:top-6 ${
        isPending ? "opacity-60" : ""
      }`}
      aria-label="Question filters"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setParam("q", search.trim());
        }}
        className="mb-5"
      >
        <label
          htmlFor="question-code-search"
          className="mb-1.5 block text-xs font-medium text-muted"
        >
          Search by code or source ID
        </label>
        <div className="flex gap-2">
          <input
            id="question-code-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. SVI00001C"
            disabled={!selectedConfig}
            className={controlClassName}
          />
          <button
            type="submit"
            disabled={!selectedConfig}
            aria-label="Search questions"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent px-3 text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-sm font-semibold text-foreground">Exam</h2>
        <p className="mt-1 text-xs text-muted">
          Choose an exam to view its questions.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-1">
        {exams.map((exam) => (
            <button
              key={exam.slug}
              type="button"
              aria-pressed={selectedExam === exam.slug}
              onClick={() =>
                setParam("exam", selectedExam === exam.slug ? "" : exam.slug)
              }
              className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                selectedExam === exam.slug
                  ? "border-accent bg-accent text-white"
                  : "border-card-border bg-background text-foreground hover:border-accent hover:text-accent"
              }`}
            >
            {exam.name}
            </button>
        ))}
        </div>
      </div>

      <div className="my-5 border-t border-card-border" />

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Section
          </span>
          <select
            value={searchParams.get("section") ?? ""}
            onChange={(event) => setParam("section", event.target.value)}
            className={controlClassName}
            disabled={!selectedConfig}
          >
            <option value="">All sections</option>
            {selectedConfig?.sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Question type
          </span>
          <select
            value={searchParams.get("skill") ?? ""}
            onChange={(event) => setParam("skill", event.target.value)}
            className={controlClassName}
            disabled={selectedExam !== "sat"}
          >
            <option value="">All question types</option>
            {SAT_SKILL_CONFIGS.map((skill) => (
              <option key={skill.prefix} value={skill.name}>
                {skill.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Difficulty
          </span>
          <select
            value={searchParams.get("difficulty") ?? ""}
            onChange={(event) => setParam("difficulty", event.target.value)}
            className={controlClassName}
            disabled={!selectedConfig}
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">
            Code Name
          </span>
          <select
            value={searchParams.get("codeName") ?? ""}
            onChange={(event) => setParam("codeName", event.target.value)}
            className={controlClassName}
            disabled={!selectedConfig}
          >
            <option value="">All code names</option>
            {QUESTION_CODE_NAMES.map((codeName) => (
              <option key={codeName} value={codeName}>
                {codeName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  );
}
