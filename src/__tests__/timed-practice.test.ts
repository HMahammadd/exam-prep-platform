import { describe, expect, it } from "vitest";
import {
  availabilityOf,
  canSwitchTopicOff,
  configProblem,
  defaultTimedConfig,
  formatClock,
  formatDayLabel,
  isCustomized,
  isFocusAvailable,
  isSuccessfulResult,
  parseTimedConfig,
  pickSessionQuestions,
  planSession,
  todayLabelsAround,
  toggleTopic,
  topicForSkill,
  type TimedPoolQuestion,
} from "../lib/timed-practice";
import {
  decodeTimedStore,
  encodeTimedStore,
  packQuestionId,
  unpackQuestionId,
  type TimedStore,
} from "../lib/timed-practice-store";
import {
  TIMED_TOPIC_IDS,
  type TimedAvailability,
  type TimedPracticeConfig,
} from "../types/timed-practice";

const ALL_TOPICS = [...TIMED_TOPIC_IDS];

/** Plenty of both sections, spread over every topic. */
const FULL: TimedAvailability = {
  math: { total: 200, byTopic: { algebra: 50, advancedMath: 50, problemSolving: 50, geometryTrig: 50 } },
  "reading-writing": {
    total: 200,
    byTopic: { craftStructure: 50, informationIdeas: 50, conventions: 50, expressionIdeas: 50 },
  },
};

/** Today's bank: Reading & Writing only, a few questions without a recognised domain. */
const RW_ONLY: TimedAvailability = {
  math: { total: 0, byTopic: {} },
  "reading-writing": {
    total: 162,
    byTopic: { craftStructure: 50, informationIdeas: 40, conventions: 30, expressionIdeas: 30 },
  },
};

function config(patch: Partial<TimedPracticeConfig> = {}): TimedPracticeConfig {
  return { duration: "20", focus: "mixed", topics: ALL_TOPICS, pacing: true, ...patch };
}

describe("planSession", () => {
  it("builds the reference session: 20 minutes, 10 questions, 5 + 5", () => {
    const plan = planSession(config(), FULL);
    expect(plan.minutes).toBe(20);
    expect(plan.questionCount).toBe(10);
    expect(plan.split.map((row) => [row.section, row.count])).toEqual([
      ["math", 5],
      ["reading-writing", 5],
    ]);
    expect(plan.limited).toBe(false);
  });

  it("maps each short length to its question count", () => {
    expect(planSession(config({ duration: "10" }), FULL).questionCount).toBe(5);
    expect(planSession(config({ duration: "35" }), FULL).questionCount).toBe(18);
  });

  it("gives Reading & Writing the odd question in a mixed session", () => {
    const plan = planSession(config({ duration: "10" }), FULL);
    expect(plan.split).toMatchObject([
      { section: "math", count: 2 },
      { section: "reading-writing", count: 3 },
    ]);
  });

  it("derives a full section from the SAT's own shape", () => {
    expect(planSession(config({ duration: "full", focus: "reading-writing" }), FULL)).toMatchObject({
      minutes: 64,
      questionCount: 54,
    });
    expect(planSession(config({ duration: "full", focus: "math" }), FULL)).toMatchObject({
      minutes: 70,
      questionCount: 44,
    });
    // Mixed: one module of each section.
    expect(planSession(config({ duration: "full", focus: "mixed" }), FULL)).toMatchObject({
      minutes: 67,
      questionCount: 49,
    });
  });

  it("caps the count at what the chosen topics can serve", () => {
    const plan = planSession(
      config({ duration: "35", focus: "reading-writing", topics: ["conventions"] }),
      { ...RW_ONLY, "reading-writing": { total: 162, byTopic: { conventions: 7 } } }
    );
    expect(plan.questionCount).toBe(7);
    expect(plan.limited).toBe(true);
    expect(plan.split[0]).toMatchObject({ topicsOn: 1, topicsAll: 4 });
  });

  it("counts untagged questions only when every topic is on", () => {
    const full = planSession(config({ duration: "full", focus: "reading-writing" }), RW_ONLY);
    expect(full.questionCount).toBe(54);
    const narrowed = planSession(
      config({ duration: "full", focus: "reading-writing", topics: ["conventions", "expressionIdeas"] }),
      RW_ONLY
    );
    expect(narrowed.questionCount).toBe(54);
    const tight = planSession(
      config({ duration: "full", focus: "reading-writing", topics: ["conventions"] }),
      RW_ONLY
    );
    expect(tight.questionCount).toBe(30);
  });
});

