import {
  TIMED_DURATION_IDS,
  TIMED_FOCUS_IDS,
  TIMED_SECTION_IDS,
  TIMED_TOPIC_IDS,
  type TimedAvailability,
  type TimedDurationId,
  type TimedErrorCode,
  type TimedFocusId,
  type TimedPracticeConfig,
  type TimedSectionId,
  type TimedSessionPlan,
  type TimedTopicId,
} from "../types/timed-practice";
import { addDays, seededShuffle } from "./daily-mission";

/**
 * Pure Timed Practice rules — no cookies, no React — so the setup page, the
 * server actions and the tests share one definition of how a duration, a
 * focus and a topic selection turn into a session.
 */

export const TIMED_PRACTICE_PATH = "/dashboard/sat/timed-practice";
export const TIMED_SESSION_PATH = `${TIMED_PRACTICE_PATH}/session`;
export const TIMED_RESULTS_PATH = `${TIMED_PRACTICE_PATH}/results`;

/** Short sessions run at roughly two minutes a question. */
export const DURATION_PRESETS: Record<
  Exclude<TimedDurationId, "full">,
  { minutes: number; questions: number }
> = {
  "10": { minutes: 10, questions: 5 },
  "20": { minutes: 20, questions: 10 },
  "35": { minutes: 35, questions: 18 },
};

/** Digital SAT section shape: two adaptive modules per section. */
export const SAT_SECTION_SHAPE: Record<
  TimedSectionId,
  { modules: number; moduleMinutes: number; moduleQuestions: number }
> = {
  "reading-writing": { modules: 2, moduleMinutes: 32, moduleQuestions: 27 },
  math: { modules: 2, moduleMinutes: 35, moduleQuestions: 22 },
};

export const SECTION_TOPICS: Record<TimedSectionId, readonly TimedTopicId[]> = {
  math: ["algebra", "advancedMath", "problemSolving", "geometryTrig"],
  "reading-writing": ["craftStructure", "informationIdeas", "conventions", "expressionIdeas"],
};

/**
 * College Board's skill → domain mapping for Reading & Writing. Skill names
 * match SAT_SKILL_CONFIGS / inferSatSkill. Math questions will carry their
 * domain directly once the Math bank lands.
 */
export const TOPIC_SKILLS: Partial<Record<TimedTopicId, readonly string[]>> = {
  craftStructure: ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"],
  informationIdeas: ["Central Ideas and Details", "Command of Evidence", "Inferences"],
  conventions: ["Boundaries", "Form, Structure, and Sense"],
  expressionIdeas: ["Rhetorical Synthesis", "Transitions"],
};

/** A result reads as a success (muted green) from this accuracy up. */
export const SUCCESS_RATIO = 0.7;

// ——— guards ———

export function isTimedDuration(value: unknown): value is TimedDurationId {
  return typeof value === "string" && (TIMED_DURATION_IDS as readonly string[]).includes(value);
}

export function isTimedFocus(value: unknown): value is TimedFocusId {
  return typeof value === "string" && (TIMED_FOCUS_IDS as readonly string[]).includes(value);
}

