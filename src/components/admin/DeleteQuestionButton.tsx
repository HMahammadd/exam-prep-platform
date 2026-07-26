"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteQuestion } from "@/app/admin/questions/actions";

type DeleteQuestionButtonProps = {
  questionId: string;
  questionNumber: number;
  redirectTo?: string;
};

export function DeleteQuestionButton({
  questionId,
  questionNumber,
  redirectTo,
}: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete question #${questionNumber}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteQuestion(questionId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        {isPending ? "Deleting…" : "Delete"}
      </button>
      {error && (
        <p className="max-w-xs text-right text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
