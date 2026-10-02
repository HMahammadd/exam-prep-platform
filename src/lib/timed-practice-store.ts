import {
  TIMED_DURATION_IDS,
  TIMED_FOCUS_IDS,
  TIMED_TOPIC_IDS,
  type TimedFocusId,
  type TimedHistoryEntry,
  type TimedPracticeConfig,
} from "../types/timed-practice";
import type { SatChoiceLabel } from "../types/sat-exam";
import { isIsoDate } from "./daily-mission";

/**
 * The Timed Practice cookie payload and its codec. Pure, so it can be tested
 * without a request. Everything read back is re-checked: the cookie is
 * httpOnly but still held by the browser.
 *
 * A cookie tops out around 4 KB, so the payload is packed: question ids as
 * "exam.question" pairs, answers as one letter per question, the config and
 * history as tuples. A full-section session plus the last result stays well
 * under 2.5 KB once base64url-encoded.
 */

export type StoredSession = {
  id: string;
  config: TimedPracticeConfig;
  questions: string[];
  answers: (SatChoiceLabel | null)[];
  /** Seconds the session allows. */
  limit: number;
  /** Seconds left at the last save; negative is overtime (relaxed timing only). */
  remaining: number;
  /** Epoch ms. */
  started: number;
};

export type StoredResult = {
  date: string;
  config: TimedPracticeConfig;
  minutes: number;
  used: number;
  questions: string[];
  answers: (SatChoiceLabel | null)[];
};

export type TimedStore = {
  /** Owner — a different account on the same browser starts from empty. */
  uid: string | null;
  active: StoredSession | null;
  last: StoredResult | null;
  /** Newest first. */
  history: TimedHistoryEntry[];
};

export const EMPTY_TIMED_STORE: TimedStore = { uid: null, active: null, last: null, history: [] };

export const TIMED_HISTORY_LIMIT = 12;

// ——— packing helpers ———

const BANK_ID = /^exam-(\d{1,3})-q-(\d{1,3})$/;
const PACKED_ID = /^(\d{1,3})\.(\d{1,3})$/;
const SESSION_ID = /^[a-z0-9]{6,32}$/;

export function packQuestionId(id: string): string {
  const match = id.match(BANK_ID);
  return match ? `${match[1]}.${match[2]}` : id;
}

export function unpackQuestionId(packed: string): string {
  const match = packed.match(PACKED_ID);
  return match ? `exam-${match[1]}-q-${match[2]}` : packed;
}

function packAnswers(answers: (SatChoiceLabel | null)[]): string {
  return answers.map((answer) => answer ?? "-").join("");
}

function unpackAnswers(packed: unknown, length: number): (SatChoiceLabel | null)[] | null {
  if (typeof packed !== "string" || packed.length !== length || !/^[ABCD-]*$/.test(packed)) return null;
  return Array.from(packed, (letter) => (letter === "-" ? null : (letter as SatChoiceLabel)));
}

function packConfig(config: TimedPracticeConfig): [string, string, number, number] {
  const mask = TIMED_TOPIC_IDS.reduce((bits, topic, index) => (config.topics.includes(topic) ? bits | (1 << index) : bits), 0);
  return [config.duration, config.focus, mask, config.pacing ? 1 : 0];
}

function unpackConfig(value: unknown): TimedPracticeConfig | null {
  if (!Array.isArray(value) || value.length !== 4) return null;
  const [duration, focus, mask, pacing] = value;
  if (
    !(TIMED_DURATION_IDS as readonly unknown[]).includes(duration) ||
    !(TIMED_FOCUS_IDS as readonly unknown[]).includes(focus) ||
    !Number.isInteger(mask) ||
    (pacing !== 0 && pacing !== 1)
  ) {
    return null;
  }
  return {
    duration,
    focus,
    topics: TIMED_TOPIC_IDS.filter((_, index) => (mask as number) & (1 << index)),
    pacing: pacing === 1,
  } as TimedPracticeConfig;
}

