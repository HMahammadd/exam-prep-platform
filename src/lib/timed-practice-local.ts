import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { SAT_EXAM_1_QUESTIONS } from "@/lib/sat-exam-1-questions";
import { SAT_EXAM_2_QUESTIONS } from "@/lib/sat-exam-2-questions";
import { SAT_EXAM_3_QUESTIONS } from "@/lib/sat-exam-3-questions";
import { inferSatSkill, isIsoDate } from "@/lib/daily-mission";
import {
  availabilityOf,
  configProblem,
  formatDayLabel,
  pickSessionQuestions,
  planSession,
  todayLabelsAround,
  topicForSkill,
  type TimedPoolQuestion,
} from "@/lib/timed-practice";
import {
  EMPTY_TIMED_STORE,
  TIMED_HISTORY_LIMIT,
  decodeTimedStore,
  encodeTimedStore,
  type TimedStore,
} from "@/lib/timed-practice-store";
import type { SatChoiceLabel, SatClientQuestion, SatQuestion } from "@/types/sat-exam";
import type {
  TimedActionResult,
  TimedPracticeConfig,
  TimedPracticeView,
  TimedResultsData,
  TimedRunnerData,
} from "@/types/timed-practice";

/*
 * Timed Practice without a database, following Daily Goal: the active session,
 * the last result and a short history live in one httpOnly cookie, and
 * questions come from the static practice-exam banks. Grading happens here, so
 * answer keys never reach the browser before a session is submitted.
 *
 * This file is the only place that knows where sessions are stored. Moving to
 * Supabase later means replacing these functions; the page, the runner and
 * the actions only see the types in @/types/timed-practice.
 */

const COOKIE = "kp_timed_practice";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
/** An unfinished session is offered for resume for a week. */
const RESUME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

// ——— content ———

/*
 * Only Reading & Writing exists in the static banks today, so Math reports
 * zero available questions and the page marks it unavailable. A Math bank
 * joins by adding its questions here with section "math" and their domain.
 */
const BANK: SatQuestion[] = [...SAT_EXAM_1_QUESTIONS, ...SAT_EXAM_2_QUESTIONS, ...SAT_EXAM_3_QUESTIONS];
const QUESTION_BY_ID = new Map(BANK.map((question) => [question.id, question]));

const POOL: TimedPoolQuestion[] = BANK.map((question) => ({
  id: question.id,
  section: "reading-writing",
  topic: topicForSkill(inferSatSkill(question)),
}));

const AVAILABILITY = availabilityOf(POOL);

function toClientQuestion(question: SatQuestion): SatClientQuestion {
  return {
    id: question.id,
    examId: question.examId,
    module: question.module,
    section: question.section,
    passage: question.passage,
    passageImageUrl: question.passageImageUrl,
    chartId: question.chartId,
    questionText: question.questionText,
    choices: question.choices,
  };
}

// ——— cookie ———

async function readStore(uid: string): Promise<TimedStore> {
  const jar = await cookies();
  const store = decodeTimedStore(jar.get(COOKIE)?.value);
  if (store.uid !== uid) return { ...EMPTY_TIMED_STORE, uid };

  // Drop sessions that are too old to resume or point at retired questions.
  const active = store.active;
  if (
    active &&
    (Date.now() - active.started > RESUME_WINDOW_MS || !active.questions.every((id) => QUESTION_BY_ID.has(id)))
  ) {
    return { ...store, active: null };
  }
  return store;
}