describe("availability", () => {
  it("marks Math and Mixed unavailable while the bank has no Math", () => {
    expect(isFocusAvailable("reading-writing", RW_ONLY)).toBe(true);
    expect(isFocusAvailable("math", RW_ONLY)).toBe(false);
    expect(isFocusAvailable("mixed", RW_ONLY)).toBe(false);
  });

  it("defaults to Mixed, falling back to a section the bank can serve", () => {
    expect(defaultTimedConfig(FULL)).toMatchObject({ duration: "20", focus: "mixed", pacing: true });
    expect(defaultTimedConfig(RW_ONLY).focus).toBe("reading-writing");
  });

  it("explains why a session can't start", () => {
    expect(configProblem(config(), RW_ONLY)).toBe("focus-unavailable");
    expect(configProblem(config({ focus: "reading-writing", topics: ["algebra"] }), RW_ONLY)).toBe("no-topics");
    expect(
      configProblem(config({ focus: "reading-writing", topics: ["conventions"] }), {
        ...RW_ONLY,
        "reading-writing": { total: 10, byTopic: { craftStructure: 10 } },
      })
    ).toBe("no-questions");
    expect(configProblem(config({ focus: "reading-writing" }), RW_ONLY)).toBeNull();
  });

  it("counts a pool by section and topic", () => {
    const pool: TimedPoolQuestion[] = [
      { id: "a", section: "reading-writing", topic: "conventions" },
      { id: "b", section: "reading-writing", topic: null },
      { id: "c", section: "math", topic: "algebra" },
    ];
    expect(availabilityOf(pool)).toEqual({
      math: { total: 1, byTopic: { algebra: 1 } },
      "reading-writing": { total: 2, byTopic: { conventions: 1 } },
    });
  });
});

describe("topics", () => {
  it("maps Reading & Writing skills to their College Board domain", () => {
    expect(topicForSkill("Words in Context")).toBe("craftStructure");
    expect(topicForSkill("Boundaries")).toBe("conventions");
    expect(topicForSkill("Transitions")).toBe("expressionIdeas");
    expect(topicForSkill(null)).toBeNull();
  });

  it("never switches off the last topic in a section", () => {
    const one = toggleTopic(ALL_TOPICS.filter((topic) => topic !== "craftStructure" && topic !== "informationIdeas" && topic !== "expressionIdeas"), "conventions");
    expect(one).toContain("conventions");
    expect(canSwitchTopicOff(["conventions", "algebra"], "conventions")).toBe(false);
    expect(canSwitchTopicOff(["conventions", "craftStructure"], "conventions")).toBe(true);
  });

  it("switches topics back on in canonical order", () => {
    expect(toggleTopic(["conventions"], "craftStructure")).toEqual(["craftStructure", "conventions"]);
  });

  it("only counts as customized within the focus's sections", () => {
    const noMath = ALL_TOPICS.filter((topic) => topic !== "algebra");
    expect(isCustomized({ focus: "reading-writing", topics: noMath })).toBe(false);
    expect(isCustomized({ focus: "mixed", topics: noMath })).toBe(true);
  });
});

