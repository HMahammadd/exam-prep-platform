import type {
  MissionIntensity,
  MissionTaskId,
  MissionTaskSummary,
  WeeklyDay,
} from "@/types/daily-mission";
import { MISSION_INTENSITIES, MISSION_TASK_IDS } from "../types/daily-mission";
import { SAT_SKILL_CONFIGS } from "./question-bank";

/**
 * Pure Daily Mission rules — no Supabase, no React — so the page, the task
 * runner, the server actions and the tests all agree on one definition of
 * "today", "complete", "streak" and "weakest skill".
 */

export const SAT_SKILLS: string[] = SAT_SKILL_CONFIGS.map((skill) => skill.name);

/** Items per task at each intensity. "standard" is the default plan. */
export const INTENSITY_TARGETS: Record<MissionIntensity, Record<MissionTaskId, number>> = {
  light: { warmup: 2, focus: 5, mistakes: 1, vocabulary: 3 },
  standard: { warmup: 3, focus: 8, mistakes: 2, vocabulary: 5 },
  intense: { warmup: 5, focus: 12, mistakes: 4, vocabulary: 8 },
};

export const INTENSITY_LABELS: Record<MissionIntensity, string> = {
  light: "Light",
  standard: "Standard",
  intense: "Intense",
};

/**
 * Expected minutes per item. Reading & Writing allows ~71s a question; a
 * mistake retry also means reading the explanation; a flashcard is quick.
 */
export const MINUTES_PER_ITEM: Record<MissionTaskId, number> = {
  warmup: 1.25,
  focus: 1.25,
  mistakes: 2,
  vocabulary: 0.5,
};

export const TASK_TITLES: Record<MissionTaskId, string> = {
  warmup: "Warm-up",
  focus: "Focus drill",
  mistakes: "Fix mistakes",
  vocabulary: "Vocabulary",
};

export const DAILY_GOAL_PATH = "/dashboard/sat/daily-goal";

export function missionTaskHref(task: MissionTaskId): string {
  return `${DAILY_GOAL_PATH}/${task}`;
}

export function isMissionTaskId(value: string): value is MissionTaskId {
  return (MISSION_TASK_IDS as readonly string[]).includes(value);
}

export function isMissionIntensity(value: string): value is MissionIntensity {
  return (MISSION_INTENSITIES as readonly string[]).includes(value);
}

