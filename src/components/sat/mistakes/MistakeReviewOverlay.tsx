"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Highlighter,
  Maximize2,
  Minimize2,
  MessageCircle,
  StickyNote,
  Type,
  X,
  XCircle,
} from "lucide-react";
import { setWordStarred } from "@/app/dashboard/(shell)/vocabulary/actions";
import { DimMathContent } from "@/components/dim/DimMathContent";
import { SatPassage } from "@/components/sat/SatPassage";
import { VOCABULARY_WORDS } from "@/lib/vocabulary-words";
import {
  MISTAKE_REASON_LABELS,
  MISTAKE_SUBJECT_LABELS,
  mistakeKey,
  type MistakeItem,
  type MistakeReason,
} from "@/types/mistake-review";
import type { SatChoiceLabel } from "@/types/sat-exam";

const FOCUSABLE =
  'a[href], button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const TEXT_SIZES = ["sm", "base", "lg"] as const;
type TextSize = (typeof TEXT_SIZES)[number];
const TEXT_SIZE_PX: Record<TextSize, string> = {
  sm: "15px",
  base: "17px",
  lg: "19px",
};

const REASON_OPTIONS = Object.keys(MISTAKE_REASON_LABELS) as MistakeReason[];

function extractHighlightTerm(questionText: string): string | undefined {
  const match = questionText.match(/"([^"]{2,40})"/);
  return match?.[1];
}

type RetryPhase = "idle" | "retrying" | "checked";

type RetryState = {
  phase: RetryPhase;
  draft: SatChoiceLabel | null;
  isCorrect: boolean | null;
};

const IDLE_RETRY: RetryState = { phase: "idle", draft: null, isCorrect: null };

