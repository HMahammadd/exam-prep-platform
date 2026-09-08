import Link from "next/link";
import { Plus } from "lucide-react";
import { EXAM_SECTION_CONFIGS } from "@/lib/question-bank";
import { QuestionFilters } from "@/components/admin/QuestionFilters";
import { QuestionResults } from "@/components/admin/QuestionResults";

export default function AdminQuestionsPage() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Questions
          </h1>
          <p className="mt-2 text-muted">
            Browse and manage questions by exam, section, type, and difficulty.
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

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <QuestionFilters exams={EXAM_SECTION_CONFIGS} />
        <QuestionResults />
      </div>
    </div>
  );
}
