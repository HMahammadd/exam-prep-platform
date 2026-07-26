import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getExamName } from "@/lib/question-bank";
import {
  mapQuestionRow,
  type ExamQuestionChoiceRow,
  type ExamQuestionRow,
} from "@/types/question-bank";
import { QuestionBankForm } from "@/components/admin/QuestionBankForm";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    notFound();
  }

  const { data: choiceRows } = await supabase
    .from("exam_question_choices")
    .select("*")
    .eq("question_id", id)
    .order("display_order", { ascending: true });

  const question = mapQuestionRow(
    row as ExamQuestionRow,
    (choiceRows ?? []) as ExamQuestionChoiceRow[]
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Edit question
          </h1>
          <p className="mt-2 text-muted">
            {getExamName(question.examType)} ·{" "}
            {question.groupLabel ?? question.groupKey} · #
            {question.questionNumber}
          </p>
        </div>
        <DeleteQuestionButton
          questionId={question.id}
          questionNumber={question.questionNumber}
          redirectTo="/admin/questions"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-card-border bg-card p-8 shadow-card">
        <QuestionBankForm question={question} />
      </div>
    </div>
  );
}
