"use server";

import { getCachedUser } from "@/lib/cached-auth";
import { parseTimedConfig } from "@/lib/timed-practice";
import {
  saveLocalTimedProgress,
  startLocalTimedSession,
  submitLocalTimedSession,
} from "@/lib/timed-practice-local";
import type { SatChoiceLabel } from "@/types/sat-exam";
import type { TimedActionResult } from "@/types/timed-practice";

/**
 * Timed Practice writes. Sessions are kept in a cookie (no database), but
 * Server Actions are still public endpoints, so every input is re-validated
 * here and grading happens on the server against the static question banks.
 *
 * No revalidatePath: writing the cookie already clears the client router cache
 * and re-renders the current page with the new value.
 */

const SESSION_ID = /^[a-f0-9]{18}$/;
const MAX_QUESTIONS = 120;
const MAX_SECONDS = 4 * 60 * 60;

function parseAnswers(input: unknown): (SatChoiceLabel | null)[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_QUESTIONS) return null;
  const valid = input.every((answer) => answer === null || answer === "A" || answer === "B" || answer === "C" || answer === "D");
  return valid ? (input as (SatChoiceLabel | null)[]) : null;
}

function parseSeconds(input: unknown): number | null {
  return Number.isInteger(input) && Math.abs(input as number) <= MAX_SECONDS ? (input as number) : null;
}

export async function startTimedPractice(input: unknown): Promise<TimedActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "signed-out" };

  const config = parseTimedConfig(input);
  if (!config) return { success: false, error: "invalid" };

  return startLocalTimedSession(user.id, config);
}

export async function saveTimedPracticeProgress(
  sessionId: unknown,
  answers: unknown,
  remainingSeconds: unknown
): Promise<TimedActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "signed-out" };

  const parsedAnswers = parseAnswers(answers);
  const remaining = parseSeconds(remainingSeconds);
  if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId) || !parsedAnswers || remaining === null) {
    return { success: false, error: "invalid" };
  }

  return saveLocalTimedProgress(user.id, sessionId, parsedAnswers, remaining);
}

export async function submitTimedPractice(
  sessionId: unknown,
  answers: unknown,
  remainingSeconds: unknown,
  localDate: unknown
): Promise<TimedActionResult> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "signed-out" };

  const parsedAnswers = parseAnswers(answers);
  const remaining = parseSeconds(remainingSeconds);
  if (
    typeof sessionId !== "string" ||
    !SESSION_ID.test(sessionId) ||
    !parsedAnswers ||
    remaining === null ||
    typeof localDate !== "string"
  ) {
    return { success: false, error: "invalid" };
  }

  return submitLocalTimedSession(user.id, sessionId, parsedAnswers, remaining, localDate);
}