export function percent(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

export function estimateMinutes(remaining: Partial<Record<MissionTaskId, number>>): number {
  let minutes = 0;
  for (const task of MISSION_TASK_IDS) {
    minutes += (remaining[task] ?? 0) * MINUTES_PER_ITEM[task];
  }
  return Math.ceil(minutes);
}

// ——— dates (all YYYY-MM-DD strings in the student's own time zone) ———

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone || timeZone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar date an instant falls on in `timeZone`. */
export function localDateIn(timeZone: string, at: Date = new Date()): string {
  const zone = isValidTimeZone(timeZone) ? timeZone : "UTC";
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function toUtc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function addDays(date: string, days: number): string {
  const next = toUtc(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: string): string {
  const day = toUtc(date).getUTCDay(); // 0 = Sunday
  return addDays(date, -((day + 6) % 7));
}

export function weekdayShort(date: string): string {
  return toUtc(date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function monthDayLabel(date: string): string {
  return toUtc(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Consecutive fully-completed days ending today — or ending yesterday while
 * today is still in progress, so an unfinished morning doesn't read as a
 * broken streak.
 */
export function computeStreak(completedDates: Iterable<string>, today: string): number {
  const done = new Set(completedDates);
  let cursor = done.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export type WeekMission = { date: string; completed: number; total: number; done: boolean };

export function buildWeek(today: string, missions: WeekMission[]): WeeklyDay[] {
  const byDate = new Map(missions.map((mission) => [mission.date, mission]));
  const monday = startOfWeek(today);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    const mission = byDate.get(date);
    const progress = mission ? percent(mission.completed, mission.total) : 0;
    const base = { date, weekday: weekdayShort(date), dateLabel: monthDayLabel(date) };

    if (date === today) {
      return { ...base, status: "today", progress: mission?.done ? 100 : progress };
    }
    if (date > today) {
      return { ...base, status: "upcoming", progress: 0 };
    }
    if (mission?.done) {
      return { ...base, status: "completed", progress: 100 };
    }
    return { ...base, status: progress > 0 ? "partial" : "missed", progress };
  });
}

// ——— deterministic shuffling ———

/** 32-bit string hash (FNV-1a) — seeds the day's shuffle. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Same seed, same order — a reload can't reshuffle the day's picks. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let state = hashSeed(seed) || 1;
  const random = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

// ——— skills ———

/**
 * The practice-exam banks (src/lib/sat-exam-*-questions.ts) carry no skill
 * tag, but every SAT Reading & Writing stem is standardized, so the skill is
 * recoverable from the question wording. Used only for those exam answers —
 * the official bank already stores `skill`.
 */
export function inferSatSkill(question: {
  passage: string;
  questionText: string;
  choices: { text: string }[];
}): string | null {
  const stem = question.questionText;
  const everything = `${question.passage}\n${stem}`;

  if (/conventions of Standard English/i.test(stem)) {
    // Boundaries questions differ only in punctuation.
    const bare = question.choices.map((choice) =>
      choice.text.toLowerCase().replace(/[\s,.;:!?'"()—–-]/g, "")
    );
    return bare.every((text) => text === bare[0]) ? "Boundaries" : "Form, Structure, and Sense";
  }
  if (/logical transition/i.test(stem)) return "Transitions";
  if (/logical and precise word or phrase|most nearly mean/i.test(stem)) return "Words in Context";
  if (/student wants to|following notes/i.test(everything)) return "Rhetorical Synthesis";
  if (/based on the texts|text 2/i.test(stem)) return "Cross-Text Connections";
  if (/quotation|finding|data (from|in) the (graph|table|chart)|uses data|describes data|weaken/i.test(stem)) {
    return "Command of Evidence";
  }
  if (/structure of the text|main purpose|function of the underlined/i.test(stem)) {
    return "Text Structure and Purpose";
  }
  if (/main idea|according to the text|based on the text|what is true|interact with|approach to|ensure/i.test(stem)) {
    return "Central Ideas and Details";
  }
  if (/most logically completes the text/i.test(stem)) return "Inferences";
  return null;
}

export type SkillStat = { correct: number; total: number };

/**
 * Weakest skill, with every skill's accuracy shrunk toward the student's own
 * average (k pseudo-answers). Unpracticed skills sit exactly at the average,
 * so a skill they're genuinely below average on wins, and with little data
 * the drill rotates through skills they haven't tried rather than repeating
 * one forever. Ties go to the least-practiced skill, then to syllabus order.
 */
export function pickFocusSkill(
  stats: Map<string, SkillStat>,
  overall: SkillStat,
  candidates: readonly string[] = SAT_SKILLS
): string {
  const k = 4;
  const prior = overall.total > 0 ? overall.correct / overall.total : 0.6;

  let best = candidates[0] ?? SAT_SKILLS[0];
  let bestScore = Number.POSITIVE_INFINITY;
  let bestTotal = Number.POSITIVE_INFINITY;

  for (const skill of candidates) {
    const stat = stats.get(skill) ?? { correct: 0, total: 0 };
    const score = (stat.correct + prior * k) / (stat.total + k);
    if (
      score < bestScore - 1e-9 ||
      (Math.abs(score - bestScore) <= 1e-9 && stat.total < bestTotal)
    ) {
      best = skill;
      bestScore = score;
      bestTotal = stat.total;
    }
  }
  return best;
}

// ——— question text ———

const STEM_START =
  /^(?:Which|Based on|According to|As used in|What|How|In the text|In context|It can|It is|The text|The author|The student wants)\b/;

/**
 * The official bank stores passage and question as one run of text. Split
 * off the final question sentence so it can be shown the way the real exam
 * does: passage on one side, question under it.
 */
export function splitQuestionText(text: string): { passage: string; stem: string } {
  const trimmed = text.trim();

  const student = trimmed.lastIndexOf("The student wants");
  if (student > 0) {
    return { passage: trimmed.slice(0, student).trim(), stem: trimmed.slice(student).trim() };
  }

  const starts: number[] = [];
  for (const match of trimmed.matchAll(/(?:[.!?:]["'”’)]*|_{2,})\s+(?=\S)/g)) {
    const start = (match.index ?? 0) + match[0].length;
    if (start < trimmed.length) starts.push(start);
  }

  const splitAt = (start: number) => ({
    passage: trimmed.slice(0, start).trim(),
    stem: trimmed.slice(start).trim(),
  });
  const openings = (from: number) =>
    Array.from(trimmed.slice(from).matchAll(/\s(?=\S)/g), (match) => from + (match.index ?? 0) + 1)
      .filter((start) => STEM_START.test(trimmed.slice(start)));

  // Literary passages end in a credit line with no closing punctuation
  // ("…©1989 by N. Scott Momaday As used in the text, …?"); the question is
  // the first opening after it, and the passage itself may contain sentences
  // that look like one ("How nice and…").
  const credit = trimmed.lastIndexOf("\u00a9");
  if (credit > 0) {
    const [afterCredit] = openings(credit);
    if (afterCredit !== undefined) return splitAt(afterCredit);
  }

  for (let index = starts.length - 1; index >= 0; index -= 1) {
    if (STEM_START.test(trimmed.slice(starts[index]))) return splitAt(starts[index]);
  }

  const fallback = openings(0).at(-1);
  if (fallback !== undefined && fallback > 0) return splitAt(fallback);

  return { passage: "", stem: trimmed };
}

/** Restores the line structure SatPassage expects for Cross-Text and notes. */
export function formatBankPassage(passage: string): string {
  const cross = passage.match(/^Text 1\s+([\s\S]+?)\s+Text 2\s+([\s\S]+)$/);
  if (cross) {
    return `Text 1\n${cross[1].trim()}\n\nText 2\n${cross[2].trim()}`;
  }
  return passage.replace(/(the following notes:)\s+/i, "$1\n\n");
}

// ——— item references ———

export type ItemRef =
  | { kind: "bank"; questionId: string }
  | { kind: "exam"; attemptId: string; questionId: string }
  | { kind: "word"; wordId: string };

export const bankRef = (questionId: string) => `bank:${questionId}`;
export const examRef = (attemptId: string, questionId: string) =>
  `exam:${attemptId}:${questionId}`;
export const wordRef = (wordId: string) => `word:${wordId}`;

export function parseItemRef(ref: string): ItemRef | null {
  const [kind, ...rest] = ref.split(":");
  if (kind === "bank" && rest.length === 1 && rest[0]) {
    return { kind, questionId: rest[0] };
  }
  if (kind === "exam" && rest.length === 2 && rest[0] && rest[1]) {
    return { kind, attemptId: rest[0], questionId: rest[1] };
  }
  if (kind === "word" && rest.length === 1 && rest[0]) {
    return { kind, wordId: rest[0] };
  }
  return null;
}

// ——— task summaries ———

export type TaskProgress = Record<MissionTaskId, { completed: number; total: number }>;

export function emptyTaskProgress(): TaskProgress {
  return {
    warmup: { completed: 0, total: 0 },
    focus: { completed: 0, total: 0 },
    mistakes: { completed: 0, total: 0 },
    vocabulary: { completed: 0, total: 0 },
  };
}

function isTaskDone(progress: { completed: number; total: number }): boolean {
  return progress.completed >= progress.total;
}

/**
 * First unfinished task in orbit order is "current"; everything after it is
 * "upcoming". A task with nothing to do (no open mistakes) counts as done.
 */
export function summarizeTasks(
  progress: TaskProgress,
  focusSkill: string,
  vocabularyAllSaved: boolean
): MissionTaskSummary[] {
  const currentId = MISSION_TASK_IDS.find((task) => !isTaskDone(progress[task])) ?? null;

  return MISSION_TASK_IDS.map((task) => {
    const { completed, total } = progress[task];
    const status: MissionTaskSummary["status"] = isTaskDone(progress[task])
      ? "completed"
      : task === currentId
        ? "current"
        : "upcoming";
    const counter = `${completed} of ${total}`;

    let subtitle: string;
    switch (task) {
      case "warmup":
        subtitle =
          status === "current" ? `Mixed skills • ${counter}` : `${total} mixed questions`;
        break;
      case "focus":
        subtitle =
          status === "upcoming"
            ? `${focusSkill} • ${total} questions`
            : `${focusSkill} • ${counter}`;
        break;
      case "mistakes":
        subtitle =
          total === 0
            ? "No open mistakes"
            : status === "current"
              ? `Recent mistakes • ${counter}`
              : `${total} recent question${total === 1 ? "" : "s"}`;
        break;
      case "vocabulary": {
        const noun = vocabularyAllSaved ? "saved words" : "words";
        subtitle =
          status === "current"
            ? `${vocabularyAllSaved ? "Saved words" : "Word review"} • ${counter}`
            : `${total} ${total === 1 ? noun.replace(/s$/, "") : noun}`;
        break;
      }
    }

    return {
      id: task,
      title: TASK_TITLES[task],
      subtitle,
      status,
      completed,
      total,
      href: missionTaskHref(task),
    };
  });
}
