"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { toGroupKey } from "@/lib/question-bank";
import { createClient } from "@/lib/supabaseServer";
import type {
  AdminActionResult,
  QuestionBankDifficulty,
  QuestionBankStatus,
  QuestionBankType,
} from "@/types/question-bank";

const BUCKET = "question-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type QuestionFormState = {
  status: "idle" | "success" | "error";
  message: string;
  questionId?: string;
};

type SubmittedChoice = {
  label: string;
  choiceText: string;
};

function parseChoices(raw: FormDataEntryValue | null): SubmittedChoice[] {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SubmittedChoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Extracts the storage object path from a public bucket URL. */
function storagePathFromUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

async function uploadImage(
  file: File,
  examType: string
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image files can be uploaded." };
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${examType}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return {
      error: `Image upload failed: ${error.message}. Make sure the "${BUCKET}" storage bucket exists.`,
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}

async function deleteStoredImage(url: string | null) {
  const path = storagePathFromUrl(url);
  if (!path) {
    return;
  }

  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function saveQuestion(
  _prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  await requireAdmin();

  const questionId = text(formData, "questionId");
  const examType = text(formData, "examType");
  const section = text(formData, "section");
  const groupLabel = text(formData, "groupLabel");
  const groupKeyInput = text(formData, "groupKey");
  const questionText = text(formData, "questionText");
  const passage = text(formData, "passage");
  const explanation = text(formData, "explanation");
  const questionType = text(formData, "questionType") as QuestionBankType;
  const status = (text(formData, "status") || "published") as QuestionBankStatus;
  const difficultyInput = text(formData, "difficulty");
  const questionNumber = Number(text(formData, "questionNumber") || "1");
  const correctAnswerInput = text(formData, "correctAnswer");
  const acceptedAnswersInput = text(formData, "acceptedAnswers");
  const removeImage = formData.get("removeImage") === "on";
  const existingImageUrl = text(formData, "existingImageUrl") || null;
  const choices = parseChoices(formData.get("choices"));

  if (!examType) {
    return { status: "error", message: "Exam is required." };
  }

  if (!questionText) {
    return { status: "error", message: "Question text is required." };
  }

  const groupKey = groupKeyInput || toGroupKey(groupLabel);

  if (!groupKey) {
    return {
      status: "error",
      message: "Question set is required (for example: Exam 1, Chapter 3).",
    };
  }

  if (!Number.isFinite(questionNumber) || questionNumber < 1) {
    return { status: "error", message: "Question number must be 1 or higher." };
  }

  const correctAnswer = correctAnswerInput;

  if (questionType === "multiple-choice") {
    const filled = choices.filter((choice) => choice.choiceText.trim());

    if (filled.length < 2) {
      return {
        status: "error",
        message: "Add at least two answer choices.",
      };
    }

    if (!correctAnswer) {
      return { status: "error", message: "Select the correct answer." };
    }

    if (!filled.some((choice) => choice.label === correctAnswer)) {
      return {
        status: "error",
        message: "The correct answer must match one of the filled choices.",
      };
    }
  } else if (!correctAnswer) {
    return {
      status: "error",
      message: "Enter the correct answer for this open question.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- image handling -----------------------------------------------------
  let imageUrl: string | null = existingImageUrl;
  const imageFile = formData.get("image");

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadImage(imageFile, examType);

    if ("error" in uploaded) {
      return { status: "error", message: uploaded.error };
    }

    if (existingImageUrl) {
      await deleteStoredImage(existingImageUrl);
    }

    imageUrl = uploaded.url;
  } else if (removeImage && existingImageUrl) {
    await deleteStoredImage(existingImageUrl);
    imageUrl = null;
  }

  const payload = {
    exam_type: examType,
    section: section || null,
    group_key: groupKey,
    group_label: groupLabel || null,
    question_number: questionNumber,
    question_type: questionType,
    passage: passage || null,
    question_text: questionText,
    image_url: imageUrl,
    correct_answer: correctAnswer,
    accepted_answers: acceptedAnswersInput
      ? acceptedAnswersInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    explanation: explanation || null,
    difficulty: (difficultyInput || null) as QuestionBankDifficulty | null,
    status,
  };

  let savedId = questionId;

  if (questionId) {
    const { error } = await supabase
      .from("exam_questions")
      .update(payload)
      .eq("id", questionId);

    if (error) {
      return { status: "error", message: describeDbError(error.message) };
    }

    await supabase
      .from("exam_question_choices")
      .delete()
      .eq("question_id", questionId);
  } else {
    const { data, error } = await supabase
      .from("exam_questions")
      .insert({ ...payload, created_by: user?.id ?? null })
      .select("id")
      .single();

    if (error || !data) {
      return {
        status: "error",
        message: describeDbError(error?.message ?? "Failed to save question."),
      };
    }

    savedId = data.id;
  }

  if (questionType === "multiple-choice") {
    const rows = choices
      .filter((choice) => choice.choiceText.trim())
      .map((choice, index) => ({
        question_id: savedId,
        label: choice.label,
        choice_text: choice.choiceText.trim(),
        is_correct: choice.label === correctAnswer,
        display_order: index,
      }));

    const { error: choicesError } = await supabase
      .from("exam_question_choices")
      .insert(rows);

    if (choicesError) {
      return {
        status: "error",
        message: describeDbError(choicesError.message),
      };
    }
  }

  revalidatePath("/admin/questions");
  revalidatePath("/admin");

  return {
    status: "success",
    message: questionId ? "Question updated." : "Question created.",
    questionId: savedId,
  };
}

export async function deleteQuestion(
  questionId: string
): Promise<AdminActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("exam_questions")
    .select("image_url")
    .eq("id", questionId)
    .maybeSingle();

  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    return { success: false, error: describeDbError(error.message) };
  }

  await deleteStoredImage(existing?.image_url ?? null);

  revalidatePath("/admin/questions");
  revalidatePath("/admin");

  return { success: true };
}

function describeDbError(message: string): string {
  if (/exam_questions|exam_question_choices|schema cache|does not exist/i.test(message)) {
    return `${message} — run supabase/migrations/003_admin_question_bank.sql in the Supabase SQL Editor.`;
  }

  if (/row-level security|permission denied/i.test(message)) {
    return `${message} — your account needs role 'admin' in the profiles table.`;
  }

  return message;
}
