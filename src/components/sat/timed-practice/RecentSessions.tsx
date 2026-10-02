"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { isSuccessfulResult } from "@/lib/timed-practice";
import type { TimedPracticeView } from "@/types/timed-practice";
import { useTimedCopy } from "./useTimedCopy";

type Entry = TimedPracticeView["history"][number];

/** How many results sit inline in the row; the rest are behind "View history". */
const INLINE = 2;

function Result({ entry, withFocus = false }: { entry: Entry; withFocus?: boolean }) {
  const { tp } = useTimedCopy();
  return (
    <>
      <time dateTime={entry.date}>{entry.dateLabel}</time>
      <span className="tp-dot" aria-hidden>·</span>
      <span>{tp("recentMinutes", { count: entry.minutes })}</span>
      {withFocus ? (
        <>
          <span className="tp-dot" aria-hidden>·</span>
          <span>{tp(`focus.${entry.focus}.title`)}</span>
        </>
      ) : null}
      <span className="tp-dot" aria-hidden>·</span>
      <span className={isSuccessfulResult(entry.correct, entry.total) ? "tp-good" : undefined}>
        {tp("recentCorrect", { correct: entry.correct, total: entry.total })}
      </span>
    </>
  );
}

export function RecentSessions({ history }: { history: TimedPracticeView["history"] }) {
  const { tp } = useTimedCopy();
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const hasMore = history.length > INLINE;

  return (
    <section className="tp-recent" aria-labelledby={`${baseId}-label`}>
      <div className="tp-recent-row">
        <h3 id={`${baseId}-label`} className="tp-label tp-recent-label">
          {tp("recent")}
        </h3>

        {history.length === 0 ? (
          <p className="tp-recent-empty">{tp("recentEmpty")}</p>
        ) : (
          <ul className="tp-recent-list">
            {history.slice(0, INLINE).map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="tp-recent-item">
                <Result entry={entry} />
              </li>
            ))}
          </ul>
        )}

        {hasMore ? (
          <button
            type="button"
            className="tp-link tp-history-toggle"
            aria-expanded={open}
            aria-controls={`${baseId}-history`}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? tp("hideHistory") : tp("viewHistory")}
            <ArrowRight className="tp-link-arrow" aria-hidden />
          </button>
        ) : null}
      </div>

      {hasMore ? (
        <div id={`${baseId}-history`} className={`tp-reveal${open ? " is-open" : ""}`} inert={!open}>
          <div className="tp-reveal-inner">
            <ol className="tp-history" aria-label={tp("historyLabel")}>
              {history.map((entry, index) => (
                <li key={`${entry.date}-${index}`} className="tp-history-item">
                  <Result entry={entry} withFocus />
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}
