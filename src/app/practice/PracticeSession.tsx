"use client";

import Link from "next/link";
import { useState } from "react";
import {
  completePracticeSession,
  startPractice,
  submitAnswer,
} from "./actions";
import { EXAM_OPTIONS, TOPIC_OPTIONS } from "@/types/question";
import type { PracticeQuestion } from "@/types/practice";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

type Feedback = {
  isCorrect: boolean;
  explanation: string;
  correctLabel: string;
};

export function PracticeSession() {
  const [exam, setExam] = useState<string>(EXAM_OPTIONS[0]);
  const [topic, setTopic] = useState<string>(TOPIC_OPTIONS[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"setup" | "practice" | "complete">(
    "setup"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  async function handleStart() {
    setError(null);
    setLoading(true);

    const result = await startPractice(exam, topic);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSessionId(result.sessionId);
    setQuestions(result.questions);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setFeedback(null);
    setScore(0);
    setPhase("practice");
    setLoading(false);
  }

  async function handleSubmit() {
    if (!sessionId || !currentQuestion || !selectedChoiceId) {
      setError("Please select an answer before submitting.");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await submitAnswer(
      sessionId,
      currentQuestion.id,
      selectedChoiceId
    );

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.isCorrect) {
      setScore((prev) => prev + 1);
    }

    setFeedback({
      isCorrect: result.isCorrect,
      explanation: result.explanation,
      correctLabel: result.correctLabel,
    });
    setLoading(false);
  }

  async function handleNext() {
    if (!sessionId) {
      return;
    }

    if (isLastQuestion) {
      setLoading(true);
      await completePracticeSession(sessionId);
      setPhase("complete");
      setLoading(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedChoiceId(null);
    setFeedback(null);
    setError(null);
  }

  function handleRestart() {
    setSessionId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setFeedback(null);
    setScore(0);
    setPhase("setup");
    setError(null);
  }

  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="exam" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Exam
            </label>
            <select
              id="exam"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className={inputClassName}
            >
              {EXAM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="topic" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Topic
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputClassName}
            >
              {TOPIC_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Loading…" : "Start Practice"}
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Session complete
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            You answered {score} of {questions.length} correctly.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Practice again
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="capitalize">{currentQuestion.difficulty}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-50"
          style={{
            width: `${((currentIndex + (feedback ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-50">
          {currentQuestion.questionText}
        </p>
      </div>

      <fieldset disabled={!!feedback}>
        <legend className="sr-only">Answer choices</legend>
        <div className="space-y-3">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const showAsCorrect =
              feedback && choice.label === feedback.correctLabel;
            const showAsWrong =
              feedback && isSelected && !feedback.isCorrect;

            let choiceClassName =
              "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition ";

            if (showAsCorrect) {
              choiceClassName +=
                "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30";
            } else if (showAsWrong) {
              choiceClassName +=
                "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30";
            } else if (isSelected) {
              choiceClassName +=
                "border-zinc-900 bg-zinc-100 dark:border-zinc-400 dark:bg-zinc-800";
            } else {
              choiceClassName +=
                "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";
            }

            return (
              <label key={choice.id} className={choiceClassName}>
                <input
                  type="radio"
                  name="answer"
                  value={choice.id}
                  checked={isSelected}
                  onChange={() => setSelectedChoiceId(choice.id)}
                  className="mt-1 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-950"
                />
                <span className="flex-1">
                  <span className="mr-2 font-semibold text-zinc-900 dark:text-zinc-50">
                    {choice.label}.
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {choice.choiceText}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {feedback && (
        <div className="space-y-4">
          <p
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              feedback.isCorrect
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {feedback.isCorrect
              ? "Correct!"
              : `Incorrect. The correct answer is ${feedback.correctLabel}.`}
          </p>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Explanation
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {feedback.explanation}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {!feedback ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedChoiceId}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading
              ? "Saving…"
              : isLastQuestion
                ? "Finish"
                : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}