describe("parseTimedConfig", () => {
  it("accepts a valid config and normalises topic order", () => {
    expect(
      parseTimedConfig({ duration: "35", focus: "math", topics: ["geometryTrig", "algebra", "algebra"], pacing: false })
    ).toEqual({ duration: "35", focus: "math", topics: ["algebra", "geometryTrig"], pacing: false });
  });

  it("rejects anything malformed", () => {
    expect(parseTimedConfig(null)).toBeNull();
    expect(parseTimedConfig({ duration: "15", focus: "math", topics: [], pacing: true })).toBeNull();
    expect(parseTimedConfig({ duration: "20", focus: "science", topics: [], pacing: true })).toBeNull();
    expect(parseTimedConfig({ duration: "20", focus: "math", topics: ["history"], pacing: true })).toBeNull();
    expect(parseTimedConfig({ duration: "20", focus: "math", topics: [], pacing: "yes" })).toBeNull();
  });
});

describe("pickSessionQuestions", () => {
  const pool: TimedPoolQuestion[] = [
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `rw-${index}`,
      section: "reading-writing" as const,
      topic: (["expressionIdeas", "craftStructure", "conventions", null] as const)[index % 4],
    })),
    ...Array.from({ length: 6 }, (_, index) => ({ id: `m-${index}`, section: "math" as const, topic: "algebra" as const })),
  ];
  const availability = availabilityOf(pool);

  it("takes the planned number from each section, Reading & Writing first", () => {
    const cfg = config({ duration: "10" });
    const ids = pickSessionQuestions(pool, cfg, planSession(cfg, availability), "seed");
    expect(ids).toHaveLength(5);
    expect(ids.slice(0, 3).every((id) => id.startsWith("rw-"))).toBe(true);
    expect(ids.slice(3).every((id) => id.startsWith("m-"))).toBe(true);
  });

  it("follows the test's domain order within a section", () => {
    const cfg = config({ duration: "full", focus: "reading-writing" });
    const ids = pickSessionQuestions(pool, cfg, planSession(cfg, availability), "seed");
    const topics = ids.map((id) => pool.find((question) => question.id === id)!.topic);
    const rank = (topic: string | null) =>
      topic === null ? 4 : ["craftStructure", "informationIdeas", "conventions", "expressionIdeas"].indexOf(topic);
    expect(topics.map(rank)).toEqual([...topics.map(rank)].sort((a, b) => a - b));
  });

  it("respects the topic selection", () => {
    const cfg = config({ duration: "full", focus: "reading-writing", topics: ["conventions"] });
    const ids = pickSessionQuestions(pool, cfg, planSession(cfg, availability), "seed");
    expect(ids).toHaveLength(3);
    expect(ids.every((id) => pool.find((question) => question.id === id)!.topic === "conventions")).toBe(true);
  });

  it("uses questions from the last session only once fresh ones run out", () => {
    const cfg = config({ duration: "20", focus: "reading-writing" });
    const plan = planSession(cfg, availability);
    const avoid = new Set(pool.filter((question) => question.section === "reading-writing").slice(0, 4).map((q) => q.id));
    const ids = pickSessionQuestions(pool, cfg, plan, "seed", avoid);
    expect(ids).toHaveLength(10);
    expect(ids.filter((id) => avoid.has(id))).toHaveLength(2);
  });

  it("is deterministic for a seed", () => {
    const cfg = config({ duration: "10", focus: "reading-writing" });
    const plan = planSession(cfg, availability);
    expect(pickSessionQuestions(pool, cfg, plan, "abc")).toEqual(pickSessionQuestions(pool, cfg, plan, "abc"));
  });
});

