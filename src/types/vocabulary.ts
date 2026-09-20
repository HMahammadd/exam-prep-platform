export type TranslationLanguage = "AZE" | "RUS";

export type VocabularyWord = {
  id: string;
  word: string;
  definition: string;
  translations: Record<TranslationLanguage, string>;
};

export type VocabularyColumnId =
  | "star"
  | "no"
  | "word"
  | "definition"
  | "notes"
  | "translation";

export const DEFAULT_VOCABULARY_COLUMN_ORDER: VocabularyColumnId[] = [
  "star",
  "no",
  "word",
  "definition",
  "notes",
  "translation",
];

export function isVocabularyColumnId(
  value: string
): value is VocabularyColumnId {
  return (DEFAULT_VOCABULARY_COLUMN_ORDER as string[]).includes(value);
}

/** DB row shape — mirrors `user_vocabulary_words`. */
export type UserVocabularyWordRow = {
  word_id: string;
  starred: boolean;
  notes: string | null;
};

/** DB row shape — mirrors `user_vocabulary_prefs`. */
export type UserVocabularyPrefsRow = {
  translation_language: TranslationLanguage;
  column_order: string[] | null;
};

/** Client-facing per-user vocabulary state, keyed by word id. */
export type VocabularyUserState = {
  starred: Record<string, boolean>;
  notes: Record<string, string>;
  translationLanguage: TranslationLanguage;
  columnOrder: VocabularyColumnId[];
};

export function mapVocabularyUserState(
  wordRows: UserVocabularyWordRow[],
  prefsRow: UserVocabularyPrefsRow | null
): VocabularyUserState {
  const starred: Record<string, boolean> = {};
  const notes: Record<string, string> = {};

  for (const row of wordRows) {
    if (row.starred) starred[row.word_id] = true;
    if (row.notes) notes[row.word_id] = row.notes;
  }

  const storedOrder = prefsRow?.column_order?.filter(isVocabularyColumnId);
  const columnOrder =
    storedOrder && storedOrder.length === DEFAULT_VOCABULARY_COLUMN_ORDER.length
      ? storedOrder
      : DEFAULT_VOCABULARY_COLUMN_ORDER;

  return {
    starred,
    notes,
    translationLanguage: prefsRow?.translation_language ?? "AZE",
    columnOrder,
  };
}
