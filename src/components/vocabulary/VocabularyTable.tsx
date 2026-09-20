"use client";

import { Check, ChevronDown, GripVertical, Pencil, Star } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  saveVocabularyPrefs,
  saveWordNote,
  setWordStarred,
} from "@/app/dashboard/vocabulary/actions";
import type {
  TranslationLanguage,
  VocabularyColumnId,
  VocabularyUserState,
  VocabularyWord,
} from "@/types/vocabulary";

const LANGUAGES: TranslationLanguage[] = ["AZE", "RUS"];
const NOTE_SAVE_DELAY_MS = 700;

const COLUMN_LABEL: Record<VocabularyColumnId, string> = {
  star: "",
  no: "No.",
  word: "Word",
  definition: "Defn.",
  notes: "Notes",
  translation: "",
};

const COLUMN_CLASS: Record<VocabularyColumnId, string> = {
  star: "vocab-col-star",
  no: "vocab-col-no",
  word: "vocab-col-word",
  definition: "vocab-col-defn",
  notes: "vocab-col-notes",
  translation: "vocab-col-translation",
};

export function VocabularyTable({
  words,
  initialState,
}: {
  words: VocabularyWord[];
  initialState: VocabularyUserState;
}) {
  const [starred, setStarred] = useState(initialState.starred);
  const [notes, setNotes] = useState(initialState.notes);
  const [translationLanguage, setTranslationLanguage] = useState(
    initialState.translationLanguage
  );
  const [columnOrder, setColumnOrder] = useState(initialState.columnOrder);
  const [starFilterOn, setStarFilterOn] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [dragColumn, setDragColumn] = useState<VocabularyColumnId | null>(
    null
  );
  const [dragOverColumn, setDragOverColumn] =
    useState<VocabularyColumnId | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!langMenuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [langMenuOpen]);

  useEffect(() => {
    return () => {
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    };
  }, []);

  const toggleStar = (wordId: string) => {
    setStarred((prev) => {
      const next = { ...prev, [wordId]: !prev[wordId] };
      void setWordStarred(wordId, Boolean(next[wordId]));
      return next;
    });
  };

  const chooseLanguage = (lang: TranslationLanguage) => {
    setLangMenuOpen(false);
    if (lang === translationLanguage) return;
    setTranslationLanguage(lang);
    void saveVocabularyPrefs({ translationLanguage: lang });
  };

  const openNoteEditor = (wordId: string) => {
    setEditingWordId(wordId);
    setDraftNote(notes[wordId] ?? "");
  };

  const flushNoteSave = (wordId: string, value: string) => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    void saveWordNote(wordId, value);
  };

  const onDraftNoteChange = (
    wordId: string,
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setDraftNote(value);
    setNotes((prev) => ({ ...prev, [wordId]: value }));

    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      void saveWordNote(wordId, value);
    }, NOTE_SAVE_DELAY_MS);
  };

  const closeNoteEditor = (wordId: string) => {
    flushNoteSave(wordId, draftNote);
    setEditingWordId(null);
  };

  const reorderColumns = (from: VocabularyColumnId, to: VocabularyColumnId) => {
    if (from === to) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(from);
      const toIndex = next.indexOf(to);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, from);
      void saveVocabularyPrefs({ columnOrder: next });
      return next;
    });
  };

  const onHeaderDragStart = (colId: VocabularyColumnId) => (
    event: DragEvent<HTMLTableCellElement>
  ) => {
    setDragColumn(colId);
    event.dataTransfer.effectAllowed = "move";
  };

  const onHeaderDragOver = (colId: VocabularyColumnId) => (
    event: DragEvent<HTMLTableCellElement>
  ) => {
    event.preventDefault();
    if (colId !== dragOverColumn) setDragOverColumn(colId);
  };

  const onHeaderDrop = (colId: VocabularyColumnId) => (
    event: DragEvent<HTMLTableCellElement>
  ) => {
    event.preventDefault();
    if (dragColumn) reorderColumns(dragColumn, colId);
    setDragColumn(null);
    setDragOverColumn(null);
  };

  const onHeaderDragEnd = () => {
    setDragColumn(null);
    setDragOverColumn(null);
  };

  const visibleWords = useMemo(
    () => (starFilterOn ? words.filter((word) => starred[word.id]) : words),
    [words, starred, starFilterOn]
  );

  const renderHeaderContent = (colId: VocabularyColumnId) => {
    if (colId === "star") {
      return (
        <button
          type="button"
          className={`vocab-star-filter${starFilterOn ? " is-active" : ""}`}
          onClick={() => setStarFilterOn((value) => !value)}
          aria-pressed={starFilterOn}
          title={starFilterOn ? "Show all words" : "Show starred words only"}
        >
          <Star className="h-4 w-4" aria-hidden />
        </button>
      );
    }

    if (colId === "translation") {
      return (
        <div className="vocab-lang-switch" ref={langMenuRef}>
          <button
            type="button"
            className="vocab-lang-trigger"
            onClick={() => setLangMenuOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={langMenuOpen}
          >
            {translationLanguage}
            <ChevronDown
              className={`h-3.5 w-3.5 transition ${langMenuOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {langMenuOpen ? (
            <ul className="vocab-lang-menu" role="listbox">
              {LANGUAGES.map((lang) => {
                const active = lang === translationLanguage;
                return (
                  <li key={lang} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={`vocab-lang-option${active ? " is-active" : ""}`}
                      onClick={() => chooseLanguage(lang)}
                    >
                      <span>{lang}</span>
                      {active ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      );
    }

    return <span>{COLUMN_LABEL[colId]}</span>;
  };

  const renderBodyCell = (word: VocabularyWord, index: number, colId: VocabularyColumnId) => {
    switch (colId) {
      case "star": {
        const isStarred = Boolean(starred[word.id]);
        return (
          <button
            type="button"
            className={`vocab-star-toggle${isStarred ? " is-starred" : ""}`}
            onClick={() => toggleStar(word.id)}
            aria-pressed={isStarred}
            aria-label={isStarred ? `Unsave ${word.word}` : `Save ${word.word}`}
          >
            <Star className="h-4 w-4" aria-hidden />
          </button>
        );
      }
      case "no":
        return <span className="vocab-no">{index + 1}</span>;
      case "word":
        return <span className="vocab-word">{word.word}</span>;
      case "definition":
        return <span className="vocab-defn">{word.definition}</span>;
      case "notes": {
        const isEditing = editingWordId === word.id;
        const value = notes[word.id] ?? "";

        if (isEditing) {
          return (
            <textarea
              autoFocus
              className="vocab-note-input"
              rows={1}
              value={draftNote}
              onChange={(event) => onDraftNoteChange(word.id, event)}
              onBlur={() => closeNoteEditor(word.id)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.blur();
                }
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
              placeholder="Add a note…"
            />
          );
        }

        return (
          <button
            type="button"
            className="vocab-note-cell"
            onClick={() => openNoteEditor(word.id)}
          >
            {value ? (
              <span className="vocab-note-text">{value}</span>
            ) : (
              <Pencil className="vocab-note-hint h-3.5 w-3.5" aria-hidden />
            )}
          </button>
        );
      }
      case "translation":
        return (
          <span className="vocab-translation">
            {word.translations[translationLanguage]}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="vocab-table-scroll">
      <table className="vocab-table">
        <thead>
          <tr>
            {columnOrder.map((colId) => (
              <th
                key={colId}
                scope="col"
                className={`${COLUMN_CLASS[colId]}${
                  dragOverColumn === colId ? " is-drag-over" : ""
                }${dragColumn === colId ? " is-dragging" : ""}`}
                draggable
                onDragStart={onHeaderDragStart(colId)}
                onDragOver={onHeaderDragOver(colId)}
                onDrop={onHeaderDrop(colId)}
                onDragEnd={onHeaderDragEnd}
              >
                <span className="vocab-th-inner">
                  <GripVertical
                    className="vocab-drag-handle h-3.5 w-3.5"
                    aria-hidden
                  />
                  {renderHeaderContent(colId)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleWords.map((word, index) => (
            <tr key={word.id}>
              {columnOrder.map((colId) => (
                <td key={colId} className={COLUMN_CLASS[colId]}>
                  {renderBodyCell(word, index, colId)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {visibleWords.length === 0 ? (
        <p className="vocab-empty-filter">
          No starred words yet. Star a few to see them here.
        </p>
      ) : null}
    </div>
  );
}
