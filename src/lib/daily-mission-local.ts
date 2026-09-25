import { cookies } from "next/headers";
import { SAT_EXAM_1_QUESTIONS } from "@/lib/sat-exam-1-questions";
import { SAT_EXAM_2_QUESTIONS } from "@/lib/sat-exam-2-questions";
import { SAT_EXAM_3_QUESTIONS } from "@/lib/sat-exam-3-questions";
import { VOCABULARY_WORDS } from "@/lib/vocabulary-words";
import {
  INTENSITY_TARGETS,
  SAT_SKILLS,
  TASK_TITLES,
  buildWeek,
  computeStreak,
  daysBetween,
  estimateMinutes,
  inferSatSkill,
  isIsoDate,
  isMissionIntensity,
  isValidTimeZone,
  localDateIn,
  missionTaskHref,
  percent,
  pickFocusSkill,
  seededShuffle,
  startOfWeek,
  summarizeTasks,
  type TaskProgress,
  type WeekMission,
} from "@/lib/daily-mission";
import {
  MISSION_TASK_IDS,
  type CurrentTaskInfo,
  type DailyMissionView,
  type MissionIntensity,
  type MissionQuestionResult,
  type MissionRunnerData,
  type MissionRunnerItem,
  type MissionTaskId,
  type MissionTaskSummary,
} from "@/types/daily-mission";

/*
 * Daily Mission without a database. The student's plan and progress live in
 * one small httpOnly cookie; questions come from the static practice-exam
 * banks and words from the static vocabulary list. Grading stays on the
 * server, so answer keys never reach the browser before a question is answered.
 */

const COOKIE = "kp_daily_mission";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const HISTORY_DAYS = 14;
const MAX_OPEN_MISTAKES = 30;

type DayPlan = Record<MissionTaskId, string[]>;

type DayState = {
  date: string;
  focusSkill: string;
  plan: DayPlan;
  /** item ref → chosen letter for questions, "1"/"0" (knew it / still learning) for words. */
  answers: Record<string, string>;
};

type HistoryDay = WeekMission & { answered: number; correct: number };

type Store = {
  tz: string | null;
  examDate: string | null;
  intensity: MissionIntensity;
  day: DayState | null;
  history: HistoryDay[];
  /** Question ids answered wrong and not yet retried correctly, newest first. */
  wrong: string[];
  /** skill → [correct, total] over every first-try answer. */
  skills: Record<string, [number, number]>;
};

const EMPTY_STORE: Store = {
  tz: null,
  examDate: null,
  intensity: "standard",
  day: null,
  history: [],
  wrong: [],
  skills: {},
};

// ——— content ———

const QUESTIONS = [...SAT_EXAM_1_QUESTIONS, ...SAT_EXAM_2_QUESTIONS, ...SAT_EXAM_3_QUESTIONS].map(
  (question) => ({ ...question, skill: inferSatSkill(question) })
);
const QUESTION_BY_ID = new Map(QUESTIONS.map((question) => [question.id, question]));
const WORD_BY_ID = new Map(VOCABULARY_WORDS.map((word) => [word.id, word]));

const questionRef = (id: string) => `q:${id}`;
const wordRef = (id: string) => `w:${id}`;

function refId(ref: string) {
  return ref.slice(2);
}