export function MistakeReviewOverlay({
  queue,
  activeItem,
  isOpen,
  isScopedToSelection,
  timed,
  onClose,
  onNavigate,
  onFirstOpen,
  onRetry,
  onMastered,
  onSaveReason,
  onSaveNote,
}: {
  queue: MistakeItem[];
  activeItem: MistakeItem | null;
  isOpen: boolean;
  isScopedToSelection: boolean;
  timed: boolean;
  onClose: () => void;
  onNavigate: (item: MistakeItem) => void;
  onFirstOpen: (item: MistakeItem) => void;
  onRetry: (
    item: MistakeItem,
    selected: SatChoiceLabel
  ) => Promise<{ success: boolean; isCorrect?: boolean }>;
  onMastered: (item: MistakeItem) => void;
  onSaveReason: (item: MistakeItem, reason: MistakeReason) => void;
  onSaveNote: (item: MistakeItem, note: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const passageRef = useRef<HTMLDivElement>(null);

  // Portal target isn't available during SSR; render nothing until mounted.
  const [mounted, setMounted] = useState(false);
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setMounted(true), []);

  const [expanded, setExpanded] = useState(false);
  const [textSizeIndex, setTextSizeIndex] = useState(1);
  const [highlightOn, setHighlightOn] = useState(true);
  const [explanationOpen, setExplanationOpen] = useState<Record<string, boolean>>({});
  const [reflectionOpen, setReflectionOpen] = useState<Record<string, boolean>>({});
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [retryStates, setRetryStates] = useState<Record<string, RetryState>>({});
  const [selectionPopover, setSelectionPopover] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const [saveWordMessage, setSaveWordMessage] = useState<string | null>(null);

  const activeKey = activeItem ? mistakeKey(activeItem.attemptId, activeItem.question.id) : null;
  const retryState = activeKey ? retryStates[activeKey] ?? IDLE_RETRY : IDLE_RETRY;

  const index = activeItem
    ? queue.findIndex(
        (item) =>
          item.attemptId === activeItem.attemptId &&
          item.question.id === activeItem.question.id
      )
    : -1;
  const previousItem = index > 0 ? queue[index - 1] : null;
  const nextItem = index >= 0 && index < queue.length - 1 ? queue[index + 1] : null;

  const isUnsafeToClose = useCallback(() => {
    if (!activeItem || !activeKey) return false;
    const unsavedRetry = retryState.phase === "retrying" && retryState.draft != null;
    const draftNote = noteDraft[activeKey];
    const unsavedNote =
      noteOpen[activeKey] === true &&
      draftNote != null &&
      draftNote !== (activeItem.note ?? "");
    return unsavedRetry || unsavedNote;
  }, [activeItem, activeKey, retryState, noteDraft, noteOpen]);

  // Mark reviewed on first open of a given question.
  useEffect(() => {
    if (isOpen && activeItem) {
      onFirstOpen(activeItem);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeItem?.attemptId, activeItem?.question.id]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!isOpen) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [isOpen]);

  // Focus in, trap, escape-to-close (guarded).
  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isUnsafeToClose()) return;
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isUnsafeToClose, onClose]);

  // Selection -> "Save word" popover, scoped to the passage column.
  useEffect(() => {
    if (!isOpen) return;

    function handleSelectionChange() {
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode ?? null;
      if (
        !selection ||
        selection.isCollapsed ||
        !anchorNode ||
        !passageRef.current?.contains(anchorNode)
      ) {
        setSelectionPopover(null);
        return;
      }

      const text = selection.toString().trim();
      if (!text || text.length > 60 || /\s/.test(text)) {
        // Single word/phrase only — long multi-line selections don't get a save action.
        if (text.split(/\s+/).length > 4 || !text) {
          setSelectionPopover(null);
          return;
        }
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      if (!panelRect || rect.width === 0) {
        setSelectionPopover(null);
        return;
      }

      setSelectionPopover({
        text,
        x: rect.left + rect.width / 2 - panelRect.left,
        y: rect.top - panelRect.top,
      });
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isOpen]);

  async function handleSaveWord() {
    if (!selectionPopover) return;
    const normalized = selectionPopover.text.toLowerCase().replace(/[^a-z']/g, "");
    const match = VOCABULARY_WORDS.find(
      (word) => word.id === normalized || word.word.toLowerCase() === normalized
    );

    if (match) {
      const result = await setWordStarred(match.id, true);
      setSaveWordMessage(
        result.success ? `Saved "${match.word}" to your words.` : "Couldn't save — try again."
      );
    } else {
      setSaveWordMessage("Not in your word list yet.");
    }

    setSelectionPopover(null);
    window.getSelection()?.removeAllRanges();
    window.setTimeout(() => setSaveWordMessage(null), 2600);
  }

  function go(item: MistakeItem | null) {
    if (!item) return;
    onNavigate(item);
  }

  function startRetry() {
    if (!activeKey) return;
    setRetryStates((prev) => ({
      ...prev,
      [activeKey]: { phase: "retrying", draft: null, isCorrect: null },
    }));
    setExplanationOpen((prev) => ({ ...prev, [activeKey]: false }));
  }

  function pickRetryChoice(label: SatChoiceLabel) {
    if (!activeKey) return;
    setRetryStates((prev) => ({
      ...prev,
      [activeKey]: { ...(prev[activeKey] ?? IDLE_RETRY), phase: "retrying", draft: label },
    }));
  }

  async function checkAnswer() {
    if (!activeKey || !activeItem || retryState.draft == null) return;
    const result = await onRetry(activeItem, retryState.draft);
    setRetryStates((prev) => ({
      ...prev,
      [activeKey]: {
        phase: "checked",
        draft: retryState.draft,
        isCorrect: result.isCorrect ?? null,
      },
    }));
  }

  function toggleExplanation() {
    if (!activeKey) return;
    setExplanationOpen((prev) => ({ ...prev, [activeKey]: !prev[activeKey] }));
  }

  function toggleReflection() {
    if (!activeKey) return;
    setReflectionOpen((prev) => ({ ...prev, [activeKey]: !prev[activeKey] }));
  }

  function toggleNote() {
    if (!activeKey || !activeItem) return;
    setNoteOpen((prev) => ({ ...prev, [activeKey]: !prev[activeKey] }));
    setNoteDraft((prev) => ({ ...prev, [activeKey]: prev[activeKey] ?? activeItem.note ?? "" }));
  }

  function saveNote() {
    if (!activeKey || !activeItem) return;
    onSaveNote(activeItem, noteDraft[activeKey] ?? "");
    setNoteOpen((prev) => ({ ...prev, [activeKey]: false }));
  }

  function handlePanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return;
    // Handled globally too, but stop bubbling so nested selects don't double-fire.
    event.stopPropagation();
  }

  const highlightTerm = useMemo(
    () => (activeItem ? extractHighlightTerm(activeItem.question.questionText) : undefined),
    [activeItem]
  );

  const isMath = activeItem?.subject === "math";
  const subject = activeItem ? MISTAKE_SUBJECT_LABELS[activeItem.subject] : "";

  if (!mounted) return null;

  // Portaled to <body> so this floats above the shell's own sticky topbar
  // (which has its own z-index-30 stacking context) instead of being
  // trapped inside .sat-content's stacking context.
  return createPortal(
    <>
      <div
        className={`mistake-overlay-backdrop${isOpen ? " is-open" : ""}`}
        aria-hidden
        onClick={() => {
          if (!isUnsafeToClose()) onClose();
        }}
      />

      <div
        ref={panelRef}
        className={`mistake-overlay-panel${isOpen ? " is-open" : ""}${
          expanded ? " is-expanded" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mistake-overlay-title"
        aria-hidden={!isOpen}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
      >
        {activeItem ? (
          <>
            <header className="mistake-overlay-header">
              <div className="mistake-overlay-heading">
                <h2 id="mistake-overlay-title">
                  Q{activeItem.displayNumber} · {subject}
                </h2>
                <p>
                  {activeItem.examName} · {subject}
                  {timed ? (
                    <span className="mistake-overlay-timer">
                      <Clock className="h-3 w-3" aria-hidden /> Timed
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="mistake-overlay-controls">
                <span className="mistake-overlay-position">
                  {index + 1} of {queue.length} {isScopedToSelection ? "selected" : "mistakes"}
                </span>
                <button
                  type="button"
                  className="mistake-icon-btn"
                  onClick={() => go(previousItem)}
                  disabled={!previousItem}
                  aria-label="Previous question"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="mistake-icon-btn"
                  onClick={() => go(nextItem)}
                  disabled={!nextItem}
                  aria-label="Next question"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="mistake-icon-btn"
                  onClick={() => setExpanded((value) => !value)}
                  aria-label={expanded ? "Collapse to panel" : "Expand to full screen"}
                >
                  {expanded ? (
                    <Minimize2 className="h-4 w-4" aria-hidden />
                  ) : (
                    <Maximize2 className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  className="mistake-icon-btn"
                  onClick={() => {
                    if (!isUnsafeToClose()) onClose();
                  }}
                  aria-label="Close question review"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </header>

            <div
              key={activeKey}
              className={`mistake-overlay-body${isMath ? " is-math" : ""}`}
            >
              <div className="mistake-overlay-pane mistake-overlay-passage" ref={passageRef}>
                {isMath ? (
                  <>
                    <p className="mistake-pane-label">Problem</p>
                    <div
                      className="mistake-math-problem"
                      style={{ fontSize: TEXT_SIZE_PX[TEXT_SIZES[textSizeIndex]] }}
                    >
                      <DimMathContent text={activeItem.question.questionText} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mistake-pane-toolbar">
                      <p className="mistake-pane-label">Passage</p>
                      <div className="mistake-pane-tools">
                        <button
                          type="button"
                          className="mistake-tool-btn"
                          onClick={() =>
                            setTextSizeIndex((value) => (value + 1) % TEXT_SIZES.length)
                          }
                        >
                          <Type className="h-3.5 w-3.5" aria-hidden />
                          Text size
                        </button>
                        <button
                          type="button"
                          className={`mistake-tool-btn${highlightOn ? " is-active" : ""}`}
                          onClick={() => setHighlightOn((value) => !value)}
                          aria-pressed={highlightOn}
                        >
                          <Highlighter className="h-3.5 w-3.5" aria-hidden />
                          Highlight
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: TEXT_SIZE_PX[TEXT_SIZES[textSizeIndex]],
                        position: "relative",
                      }}
                    >
                      <SatPassage
                        passage={activeItem.question.passage}
                        variant="mistake"
                        highlightTerm={highlightOn ? highlightTerm : undefined}
                      />
                      {selectionPopover ? (
                        <button
                          type="button"
                          className="mistake-save-word-btn"
                          style={{ left: selectionPopover.x, top: selectionPopover.y }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={handleSaveWord}
                        >
                          <Bookmark className="h-3.5 w-3.5" aria-hidden />
                          Save word
                        </button>
                      ) : null}
                      {saveWordMessage ? (
                        <p className="mistake-save-word-toast" role="status">
                          {saveWordMessage}
                        </p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>

              <div className="mistake-overlay-pane mistake-overlay-question">
                <p className="mistake-pane-label">Question</p>
                <div className="mistake-question-text">
                  <DimMathContent text={activeItem.question.questionText} />
                </div>

                <div className="mistake-choices">
                  {activeItem.question.choices.map((choice) => (
                    <AnswerChoiceRow
                      key={choice.label}
                      label={choice.label}
                      text={choice.text}
                      retryPhase={retryState.phase}
                      retrySelected={retryState.draft === choice.label}
                      isSelectedAnswer={activeItem.selectedAnswer === choice.label}
                      isCorrectAnswer={activeItem.correctAnswer === choice.label}
                      onPick={() => pickRetryChoice(choice.label)}
                    />
                  ))}
                </div>

                {retryState.phase !== "retrying" ? (
                  <div className="mistake-result-line">
                    <span>
                      <span className="mistake-result-label-muted">Your answer: </span>
                      {activeItem.selectedAnswer ?? "— (not answered)"}
                    </span>
                    <span>
                      <span className="mistake-result-label-muted">Correct answer: </span>
                      {activeItem.correctAnswer}
                    </span>
                  </div>
                ) : null}

                <div className="mistake-disclosure">
                  <button
                    type="button"
                    className="mistake-disclosure-trigger"
                    onClick={toggleExplanation}
                    aria-expanded={explanationOpen[activeKey ?? ""] ?? false}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform${
                        explanationOpen[activeKey ?? ""] ? "" : " -rotate-90"
                      }`}
                      aria-hidden
                    />
                    Explanation
                  </button>
                  {explanationOpen[activeKey ?? ""] ? (
                    <div className="mistake-disclosure-body">
                      <DimMathContent text={activeItem.question.explanation} />
                    </div>
                  ) : null}
                </div>

                <div className="mistake-secondary-actions">
                  <button type="button" className="mistake-link-btn" onClick={toggleReflection}>
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    {activeItem.reason
                      ? `Reason: ${MISTAKE_REASON_LABELS[activeItem.reason]}`
                      : "Add reflection"}
                  </button>
                  <button type="button" className="mistake-link-btn" onClick={toggleNote}>
                    <StickyNote className="h-3.5 w-3.5" aria-hidden />
                    {activeItem.note ? "Edit note" : "Add note"}
                  </button>
                </div>

                {reflectionOpen[activeKey ?? ""] ? (
                  <div className="mistake-reason-picker" role="group" aria-label="Mistake reason">
                    {REASON_OPTIONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        className={`mistake-reason-chip${
                          activeItem.reason === reason ? " is-active" : ""
                        }`}
                        onClick={() => {
                          onSaveReason(activeItem, reason);
                          setReflectionOpen((prev) => ({ ...prev, [activeKey ?? ""]: false }));
                        }}
                      >
                        {MISTAKE_REASON_LABELS[reason]}
                      </button>
                    ))}
                  </div>
                ) : null}

                {noteOpen[activeKey ?? ""] ? (
                  <div className="mistake-note-editor">
                    <textarea
                      value={noteDraft[activeKey ?? ""] ?? ""}
                      onChange={(event) =>
                        setNoteDraft((prev) => ({
                          ...prev,
                          [activeKey ?? ""]: event.target.value,
                        }))
                      }
                      placeholder="What will help you remember this next time?"
                      rows={3}
                    />
                    <div className="mistake-note-actions">
                      <button
                        type="button"
                        className="mistake-btn-ghost"
                        onClick={() =>
                          setNoteOpen((prev) => ({ ...prev, [activeKey ?? ""]: false }))
                        }
                      >
                        Cancel
                      </button>
                      <button type="button" className="mistake-btn-primary-sm" onClick={saveNote}>
                        Save note
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="mistake-overlay-footer">
              <button type="button" className="mistake-btn-ghost" onClick={onClose}>
                Back to mistakes
              </button>

              <div className="mistake-footer-actions">
                <button
                  type="button"
                  className="mistake-btn-ghost"
                  onClick={() => go(nextItem)}
                  disabled={!nextItem}
                >
                  Next question
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>

                {retryState.phase === "checked" && retryState.isCorrect ? (
                  <button
                    type="button"
                    className="mistake-btn-secondary"
                    onClick={() => activeItem && onMastered(activeItem)}
                  >
                    <Award className="h-4 w-4" aria-hidden />
                    Mark as mastered
                  </button>
                ) : null}

                {retryState.phase === "retrying" ? (
                  <button
                    type="button"
                    className="mistake-btn-primary"
                    onClick={checkAnswer}
                    disabled={retryState.draft == null}
                  >
                    Check answer
                  </button>
                ) : (
                  <button type="button" className="mistake-btn-primary" onClick={startRetry}>
                    Retry question
                  </button>
                )}
              </div>
            </footer>
          </>
        ) : null}
      </div>
    </>,
    document.body
  );
}