export function isTimedTopic(value: unknown): value is TimedTopicId {
  return typeof value === "string" && (TIMED_TOPIC_IDS as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Server Actions are public endpoints: rebuild the config from scratch, never trust its shape. */
export function parseTimedConfig(input: unknown): TimedPracticeConfig | null {
  if (!isRecord(input)) return null;
  const { duration, focus, topics, pacing } = input;
  if (!isTimedDuration(duration) || !isTimedFocus(focus) || typeof pacing !== "boolean") {
    return null;
  }
  if (!Array.isArray(topics) || topics.length > TIMED_TOPIC_IDS.length * 2 || !topics.every(isTimedTopic)) {
    return null;
  }
  // Canonical order, no duplicates.
  return { duration, focus, topics: TIMED_TOPIC_IDS.filter((topic) => topics.includes(topic)), pacing };
}

// ——— sections & topics ———

export function sectionsFor(focus: TimedFocusId): TimedSectionId[] {
  return focus === "mixed" ? [...TIMED_SECTION_IDS] : [focus];
}

export function sectionOfTopic(topic: TimedTopicId): TimedSectionId {
  return SECTION_TOPICS.math.includes(topic) ? "math" : "reading-writing";
}

export function topicForSkill(skill: string | null): TimedTopicId | null {
  if (!skill) return null;
  for (const [topic, skills] of Object.entries(TOPIC_SKILLS)) {
    if (skills?.includes(skill)) return topic as TimedTopicId;
  }
  return null;
}

function topicsOn(section: TimedSectionId, topics: readonly TimedTopicId[]) {
  return SECTION_TOPICS[section].filter((topic) => topics.includes(topic));
}

/** Questions the bank holds for a section under the current topic selection. */
export function availableFor(
  section: TimedSectionId,
  topics: readonly TimedTopicId[],
  availability: TimedAvailability
): number {
  const on = topicsOn(section, topics);
  // With every topic on, questions without a recognised domain count too.
  if (on.length === SECTION_TOPICS[section].length) return availability[section].total;
  return on.reduce((sum, topic) => sum + (availability[section].byTopic[topic] ?? 0), 0);
}

export function isFocusAvailable(focus: TimedFocusId, availability: TimedAvailability): boolean {
  return sectionsFor(focus).every((section) => availability[section].total > 0);
}

/** Each section a session draws on must keep at least one topic switched on. */
export function canSwitchTopicOff(topics: readonly TimedTopicId[], topic: TimedTopicId): boolean {
  return topicsOn(sectionOfTopic(topic), topics).filter((entry) => entry !== topic).length > 0;
}

export function toggleTopic(topics: readonly TimedTopicId[], topic: TimedTopicId): TimedTopicId[] {
  if (topics.includes(topic)) {
    return canSwitchTopicOff(topics, topic) ? topics.filter((entry) => entry !== topic) : [...topics];
  }
  return TIMED_TOPIC_IDS.filter((entry) => entry === topic || topics.includes(entry));
}

export function isCustomized(config: Pick<TimedPracticeConfig, "focus" | "topics">): boolean {
  return sectionsFor(config.focus).some(
    (section) => topicsOn(section, config.topics).length < SECTION_TOPICS[section].length
  );
}

export function defaultTimedConfig(availability: TimedAvailability): TimedPracticeConfig {
  // Mixed is the intended default; fall back only while a section has no questions.
  const focus =
    (["mixed", "reading-writing", "math"] as const).find((entry) => isFocusAvailable(entry, availability)) ??
    "mixed";
  return { duration: "20", focus, topics: [...TIMED_TOPIC_IDS], pacing: true };
}

// ——— planning ———

function targets(config: TimedPracticeConfig): { minutes: number; counts: Record<TimedSectionId, number> } {
  const sections = sectionsFor(config.focus);
  const counts: Record<TimedSectionId, number> = { math: 0, "reading-writing": 0 };

  if (config.duration === "full") {
    // One section: both of its modules. Mixed: one module of each, back to back.
    const modules = sections.length === 1 ? SAT_SECTION_SHAPE[sections[0]].modules : 1;
    let minutes = 0;
    for (const section of sections) {
      const shape = SAT_SECTION_SHAPE[section];
      counts[section] = shape.moduleQuestions * modules;
      minutes += shape.moduleMinutes * modules;
    }
    return { minutes, counts };
  }

  const preset = DURATION_PRESETS[config.duration];
  if (sections.length === 1) {
    counts[sections[0]] = preset.questions;
  } else {
    // Reading & Writing takes the odd question: its items are the quicker ones.
    counts.math = Math.floor(preset.questions / 2);
    counts["reading-writing"] = preset.questions - counts.math;
  }
  return { minutes: preset.minutes, counts };
}

/** What the session will actually contain — capped by what the bank can serve. */
export function planSession(config: TimedPracticeConfig, availability: TimedAvailability): TimedSessionPlan {
  const { minutes, counts } = targets(config);
  let limited = false;

  const split = TIMED_SECTION_IDS.filter((section) => sectionsFor(config.focus).includes(section)).map(
    (section) => {
      const count = Math.min(counts[section], availableFor(section, config.topics, availability));
      if (count < counts[section]) limited = true;
      return {
        section,
        count,
        topicsOn: topicsOn(section, config.topics).length,
        topicsAll: SECTION_TOPICS[section].length,
      };
    }
  );

  return { minutes, questionCount: split.reduce((sum, row) => sum + row.count, 0), split, limited };
}

/** Why a session can't be started with this config, or null when it can. */
export function configProblem(
  config: TimedPracticeConfig,
  availability: TimedAvailability
): Extract<TimedErrorCode, "focus-unavailable" | "no-topics" | "no-questions"> | null {
  if (!isFocusAvailable(config.focus, availability)) return "focus-unavailable";
  if (sectionsFor(config.focus).some((section) => topicsOn(section, config.topics).length === 0)) {
    return "no-topics";
  }
  const plan = planSession(config, availability);
  if (plan.split.some((row) => row.count === 0)) return "no-questions";
  return null;
}

// ——— question selection ———

export type TimedPoolQuestion = {
  id: string;
  section: TimedSectionId;
  topic: TimedTopicId | null;
};

export function availabilityOf(pool: readonly TimedPoolQuestion[]): TimedAvailability {
  const availability: TimedAvailability = {
    math: { total: 0, byTopic: {} },
    "reading-writing": { total: 0, byTopic: {} },
  };
  for (const question of pool) {
    const entry = availability[question.section];
    entry.total += 1;
    if (question.topic) entry.byTopic[question.topic] = (entry.byTopic[question.topic] ?? 0) + 1;
  }
  return availability;
}

/**
 * Picks the session's questions in test order: the Reading & Writing module
 * first, then Math, each following the test's own domain order. Questions
 * from `avoid` (the previous session) are used only once fresh ones run out.
 */
export function pickSessionQuestions(
  pool: readonly TimedPoolQuestion[],
  config: TimedPracticeConfig,
  plan: TimedSessionPlan,
  seed: string,
  avoid: ReadonlySet<string> = new Set()
): string[] {
  const picked: string[] = [];

  for (const section of ["reading-writing", "math"] as const) {
    const row = plan.split.find((entry) => entry.section === section);
    if (!row || row.count === 0) continue;

    const order = SECTION_TOPICS[section];
    const on = topicsOn(section, config.topics);
    const everyTopic = on.length === order.length;
    const candidates = pool.filter(
      (question) =>
        question.section === section && (everyTopic || (question.topic !== null && on.includes(question.topic)))
    );

    const shuffled = seededShuffle(candidates, `${seed}:${section}`);
    const chosen = [
      ...shuffled.filter((question) => !avoid.has(question.id)),
      ...shuffled.filter((question) => avoid.has(question.id)),
    ].slice(0, row.count);

    const rank = (question: TimedPoolQuestion) =>
      question.topic ? order.indexOf(question.topic) : order.length;
    // Array#sort is stable, so each domain keeps its shuffled order.
    chosen.sort((a, b) => rank(a) - rank(b));
    picked.push(...chosen.map((question) => question.id));
  }

  return picked;
}

// ——— formatting ———

/** 1200 → "20:00", 4020 → "67:00". Callers render the sign of overtime themselves. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.abs(Math.trunc(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function isSuccessfulResult(correct: number, total: number): boolean {
  return total > 0 && correct / total >= SUCCESS_RATIO;
}

/** "2026-09-28" → "Sep 28" (en), read as UTC so the day never shifts. */
export function formatDayLabel(date: string, locale: string, weekday = false): string {
  const day = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(day.getTime())) return date;
  return new Intl.DateTimeFormat(locale, {
    ...(weekday ? { weekday: "long" as const } : {}),
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(day);
}

/**
 * "Today" labels for every calendar day a student could be on right now
 * (UTC −1 … +1 day covers every time zone), formatted on the server: browsers
 * ship trimmed date data for some locales (Chromium renders Azerbaijani as
 * "M09 29"), while Node carries full ICU. The browser picks its own day.
 */
export function todayLabelsAround(now: Date, locale: string): Record<string, string> {
  const today = now.toISOString().slice(0, 10);
  return Object.fromEntries(
    [addDays(today, -1), today, addDays(today, 1)].map((date) => [date, formatDayLabel(date, locale, true)])
  );
}
