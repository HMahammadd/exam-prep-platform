"use server";

import { createClient } from "@/lib/supabaseServer";
import { getCachedUser } from "@/lib/cached-auth";
import {
  DEFAULT_VOCABULARY_COLUMN_ORDER,
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

  const supabase = await createClient();
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

  const supabase = await createClient();
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