function AnswerChoiceRow({
  label,
  text,
  retryPhase,
  retrySelected,
  isSelectedAnswer,
  isCorrectAnswer,
  onPick,
}: {
  label: SatChoiceLabel;
  text: string;
  retryPhase: RetryPhase;
  retrySelected: boolean;
  isSelectedAnswer: boolean;
  isCorrectAnswer: boolean;
  onPick: () => void;
}) {
  if (retryPhase === "retrying") {
    return (
      <button
        type="button"
        role="radio"
        aria-checked={retrySelected}
        className={`mistake-choice is-interactive${retrySelected ? " is-picked" : ""}`}
        onClick={onPick}
      >
        <span className="mistake-choice-letter">{label}</span>
        <span className="mistake-choice-text">{text}</span>
      </button>
    );
  }

  if (retryPhase === "checked") {
    const showCorrect = isCorrectAnswer;
    const showWrong = retrySelected && !isCorrectAnswer;
    return (
      <div
        className={`mistake-choice${showCorrect ? " is-correct" : ""}${
          showWrong ? " is-wrong" : ""
        }`}
      >
        <span className="mistake-choice-letter">{label}</span>
        <span className="mistake-choice-text">{text}</span>
        {showCorrect ? (
          <span className="mistake-choice-badge is-correct">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Correct answer
          </span>
        ) : null}
        {showWrong ? (
          <span className="mistake-choice-badge is-wrong">
            <XCircle className="h-3.5 w-3.5" aria-hidden /> Your answer
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`mistake-choice${isCorrectAnswer ? " is-correct" : ""}${
        isSelectedAnswer && !isCorrectAnswer ? " is-wrong" : ""
      }`}
    >
      <span className="mistake-choice-letter">{label}</span>
      <span className="mistake-choice-text">{text}</span>
      {isCorrectAnswer ? (
        <span className="mistake-choice-badge is-correct">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Correct answer
        </span>
      ) : null}
      {isSelectedAnswer && !isCorrectAnswer ? (
        <span className="mistake-choice-badge is-wrong">
          <XCircle className="h-3.5 w-3.5" aria-hidden /> Your answer
        </span>
      ) : null}
    </div>
  );
}
