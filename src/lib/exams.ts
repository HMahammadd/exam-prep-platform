export type ExamStatus = "available" | "coming-soon";

export type Exam = {
  id: string;
  name: string;
  description: string;
  status: ExamStatus;
  dashboardHref: string;
  lessonsHref: string;
  lessonsStatus: ExamStatus;
};

export const EXAMS: Exam[] = [
  {
    id: "sat",
    name: "SAT",
    description: "Verbal practice with exam-style questions and explanations.",
    status: "available",
    dashboardHref: "/dashboard/sat",
    lessonsHref: "/dashboard/sat/lessons",
    lessonsStatus: "available",
  },
  {
    id: "toefl",
    name: "TOEFL",
    description: "English proficiency practice for reading, listening, and more.",
    status: "coming-soon",
    dashboardHref: "/dashboard/toefl",
    lessonsHref: "/dashboard/toefl",
    lessonsStatus: "coming-soon",
  },
  {
    id: "dim",
    name: "DIM",
    description: "Targeted practice for DIM exam preparation.",
    status: "coming-soon",
    dashboardHref: "/dashboard/dim",
    lessonsHref: "/dashboard/dim",
    lessonsStatus: "coming-soon",
  },
];
