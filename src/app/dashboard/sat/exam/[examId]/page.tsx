import { notFound, redirect } from "next/navigation";
import { getCachedUser } from "@/lib/cached-auth";
import { getSatExamById, isSatExamAvailable } from "@/lib/sat-exams";
import { getExamQuestions } from "@/lib/sat-questions";
import type { SatClientQuestion } from "@/types/sat-exam";
import { getMyProfile } from "@/lib/services/profile";
import { ExamInterface } from "./ExamInterface";

type ExamPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function SatExamPage({ params }: ExamPageProps) {
  const { examId: examIdParam } = await params;
  const examId = Number(examIdParam);

  if (!Number.isInteger(examId)) {
    notFound();
  }

  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const exam = getSatExamById(examId);

  if (!exam) {
    notFound();
  }

  if (!isSatExamAvailable(examId)) {
    redirect("/dashboard/sat");
  }

  const questions = await getExamQuestions(examId);

  if (!questions.length) {
    notFound();
  }

  // Never send the answer key or explanations to the exam-taking client.
  // Grading is done server-side in `submitSatExam`.
  const clientQuestions: SatClientQuestion[] = questions.map((question) => ({
    id: question.id,
    examId: question.examId,
    module: question.module,
    section: question.section,
    passage: question.passage,
    passageImageUrl: question.passageImageUrl,
    chartId: question.chartId,
    questionText: question.questionText,
    choices: question.choices,
  }));

  const profile = await getMyProfile();
  const studentName = profile?.username || "Student";

  return (
    <ExamInterface
      exam={exam}
      questions={clientQuestions}
      studentName={studentName}
    />
  );
}
