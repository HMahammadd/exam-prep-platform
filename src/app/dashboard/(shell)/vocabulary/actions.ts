"use server";

import { createClient } from "@/lib/supabaseServer";
import { getCachedUser } from "@/lib/cached-auth";
import { VOCABULARY_WORDS } from "@/lib/vocabulary-words";
import {
  DEFAULT_VOCABULARY_COLUMN_ORDER,
  isVocabularyColumnId,
  mapVocabularyUserState,
  type TranslationLanguage,
  type UserVocabularyPrefsRow,
  type UserVocabularyWordRow,
  type VocabularyColumnId,
  type VocabularyUserState,
} from "@/types/vocabulary";

const EMPTY_STATE: VocabularyUserState = {
  starred: {},
  notes: {},
  translationLanguage: "AZE",
  columnOrder: DEFAULT_VOCABULARY_COLUMN_ORDER,
};

/**
 * Server Actions are a public endpoint, so the word id is checked against the
 * static list rather than trusted from the client. RLS already stops a student
 * writing someone else's rows; this stops them filling their own with ids that
 * match no word. When "Your Words" lands, student-authored words get their own
 * table instead of being smuggled in here — see the migration's header note.
 */
const KNOWN_WORD_IDS = new Set(VOCABULARY_WORDS.map((word) => word.id));

function isKnownWordId(wordId: string): boolean {
  return KNOWN_WORD_IDS.has(wordId);
}

function isValidColumnOrder(order: VocabularyColumnId[]): boolean {
  return (
    order.length === DEFAULT_VOCABULARY_COLUMN_ORDER.length &&
    new Set(order).size === order.length &&
    order.every(isVocabularyColumnId)
  );
}

export async function getMyVocabularyState(): Promise<VocabularyUserState> {
  const user = await getCachedUser();
  if (!user) return EMPTY_STATE;

  const supabase = await createClient();

  const [wordsResult, prefsResult] = await Promise.all([
    supabase
      .from("user_vocabulary_words")
      .select("word_id, starred, notes")
      .eq("user_id", user.id),
    supabase
      .from("user_vocabulary_prefs")
      .select("translation_language, column_order")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (wordsResult.error) {
    console.error("Failed to load vocabulary word state:", wordsResult.error);
  }
  if (prefsResult.error) {
    console.error("Failed to load vocabulary prefs:", prefsResult.error);
  }

  return mapVocabularyUserState(
    (wordsResult.data as UserVocabularyWordRow[] | null) ?? [],
    (prefsResult.data as UserVocabularyPrefsRow | null) ?? null
  );
}

export async function setWordStarred(
  wordId: string,
  starred: boolean
): Promise<{ success: boolean; error?: string }> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (!isKnownWordId(wordId)) return { success: false, error: "Unknown word." };

  const supabase = await createClient();
  // Partial upsert: only the columns in this payload are written, so starring
  // a word never clobbers the note attached to the same row.
  const { error } = await supabase.from("user_vocabulary_words").upsert(
    {
      user_id: user.id,
      word_id: wordId,
      starred,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" }
  );

  if (error) {
    console.error("Failed to save starred word:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true };
}

export async function saveWordNote(
  wordId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (!isKnownWordId(wordId)) return { success: false, error: "Unknown word." };

  const supabase = await createClient();
  // Same partial upsert in reverse: saving a note leaves `starred` alone.
  const { error } = await supabase.from("user_vocabulary_words").upsert(
    {
      user_id: user.id,
      word_id: wordId,
      notes: notes.trim().length > 0 ? notes.trim() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" }
  );

  if (error) {
    console.error("Failed to save word note:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true };
}

export async function saveVocabularyPrefs(input: {
  translationLanguage?: TranslationLanguage;
  columnOrder?: VocabularyColumnId[];
}): Promise<{ success: boolean; error?: string }> {
  const user = await getCachedUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (input.columnOrder && !isValidColumnOrder(input.columnOrder)) {
    return { success: false, error: "Invalid column order." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_vocabulary_prefs").upsert(
    {
      user_id: user.id,
      ...(input.translationLanguage
        ? { translation_language: input.translationLanguage }
        : {}),
      ...(input.columnOrder ? { column_order: input.columnOrder } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save vocabulary prefs:", error);
    return { success: false, error: "Failed to save." };
  }

  return { success: true };
}
