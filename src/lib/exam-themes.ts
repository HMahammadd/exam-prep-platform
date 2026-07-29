export type ExamThemeId = "sat" | "toefl" | "dim";

export type ExamTheme = {
  /** Ambient glow in the card corner */
  glow: string;
  border: string;
  borderHover: string;
  shadow: string;
  shadowHover: string;
  iconWrap: string;
  icon: string;
  badgeAvailable: string;
  badgeSoon: string;
  tag: string;
  btnPrimary: string;
  btnSecondary: string;
  btnDisabled: string;
};

export const EXAM_THEMES: Record<ExamThemeId, ExamTheme> = {
  sat: {
    glow: "bg-blue-400/25",
    border: "border-blue-200/90 dark:border-blue-900/80",
    borderHover:
      "hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.45),0_16px_48px_-12px_rgba(37,99,235,0.35)]",
    shadow: "shadow-[0_8px_32px_-10px_rgba(37,99,235,0.22)]",
    shadowHover: "",
    iconWrap: "bg-blue-100 dark:bg-blue-950/60",
    icon: "text-blue-600 dark:text-blue-400",
    badgeAvailable: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
    badgeSoon: "bg-blue-50 text-blue-600 ring-1 ring-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-800",
    tag: "border-blue-200/80 bg-blue-50/80 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
    btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
    btnSecondary:
      "border border-blue-200 bg-blue-50/80 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-950",
    btnDisabled:
      "border border-blue-200/70 bg-blue-50/40 text-blue-600/70 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400/70",
  },
  toefl: {
    glow: "bg-violet-400/25",
    border: "border-violet-200/90 dark:border-violet-900/80",
    borderHover:
      "hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.45),0_16px_48px_-12px_rgba(124,58,237,0.35)]",
    shadow: "shadow-[0_8px_32px_-10px_rgba(124,58,237,0.22)]",
    shadowHover: "",
    iconWrap: "bg-violet-100 dark:bg-violet-950/60",
    icon: "text-violet-600 dark:text-violet-400",
    badgeAvailable:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300",
    badgeSoon:
      "bg-violet-50 text-violet-600 ring-1 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800",
    tag: "border-violet-200/80 bg-violet-50/80 text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200",
    btnPrimary: "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400",
    btnSecondary:
      "border border-violet-200 bg-violet-50/80 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-950",
    btnDisabled:
      "border border-violet-200/70 bg-violet-50/40 text-violet-600/70 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-400/70",
  },
  dim: {
    glow: "bg-emerald-400/25",
    border: "border-emerald-200/90 dark:border-emerald-900/80",
    borderHover:
      "hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_16px_48px_-12px_rgba(16,185,129,0.35)]",
    shadow: "shadow-[0_8px_32px_-10px_rgba(16,185,129,0.22)]",
    shadowHover: "",
    iconWrap: "bg-emerald-100 dark:bg-emerald-950/60",
    icon: "text-emerald-600 dark:text-emerald-400",
    badgeAvailable:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
    badgeSoon:
      "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800",
    tag: "border-emerald-200/80 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    btnPrimary: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
    btnSecondary:
      "border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-950",
    btnDisabled:
      "border border-emerald-200/70 bg-emerald-50/40 text-emerald-600/70 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400/70",
  },
};

export function getExamTheme(examId: string): ExamTheme {
  if (examId in EXAM_THEMES) {
    return EXAM_THEMES[examId as ExamThemeId];
  }
  return EXAM_THEMES.sat;
}