function unpackQuestions(value: unknown): string[] | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const ids = value.split(",");
  if (ids.length > 120 || !ids.every((id) => PACKED_ID.test(id) || /^[\w-]{1,48}$/.test(id))) return null;
  return ids.map(unpackQuestionId);
}

const isInt = (value: unknown): value is number => Number.isInteger(value);

// ——— encode / decode ———

export function encodeTimedStore(store: TimedStore): string {
  const active = store.active
    ? {
        i: store.active.id,
        c: packConfig(store.active.config),
        q: store.active.questions.map(packQuestionId).join(","),
        a: packAnswers(store.active.answers),
        l: store.active.limit,
        r: store.active.remaining,
        s: store.active.started,
      }
    : null;
  const last = store.last
    ? {
        d: store.last.date,
        c: packConfig(store.last.config),
        m: store.last.minutes,
        u: store.last.used,
        q: store.last.questions.map(packQuestionId).join(","),
        a: packAnswers(store.last.answers),
      }
    : null;
  const history = store.history
    .slice(0, TIMED_HISTORY_LIMIT)
    .map((entry) => [entry.date, entry.minutes, entry.correct, entry.total, TIMED_FOCUS_IDS.indexOf(entry.focus)]);

  return Buffer.from(JSON.stringify({ v: 1, u: store.uid, a: active, l: last, h: history })).toString("base64url");
}

function decodeActive(value: unknown): StoredSession | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const config = unpackConfig(raw.c);
  const questions = unpackQuestions(raw.q);
  if (!config || !questions || typeof raw.i !== "string" || !SESSION_ID.test(raw.i)) return null;
  const answers = unpackAnswers(raw.a, questions.length);
  if (!answers || !isInt(raw.l) || !isInt(raw.r) || !isInt(raw.s)) return null;
  if (raw.l <= 0 || raw.l > 4 * 60 * 60 || raw.r > raw.l || raw.r < -raw.l) return null;
  return { id: raw.i, config, questions, answers, limit: raw.l, remaining: raw.r, started: raw.s };
}

function decodeLast(value: unknown): StoredResult | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const config = unpackConfig(raw.c);
  const questions = unpackQuestions(raw.q);
  if (!config || !questions || typeof raw.d !== "string" || !isIsoDate(raw.d)) return null;
  const answers = unpackAnswers(raw.a, questions.length);
  if (!answers || !isInt(raw.m) || !isInt(raw.u) || raw.u < 0) return null;
  return { date: raw.d, config, minutes: raw.m, used: raw.u, questions, answers };
}

function decodeHistory(value: unknown): TimedHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((entry): TimedHistoryEntry[] => {
      if (!Array.isArray(entry) || entry.length !== 5) return [];
      const [date, minutes, correct, total, focusIndex] = entry;
      const focus = TIMED_FOCUS_IDS[focusIndex as number] as TimedFocusId | undefined;
      if (
        typeof date !== "string" ||
        !isIsoDate(date) ||
        ![minutes, correct, total].every(isInt) ||
        !focus ||
        correct < 0 ||
        correct > total ||
        total <= 0
      ) {
        return [];
      }
      return [{ date, minutes, correct, total, focus }];
    })
    .slice(0, TIMED_HISTORY_LIMIT);
}

export function decodeTimedStore(raw: string | undefined): TimedStore {
  if (!raw) return { ...EMPTY_TIMED_STORE };
  try {
    const data: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (typeof data !== "object" || data === null || (data as { v?: unknown }).v !== 1) {
      return { ...EMPTY_TIMED_STORE };
    }
    const payload = data as Record<string, unknown>;
    return {
      uid: typeof payload.u === "string" ? payload.u : null,
      active: decodeActive(payload.a),
      last: decodeLast(payload.l),
      history: decodeHistory(payload.h),
    };
  } catch {
    return { ...EMPTY_TIMED_STORE };
  }
}
