/**
 * Reads the in-progress state the exam interface already keeps.
 *
 * ExamInterface writes its session to `sat-exam-{id}` in sessionStorage on
 * every answer; this only reads it, so an unfinished exam can be shown as a
 * checkpoint without any new storage or backend.
 */

import type { SatChoiceLabel } from "@/types/sat-exam";

type StoredExamState = {
  phase?: string;
  answers?: Record<string, SatChoiceLabel | null>;
};

export type SatExamProgress = {
  answered: number;
  total: number;
};

function storageKey(examId: number) {
  return `sat-exam-${examId}`;
}

export function loadSatExamProgress(
  examId: number
): SatExamProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(storageKey(examId));
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as StoredExamState;
    const answers = stored.answers ?? {};
    const total = Object.keys(answers).length;
    if (!total) return null;

    const answered = Object.values(answers).filter(Boolean).length;

    // Sitting on the instructions screen having answered nothing is not
    // progress worth showing — it would mark every opened exam as started.
    if (!answered && stored.phase === "instructions") {
      return null;
    }

    return { answered, total };
  } catch {
    return null;
  }
}
