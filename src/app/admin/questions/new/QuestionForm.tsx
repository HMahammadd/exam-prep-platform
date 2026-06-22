"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createQuestion } from "./actions";
import {
  DIFFICULTY_OPTIONS,
  EXAM_OPTIONS,
  STATUS_OPTIONS,
  TOPIC_OPTIONS,
  type QuestionDifficulty,
  type QuestionStatus,
} from "@/types/question";

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/10";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function QuestionForm() {
  const [exam, setExam] = useState<string>(EXAM_OPTIONS[0]);
  const [topic, setTopic] = useState<string>(TOPIC_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(0);
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState<QuestionStatus>("draft");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateChoice(index: number, value: string) {
    setChoices((prev) => prev.map((choice, i) => (i === index ? value : choice)));
  }

  function validateForm(): string | null {
    if (!questionText.trim()) {
      return "Question text is required.";
    }

    if (!explanation.trim()) {
      return "Explanation is required.";
    }

    if (choices.some((choice) => !choice.trim())) {
      return "All four answer choices are required.";
    }

    if (correctIndex < 0 || correctIndex > 3) {
      return "Exactly one correct answer is required.";
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const result = await createQuestion({
      exam,
      topic,
      difficulty,
      questionText,
      explanation,
      status,
      choices: choices as [string, string, string, string],
      correctIndex,
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess("Question saved successfully.");
    setQuestionText("");
    setChoices(["", "", "", ""]);
    setCorrectIndex(0);
    setExplanation("");
    setStatus("draft");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="exam" className={labelClassName}>
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
          <label htmlFor="topic" className={labelClassName}>
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

        <div>
          <label htmlFor="difficulty" className={labelClassName}>
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as QuestionDifficulty)
            }
            className={inputClassName}
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="questionText" className={labelClassName}>
          Question text
        </label>
        <textarea
          id="questionText"
          rows={4}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className={inputClassName}
          placeholder="Enter the question..."
        />
      </div>

      <fieldset>
        <legend className={labelClassName}>Answer choices</legend>
        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
          Select the radio button next to the correct answer.
        </p>
        <div className="space-y-3">
          {choices.map((choice, index) => (
            <div key={index} className="flex items-start gap-3">
              <input
                type="radio"
                id={`correct-${index}`}
                name="correctAnswer"
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index as 0 | 1 | 2 | 3)}
                className="mt-3 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-950"
              />
              <div className="flex-1">
                <label
                  htmlFor={`choice-${index}`}
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Choice {String.fromCharCode(65 + index)}
                </label>
                <input
                  id={`choice-${index}`}
                  type="text"
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  className={inputClassName}
                  placeholder={`Answer choice ${String.fromCharCode(65 + index)}`}
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="explanation" className={labelClassName}>
          Explanation
        </label>
        <textarea
          id="explanation"
          rows={4}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className={inputClassName}
          placeholder="Explain why the correct answer is right..."
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClassName}>
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as QuestionStatus)}
          className={`${inputClassName} sm:max-w-xs`}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          {success}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Saving…" : "Save question"}
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Back to dashboard
        </Link>
      </div>
    </form>
  );
}
