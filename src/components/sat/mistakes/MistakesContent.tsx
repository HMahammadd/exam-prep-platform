"use client";

import { useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  ListFilter,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { MistakeReviewOverlay } from "@/components/sat/mistakes/MistakeReviewOverlay";
import {
  markMistakeMastered,
  markMistakeReviewed,
  saveMistakeNote,
  saveMistakeReason,
  submitMistakeRetry,
} from "@/app/dashboard/(shell)/sat/mistakes-actions";
import {
  buildReviewQueue,
  computeNeedsAttention,
  computeRecoveryStats,
  sortByCompletedAt,
  type ReviewMode,
} from "@/lib/mistake-review";
import {
  MISTAKE_REASON_LABELS,
  MISTAKE_SUBJECT_LABELS,
  mistakeKey,
  type MistakeItem,
  type MistakeReason,
  type MistakeStatus,
  type MistakeSubject,
} from "@/types/mistake-review";
import type { SatChoiceLabel } from "@/types/sat-exam";

const STATUS_LABELS: Record<MistakeStatus, string> = {
  to_review: "To review",
  reviewed: "Reviewed",
  corrected: "Corrected",
  mastered: "Mastered",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type SubjectFilter = "all" | MistakeSubject;
type StatusFilter = "all" | MistakeStatus;
type ReasonFilter = "all" | MistakeReason;
type ExamFilter = "all" | number;
type SortDirection = "newest" | "oldest";

export function MistakesContent({
  initialItems,
}: {
  initialItems: MistakeItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>("all");
  const [examFilter, setExamFilter] = useState<ExamFilter>("all");
  const [sort, setSort] = useState<SortDirection>("newest");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [reviewMode, setReviewMode] = useState<ReviewMode>("adaptive");

  const [activeQueue, setActiveQueue] = useState<MistakeItem[] | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const keyOf = (item: MistakeItem) => mistakeKey(item.attemptId, item.question.id);

  function matchesNonSubjectFilters(item: MistakeItem): boolean {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (reasonFilter !== "all" && item.reason !== reasonFilter) return false;
    if (examFilter !== "all" && item.examId !== examFilter) return false;
    return true;
  }

  const subjectCounts = useMemo(() => {
    const base = items.filter(matchesNonSubjectFilters);
    return {
      all: base.length,
      math: base.filter((item) => item.subject === "math").length,
      verbal: base.filter((item) => item.subject === "verbal").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, statusFilter, reasonFilter, examFilter]);

  const filteredSorted = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        matchesNonSubjectFilters(item) &&
        (subjectFilter === "all" || item.subject === subjectFilter)
    );
    return sortByCompletedAt(filtered, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, subjectFilter, statusFilter, reasonFilter, examFilter, sort]);

  const examOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of items) map.set(item.examId, item.examName);
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  const recoveryStats = useMemo(() => computeRecoveryStats(items), [items]);
  const attentionGroups = useMemo(() => computeNeedsAttention(items), [items]);
  const nextReview = attentionGroups[0] ?? null;

  const currentQueue = activeQueue ?? filteredSorted;
  const activeItem =
    activeKey != null
      ? currentQueue.find((item) => keyOf(item) === activeKey) ?? null
      : null;

  function openItem(
    item: MistakeItem,
    queue: MistakeItem[] | null,
    trigger: HTMLElement
  ) {
    openerRef.current = trigger;
    setActiveQueue(queue);
    setActiveKey(keyOf(item));
  }

  function openRow(item: MistakeItem, event: React.MouseEvent<HTMLElement>) {
    openItem(item, null, event.currentTarget);
  }

  function openSelected(event: React.MouseEvent<HTMLElement>) {
    const queue = filteredSorted.filter((item) => selectedKeys.has(keyOf(item)));
    if (queue.length === 0) return;
    openItem(queue[0], queue, event.currentTarget);
  }

  function startSmartReview(event: React.MouseEvent<HTMLElement>) {
    const openItems = items.filter((item) => item.status !== "mastered");
    const pool = openItems.length > 0 ? openItems : items;
    const queue = buildReviewQueue(pool, reviewMode);
    if (queue.length === 0) return;
    openItem(queue[0], queue, event.currentTarget);
  }

  function chooseQuestions() {
    listRef.current?.querySelector<HTMLInputElement>("input[type=checkbox]")?.focus();
  }

  function closeOverlay() {
    setActiveKey(null);
    openerRef.current?.focus();
  }

  function navigateTo(item: MistakeItem) {
    setActiveKey(keyOf(item));
  }

  function patchItem(attemptId: string, questionId: string, patch: Partial<MistakeItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.attemptId === attemptId && item.question.id === questionId
          ? { ...item, ...patch }
          : item
      )
    );
  }

  async function handleFirstOpen(item: MistakeItem) {
    if (item.status !== "to_review") return;
    const result = await markMistakeReviewed(item.attemptId, item.question.id);
    if (result.success && result.status) {
      patchItem(item.attemptId, item.question.id, { status: result.status });
    }
  }

  async function handleRetry(item: MistakeItem, selected: SatChoiceLabel) {
    const result = await submitMistakeRetry(item.attemptId, item.question.id, selected);
    if (result.success) {
      patchItem(item.attemptId, item.question.id, {
        status: result.status ?? item.status,
        retrySelectedAnswer: selected,
        retryIsCorrect: result.isCorrect ?? null,
      });
    }
    return result;
  }

  async function handleMastered(item: MistakeItem) {
    const result = await markMistakeMastered(item.attemptId, item.question.id);
    if (result.success) {
      patchItem(item.attemptId, item.question.id, { status: "mastered" });
    }
  }

  async function handleReason(item: MistakeItem, reason: MistakeReason) {
    const result = await saveMistakeReason(item.attemptId, item.question.id, reason);
    if (result.success) {
      patchItem(item.attemptId, item.question.id, { reason });
    }
  }

  async function handleNote(item: MistakeItem, note: string) {
    const result = await saveMistakeNote(item.attemptId, item.question.id, note);
    if (result.success) {
      patchItem(item.attemptId, item.question.id, { note: note.trim() || null });
    }
  }

  function toggleSelected(item: MistakeItem) {
    const key = keyOf(item);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const allFilteredSelected =
    filteredSorted.length > 0 &&
    filteredSorted.every((item) => selectedKeys.has(keyOf(item)));

  function toggleSelectAll() {
    setSelectedKeys((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        for (const item of filteredSorted) next.delete(keyOf(item));
        return next;
      }
      const next = new Set(prev);
      for (const item of filteredSorted) next.add(keyOf(item));
      return next;
    });
  }

  return (
    <div className="mistakes-page space-y-6">
      <header className="mistakes-head">
        <p className="mistakes-eyebrow">Mistake recovery</p>
        <h2 className="mistakes-title">Mistakes</h2>
        <p className="mistakes-sub">
          Review what went wrong and turn weak areas into strengths.
        </p>
      </header>

      <section className="mistakes-stats" aria-label="Summary">
        <div className="mistakes-stat">
          <p className="mistakes-stat-value">{recoveryStats.total}</p>
          <p className="mistakes-stat-label">To review</p>
        </div>
        <div className="mistakes-stat">
          <p className="mistakes-stat-value">{recoveryStats.reviewed}</p>
          <p className="mistakes-stat-label">Reviewed</p>
        </div>
        <div className="mistakes-stat">
          <p className="mistakes-stat-value">{recoveryStats.mastered}</p>
          <p className="mistakes-stat-label">Mastered</p>
        </div>
      </section>

      <div className="mistakes-layout">
        <div className="mistakes-main">
          <div className="mistakes-filterbar">
            <div className="mistakes-chips" role="group" aria-label="Filter by subject">
              <button
                type="button"
                className={`mistakes-chip${subjectFilter === "all" ? " is-active" : ""}`}
                onClick={() => setSubjectFilter("all")}
              >
                All ({subjectCounts.all})
              </button>
              <button
                type="button"
                className={`mistakes-chip${subjectFilter === "math" ? " is-active" : ""}`}
                onClick={() => setSubjectFilter("math")}
              >
                Math ({subjectCounts.math})
              </button>
              <button
                type="button"
                className={`mistakes-chip${subjectFilter === "verbal" ? " is-active" : ""}`}
                onClick={() => setSubjectFilter("verbal")}
              >
                Reading &amp; Writing ({subjectCounts.verbal})
              </button>
            </div>

            <div className="mistakes-filters">
              <select
                className="mistakes-select"
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="all">Status</option>
                {(Object.keys(STATUS_LABELS) as MistakeStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>

              <select
                className="mistakes-select"
                aria-label="Filter by reason"
                value={reasonFilter}
                onChange={(event) => setReasonFilter(event.target.value as ReasonFilter)}
              >
                <option value="all">Reason</option>
                {(Object.keys(MISTAKE_REASON_LABELS) as MistakeReason[]).map((reason) => (
                  <option key={reason} value={reason}>
                    {MISTAKE_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>

              <select
                className="mistakes-select"
                aria-label="Filter by practice test"
                value={examFilter === "all" ? "all" : String(examFilter)}
                onChange={(event) =>
                  setExamFilter(
                    event.target.value === "all" ? "all" : Number(event.target.value)
                  )
                }
              >
                <option value="all">Practice test</option>
                {examOptions.map(([examId, examName]) => (
                  <option key={examId} value={examId}>
                    {examName}
                  </option>
                ))}
              </select>

              <select
                className="mistakes-select"
                aria-label="Sort order"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortDirection)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>

              {(statusFilter !== "all" ||
                reasonFilter !== "all" ||
                examFilter !== "all" ||
                subjectFilter !== "all") && (
                <button
                  type="button"
                  className="mistakes-clear"
                  onClick={() => {
                    setSubjectFilter("all");
                    setStatusFilter("all");
                    setReasonFilter("all");
                    setExamFilter("all");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="mistakes-select-row">
            <label className="mistakes-select-all">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                disabled={filteredSorted.length === 0}
              />
              Select all
            </label>
            {selectedKeys.size > 0 ? (
              <>
                <span className="mistakes-select-count">{selectedKeys.size} selected</span>
                <button type="button" className="mistake-btn-primary" onClick={openSelected}>
                  Review selected ({selectedKeys.size})
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : null}
          </div>

          <div className="mistakes-list" ref={listRef}>
            {filteredSorted.length === 0 ? (
              <p className="mistakes-empty">
                {items.length === 0
                  ? "No missed questions yet — nice work. Keep practicing and anything you miss will show up here."
                  : "No mistakes match these filters."}
              </p>
            ) : (
              filteredSorted.map((item) => {
                const key = keyOf(item);
                return (
                  <MistakeRow
                    key={key}
                    item={item}
                    selected={selectedKeys.has(key)}
                    onToggleSelected={() => toggleSelected(item)}
                    onReview={(event) => openRow(item, event)}
                  />
                );
              })
            )}
          </div>
        </div>

        <aside className="mistakes-rail">
          <div className="mistakes-rail-card">
            <p className="mistakes-rail-title">Recovery</p>
            <p className="mistakes-recovery-ratio">
              {recoveryStats.reviewed}
              <span> / {recoveryStats.total} reviewed</span>
            </p>
            <div className="mistakes-progress" aria-hidden>
              <span
                style={{
                  width:
                    recoveryStats.total > 0
                      ? `${Math.round((recoveryStats.reviewed / recoveryStats.total) * 100)}%`
                      : "0%",
                }}
              />
            </div>
            <ul className="mistakes-recovery-list">
              <li>
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {recoveryStats.reviewed} Reviewed
              </li>
              <li>
                <RotateCcw className="h-4 w-4" aria-hidden />
                {recoveryStats.corrected} Corrected on retry
              </li>
              <li>
                <Award className="h-4 w-4" aria-hidden />
                {recoveryStats.mastered} Mastered
              </li>
            </ul>
          </div>

          {attentionGroups.length > 0 ? (
            <div className="mistakes-rail-card">
              <p className="mistakes-rail-title">Needs attention</p>
              <ul className="mistakes-attention-list">
                {attentionGroups.map((group) => (
                  <li key={group.key}>
                    <span>{group.label}</span>
                    <span className="mistakes-attention-count">{group.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {nextReview ? (
            <div className="mistakes-rail-card">
              <p className="mistakes-rail-title">Next review</p>
              <p className="mistakes-next-topic">{nextReview.label}</p>
              <p className="mistakes-next-body">
                You&apos;ve missed this {nextReview.count > 1 ? `${nextReview.count} times` : "once"}{" "}
                across your recent attempts.
              </p>
            </div>
          ) : null}

          <div className="mistakes-rail-card">
            <p className="mistakes-rail-title">Review mode</p>
            <div className="mistakes-mode-group" role="group" aria-label="Review mode">
              <button
                type="button"
                className={`mistakes-mode${reviewMode === "adaptive" ? " is-active" : ""}`}
                onClick={() => setReviewMode("adaptive")}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Adaptive
              </button>
              <button
                type="button"
                className={`mistakes-mode${reviewMode === "by_topic" ? " is-active" : ""}`}
                onClick={() => setReviewMode("by_topic")}
              >
                <Target className="h-3.5 w-3.5" aria-hidden />
                By topic
              </button>
              <button
                type="button"
                className={`mistakes-mode${reviewMode === "timed" ? " is-active" : ""}`}
                onClick={() => setReviewMode("timed")}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Timed
              </button>
            </div>

            <button
              type="button"
              className="mistake-btn-primary mistakes-start-btn"
              onClick={startSmartReview}
              disabled={items.length === 0}
            >
              Start smart review
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="mistakes-choose-btn" onClick={chooseQuestions}>
              <ListFilter className="h-3.5 w-3.5" aria-hidden />
              Choose questions
            </button>
          </div>
        </aside>
      </div>

      <MistakeReviewOverlay
        queue={currentQueue}
        activeItem={activeItem}
        isOpen={activeItem != null}
        isScopedToSelection={activeQueue != null}
        timed={reviewMode === "timed"}
        onClose={closeOverlay}
        onNavigate={navigateTo}
        onFirstOpen={handleFirstOpen}
        onRetry={handleRetry}
        onMastered={handleMastered}
        onSaveReason={handleReason}
        onSaveNote={handleNote}
      />
    </div>
  );
}

function MistakeRow({
  item,
  selected,
  onToggleSelected,
  onReview,
}: {
  item: MistakeItem;
  selected: boolean;
  onToggleSelected: () => void;
  onReview: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const statusDotClass = `mistakes-row-dot is-${item.status.replace("_", "-")}`;

  return (
    <div className="mistakes-row">
      <span className={statusDotClass} aria-hidden />
      <input
        type="checkbox"
        className="mistakes-row-checkbox"
        checked={selected}
        onChange={onToggleSelected}
        aria-label={`Select question ${item.displayNumber}`}
      />

      <div className="mistakes-row-body">
        <div className="mistakes-row-heading">
          <span className="mistakes-row-q">Q{item.displayNumber}</span>
          <span className="mistakes-row-subject">
            {MISTAKE_SUBJECT_LABELS[item.subject]}
          </span>
        </div>
        <p className="mistakes-row-meta">
          {item.examName} · {DATE_FORMAT.format(new Date(item.completedAt))}
        </p>

        {item.reason ? (
          <p className="mistakes-row-reason">
            <span className="mistakes-row-reason-dot" aria-hidden />
            {MISTAKE_REASON_LABELS[item.reason]}
          </p>
        ) : null}
      </div>

      <div className="mistakes-row-answers">
        <span className="mistakes-answer-pill is-wrong">
          {item.selectedAnswer ?? "—"}
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="mistakes-answer-pill is-correct">{item.correctAnswer}</span>
      </div>

      <button type="button" className="mistakes-row-review" onClick={onReview}>
        Review question
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
