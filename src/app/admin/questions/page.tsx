import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ImageIcon, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabaseServer";
import { EXAM_SECTION_CONFIGS, getExamName } from "@/lib/question-bank";
import { mapQuestionRow, type ExamQuestionRow } from "@/types/question-bank";
import { QuestionFilters } from "@/components/admin/QuestionFilters";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";

type SearchParams = {
  exam?: string;
  group?: string;
  status?: string;
  q?: string;
};

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("exam_questions")
    .select("*")
    .order("exam_type", { ascending: true })
    .order("group_key", { ascending: true })
    .order("question_number", { ascending: true })
    .limit(500);

  if (filters.exam) {
    query = query.eq("exam_type", filters.exam);
  }

  if (filters.group) {
    query = query.eq("group_key", filters.group);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    query = query.ilike("question_text", `%${filters.q}%`);
  }

  const { data, error } = await query;
  const questions = ((data ?? []) as ExamQuestionRow[]).map((row) =>
    mapQuestionRow(row)
  );

  const groupOptions = Array.from(
    new Set(questions.map((question) => question.groupKey))
  ).sort();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Questions
          </h1>
          <p className="mt-2 text-muted">
            {error
              ? "Question bank unavailable."
              : `${questions.length} question${questions.length === 1 ? "" : "s"} matching your filters.`}
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New question
        </Link>
      </div>

      <QuestionFilters
        exams={EXAM_SECTION_CONFIGS.map((config) => ({
          slug: config.slug,
          name: config.name,
        }))}
        groups={groupOptions}
      />

      {error ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Could not load questions</p>
            <p className="mt-1">{error.message}</p>
            <p className="mt-1">
              Run{" "}
              <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
                supabase/migrations/003_admin_question_bank.sql
              </code>{" "}
              in the Supabase SQL Editor.
            </p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-card-border bg-card p-12 text-center">
          <p className="text-sm text-muted">
            No questions yet. Create your first one to get started.
          </p>
          <Link
            href="/admin/questions/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New question
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="flex flex-wrap items-start gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-card"
            >
              {question.imageUrl ? (
                <Image
                  src={question.imageUrl}
                  alt=""
                  width={96}
                  height={72}
                  className="h-18 w-24 shrink-0 rounded-lg border border-card-border object-cover"
                />
              ) : (
                <div className="flex h-18 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-card-border text-muted">
                  <ImageIcon className="h-5 w-5" aria-hidden />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
                    {getExamName(question.examType)}
                  </span>
                  {question.section && (
                    <span className="text-muted">{question.section}</span>
                  )}
                  <span className="text-muted">
                    {question.groupLabel ?? question.groupKey} · #
                    {question.questionNumber}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      question.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {question.status}
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-foreground">
                  {question.questionText}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Correct answer: {question.correctAnswer}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/questions/${question.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit
                </Link>
                <DeleteQuestionButton
                  questionId={question.id}
                  questionNumber={question.questionNumber}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
