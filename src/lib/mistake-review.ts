import {
  MISTAKE_REASON_LABELS,
  MISTAKE_SUBJECT_LABELS,
  mistakeKey,
  type MistakeItem,
  type MistakeReason,
  type MistakeStatus,
  type MistakeSubject,
} from "@/types/mistake-review";

/** Funnel order — later stages imply every earlier one. */
const STATUS_ORDER: MistakeStatus[] = [
  "to_review",
  "reviewed",
  "corrected",
  "mastered",
];

/** Never lets a status move backwards. */
export function advanceStatus(
  current: MistakeStatus | null | undefined,
  target: MistakeStatus
): MistakeStatus {
  const cur = current ?? "to_review";
  return STATUS_ORDER.indexOf(target) > STATUS_ORDER.indexOf(cur)
    ? target
    : cur;
}

export type RecoveryStats = {
  total: number;
  toReview: number;
  /** Includes reviewed, corrected, and mastered. */
  reviewed: number;
  /** Includes corrected and mastered. */
  corrected: number;
  mastered: number;
};

export function computeRecoveryStats(items: MistakeItem[]): RecoveryStats {
  let reviewed = 0;
  let corrected = 0;
  let mastered = 0;

  for (const item of items) {
    if (item.status !== "to_review") reviewed += 1;
    if (item.status === "corrected" || item.status === "mastered") corrected += 1;
    if (item.status === "mastered") mastered += 1;
  }

  return {
    total: items.length,
    toReview: items.length - reviewed,
    reviewed,
    corrected,
    mastered,
  };
}

export type AttentionGroup = {
  key: string;
  label: string;
  count: number;
};

/**
 * Real, honest groupings only — subject (Math / Reading & Writing) and
 * mistake reason (set by the student). No fabricated skill/topic taxonomy:
 * the question bank has no per-question skill tag to group by.
 */
export function computeNeedsAttention(
  items: MistakeItem[],
  limit = 3
): AttentionGroup[] {
  const open = items.filter((item) => item.status !== "mastered");

  const bySubject = new Map<MistakeSubject, number>();
  const byReason = new Map<MistakeReason, number>();

  for (const item of open) {
    bySubject.set(item.subject, (bySubject.get(item.subject) ?? 0) + 1);
    if (item.reason) {
      byReason.set(item.reason, (byReason.get(item.reason) ?? 0) + 1);
    }
  }

  const groups: AttentionGroup[] = [
    ...Array.from(bySubject.entries()).map(([subject, count]) => ({
      key: `subject:${subject}`,
      label: MISTAKE_SUBJECT_LABELS[subject],
      count,
    })),
    ...Array.from(byReason.entries()).map(([reason, count]) => ({
      key: `reason:${reason}`,
      label: MISTAKE_REASON_LABELS[reason],
      count,
    })),
  ];

  return groups.sort((a, b) => b.count - a.count).slice(0, limit);
}

export type ReviewMode = "adaptive" | "by_topic" | "timed";

const STATUS_PRIORITY: Record<MistakeStatus, number> = {
  to_review: 0,
  reviewed: 1,
  corrected: 2,
  mastered: 3,
};

/** Orders a smart-review queue for a given mode. Never mutates the input. */
export function buildReviewQueue(
  items: MistakeItem[],
  mode: ReviewMode
): MistakeItem[] {
  const list = [...items];

  if (mode === "by_topic") {
    list.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      const reasonA = a.reason ?? "zzz";
      const reasonB = b.reason ?? "zzz";
      return reasonA.localeCompare(reasonB);
    });
    return list;
  }

  // "adaptive" and "timed" both prioritize what still needs work, most
  // recently missed first within each stage.
  list.sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;
    return (
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  });
  return list;
}

export function sortByCompletedAt(
  items: MistakeItem[],
  direction: "newest" | "oldest"
): MistakeItem[] {
  const list = [...items];
  list.sort((a, b) => {
    const delta =
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    return direction === "newest" ? -delta : delta;
  });
  return list;
}

export { mistakeKey };
