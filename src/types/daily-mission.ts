import type { SatChartId } from "@/types/sat-exam";
import type { TranslationLanguage } from "@/types/vocabulary";

/** Fixed order: it is also the order around the orbit and the order of play. */
export const MISSION_TASK_IDS = ["warmup", "focus", "mistakes", "vocabulary"] as const;
export type MissionTaskId = (typeof MISSION_TASK_IDS)[number];

export const MISSION_INTENSITIES = ["light", "standard", "intense"] as const;
export type MissionIntensity = (typeof MISSION_INTENSITIES)[number];

export type MissionTaskStatus = "completed" | "current" | "upcoming";

export type MissionTaskSummary = {
  id: MissionTaskId;
  title: string;
  subtitle: string;
  status: MissionTaskStatus;
  completed: number;
  total: number;
  href: string;
};

export type WeeklyDayStatus = "completed" | "partial" | "missed" | "today" | "upcoming";

export type WeeklyDay = {
  /** YYYY-MM-DD in the student's time zone. */
  date: string;
  weekday: string;
  dateLabel: string;
  status: WeeklyDayStatus;
  /** 0–100; meaningful for "today" and "partial". */
  progress: number;
};

export type CurrentTaskInfo = {
  /** null once every task is finished. */
  taskId: MissionTaskId | null;
  title: string;
  stat: { value: string; label: string } | null;
  minutes: number;
  ctaLabel: string;
  href: string;
  insight: string | null;
};

export type DailyMissionView = {
  date: string;
  timezone: string;
  progress: number;
  completedItems: number;
  totalItems: number;
  tasks: MissionTaskSummary[];
  current: CurrentTaskInfo;
  examDate: string | null;
  examDaysRemaining: number | null;
  intensity: MissionIntensity;
  streak: number;
  remainingMinutes: number;
  /** This week's answered-question accuracy, or null with nothing answered. */
  accuracy: number | null;
  week: WeeklyDay[];
};

export type MissionLoadResult =
  | { ok: true; mission: DailyMissionView }
  | { ok: false; reason: "setup-required" | "error"; message: string };

// ——— task runner ———

export type MissionQuestionResult = {
  selected: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
};

export type MissionQuestionItem = {
  kind: "question";
  itemId: string;
  passage: string;
  stem: string;
  choices: { label: string; text: string }[];
  imageUrl: string | null;
  chartId: SatChartId | null;
  skill: string | null;
  source: string;
  result: MissionQuestionResult | null;
};

export type MissionWordItem = {
  kind: "word";
  itemId: string;
  wordId: string;
  word: string;
  definition: string;
  translations: Record<TranslationLanguage, string>;
  saved: boolean;
  result: { knewIt: boolean } | null;
};

export type MissionRunnerItem = MissionQuestionItem | MissionWordItem;

export type MissionRunnerData = {
  taskId: MissionTaskId;
  title: string;
  subtitle: string;
  items: MissionRunnerItem[];
  nextTask: { id: MissionTaskId; title: string; href: string } | null;
};

export type MissionRunnerLoadResult =
  | { ok: true; runner: MissionRunnerData }
  | { ok: false; reason: "setup-required" | "error"; message: string };
