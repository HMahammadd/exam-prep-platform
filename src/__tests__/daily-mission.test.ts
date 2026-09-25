import { describe, expect, it } from "vitest";
import {
  addDays,
  buildWeek,
  computeStreak,
  daysBetween,
  emptyTaskProgress,
  estimateMinutes,
  formatBankPassage,
  inferSatSkill,
  isIsoDate,
  localDateIn,
  parseItemRef,
  pickFocusSkill,
  seededShuffle,
  splitQuestionText,
  startOfWeek,
  summarizeTasks,
  type SkillStat,
} from "../lib/daily-mission";

describe("dates", () => {
  it("resolves the calendar day in the student's time zone", () => {
    const instant = new Date("2026-09-24T22:30:00Z");
    expect(localDateIn("UTC", instant)).toBe("2026-09-24");
    expect(localDateIn("Asia/Baku", instant)).toBe("2026-09-25");
    expect(localDateIn("America/Los_Angeles", instant)).toBe("2026-09-24");
  });

  it("falls back to UTC for an unknown time zone", () => {
    expect(localDateIn("Not/AZone", new Date("2026-09-24T23:59:00Z"))).toBe("2026-09-24");
  });

  it("does calendar arithmetic across month ends", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(daysBetween("2026-09-24", "2026-11-09")).toBe(46);
    expect(daysBetween("2026-09-24", "2026-09-20")).toBe(-4);
  });

  it("starts weeks on Monday", () => {
    expect(startOfWeek("2026-09-24")).toBe("2026-09-21"); // Thursday
    expect(startOfWeek("2026-09-21")).toBe("2026-09-21"); // Monday
    expect(startOfWeek("2026-09-27")).toBe("2026-09-21"); // Sunday
  });

  it("validates ISO dates", () => {
    expect(isIsoDate("2026-12-05")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("12/05/2026")).toBe(false);
  });
});

describe("computeStreak", () => {
  const done = ["2026-09-18", "2026-09-19", "2026-09-20", "2026-09-21", "2026-09-22", "2026-09-23"];

  it("counts back from yesterday while today is unfinished", () => {
    expect(computeStreak(done, "2026-09-24")).toBe(6);
  });

  it("includes today once it is finished", () => {
    expect(computeStreak([...done, "2026-09-24"], "2026-09-24")).toBe(7);
  });

  it("is broken by a missed day", () => {
    expect(computeStreak(["2026-09-20", "2026-09-22"], "2026-09-24")).toBe(0);
    expect(computeStreak([], "2026-09-24")).toBe(0);
  });
});

describe("buildWeek", () => {
  it("marks past, today and future days", () => {
    const week = buildWeek("2026-09-24", [
      { date: "2026-09-21", completed: 18, total: 18, done: true },
      { date: "2026-09-22", completed: 9, total: 18, done: false },
      { date: "2026-09-24", completed: 8, total: 15, done: false },
    ]);

    expect(week.map((day) => day.status)).toEqual([
      "completed",
      "partial",
      "missed",
      "today",
      "upcoming",
      "upcoming",
      "upcoming",
    ]);
    expect(week[3]).toMatchObject({ weekday: "Thu", dateLabel: "Sep 24", progress: 53 });
    expect(week[1].progress).toBe(50);
  });
});

describe("seededShuffle", () => {
  it("is stable for a seed and differs across seeds", () => {
    const items = Array.from({ length: 20 }, (_, index) => index);
    expect(seededShuffle(items, "u1:2026-09-24")).toEqual(seededShuffle(items, "u1:2026-09-24"));
    expect(seededShuffle(items, "u1:2026-09-24")).not.toEqual(seededShuffle(items, "u1:2026-09-25"));
    expect([...seededShuffle(items, "x")].sort((a, b) => a - b)).toEqual(items);
  });
});

describe("inferSatSkill", () => {
  const choices = (texts: string[]) => texts.map((text) => ({ text }));

  it("tells Boundaries from Form, Structure, and Sense by the choices", () => {
    const stem = "Which choice completes the text so that it conforms to the conventions of Standard English?";
    expect(
      inferSatSkill({ passage: "", questionText: stem, choices: choices(["system. Located", "system, located", "system and located", "system located"]) })
    ).toBe("Form, Structure, and Sense");
    expect(
      inferSatSkill({ passage: "", questionText: stem, choices: choices(["cells; however,", "cells, however,", "cells. However,", "cells however"]) })
    ).toBe("Boundaries");
  });

  it("recognizes the standard stems", () => {
    const skill = (questionText: string, passage = "") =>
      inferSatSkill({ passage, questionText, choices: choices(["a", "b", "c", "d"]) });

    expect(skill("Which choice completes the text with the most logical and precise word or phrase?")).toBe("Words in Context");
    expect(skill("Which choice completes the text with the most logical transition?")).toBe("Transitions");
    expect(skill("Which choice most effectively uses relevant information from the notes?", "While researching a topic, a student has taken the following notes:")).toBe("Rhetorical Synthesis");
    expect(skill("Based on the texts, how would Povinelli (Text 2) most likely respond?")).toBe("Cross-Text Connections");
    expect(skill("Which quotation from My Antonia most accurately illustrates this claim?")).toBe("Command of Evidence");
    expect(skill("Which choice best describes the overall structure of the text?")).toBe("Text Structure and Purpose");
    expect(skill("Which choice best states the main idea of the text?")).toBe("Central Ideas and Details");
    expect(skill("Which choice most logically completes the text?")).toBe("Inferences");
  });
});

