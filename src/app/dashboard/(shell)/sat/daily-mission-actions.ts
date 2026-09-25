"use server";

import { revalidatePath } from "next/cache";
import {
  DAILY_GOAL_PATH,
  isIsoDate,
  isMissionIntensity,
  isValidTimeZone,
} from "@/lib/daily-mission";
import {
  recordLocalAnswer,
  recordLocalWordReview,
  saveLocalGoal,
  saveLocalTimeZone,
  type AnswerOutcome,
} from "@/lib/daily-mission-local";
import type { MissionIntensity } from "@/types/daily-mission";

/**
 * Daily Mission writes. Progress is kept in a cookie (no database), but Server
 * Actions are still public endpoints, so every input is re-validated here and
 * grading happens on the server against the static question banks.
 */

const QUESTION_REF = /^q:exam-\d+-q-\d+$/;
const WORD_REF = /^w:[\w-]{1,64}$/;

function refreshMission() {
  // Also drops the client router cache (staleTimes.dynamic), so going back
  // to the mission page shows the new progress immediately.
  revalidatePath(DAILY_GOAL_PATH, "layout");
}

export async function answerMissionQuestion(itemId: string, selected: string): Promise<AnswerOutcome> {
  if (!QUESTION_REF.test(itemId) || !/^[A-D]$/.test(selected)) {
    return { success: false, error: "Invalid answer." };
  }
  const outcome = await recordLocalAnswer(itemId, selected);
  if (outcome.success) refreshMission();
  return outcome;
}

export async function reviewMissionWord(
  itemId: string,
  knewIt: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!WORD_REF.test(itemId) || typeof knewIt !== "boolean") {
    return { success: false, error: "Invalid review." };
  }
  const outcome = await recordLocalWordReview(itemId, knewIt);
  if (outcome.success) refreshMission();
  return outcome;
}

export async function saveStudyGoal(input: {
  examDate: string | null;
  intensity: MissionIntensity;
}): Promise<{ success: boolean; error?: string }> {
  const examDate = input.examDate?.trim() || null;
  if (examDate !== null && !isIsoDate(examDate)) {
    return { success: false, error: "Enter a valid SAT date." };
  }
  if (!isMissionIntensity(input.intensity)) {
    return { success: false, error: "Pick a daily goal." };
  }

  await saveLocalGoal(examDate, input.intensity);
  refreshMission();
  return { success: true };
}

/** "Today" follows the student's own clock, reported by their browser. */
export async function syncMissionTimezone(timeZone: string): Promise<{ success: boolean }> {
  if (!isValidTimeZone(timeZone)) return { success: false };
  await saveLocalTimeZone(timeZone);
  refreshMission();
  return { success: true };
}
