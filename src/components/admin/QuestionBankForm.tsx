"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  saveQuestion,
  type QuestionFormState,
} from "@/app/admin/questions/actions";
import {
  EXAM_SECTION_CONFIGS,
  getChoiceLabels,
  getExamConfig,
} from "@/lib/question-bank";
import type { QuestionBankItem, QuestionBankType } from "@/types/question-bank";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const labelClassName = "mb-1.5 block text-sm font-medium text-foreground";

const initialState: QuestionFormState = { status: "idle", message: "" };

type EditableChoice = {
  label: string;
  choiceText: string;
};

type QuestionBankFormProps = {
  /** Existing question when editing; omit when creating. */
  question?: QuestionBankItem;
  /** Default exam slug for new questions (e.g. from ?exam=sat). */
  defaultExamType?: string;
};

export function QuestionBankForm({
  question,
  defaultExamType,
}: QuestionBankFormProps) {
  const isEditing = Boolean(question);

  const [state, formAction, pending] = useActionState(
    saveQuestion,
    initialState
  );

  const [examType, setExamType] = useState(
    question?.examType ?? defaultExamType ?? EXAM_SECTION_CONFIGS[0].slug
  );
  const [questionType, setQuestionType] = useState<QuestionBankType>(
    question?.questionType ?? "multiple-choice"
  );
  const [choices, setChoices] = useState<EditableChoice[]>(() => {
    if (question && question.choices.length > 0) {
      return question.choices.map((choice) => ({
        label: choice.label,
        choiceText: choice.choiceText,
      }));
    }

    return getChoiceLabels(
      question?.examType ?? defaultExamType ?? EXAM_SECTION_CONFIGS[0].slug
    ).map((label) => ({ label, choiceText: "" }));
  });
  const [correctAnswer, setCorrectAnswer] = useState(
    question?.correctAnswer ?? ""
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const examConfig = getExamConfig(examType);
  const allLabels = useMemo(() => getChoiceLabels(examType), [examType]);

  function handleExamChange(nextExam: string) {
    setExamType(nextExam);

    const nextLabels = getChoiceLabels(nextExam);
    setChoices((prev) =>
      nextLabels.map((label, index) => ({
        label,
        choiceText: prev[index]?.choiceText ?? "",
      }))
    );

    if (!nextLabels.includes(correctAnswer)) {
      setCorrectAnswer("");
    }
  }

  function updateChoice(index: number, value: string) {
    setChoices((prev) =>
      prev.map((choice, i) =>
        i === index ? { ...choice, choiceText: value } : choice
      )
    );
  }

  function removeChoice(index: number) {
    setChoices((prev) => {
      const next = prev
        .filter((_, i) => i !== index)
        .map((choice, i) => ({ ...choice, label: allLabels[i] }));

      if (!next.some((choice) => choice.label === correctAnswer)) {
        setCorrectAnswer("");
      }

      return next;
    });
  }

  function addChoice() {
    setChoices((prev) => {
      if (prev.length >= allLabels.length) {
        return prev;
      }

      return [...prev, { label: allLabels[prev.length], choiceText: "" }];
    });
  }

  function handleImageChange(file: File | null) {
    setImagePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return file ? URL.createObjectURL(file) : null;
    });

    if (file) {
      setRemoveImage(false);
    }
  }

  const showExistingImage =
    question?.imageUrl && !imagePreview && !removeImage;

  return (
    <form action={formAction} className="space-y-8">
      {question && (
        <input type="hidden" name="questionId" value={question.id} />
      )}
      {question && (
        <input type="hidden" name="groupKey" value={question.groupKey} />
      )}
      <input
        type="hidden"
        name="existingImageUrl"
        value={question?.imageUrl ?? ""}
      />
      <input type="hidden" name="choices" value={JSON.stringify(choices)} />
      {questionType === "multiple-choice" && (
        <input type="hidden" name="correctAnswer" value={correctAnswer} />
      )}

      {/* --- Placement ------------------------------------------------- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="examType" className={labelClassName}>
            Exam
          </label>
          <select
            id="examType"
            name="examType"
            value={examType}
            onChange={(event) => handleExamChange(event.target.value)}
            className={inputClassName}
          >
            {EXAM_SECTION_CONFIGS.map((config) => (
              <option key={config.slug} value={config.slug}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="section" className={labelClassName}>
            Section
          </label>
          <input
            id="section"
            name="section"
            list="section-suggestions"
            defaultValue={question?.section ?? ""}
            placeholder="e.g. Reading and Writing"
            className={inputClassName}
          />
          <datalist id="section-suggestions">
            {(examConfig?.sections ?? []).map((section) => (
              <option key={section} value={section} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="groupLabel" className={labelClassName}>
            Question set
          </label>
          <input
            id="groupLabel"
            name="groupLabel"
            list="group-suggestions"
            defaultValue={question?.groupLabel ?? question?.groupKey ?? ""}
            placeholder="e.g. SAT Practice Exam 1"
            required
            className={inputClassName}
          />
          <datalist id="group-suggestions">
            {(examConfig?.groups ?? []).map((group) => (
              <option key={group.key} value={group.label} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="questionNumber" className={labelClassName}>
            Question #
          </label>
          <input
            id="questionNumber"
            name="questionNumber"
            type="number"
            min={1}
            defaultValue={question?.questionNumber ?? 1}
            className={inputClassName}
          />
        </div>
      </div>

      {/* --- Content ---------------------------------------------------- */}
      <div>
        <label htmlFor="passage" className={labelClassName}>
          Passage <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="passage"
          name="passage"
          rows={4}
          defaultValue={question?.passage ?? ""}
          placeholder="Reading passage or context shown above the question…"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="questionText" className={labelClassName}>
          Question text
        </label>
        <textarea
          id="questionText"
          name="questionText"
          rows={4}
          required
          defaultValue={question?.questionText ?? ""}
          placeholder="Enter the question… (LaTeX like $x^2$ is supported in DIM math)"
          className={inputClassName}
        />
      </div>

      {/* --- Image -------------------------------------------------------- */}
      <div>
        <span className={labelClassName}>Picture</span>
        <div className="flex flex-wrap items-start gap-4">
          {showExistingImage && (
            <div className="relative">
              <Image
                src={question!.imageUrl!}
                alt="Current question image"
                width={240}
                height={160}
                className="h-auto w-60 rounded-lg border border-card-border object-contain"
              />
              <button
                type="button"
                onClick={() => setRemoveImage(true)}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}

          {imagePreview && (
            // Object URLs are not supported by next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="New image preview"
              className="h-auto w-60 rounded-lg border border-card-border object-contain"
            />
          )}

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-card-border px-4 py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent">
            <ImagePlus className="h-4 w-4" aria-hidden />
            {question?.imageUrl || imagePreview
              ? "Replace image"
              : "Add image"}
            <input
              type="file"
              name="image"
              accept="image/*"
              className="sr-only"
              onChange={(event) =>
                handleImageChange(event.target.files?.[0] ?? null)
              }
            />
          </label>
        </div>
        {removeImage && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            The current image will be removed when you save.
          </p>
        )}
        <input
          type="checkbox"
          name="removeImage"
          checked={removeImage}
          onChange={() => undefined}
          className="hidden"
        />
        <p className="mt-2 text-xs text-muted">
          PNG, JPG, or WebP up to 5 MB. Shown with the passage/question.
        </p>
      </div>

      {/* --- Answers -------------------------------------------------------- */}
      <div>
        <span className={labelClassName}>Question type</span>
        <div className="flex gap-2">
          {(
            [
              { value: "multiple-choice", label: "Multiple choice" },
              { value: "open", label: "Open answer" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition ${
                questionType === option.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-card-border text-muted hover:text-foreground"
              }`}
            >
              <input
                type="radio"
                name="questionType"
                value={option.value}
                checked={questionType === option.value}
                onChange={() => setQuestionType(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {questionType === "multiple-choice" ? (
        <fieldset>
          <legend className={labelClassName}>Answer choices</legend>
          <p className="mb-4 text-xs text-muted">
            Select the radio button next to the correct answer.
          </p>
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <div key={choice.label} className="flex items-center gap-3">
                <input
                  type="radio"
                  aria-label={`Choice ${choice.label} is correct`}
                  checked={correctAnswer === choice.label}
                  onChange={() => setCorrectAnswer(choice.label)}
                  className="h-4 w-4 border-card-border text-accent focus:ring-accent"
                />
                <span className="w-5 text-sm font-semibold text-muted">
                  {choice.label}
                </span>
                <input
                  type="text"
                  value={choice.choiceText}
                  onChange={(event) => updateChoice(index, event.target.value)}
                  placeholder={`Answer choice ${choice.label}`}
                  className={inputClassName}
                />
                {choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    aria-label={`Remove choice ${choice.label}`}
                    className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
          {choices.length < allLabels.length && (
            <button
              type="button"
              onClick={addChoice}
              className="mt-3 text-sm font-medium text-accent hover:underline"
            >
              + Add choice {allLabels[choices.length]}
            </button>
          )}
        </fieldset>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="correctAnswerOpen" className={labelClassName}>
              Correct answer
            </label>
            <input
              id="correctAnswerOpen"
              name="correctAnswer"
              defaultValue={question?.correctAnswer ?? ""}
              placeholder="e.g. 42"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="acceptedAnswers" className={labelClassName}>
              Also accept{" "}
              <span className="font-normal text-muted">
                (comma separated, optional)
              </span>
            </label>
            <input
              id="acceptedAnswers"
              name="acceptedAnswers"
              defaultValue={question?.acceptedAnswers.join(", ") ?? ""}
              placeholder="e.g. 42.0, forty-two"
              className={inputClassName}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="explanation" className={labelClassName}>
          Explanation <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="explanation"
          name="explanation"
          rows={3}
          defaultValue={question?.explanation ?? ""}
          placeholder="Explain why the correct answer is right…"
          className={inputClassName}
        />
      </div>

      {/* --- Meta -------------------------------------------------------- */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="difficulty" className={labelClassName}>
            Difficulty <span className="font-normal text-muted">(optional)</span>
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={question?.difficulty ?? ""}
            className={inputClassName}
          >
            <option value="">Not set</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClassName}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={question?.status ?? "published"}
            className={inputClassName}
          >
            <option value="published">Published (visible to students)</option>
            <option value="draft">Draft (admins only)</option>
          </select>
        </div>
      </div>

      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.message}
        </p>
      )}

      {state.status === "success" && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
          {state.message}{" "}
          {!isEditing && state.questionId && (
            <Link
              href={`/admin/questions/${state.questionId}`}
              className="font-medium underline"
            >
              Edit it
            </Link>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Create question"}
        </button>
        <Link
          href="/admin/questions"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to questions
        </Link>
      </div>
    </form>
  );
}
