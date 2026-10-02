import type { SatChoiceLabel, SatClientQuestion, SatQuestion } from "@/types/sat-exam";

/** Order is the order of the duration controls on the page. */
export const TIMED_DURATION_IDS = ["10", "20", "35", "full"] as const;
export type TimedDurationId = (typeof TIMED_DURATION_IDS)[number];

/** Order is the order of the focus rows on the page. */
export const TIMED_FOCUS_IDS = ["mixed", "math", "reading-writing"] as const;
export type TimedFocusId = (typeof TIMED_FOCUS_IDS)[number];

/** Order is the order of the content-split rows (Math first, as on the page). */
export const TIMED_SECTION_IDS = ["math", "reading-writing"] as const;
export type TimedSectionId = (typeof TIMED_SECTION_IDS)[number];

export const TIMED_TOPIC_IDS = [
  // Reading & Writing — the four official College Board domains.
  "craftStructure",
  "informationIdeas",
  "conventions",
  "expressionIdeas",
  // Math — the four official domains.
  "algebra",
  "advancedMath",
  "problemSolving",
  "geometryTrig",
] as const;
export type TimedTopicId = (typeof TIMED_TOPIC_IDS)[number];

export type TimedPracticeConfig = {
  duration: TimedDurationId;
  focus: TimedFocusId;
  /** Every topic the student has left switched on, across both sections. */
  topics: TimedTopicId[];
  /** Strict SAT timing: the session submits itself when the clock runs out. */
  pacing: boolean;
};

/** Questions the bank can actually serve, per section and per topic. */
export type TimedAvailability = Record<
  TimedSectionId,
  { total: number; byTopic: Partial<Record<TimedTopicId, number>> }
>;

export type TimedSplitRow = {
  section: TimedSectionId;
  count: number;
  /** Topics switched on for this section, and how many the section has. */
  topicsOn: number;
  topicsAll: number;
};

export type TimedSessionPlan = {
  minutes: number;
  questionCount: number;
  split: TimedSplitRow[];
  /** True when the bank had fewer matching questions than the length asks for. */
  limited: boolean;
};

export type TimedHistoryEntry = {
  /** Student's own calendar day, YYYY-MM-DD. */
  date: string;
  /** Session length the student chose. */
  minutes: number;
  correct: number;
  total: number;
  focus: TimedFocusId;
};

export type TimedResumeInfo = {
  remainingSeconds: number;
  answered: number;
  total: number;
};

/** Everything the setup page needs, already resolved on the server. */
export type TimedPracticeView = {
  /** YYYY-MM-DD → "Tuesday, Sep 29" in the page's language, for the header. */
  todayLabels: Record<string, string>;
  availability: TimedAvailability;
  resume: TimedResumeInfo | null;
  history: (TimedHistoryEntry & { dateLabel: string })[];
};

// ——— session runner ———

export type TimedRunnerData = {
  sessionId: string;
  config: TimedPracticeConfig;
  questions: SatClientQuestion[];
  answers: (SatChoiceLabel | null)[];
  limitSeconds: number;
  remainingSeconds: number;
  studentName: string;
};

export type TimedResultsData = {
  date: string;
  dateLabel: string;
  config: TimedPracticeConfig;
  minutes: number;
  usedSeconds: number;
  correct: number;
  total: number;
  questions: SatQuestion[];
  answers: {
    id: string;
    question_id: string;
    selected_answer: string | null;
    correct_answer: string;
    is_correct: boolean;
  }[];
};

/** Codes rather than sentences, so the page can show them in the student's language. */
export type TimedErrorCode =
  | "signed-out"
  | "invalid"
  | "focus-unavailable"
  | "no-topics"
  | "no-questions"
  | "no-session"
  | "failed";

export type TimedActionResult =
  | { success: true }
  | { success: false; error: TimedErrorCode };
