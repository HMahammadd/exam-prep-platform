/**
 * Per-exam study notes.
 *
 * Browser-local for now — there is no notes table and this file deliberately
 * invents no API. Everything goes through this module rather than touching
 * localStorage from components, so swapping in a server action later is one
 * change here plus awaiting the calls.
 */

const NOTES_KEY = "sat-exam-notes";

export type SatExamNotes = Record<string, string>;

export function loadSatExamNotes(): SatExamNotes {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    // Drop anything that is not a string, so one bad write cannot break render.
    const clean: SatExamNotes = {};
    for (const [examId, note] of Object.entries(parsed as SatExamNotes)) {
      if (typeof note === "string" && note.trim()) {
        clean[examId] = note;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

/** Empty text removes the note rather than storing a blank one. */
export function saveSatExamNote(examId: number, note: string): SatExamNotes {
  const next = loadSatExamNotes();
  const trimmed = note.trim();

  if (trimmed) {
    next[String(examId)] = trimmed;
  } else {
    delete next[String(examId)];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked or full — the in-memory copy still drives the UI.
    }
  }

  return next;
}
