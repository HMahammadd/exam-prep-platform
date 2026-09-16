"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  EXAM_SECTION_CONFIGS,
  QUESTION_CODE_NAMES,
  SAT_SKILL_CONFIGS,
  toGroupKey,
  type QuestionCodeName,
} from "@/lib/question-bank";
import { createClient } from "@/lib/supabaseServer";
import type {
  AdminActionResult,
  ExamQuestionChoiceRow,
  ExamQuestionRow,
  QuestionBankItem,
  QuestionBankDifficulty,
  QuestionBankStatus,
  QuestionBankType,
} from "@/types/question-bank";
import { mapQuestionRow } from "@/types/question-bank";

const BUCKET = "question-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const QUESTION_PAGE_SIZE = 20;

export type QuestionListFilters = {
  exam: string;
  section?: string;
  skill?: string;
  difficulty?: QuestionBankDifficulty;
  codeName?: QuestionCodeName;
  search?: string;
};

export type QuestionPageResult =
  | {
      success: true;
      questions: QuestionBankItem[];
      hasMore: boolean;
      total: number;
    }
  | { success: false; error: string };

type QuestionRowWithChoices = ExamQuestionRow & {
  exam_question_choices: ExamQuestionChoiceRow[] | null;
};

export type QuestionFormState = {
  status: "idle" | "success" | "error";
  message: string;
  questionId?: string;
};

type SubmittedChoice = {
  label: string;
  choiceText: string;
};

export async function loadQuestionPage(
  filters: QuestionListFilters,
  offset = 0
): Promise<QuestionPageResult> {
  await requireAdmin();

  const exam = filters.exam.trim().toLowerCase();
  const validExam = EXAM_SECTION_CONFIGS.some(
    (config) => config.slug === exam
  );

  if (!validExam) {
    return { success: false, error: "Choose a valid exam." };
  }

  if (
    filters.skill &&
    !SAT_SKILL_CONFIGS.some((skill) => skill.name === filters.skill)
  ) {
    return { success: false, error: "Choose a valid question type." };
  }

  if (
    filters.difficulty &&
    !["easy", "medium", "hard"].includes(filters.difficulty)
  ) {
    return { success: false, error: "Choose a valid difficulty." };
  }

  if (
    filters.codeName &&
    !QUESTION_CODE_NAMES.includes(filters.codeName)
  ) {
    return { success: false, error: "Choose a valid code name." };
  }

  const safeOffset =
    Number.isInteger(offset) && offset >= 0 ? Math.min(offset, 100_000) : 0;
  const supabase = await createClient();

  let query = supabase
    .from("exam_questions")
    .select("*, exam_question_choices(*)", { count: "exact" })
    .eq("exam_type", exam)
    .order("section", { ascending: true })
    .order("group_key", { ascending: true })
    .order("question_number", { ascending: true })
    .order("id", { ascending: true })
    .range(safeOffset, safeOffset + QUESTION_PAGE_SIZE - 1);

  if (filters.section) {
    query = query.eq("section", filters.section.slice(0, 200));
  }

  if (filters.skill) {
    query = query.eq("skill", filters.skill);
  }

  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters.codeName) {
    query = query.ilike("question_code", `%${filters.codeName}`);
  }

  const search = filters.search?.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40);
  if (search) {
    query = query.or(
      `question_code.ilike.${search}%,source_id.ilike.${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return { success: false, error: describeDbError(error.message) };
  }

  const rows = (data ?? []) as unknown as QuestionRowWithChoices[];
  const questions = rows.map((row) =>
    mapQuestionRow(row, row.exam_question_choices ?? [])
  );
  const total = count ?? safeOffset + questions.length;

  return {
    success: true,
    questions,
    hasMore: safeOffset + questions.length < total,
    total,
  };
}

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
  const questionCode = text(formData, "questionCode").toUpperCase();
  const skill = text(formData, "skill");
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

  if (!questionCode) {
    return { status: "error", message: "Question code is required." };
  }

  if (!/^[A-Z]{3}\d{5}[A-Z]$/.test(questionCode)) {
    return {
      status: "error",
      message:
        "Question code must use 3 letters, 5 digits, and a source letter (for example SVW00001C).",
    };
  }

  if (!skill) {
    return { status: "error", message: "Question type is required." };
  }

  if (
    examType === "sat" &&
    !SAT_SKILL_CONFIGS.some((config) => config.name === skill)
  ) {
    return { status: "error", message: "Choose a valid SAT question type." };
  }

  if (!["easy", "medium", "hard"].includes(difficultyInput)) {
    return { status: "error", message: "Difficulty is required." };
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
  const { data: duplicateCode } = await supabase
    .from("exam_questions")
    .select("id")
    .eq("question_code", questionCode)
    .maybeSingle();

  if (duplicateCode && duplicateCode.id !== questionId) {
    return {
      status: "error",
      message: `Question code ${questionCode} is already in use.`,
    };
  }

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
    question_code: questionCode,
    skill,
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
  if (
    /duplicate key.*question_code|exam_questions_question_code_unique_idx/i.test(
      message
    )
  ) {
    return "That question code is already in use.";
  }

  if (/skill|question_code|source_name|source_id/i.test(message)) {
    return `${message} — run supabase/migrations/013_sat_question_codes.sql in the Supabase SQL Editor.`;
  }

  if (/exam_questions|exam_question_choices|schema cache|does not exist/i.test(message)) {
    return `${message} — run supabase/migrations/003_admin_question_bank.sql in the Supabase SQL Editor.`;
  }

  if (/row-level security|permission denied/i.test(message)) {
    return `${message} — your account needs role 'admin' in the profiles table.`;
  }

  return message;
}
