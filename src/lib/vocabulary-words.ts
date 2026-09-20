import type { VocabularyWord } from "@/types/vocabulary";

/**
 * "Our Words" — Keplerly-supplied vocabulary. Static for now, same reasoning
 * as SAT_PRACTICE_EXAMS / SAT_LESSONS: no admin-authoring UI exists for this
 * content yet, so it lives in code rather than an editable Supabase table.
 * Per-user state (starred, notes, language) is stored separately, keyed by
 * `id` — see supabase/migrations/015_user_vocabulary.sql.
 */
export const VOCABULARY_WORDS: VocabularyWord[] = [
  {
    id: "abhor",
    word: "abhor",
    definition: "to hate, detest",
    translations: { AZE: "nifrət etmək", RUS: "ненавидеть" },
  },
  {
    id: "abide",
    word: "abide",
    definition: "to put up with; to remain",
    translations: { AZE: "dözmək; qalmaq", RUS: "терпеть; оставаться" },
  },
  {
    id: "abject",
    word: "abject",
    definition: "wretched, pitiful",
    translations: { AZE: "acınacaqlı", RUS: "жалкий, презренный" },
  },
  {
    id: "abjure",
    word: "abjure",
    definition: "to reject, renounce",
    translations: { AZE: "imtina etmək; rədd etmək", RUS: "отрекаться, отказываться" },
  },
  {
    id: "abnegation",
    word: "abnegation",
    definition: "denial of comfort to oneself",
    translations: {
      AZE: "özünü inkar / özünə rahatlığı qıymamaq",
      RUS: "самоотречение",
    },
  },
  {
    id: "abort",
    word: "abort",
    definition: "to give up on a half-finished project or effort",
    translations: { AZE: "yarımçıq dayandırmaq", RUS: "прервать, прекратить" },
  },
  {
    id: "abridge",
    word: "abridge",
    definition: "to cut down, shorten",
    translations: { AZE: "qısaltmaq", RUS: "сокращать" },
  },
  {
    id: "abrogate",
    word: "abrogate",
    definition: "to abolish, usually by authority",
    translations: { AZE: "ləğv etmək", RUS: "отменять, упразднять" },
  },
  {
    id: "abscond",
    word: "abscond",
    definition: "to sneak away and hide",
    translations: { AZE: "qaçıb gizlənmək", RUS: "скрыться, сбежать" },
  },
  {
    id: "absolution",
    word: "absolution",
    definition: "freedom from blame, guilt, or sin",
    translations: {
      AZE: "bəraət; günahdan azad olma",
      RUS: "отпущение грехов, освобождение от вины",
    },
  },
];