describe("formatting", () => {
  it("formats the clock", () => {
    expect(formatClock(1200)).toBe("20:00");
    expect(formatClock(462)).toBe("7:42");
    expect(formatClock(4020)).toBe("67:00");
    expect(formatClock(-65)).toBe("1:05");
  });

  it("reads a calendar day without shifting it", () => {
    expect(formatDayLabel("2026-09-28", "en")).toBe("Sep 28");
    expect(formatDayLabel("2026-09-29", "en", true)).toBe("Tuesday, Sep 29");
  });

  it("labels every day a student's clock could be on", () => {
    const labels = todayLabelsAround(new Date("2026-09-29T23:30:00Z"), "en");
    expect(Object.keys(labels)).toEqual(["2026-09-28", "2026-09-29", "2026-09-30"]);
    expect(labels["2026-09-30"]).toBe("Wednesday, Sep 30");
  });

  it("treats 70% and up as a successful result", () => {
    expect(isSuccessfulResult(9, 10)).toBe(true);
    expect(isSuccessfulResult(14, 18)).toBe(true);
    expect(isSuccessfulResult(6, 10)).toBe(false);
    expect(isSuccessfulResult(0, 0)).toBe(false);
  });
});

describe("timed practice cookie", () => {
  const store: TimedStore = {
    uid: "user-1",
    active: {
      id: "a1b2c3d4e5f6a7b8c9",
      config: config({ focus: "reading-writing", topics: ["craftStructure", "conventions"], pacing: false }),
      questions: ["exam-1-q-4", "exam-2-q-13", "exam-3-q-54"],
      answers: ["B", null, "D"],
      limit: 1200,
      remaining: 462,
      started: 1_790_000_000_000,
    },
    last: {
      date: "2026-09-28",
      config: config({ focus: "reading-writing" }),
      minutes: 20,
      used: 1034,
      questions: ["exam-1-q-1", "exam-1-q-2"],
      answers: ["A", "C"],
    },
    history: [
      { date: "2026-09-28", minutes: 20, correct: 9, total: 10, focus: "reading-writing" },
      { date: "2026-09-26", minutes: 35, correct: 14, total: 18, focus: "reading-writing" },
    ],
  };

  it("round-trips", () => {
    expect(decodeTimedStore(encodeTimedStore(store))).toEqual(store);
  });

  it("packs question ids", () => {
    expect(packQuestionId("exam-2-q-13")).toBe("2.13");
    expect(unpackQuestionId("2.13")).toBe("exam-2-q-13");
  });

  it("stays small enough for a cookie with a full section in flight", () => {
    const questions = Array.from({ length: 54 }, (_, index) => `exam-${(index % 3) + 1}-q-${index + 1}`);
    const big: TimedStore = {
      ...store,
      active: { ...store.active!, questions, answers: questions.map(() => "A"), limit: 3840, remaining: 3000 },
      last: { ...store.last!, questions, answers: questions.map(() => "B") },
      history: Array.from({ length: 20 }, () => store.history[0]),
    };
    expect(encodeTimedStore(big).length).toBeLessThan(3000);
    expect(decodeTimedStore(encodeTimedStore(big)).history).toHaveLength(12);
  });

  it("falls back to empty on garbage", () => {
    expect(decodeTimedStore("not-base64-json")).toMatchObject({ uid: null, active: null, last: null, history: [] });
    expect(decodeTimedStore(undefined).active).toBeNull();
  });

  it("drops a tampered session but keeps the rest", () => {
    const tampered = JSON.parse(Buffer.from(encodeTimedStore(store), "base64url").toString("utf8"));
    tampered.a.a = "BZ-";
    const decoded = decodeTimedStore(Buffer.from(JSON.stringify(tampered)).toString("base64url"));
    expect(decoded.active).toBeNull();
    expect(decoded.history).toHaveLength(2);
  });

  it("rejects impossible history entries", () => {
    const tampered = JSON.parse(Buffer.from(encodeTimedStore(store), "base64url").toString("utf8"));
    tampered.h.push(["2026-09-01", 20, 11, 10, 2], ["nope", 20, 1, 10, 2]);
    expect(decodeTimedStore(Buffer.from(JSON.stringify(tampered)).toString("base64url")).history).toHaveLength(2);
  });
});