/** Only callable from a Server Function — cookies can't be set while rendering. */
async function writeStore(store: TimedStore) {
  const jar = await cookies();
  jar.set(COOKIE, encodeTimedStore(store), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// ——— reads ———

export async function loadTimedPracticeView(uid: string, locale: string): Promise<TimedPracticeView> {
  const store = await readStore(uid);
  const active = store.active;
  return {
    todayLabels: todayLabelsAround(new Date(), locale),
    availability: AVAILABILITY,
    resume: active
      ? {
          remainingSeconds: active.remaining,
          answered: active.answers.filter(Boolean).length,
          total: active.questions.length,
        }
      : null,
    history: store.history.map((entry) => ({ ...entry, dateLabel: formatDayLabel(entry.date, locale) })),
  };
}

export async function loadLocalTimedRunner(uid: string): Promise<Omit<TimedRunnerData, "studentName"> | null> {
  const { active } = await readStore(uid);
  if (!active) return null;
  return {
    sessionId: active.id,
    config: active.config,
    questions: active.questions.map((id) => toClientQuestion(QUESTION_BY_ID.get(id)!)),
    answers: active.answers,
    limitSeconds: active.limit,
    remainingSeconds: active.remaining,
  };
}

export async function loadLocalTimedResults(uid: string, locale: string): Promise<TimedResultsData | null> {
  const { last } = await readStore(uid);
  if (!last || !last.questions.every((id) => QUESTION_BY_ID.has(id))) return null;

  const questions = last.questions.map((id) => QUESTION_BY_ID.get(id)!);
  const answers = questions.map((question, index) => {
    const selected = last.answers[index];
    return {
      id: `${index}`,
      question_id: question.id,
      selected_answer: selected,
      correct_answer: question.correctAnswer,
      is_correct: selected === question.correctAnswer,
    };
  });

  return {
    date: last.date,
    dateLabel: formatDayLabel(last.date, locale),
    config: last.config,
    minutes: last.minutes,
    usedSeconds: last.used,
    correct: answers.filter((answer) => answer.is_correct).length,
    total: answers.length,
    questions,
    answers,
  };
}

// ——— writes (Server Functions only) ———

export async function startLocalTimedSession(uid: string, config: TimedPracticeConfig): Promise<TimedActionResult> {
  const problem = configProblem(config, AVAILABILITY);
  if (problem) return { success: false, error: problem };

  const store = await readStore(uid);
  const plan = planSession(config, AVAILABILITY);
  const sessionId = randomBytes(9).toString("hex");
  const questions = pickSessionQuestions(POOL, config, plan, sessionId, new Set(store.last?.questions ?? []));
  if (questions.length === 0) return { success: false, error: "no-questions" };

  // A new session replaces any unfinished one.
  await writeStore({
    ...store,
    uid,
    active: {
      id: sessionId,
      config,
      questions,
      answers: questions.map(() => null),
      limit: plan.minutes * 60,
      remaining: plan.minutes * 60,
      started: Date.now(),
    },
  });
  return { success: true };
}

/**
 * The clock only moves forward: a save can lower the remaining time but never
 * raise it, and strict (SAT pacing) sessions stop at zero.
 */
function clampRemaining(previous: number, next: number, limit: number, pacing: boolean) {
  return Math.min(previous, Math.max(pacing ? 0 : -limit, next));
}

export async function saveLocalTimedProgress(
  uid: string,
  sessionId: string,
  answers: (SatChoiceLabel | null)[],
  remaining: number
): Promise<TimedActionResult> {
  const store = await readStore(uid);
  const active = store.active;
  if (!active || active.id !== sessionId || answers.length !== active.questions.length) {
    return { success: false, error: "no-session" };
  }

  await writeStore({
    ...store,
    active: {
      ...active,
      answers,
      remaining: clampRemaining(active.remaining, remaining, active.limit, active.config.pacing),
    },
  });
  return { success: true };
}

export async function submitLocalTimedSession(
  uid: string,
  sessionId: string,
  answers: (SatChoiceLabel | null)[],
  remaining: number,
  localDate: string
): Promise<TimedActionResult> {
  const store = await readStore(uid);
  const active = store.active;
  if (!active || active.id !== sessionId || answers.length !== active.questions.length) {
    return { success: false, error: "no-session" };
  }

  const left = clampRemaining(active.remaining, remaining, active.limit, active.config.pacing);
  const correct = active.questions.filter((id, index) => QUESTION_BY_ID.get(id)?.correctAnswer === answers[index]).length;
  const date = isIsoDate(localDate) ? localDate : new Date().toISOString().slice(0, 10);
  const minutes = Math.round(active.limit / 60);

  await writeStore({
    ...store,
    active: null,
    last: {
      date,
      config: active.config,
      minutes,
      used: active.limit - left,
      questions: active.questions,
      answers,
    },
    history: [
      { date, minutes, correct, total: active.questions.length, focus: active.config.focus },
      ...store.history,
    ].slice(0, TIMED_HISTORY_LIMIT),
  });
  return { success: true };
}
