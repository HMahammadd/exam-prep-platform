import { QuestionBankForm } from "@/components/admin/QuestionBankForm";

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ exam?: string }>;
}) {
  const { exam } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        New question
      </h1>
      <p className="mt-2 text-muted">
        Create a question for any exam section — SAT, TOEFL, DIM, or a future
        one.
      </p>

      <div className="mt-8 rounded-2xl border border-card-border bg-card p-8 shadow-card">
        <QuestionBankForm defaultExamType={exam} />
      </div>
    </div>
  );
}
