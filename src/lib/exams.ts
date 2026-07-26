export type ExamStatus = "available" | "coming-soon";

export type Exam = {
  id: string;
  name: string;
  description: string;
  status: ExamStatus;
  dashboardHref: string;
};

export const EXAMS: Exam[] = [
  {
    id: "sat",
    name: "SAT",
    description: "Verbal practice with exam-style questions and explanations.",
    status: "available",
    dashboardHref: "/dashboard/sat",
  },
  {
    id: "toefl",
    name: "TOEFL",
    description: "English proficiency practice for reading, listening, and more.",
    status: "coming-soon",
    dashboardHref: "/dashboard/toefl",
  },
  {
    id: "dim",
    name: "DIM",
    description: "Targeted practice for DIM exam preparation.",
    status: "available",
    dashboardHref: "/dashboard/dim",
  },
];