describe("pickFocusSkill", () => {
  it("picks the skill furthest below the student's average", () => {
    const stats = new Map<string, SkillStat>([
      ["Words in Context", { correct: 5, total: 20 }],
      ["Transitions", { correct: 18, total: 20 }],
    ]);
    expect(pickFocusSkill(stats, { correct: 70, total: 100 })).toBe("Words in Context");
  });

  it("starts a new student on the first skill of the syllabus", () => {
    expect(pickFocusSkill(new Map(), { correct: 0, total: 0 })).toBe("Words in Context");
  });

  it("moves on once a skill is at or above average", () => {
    const stats = new Map<string, SkillStat>([["Words in Context", { correct: 7, total: 8 }]]);
    expect(pickFocusSkill(stats, { correct: 7, total: 8 })).not.toBe("Words in Context");
  });
});

describe("splitQuestionText", () => {
  it("splits the final question off the passage", () => {
    const { passage, stem } = splitQuestionText(
      "Artist Marilyn Dingle's baskets are ______ sweetgrass. No factory can reproduce them. Which choice completes the text with the most logical and precise word or phrase?"
    );
    expect(passage).toBe("Artist Marilyn Dingle's baskets are ______ sweetgrass. No factory can reproduce them.");
    expect(stem).toBe("Which choice completes the text with the most logical and precise word or phrase?");
  });

  it("keeps the student's goal with the question", () => {
    const { stem } = splitQuestionText(
      "While researching a topic, a student has taken the following notes: Nests are flexible. The student wants to present the aim of the study. Which choice most effectively uses relevant information from the notes to accomplish this goal?"
    );
    expect(stem.startsWith("The student wants to present")).toBe(true);
  });

  it("splits after a blank with no sentence punctuation", () => {
    const { stem } = splitQuestionText(
      "Data in the graph suggest that ______ Which completion of the text is best supported by data in the graph?"
    );
    expect(stem).toBe("Which completion of the text is best supported by data in the graph?");
  });

  it("splits after a literary credit line", () => {
    const { passage, stem } = splitQuestionText(
      "The following text is from a memoir. In the text, the author discusses home. How nice and warm it was. ©2005 by Joan Didion Which choice best describes the function of the underlined portion?"
    );
    expect(passage.endsWith("©2005 by Joan Didion")).toBe(true);
    expect(stem).toBe("Which choice best describes the function of the underlined portion?");
  });

  it("does not cut inside an abbreviation in the question", () => {
    const { stem } = splitQuestionText(
      "Members served for decades. Which choice best describes the U.S. Senate data in the graph?"
    );
    expect(stem).toBe("Which choice best describes the U.S. Senate data in the graph?");
  });
});

describe("formatBankPassage", () => {
  it("restores Cross-Text headers", () => {
    expect(formatBankPassage("Text 1 First author. Text 2 Second author.")).toBe(
      "Text 1\nFirst author.\n\nText 2\nSecond author."
    );
  });
});

describe("parseItemRef", () => {
  it("round-trips every kind of item", () => {
    expect(parseItemRef("bank:114ccb34-936e-4a31-9483-1fe497a3a92e")).toEqual({
      kind: "bank",
      questionId: "114ccb34-936e-4a31-9483-1fe497a3a92e",
    });
    expect(parseItemRef("exam:abc:exam-1-q-4")).toEqual({
      kind: "exam",
      attemptId: "abc",
      questionId: "exam-1-q-4",
    });
    expect(parseItemRef("word:abhor")).toEqual({ kind: "word", wordId: "abhor" });
    expect(parseItemRef("nope")).toBeNull();
  });
});

describe("summarizeTasks", () => {
  it("reproduces the reference layout", () => {
    const progress = emptyTaskProgress();
    progress.warmup = { completed: 3, total: 3 };
    progress.focus = { completed: 5, total: 8 };
    progress.mistakes = { completed: 0, total: 2 };
    progress.vocabulary = { completed: 0, total: 5 };

    const tasks = summarizeTasks(progress, "Words in Context", true);
    expect(tasks.map((task) => [task.status, task.subtitle])).toEqual([
      ["completed", "3 mixed questions"],
      ["current", "Words in Context • 5 of 8"],
      ["upcoming", "2 recent questions"],
      ["upcoming", "5 saved words"],
    ]);
  });

  it("treats a task with nothing to do as complete", () => {
    const progress = emptyTaskProgress();
    progress.warmup = { completed: 0, total: 3 };
    const tasks = summarizeTasks(progress, "Transitions", false);
    expect(tasks.find((task) => task.id === "mistakes")).toMatchObject({
      status: "completed",
      subtitle: "No open mistakes",
    });
  });

  it("estimates remaining minutes", () => {
    expect(estimateMinutes({ focus: 3, mistakes: 2, vocabulary: 5 })).toBe(11);
  });
});
