"use client";

import { Check, ChevronDown, GripVertical, Pencil, Star } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
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
const SAVE_FAILED = "Couldn't save to your account — changes may not stick.";

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

/**
 * One template, shared by the header row and every body row, so columns can
 * never drift apart. Reordering re-serialises it in the new order.
 */
const COLUMN_TEMPLATE: Record<VocabularyColumnId, string> = {
  star: "56px",
  no: "70px",
  word: "170px",
  definition: "minmax(300px, 1.4fr)",
  notes: "minmax(220px, 1fr)",
  translation: "minmax(250px, 1fr)",
};

/** Star and No. stay pinned — keeping them fixed reads better than free reorder. */
const FIXED_COLUMNS: VocabularyColumnId[] = ["star", "no"];

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
  const [saveError, setSaveError] = useState<string | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The drop handler must read the drag source synchronously — a state value
  // would still be the pre-render one if both events land in the same tick.
  const dragColumnRef = useRef<VocabularyColumnId | null>(null);

  const noteInputRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * Sizes the note editor to its own content. A textarea never shrinks on its
   * own, so the height is cleared first and `scrollHeight` then reports what
   * the text actually needs. Borders are outside `scrollHeight` but inside the
   * border-box height being set, so they are added back — otherwise the box
   * lands two pixels short and a scrollbar flickers in at every line break.
   */
  const fitNoteInput = (input: HTMLTextAreaElement | null) => {
    if (!input) return;
    input.style.height = "auto";
    const borders = input.offsetHeight - input.clientHeight;
    input.style.height = `${input.scrollHeight + borders}px`;
  };

  // Fits on mount, so an already-long note opens at full height rather than
  // one row. Typing is handled in onDraftNoteChange, which is also what makes
  // it shrink back down when text is deleted.
  const attachNoteInput = (input: HTMLTextAreaElement | null) => {
    noteInputRef.current = input;
    fitNoteInput(input);
  };

  // A height measured at one width is wrong at another, and the notes column
  // is sized by its own contents — so a note long enough to widen the column
  // changes the very width its height was just measured against. Same story
  // when the window resizes or the rail collapses mid-edit. Width-only, since
  // reacting to our own height write would just re-measure what we set.
  useEffect(() => {
    const input = noteInputRef.current;
    if (!input) return;

    let lastWidth = input.clientWidth;
    const observer = new ResizeObserver(() => {
      if (input.clientWidth === lastWidth) return;
      lastWidth = input.clientWidth;
      fitNoteInput(input);
    });

    observer.observe(input);
    return () => observer.disconnect();
  }, [editingWordId]);

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

  const toggleStar = async (wordId: string) => {
    const next = !starred[wordId];
    setStarred((prev) => ({ ...prev, [wordId]: next }));

    const result = await setWordStarred(wordId, next);
    if (result.success) {
      setSaveError(null);
      return;
    }

    // A star's whole meaning is "this is saved", so put it back rather than
    // leaving the row claiming a write that never landed. Skip the revert if
    // the student has toggled it again in the meantime.
    setStarred((prev) =>
      prev[wordId] === next ? { ...prev, [wordId]: !next } : prev
    );
    setSaveError(result.error ?? SAVE_FAILED);
  };

  // Notes and preferences keep the student's local change even when the write
  // fails — the value is still useful for this session — but they say so
  // instead of pretending it persisted.
  const chooseLanguage = async (lang: TranslationLanguage) => {
    setLangMenuOpen(false);
    if (lang === translationLanguage) return;
    setTranslationLanguage(lang);

    const result = await saveVocabularyPrefs({ translationLanguage: lang });
    setSaveError(result.success ? null : result.error ?? SAVE_FAILED);
  };

  const openNoteEditor = (wordId: string) => {
    setEditingWordId(wordId);
    setDraftNote(notes[wordId] ?? "");
  };

  const persistNote = async (wordId: string, value: string) => {
    const result = await saveWordNote(wordId, value);
    setSaveError(result.success ? null : result.error ?? SAVE_FAILED);
  };

  const flushNoteSave = (wordId: string, value: string) => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    void persistNote(wordId, value);
  };

  const onDraftNoteChange = (
    wordId: string,
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    fitNoteInput(event.currentTarget);
    setDraftNote(value);
    setNotes((prev) => ({ ...prev, [wordId]: value }));

    // One write per pause in typing, not one per keystroke. Closing the editor
    // (onBlur) flushes whatever is still pending.
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      void persistNote(wordId, value);
    }, NOTE_SAVE_DELAY_MS);
  };

  const closeNoteEditor = (wordId: string) => {
    flushNoteSave(wordId, draftNote);
    setEditingWordId(null);
  };

  const reorderColumns = async (
    from: VocabularyColumnId,
    to: VocabularyColumnId
  ) => {
    if (from === to) return;

    const next = [...columnOrder];
    const fromIndex = next.indexOf(from);
    const toIndex = next.indexOf(to);
    if (fromIndex === -1 || toIndex === -1) return;
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, from);

    setColumnOrder(next);

    const result = await saveVocabularyPrefs({ columnOrder: next });
    setSaveError(result.success ? null : result.error ?? SAVE_FAILED);
  };

  const onHeaderDragStart = (colId: VocabularyColumnId) => (
    event: DragEvent<HTMLTableCellElement>
  ) => {
    dragColumnRef.current = colId;
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
    const source = dragColumnRef.current;
    if (source) void reorderColumns(source, colId);
    dragColumnRef.current = null;
    setDragColumn(null);
    setDragOverColumn(null);
  };

  const onHeaderDragEnd = () => {
    dragColumnRef.current = null;
    setDragColumn(null);
    setDragOverColumn(null);
  };

  const visibleWords = useMemo(
    () => (starFilterOn ? words.filter((word) => starred[word.id]) : words),
    [words, starred, starFilterOn]
  );

  const gridTemplate = useMemo(
    () => columnOrder.map((colId) => COLUMN_TEMPLATE[colId]).join(" "),
    [columnOrder]
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
                      onClick={() => void chooseLanguage(lang)}
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
            onClick={() => void toggleStar(word.id)}
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
              ref={attachNoteInput}
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
            aria-label={value ? `Edit note for ${word.word}` : `Add note for ${word.word}`}
          >
            {value ? (
              <span className="vocab-note-text">{value}</span>
            ) : (
              <span className="vocab-note-hint">
                Add note
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </span>
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
      {saveError ? (
        <p
          role="status"
          className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
        >
          {saveError}
        </p>
      ) : null}

      <table
        className="vocab-table"
        style={{ "--vocab-cols": gridTemplate } as CSSProperties}
      >
        <thead>
          <tr>
            {columnOrder.map((colId) => {
              const reorderable = !FIXED_COLUMNS.includes(colId);
              return (
                <th
                  key={colId}
                  scope="col"
                  className={`${COLUMN_CLASS[colId]}${
                    reorderable ? " is-reorderable" : ""
                  }${dragOverColumn === colId ? " is-drag-over" : ""}${
                    dragColumn === colId ? " is-dragging" : ""
                  }`}
                  draggable={reorderable}
                  onDragStart={reorderable ? onHeaderDragStart(colId) : undefined}
                  onDragOver={reorderable ? onHeaderDragOver(colId) : undefined}
                  onDrop={reorderable ? onHeaderDrop(colId) : undefined}
                  onDragEnd={reorderable ? onHeaderDragEnd : undefined}
                >
                  {renderHeaderContent(colId)}
                  {reorderable ? (
                    <GripVertical
                      className="vocab-drag-handle h-3.5 w-3.5"
                      aria-hidden
                    />
                  ) : null}
                </th>
              );
            })}
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