// ——— cookie ———

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The cookie is client-held, so everything read back is re-checked. */
function parseStore(raw: string | undefined): Store {
  if (!raw) return { ...EMPTY_STORE };
  try {
    const data: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!isRecord(data)) return { ...EMPTY_STORE };

    const strings = (value: unknown) =>
      Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

    let day: DayState | null = null;
    if (isRecord(data.day) && typeof data.day.date === "string" && isIsoDate(data.day.date) && isRecord(data.day.plan)) {
      const plan = data.day.plan;
      const answers = isRecord(data.day.answers) ? data.day.answers : {};
      day = {
        date: data.day.date,
        focusSkill:
          typeof data.day.focusSkill === "string" && SAT_SKILLS.includes(data.day.focusSkill)
            ? data.day.focusSkill
            : SAT_SKILLS[0],
        plan: Object.fromEntries(MISSION_TASK_IDS.map((task) => [task, strings(plan[task])])) as DayPlan,
        answers: Object.fromEntries(
          Object.entries(answers).filter((entry): entry is [string, string] => typeof entry[1] === "string")
        ),
      };
    }

    // Persisted as [date, completed, total, done, answered, correct] tuples.
    const history: HistoryDay[] = Array.isArray(data.history)
      ? data.history.flatMap((entry) => {
          if (
            !Array.isArray(entry) ||
            typeof entry[0] !== "string" ||
            !isIsoDate(entry[0]) ||
            !entry.slice(1).every((value) => typeof value === "number")
          ) {
            return [];
          }
          const [date, completed, total, done, answered, correct] = entry as [string, ...number[]];
          return [{ date, completed, total, done: done === 1, answered, correct }];
        })
      : [];

    const skills: Store["skills"] = {};
    if (isRecord(data.skills)) {
      for (const [skill, pair] of Object.entries(data.skills)) {
        if (
          SAT_SKILLS.includes(skill) &&
          Array.isArray(pair) &&
          typeof pair[0] === "number" &&
          typeof pair[1] === "number"
        ) {
          skills[skill] = [pair[0], pair[1]];
        }
      }
    }

    return {
      tz: typeof data.tz === "string" && isValidTimeZone(data.tz) ? data.tz : null,
      examDate: typeof data.examDate === "string" && isIsoDate(data.examDate) ? data.examDate : null,
      intensity:
        typeof data.intensity === "string" && isMissionIntensity(data.intensity) ? data.intensity : "standard",
      day,
      history: history.slice(-HISTORY_DAYS),
      wrong: strings(data.wrong).filter((id) => QUESTION_BY_ID.has(id)).slice(0, MAX_OPEN_MISTAKES),
      skills,
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

async function readStore(): Promise<Store> {
  const jar = await cookies();
  return parseStore(jar.get(COOKIE)?.value);
}

/** Only callable from a Server Function — cookies can't be set while rendering. */
async function writeStore(store: Store) {
  const jar = await cookies();
  const history = store.history.map((entry) => [
    entry.date,
    entry.completed,
    entry.total,
    entry.done ? 1 : 0,
    entry.answered,
    entry.correct,
  ]);
  const value = Buffer.from(JSON.stringify({ ...store, history })).toString("base64url");
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// ——— planning ———

function todayFor(store: Store) {
  return localDateIn(store.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
}

function skillMap(store: Store) {
  const bySkill = new Map(
    Object.entries(store.skills).map(([skill, [correct, total]]) => [skill, { correct, total }])
  );
  let correct = 0;
  let total = 0;
  for (const stat of bySkill.values()) {
    correct += stat.correct;
    total += stat.total;
  }
  return { bySkill, overall: { correct, total } };
}

function planDay(store: Store, date: string, keep: DayState | null = null): DayState {
  const targets = INTENSITY_TARGETS[store.intensity];
  const { bySkill, overall } = skillMap(store);

  const candidates = SAT_SKILLS.filter(
    (skill) => QUESTIONS.filter((question) => question.skill === skill).length >= targets.focus
  );
  const focusSkill = keep?.focusSkill ?? pickFocusSkill(bySkill, overall, candidates);

  // Work already done today stays in the plan whatever the new size is.
  const answered = (task: MissionTaskId) =>
    keep ? keep.plan[task].filter((ref) => ref in keep.answers) : [];
  const used = new Set(MISSION_TASK_IDS.flatMap((task) => answered(task).map(refId)));
  const take = (task: MissionTaskId, pool: string[]) => {
    const kept = answered(task);
    const fresh = pool.filter((id) => !used.has(id)).slice(0, Math.max(0, targets[task] - kept.length));
    for (const id of fresh) used.add(id);
    return [...kept, ...fresh.map(task === "vocabulary" ? wordRef : questionRef)];
  };

  const shuffled = seededShuffle(QUESTIONS, `${date}:questions`);
  const mistakes = take("mistakes", store.wrong);
  const focus = take(
    "focus",
    shuffled.filter((question) => question.skill === focusSkill).map((question) => question.id)
  );
  // One question per skill where possible, so the warm-up really is mixed.
  const seenSkills = new Set<string | null>([focusSkill]);
  const mixed = shuffled.filter((question) => {
    if (seenSkills.has(question.skill)) return false;
    seenSkills.add(question.skill);
    return true;
  });
  const warmup = take("warmup", [...mixed, ...shuffled].map((question) => question.id));
  const vocabulary = take(
    "vocabulary",
    seededShuffle(VOCABULARY_WORDS, `${date}:words`).map((word) => word.id)
  );

  return {
    date,
    focusSkill,
    plan: { warmup, focus, mistakes, vocabulary },
    answers: keep?.answers ?? {},
  };
}

function isCorrectAnswer(ref: string, answer: string) {
  if (ref.startsWith("w:")) return answer === "1";
  return QUESTION_BY_ID.get(refId(ref))?.correctAnswer === answer;
}

function summarizeDay(day: DayState): HistoryDay {
  const refs = MISSION_TASK_IDS.flatMap((task) => day.plan[task]);
  const completed = refs.filter((ref) => ref in day.answers).length;
  const questions = refs.filter((ref) => ref.startsWith("q:") && ref in day.answers);
  return {
    date: day.date,
    completed,
    total: refs.length,
    done: completed >= refs.length,
    answered: questions.length,
    correct: questions.filter((ref) => isCorrectAnswer(ref, day.answers[ref])).length,
  };
}

/** Rolls the store over to `date`, archiving the previous day. Pure — callers decide whether to persist. */
function withDay(store: Store, date: string): Store & { day: DayState } {
  if (store.day?.date === date) return store as Store & { day: DayState };
  const history = store.day
    ? [...store.history.filter((entry) => entry.date !== store.day!.date), summarizeDay(store.day)]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-HISTORY_DAYS)
    : store.history;
  const rolled = { ...store, history };
  return { ...rolled, day: planDay(rolled, date) };
}

function taskProgress(day: DayState): TaskProgress {
  return Object.fromEntries(
    MISSION_TASK_IDS.map((task) => [
      task,
      {
        completed: day.plan[task].filter((ref) => ref in day.answers).length,
        total: day.plan[task].length,
      },
    ])
  ) as TaskProgress;
}

// ——— views ———

const CTA_NOUN: Record<MissionTaskId, string> = {
  warmup: "warm-up",
  focus: "focus drill",
  mistakes: "mistake review",
  vocabulary: "word review",
};

function currentTask(store: Store & { day: DayState }, tasks: MissionTaskSummary[]): CurrentTaskInfo {
  const day = store.day;
  const current = tasks.find((task) => task.status === "current");
  const { bySkill, overall } = skillMap(store);
  const overallPct = overall.total > 0 ? percent(overall.correct, overall.total) : null;
  const today = summarizeDay(day);

  if (!current) {
    return {
      taskId: null,
      title: "Mission complete",
      stat: today.answered > 0 ? { value: `${percent(today.correct, today.answered)}%`, label: "accuracy today" } : null,
      minutes: 0,
      ctaLabel: "View your progress",
      href: "/dashboard/sat/progress",
      insight: "Today’s orbit is closed. A new mission unlocks tomorrow.",
    };
  }

  const remaining = current.total - current.completed;
  const left = (one: string, many: string) => ({ value: `${remaining}`, label: remaining === 1 ? one : many });
  const base = {
    taskId: current.id,
    minutes: estimateMinutes({ [current.id]: remaining }),
    ctaLabel: `${current.completed > 0 ? "Continue" : "Start"} ${CTA_NOUN[current.id]}`,
    href: current.href,
  };

  switch (current.id) {
    case "focus": {
      const skill = bySkill.get(day.focusSkill);
      let insight = "New skill for you — this drill sets your baseline.";
      if (skill && skill.total >= 3 && overallPct !== null) {
        const gap = overallPct - percent(skill.correct, skill.total);
        insight =
          gap > 0
            ? `This skill is ${gap}% below your average.`
            : "You’re at your average here — this drill keeps it sharp.";
      }
      return {
        ...base,
        title: day.focusSkill,
        stat:
          skill && skill.total > 0
            ? { value: `${percent(skill.correct, skill.total)}%`, label: "accuracy on this skill" }
            : left("question left", "questions left"),
        insight,
      };
    }
    case "warmup":
      return {
        ...base,
        title: "Mixed warm-up",
        stat: overallPct !== null ? { value: `${overallPct}%`, label: "overall accuracy" } : left("question left", "questions left"),
        insight:
          overall.total > 0
            ? `${current.total} questions from different skills.`
            : "Your first answers set your baseline for every skill.",
      };
    case "mistakes":
      return {
        ...base,
        title: "Fix mistakes",
        stat: left("question to retry", "questions to retry"),
        insight: `${store.wrong.length} open mistake${store.wrong.length === 1 ? "" : "s"} across your missions.`,
      };
    case "vocabulary":
      return {
        ...base,
        title: "Vocabulary review",
        stat: left("word left", "words left"),
        insight: "Say the meaning out loud before you reveal it.",
      };
  }
}

export async function loadLocalMission(): Promise<DailyMissionView> {
  const raw = await readStore();
  const date = todayFor(raw);
  const store = withDay(raw, date);
  const day = store.day;

  const progress = taskProgress(day);
  const tasks = summarizeTasks(progress, day.focusSkill, false);
  const todaySummary = summarizeDay(day);
  const days = [...store.history.filter((entry) => entry.date !== date), todaySummary];

  const weekStart = startOfWeek(date);
  const thisWeek = days.filter((entry) => entry.date >= weekStart && entry.date <= date);
  const answered = thisWeek.reduce((sum, entry) => sum + entry.answered, 0);
  const correct = thisWeek.reduce((sum, entry) => sum + entry.correct, 0);

  const remaining = Object.fromEntries(
    MISSION_TASK_IDS.map((task) => [task, progress[task].total - progress[task].completed])
  );

  return {
    date,
    timezone: store.tz ?? "",
    progress: percent(todaySummary.completed, todaySummary.total),
    completedItems: todaySummary.completed,
    totalItems: todaySummary.total,
    tasks,
    current: currentTask(store, tasks),
    examDate: store.examDate,
    examDaysRemaining: store.examDate ? daysBetween(date, store.examDate) : null,
    intensity: store.intensity,
    streak: computeStreak(days.filter((entry) => entry.done).map((entry) => entry.date), date),
    remainingMinutes: estimateMinutes(remaining),
    accuracy: answered > 0 ? percent(correct, answered) : null,
    week: buildWeek(date, days),
  };
}

function runnerItem(ref: string, answer: string | undefined): MissionRunnerItem | null {
  if (ref.startsWith("w:")) {
    const word = WORD_BY_ID.get(refId(ref));
    if (!word) return null;
    return {
      kind: "word",
      itemId: ref,
      wordId: word.id,
      word: word.word,
      definition: word.definition,
      translations: word.translations,
      saved: false,
      result: answer === undefined ? null : { knewIt: answer === "1" },
    };
  }

  const question = QUESTION_BY_ID.get(refId(ref));
  if (!question) return null;
  return {
    kind: "question",
    itemId: ref,
    passage: question.passage,
    stem: question.questionText,
    choices: question.choices,
    imageUrl: question.passageImageUrl ?? null,
    chartId: question.chartId ?? null,
    skill: question.skill,
    source: `Practice Exam ${question.examId}`,
    result: answer === undefined ? null : gradeQuestion(ref, answer),
  };
}

function gradeQuestion(ref: string, selected: string): MissionQuestionResult {
  const question = QUESTION_BY_ID.get(refId(ref))!;
  return {
    selected,
    isCorrect: question.correctAnswer === selected,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || null,
  };
}

export async function loadLocalRunner(task: MissionTaskId): Promise<MissionRunnerData> {
  const raw = await readStore();
  const store = withDay(raw, todayFor(raw));
  const day = store.day;
  const tasks = summarizeTasks(taskProgress(day), day.focusSkill, false);
  const summary = tasks.find((entry) => entry.id === task)!;
  const next = tasks.find((entry) => entry.id !== task && entry.status !== "completed") ?? null;

  return {
    taskId: task,
    title: task === "focus" ? `${TASK_TITLES.focus}: ${day.focusSkill}` : TASK_TITLES[task],
    subtitle: summary.subtitle,
    items: day.plan[task]
      .map((ref) => runnerItem(ref, day.answers[ref]))
      .filter((item): item is MissionRunnerItem => item !== null),
    nextTask: next ? { id: next.id, title: next.title, href: missionTaskHref(next.id) } : null,
  };
}

// ——— writes (Server Functions only) ———

export type AnswerOutcome =
  | { success: true; result: MissionQuestionResult }
  | { success: false; error: string };

function taskOf(day: DayState, ref: string): MissionTaskId | null {
  return MISSION_TASK_IDS.find((task) => day.plan[task].includes(ref)) ?? null;
}

export async function recordLocalAnswer(ref: string, selected: string): Promise<AnswerOutcome> {
  const raw = await readStore();
  const store = withDay(raw, todayFor(raw));
  const task = taskOf(store.day, ref);
  if (!task || task === "vocabulary" || !QUESTION_BY_ID.has(refId(ref))) {
    return { success: false, error: "This question isn’t part of today’s mission." };
  }

  const previous = store.day.answers[ref];
  if (previous !== undefined) return { success: true, result: gradeQuestion(ref, previous) };

  const result = gradeQuestion(ref, selected);
  const id = refId(ref);
  const skill = QUESTION_BY_ID.get(id)!.skill;
  const skills = { ...store.skills };
  if (skill) {
    const [correct, total] = skills[skill] ?? [0, 0];
    skills[skill] = [correct + (result.isCorrect ? 1 : 0), total + 1];
  }
  const wrong = result.isCorrect
    ? store.wrong.filter((entry) => entry !== id)
    : [id, ...store.wrong.filter((entry) => entry !== id)].slice(0, MAX_OPEN_MISTAKES);

  await writeStore({
    ...store,
    skills,
    wrong,
    day: { ...store.day, answers: { ...store.day.answers, [ref]: selected } },
  });
  return { success: true, result };
}

export async function recordLocalWordReview(ref: string, knewIt: boolean): Promise<{ success: boolean; error?: string }> {
  const raw = await readStore();
  const store = withDay(raw, todayFor(raw));
  if (taskOf(store.day, ref) !== "vocabulary") {
    return { success: false, error: "This word isn’t part of today’s mission." };
  }
  if (store.day.answers[ref] === undefined) {
    await writeStore({
      ...store,
      day: { ...store.day, answers: { ...store.day.answers, [ref]: knewIt ? "1" : "0" } },
    });
  }
  return { success: true };
}

export async function saveLocalGoal(examDate: string | null, intensity: MissionIntensity) {
  const raw = await readStore();
  const store = withDay(raw, todayFor(raw));
  const next = { ...store, examDate, intensity };
  await writeStore({ ...next, day: planDay(next, store.day.date, store.day) });
}

export async function saveLocalTimeZone(timeZone: string) {
  const store = await readStore();
  if (store.tz === timeZone) return;
  await writeStore({ ...store, tz: timeZone });
}
