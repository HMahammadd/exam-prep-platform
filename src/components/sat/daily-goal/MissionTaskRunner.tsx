"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Eye,
  X,
  XCircle,
} from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { SatChart } from "@/components/sat/SatChart";
import { SatPassage } from "@/components/sat/SatPassage";
import { missionFont } from "@/components/sat/daily-goal/mission-font";
import {
  answerMissionQuestion,
  reviewMissionWord,
} from "@/app/dashboard/(shell)/sat/daily-mission-actions";
import { DAILY_GOAL_PATH } from "@/lib/daily-mission";
import type {
  MissionQuestionItem,
  MissionRunnerData,
  MissionRunnerItem,
  MissionWordItem,
} from "@/types/daily-mission";

function isDone(item: MissionRunnerItem) {
  return item.result !== null;
}

function isCorrect(item: MissionRunnerItem) {
  if (!item.result) return false;
  return item.kind === "question" ? item.result.isCorrect : item.result.knewIt;
}

function QuestionStep({
  item,
  onAnswered,
}: {
  item: MissionQuestionItem;
  onAnswered: (result: MissionQuestionItem["result"]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(item.result?.selected ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const result = item.result;

  function check() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const outcome = await answerMissionQuestion(item.itemId, selected);
      if (!outcome.success) {
        setError(outcome.error);
        return;
      }
      onAnswered(outcome.result);
    });
  }

  return (
    <div className={`runner-question${item.passage ? "" : " is-single"}`}>
      {item.passage || item.imageUrl || item.chartId ? (
        <section className="runner-pane runner-passage" aria-label="Passage">
          {item.passage ? <SatPassage passage={item.passage} variant="mistake" /> : null}
          {item.chartId ? <SatChart chartId={item.chartId} /> : null}
          {item.imageUrl ? (
            <div className="runner-figure">
              <Image
                src={item.imageUrl}
                alt="Figure for this question"
                width={960}
                height={640}
                className="h-auto w-full"
              />
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="runner-pane runner-ask" aria-label="Question">
        <p className="runner-stem">{item.stem}</p>

        <div className="runner-choices" role="radiogroup" aria-label="Answer choices">
          {item.choices.map((choice) => {
            const state = result
              ? choice.label === result.correctAnswer
                ? "is-correct"
                : choice.label === result.selected
                  ? "is-wrong"
                  : "is-dim"
              : choice.label === selected
                ? "is-selected"
                : "";
            return (
              <button
                key={choice.label}
                type="button"
                role="radio"
                aria-checked={(result?.selected ?? selected) === choice.label}
                className={`runner-choice ${state}`}
                disabled={Boolean(result) || pending}
                onClick={() => setSelected(choice.label)}
              >
                <span className="runner-choice-letter">{choice.label}</span>
                <span className="runner-choice-text">{choice.text}</span>
                {state === "is-correct" ? <Check className="runner-choice-mark" aria-hidden /> : null}
                {state === "is-wrong" ? <X className="runner-choice-mark" aria-hidden /> : null}
              </button>
            );
          })}
        </div>

        {result ? (
          <div className={`runner-feedback ${result.isCorrect ? "is-correct" : "is-wrong"}`} role="status">
            <p className="runner-feedback-title">
              {result.isCorrect ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : (
                <XCircle className="h-5 w-5" aria-hidden />
              )}
              {result.isCorrect ? "Correct" : `Not quite — the answer is ${result.correctAnswer}`}
            </p>
            {result.explanation ? <p className="runner-explanation">{result.explanation}</p> : null}
          </div>
        ) : (
          <>
            {error ? (
              <p className="runner-error" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              className="mission-cta runner-check"
              disabled={!selected || pending}
              onClick={check}
            >
              {pending ? "Checking…" : "Check answer"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function WordStep({
  item,
  onReviewed,
}: {
  item: MissionWordItem;
  onReviewed: (knewIt: boolean) => void;
}) {
  const [revealed, setRevealed] = useState(item.result !== null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function review(knewIt: boolean) {
    setError(null);
    startTransition(async () => {
      const outcome = await reviewMissionWord(item.itemId, knewIt);
      if (!outcome.success) {
        setError(outcome.error ?? "Couldn’t save.");
        return;
      }
      onReviewed(knewIt);
    });
  }

  return (
    <div className="runner-word">
      {item.saved ? (
        <p className="runner-word-saved">
          <BookmarkCheck className="h-4 w-4" aria-hidden /> Saved word
        </p>
      ) : null}
      <p className="runner-word-term">{item.word}</p>

      {revealed ? (
        <div className="runner-word-meaning">
          <p className="runner-word-definition">{item.definition}</p>
          <p className="runner-word-translation">
            <span>AZ</span> {item.translations.AZE}
          </p>
          <p className="runner-word-translation">
            <span>RU</span> {item.translations.RUS}
          </p>
        </div>
      ) : (
        <button type="button" className="mission-btn-outline runner-reveal" onClick={() => setRevealed(true)}>
          <Eye className="h-4 w-4" aria-hidden /> Show meaning
        </button>
      )}

      {item.result ? (
        <p className={`runner-word-result ${item.result.knewIt ? "is-correct" : "is-wrong"}`} role="status">
          {item.result.knewIt ? "You knew this one." : "Marked as still learning — it will come back soon."}
        </p>
      ) : revealed ? (
        <>
          {error ? (
            <p className="runner-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="runner-word-actions">
            <button type="button" className="mission-btn-outline" disabled={pending} onClick={() => review(false)}>
              Still learning
            </button>
            <button type="button" className="mission-cta mission-cta-sm" disabled={pending} onClick={() => review(true)}>
              I knew it
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MissionTaskRunner({ runner }: { runner: MissionRunnerData }) {
  const [items, setItems] = useState(runner.items);
  const firstOpen = runner.items.findIndex((item) => !isDone(item));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [showSummary, setShowSummary] = useState(firstOpen === -1 && runner.items.length > 0);

  const doneCount = items.filter(isDone).length;
  const correctCount = items.filter(isCorrect).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const item = items[index];
  const isWords = runner.taskId === "vocabulary";

  const nextOpen = useMemo(() => {
    for (let offset = 1; offset <= items.length; offset += 1) {
      const candidate = (index + offset) % items.length;
      if (!isDone(items[candidate])) return candidate;
    }
    return -1;
  }, [index, items]);

  function update(next: MissionRunnerItem) {
    setItems((current) => current.map((entry) => (entry.itemId === next.itemId ? next : entry)));
  }

  function advance() {
    if (nextOpen === -1) {
      setShowSummary(true);
    } else {
      setIndex(nextOpen);
    }
  }

  return (
    <div className={`daily-goal daily-goal--runner ${missionFont.variable}`}>
      <header className="runner-head">
        <LocaleLink href={DAILY_GOAL_PATH} className="runner-back">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Today&apos;s mission
        </LocaleLink>

        <div className="runner-head-row">
          <div>
            <p className="mission-kicker">Daily mission</p>
            <h2 className="runner-title">{runner.title}</h2>
          </div>
          <p className="runner-count">
            <b>{doneCount}</b> of {items.length} done
          </p>
        </div>

        <ol className="runner-steps" aria-label="Items">
          {items.map((entry, position) => (
            <li key={entry.itemId}>
              <button
                type="button"
                className={`runner-step${position === index && !showSummary ? " is-active" : ""}${
                  isDone(entry) ? (isCorrect(entry) ? " is-correct" : " is-wrong") : ""
                }`}
                onClick={() => {
                  setShowSummary(false);
                  setIndex(position);
                }}
                aria-label={`${isWords ? "Word" : "Question"} ${position + 1}${
                  isDone(entry) ? (isCorrect(entry) ? ", correct" : ", missed") : ""
                }`}
                aria-current={position === index && !showSummary ? "step" : undefined}
              />
            </li>
          ))}
        </ol>
      </header>

      {items.length === 0 ? (
        <div className="mission-empty">
          <CheckCircle2 className="mission-empty-icon" aria-hidden strokeWidth={1.6} />
          <h2 className="mission-empty-title">Nothing to do here today</h2>
          <p className="mission-empty-text">{runner.subtitle}</p>
          <LocaleLink href={DAILY_GOAL_PATH} className="mission-cta mission-cta-sm">
            Back to today&apos;s mission
          </LocaleLink>
        </div>
      ) : showSummary && allDone ? (
        <div className="mission-empty runner-summary">
          <CheckCircle2 className="mission-empty-icon is-success" aria-hidden strokeWidth={1.6} />
          <h2 className="mission-empty-title">{runner.title.split(":")[0]} complete</h2>
          <p className="mission-empty-text">
            {isWords
              ? `You knew ${correctCount} of ${items.length} words.`
              : `${correctCount} of ${items.length} correct.`}
          </p>
          <div className="runner-summary-actions">
            <LocaleLink href={DAILY_GOAL_PATH} className="mission-btn-outline">
              Back to today&apos;s mission
            </LocaleLink>
            {runner.nextTask ? (
              <LocaleLink href={runner.nextTask.href} className="mission-cta mission-cta-sm">
                Next: {runner.nextTask.title}
                <ArrowRight className="mission-cta-arrow" aria-hidden />
              </LocaleLink>
            ) : null}
          </div>
        </div>
      ) : item ? (
        <div className="runner-body">
          <p className="runner-meta">
            {isWords ? "Word" : "Question"} {index + 1} of {items.length}
            {item.kind === "question" && item.skill ? <> &middot; {item.skill}</> : null}
            {item.kind === "question" ? <> &middot; {item.source}</> : null}
          </p>

          {item.kind === "question" ? (
            <QuestionStep
              key={item.itemId}
              item={item}
              onAnswered={(result) => update({ ...item, result })}
            />
          ) : (
            <WordStep
              key={item.itemId}
              item={item}
              onReviewed={(knewIt) => update({ ...item, result: { knewIt } })}
            />
          )}

          {isDone(item) ? (
            <div className="runner-next">
              <button type="button" className="mission-cta mission-cta-sm" onClick={advance}>
                {nextOpen === -1 ? "Finish task" : isWords ? "Next word" : "Next question"}
                <ArrowRight className="mission-cta-arrow" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
