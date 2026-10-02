"use client";

import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startTimedPractice } from "@/app/dashboard/(shell)/sat/timed-practice-actions";
import { withLocale } from "@/lib/i18n/config";
import {
  TIMED_SESSION_PATH,
  configProblem,
  defaultTimedConfig,
  isCustomized,
  planSession,
  toggleTopic,
} from "@/lib/timed-practice";
import {
  TIMED_TOPIC_IDS,
  type TimedActionResult,
  type TimedErrorCode,
  type TimedPracticeConfig,
  type TimedPracticeView,
} from "@/types/timed-practice";
import { PracticeFocus } from "./PracticeFocus";
import { RecentSessions } from "./RecentSessions";
import { SessionLength } from "./SessionLength";
import { SessionActions, SessionSummary } from "./SessionSummary";
import { useTimedCopy } from "./useTimedCopy";

const noSubscribe = () => () => {};

/**
 * Today's date on the student's own clock. The server can't know their time
 * zone, so it renders nothing and the browser picks its day from the labels
 * the server formatted (see todayLabelsAround).
 */
function useTodayLabel(labels: Record<string, string>, locale: string): string | null {
  const today = useSyncExternalStore(
    noSubscribe,
    // en-CA formats as YYYY-MM-DD in the browser's own time zone.
    () => new Intl.DateTimeFormat("en-CA").format(new Date()),
    () => null
  );
  if (!today) return null;
  return (
    labels[today] ??
    new Intl.DateTimeFormat(locale, { weekday: "long", month: "short", day: "numeric" }).format(new Date())
  );
}

export function TimedPracticeContent({ view }: { view: TimedPracticeView }) {
  const router = useRouter();
  const { tp, locale } = useTimedCopy();
  const today = useTodayLabel(view.todayLabels, locale);

  const [config, setConfig] = useState<TimedPracticeConfig>(() => defaultTimedConfig(view.availability));
  const [error, setError] = useState<TimedErrorCode | null>(null);
  const [pending, startTransition] = useTransition();
  // `pending` only disables the button once React commits; this closes the
  // gap for clicks that land before that, so only one session is ever created.
  const startingRef = useRef(false);

  const plan = useMemo(() => planSession(config, view.availability), [config, view.availability]);

  function update(patch: Partial<TimedPracticeConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function start() {
    if (pending || startingRef.current) return;
    const problem = configProblem(config, view.availability);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    startingRef.current = true;

    // Stays pending through the navigation, so the button keeps its loading
    // state until the session screen replaces this page.
    startTransition(async () => {
      let result: TimedActionResult;
      try {
        result = await startTimedPractice(config);
      } catch {
        result = { success: false, error: "failed" };
      }
      if (!result.success) {
        startingRef.current = false;
        setError(result.error);
        return;
      }
      router.push(withLocale(TIMED_SESSION_PATH, locale));
    });
  }

  return (
    <div className="timed-practice">
      <div className="tp-wrap">
        <header className="tp-head">
          <p className="tp-eyebrow">
            {tp("eyebrow")}
            {today ? (
              <>
                <span className="tp-eyebrow-dot" aria-hidden>
                  ·
                </span>
                <span className="sr-only">, </span>
                {today}
              </>
            ) : null}
          </p>
          <h2 className="tp-title">
            {tp("title")} <em>{tp("titleEmphasis")}</em>
          </h2>
          <p className="tp-subtitle">{tp("subtitle")}</p>
        </header>

        <div className="tp-workspace">
          <div className="tp-config">
            <SessionLength
              duration={config.duration}
              focus={config.focus}
              minutes={plan.minutes}
              onChange={(duration) => update({ duration })}
            />
            <PracticeFocus
              config={config}
              availability={view.availability}
              onFocus={(focus) => update({ focus })}
              onToggleTopic={(topic) => update({ topics: toggleTopic(config.topics, topic) })}
              onResetTopics={() => update({ topics: [...TIMED_TOPIC_IDS] })}
            />
          </div>

          <SessionSummary
            plan={plan}
            customized={isCustomized(config)}
            pacing={config.pacing}
            onPacing={(pacing) => update({ pacing })}
          />

          <SessionActions pending={pending} error={error} resume={view.resume} onStart={start} />
        </div>

        <RecentSessions history={view.history} />
      </div>
    </div>
  );
}
