#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // Environment variables may already be supplied by the shell or CI.
}

const SOURCE_NAME = "keplerly-exams";
const BATCH_SIZE = 50;
const BUCKET = "question-images";

const args = process.argv.slice(2);
const execute = args.includes("--execute");
const inputArg = args.find((arg) => !arg.startsWith("--"));
const inputPath = resolve(
  inputArg ?? ".question-import/keplerly-exams/questions.json"
);
const inputDirectory = dirname(inputPath);
const questions = JSON.parse(await readFile(inputPath, "utf8"));

validateDataset(questions);
printLocalSummary(questions);

if (!execute) {
  console.log(
    "\nDry run passed. Re-run with --execute after applying migration 013."
  );
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error: preflightError } = await supabase.rpc(
  "get_question_import_stats",
  { p_source_name: SOURCE_NAME }
);
if (preflightError) {
  throw new Error(
    `Import preflight failed. Apply supabase/migrations/013_sat_question_codes.sql first: ${preflightError.message}`
  );
}

const visualQuestions = questions.filter((question) => question.asset_path);
let uploaded = 0;
for (const question of visualQuestions) {
  const bytes = await readFile(resolve(inputDirectory, question.asset_path));
  const storagePath = `sat/keplerly-exams/${question.source_id}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) {
    throw new Error(`Asset ${question.source_id}: ${error.message}`);
  }
  question.image_url = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    .data.publicUrl;
  uploaded += 1;
  if (uploaded % 10 === 0 || uploaded === visualQuestions.length) {
    console.log(`Uploaded ${uploaded}/${visualQuestions.length} visuals`);
  }
}

// Replace prior import for this source so renumbered codes cannot collide.
const { data: existingRows, error: existingError } = await supabase
  .from("exam_questions")
  .select("id")
  .eq("source_name", SOURCE_NAME);
if (existingError) {
  throw new Error(`Failed to load existing rows: ${existingError.message}`);
}
if (existingRows?.length) {
  const ids = existingRows.map((row) => row.id);
  const { error: deleteChoicesError } = await supabase
    .from("exam_question_choices")
    .delete()
    .in("question_id", ids);
  if (deleteChoicesError) {
    throw new Error(
      `Failed to clear existing choices: ${deleteChoicesError.message}`
    );
  }
  const { error: deleteQuestionsError } = await supabase
    .from("exam_questions")
    .delete()
    .eq("source_name", SOURCE_NAME);
  if (deleteQuestionsError) {
    throw new Error(
      `Failed to clear existing questions: ${deleteQuestionsError.message}`
    );
  }
  console.log(`Cleared ${ids.length} existing ${SOURCE_NAME} questions`);
}

let imported = 0;
for (let offset = 0; offset < questions.length; offset += BATCH_SIZE) {
  const payload = questions
    .slice(offset, offset + BATCH_SIZE)
    .map(toImportPayload);
  const { data, error } = await supabase.rpc("import_exam_question_batch", {
    payload,
  });
  if (error) {
    throw new Error(`Batch at offset ${offset}: ${error.message}`);
  }
  if (data !== payload.length) {
    throw new Error(
      `Batch at offset ${offset}: expected ${payload.length}, imported ${data}`
    );
  }
  imported += data;
  console.log(`Imported ${imported}/${questions.length} questions`);
}

const { data: stats, error: statsError } = await supabase.rpc(
  "get_question_import_stats",
  { p_source_name: SOURCE_NAME }
);
if (statsError) {
  throw new Error(`Verification failed: ${statsError.message}`);
}

if (Number(stats?.questions) !== questions.length) {
  throw new Error(
    `Remote question count is ${stats?.questions}, expected ${questions.length}`
  );
}
if (Number(stats?.choices) !== questions.length * 4) {
  throw new Error(`Remote choice count is ${stats?.choices}`);
}

console.log("\nRemote verification passed:");
console.log(JSON.stringify(stats, null, 2));

function validateDataset(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Expected a non-empty questions array");
  }

  const ids = new Set();
  const codes = new Set();

  for (const question of data) {
    if (question.source_name !== SOURCE_NAME) {
      throw new Error(`Unexpected source for ${question.source_id}`);
    }
    if (!/^[A-Z]{3}\d{5}E$/.test(question.question_code)) {
      throw new Error(`Invalid E-code: ${question.question_code}`);
    }
    if (ids.has(question.source_id) || codes.has(question.question_code)) {
      throw new Error(`Duplicate ID or code at ${question.source_id}`);
    }
    if (
      question.choices?.length !== 4 ||
      !question.choices.some(
        (choice) =>
          choice.label === question.correct_answer && choice.is_correct
      )
    ) {
      throw new Error(`Invalid choices for ${question.source_id}`);
    }
    if (question.status !== "published") {
      throw new Error(`Expected published status for ${question.source_id}`);
    }

    ids.add(question.source_id);
    codes.add(question.question_code);
  }
}

function toImportPayload(question) {
  const payload = { ...question };
  delete payload.asset_path;
  delete payload.source_pages;
  delete payload.exam_number;
  delete payload.module;
  return payload;
}

function printLocalSummary(data) {
  const skills = {};
  const difficulties = {};
  let visuals = 0;
  for (const question of data) {
    skills[question.skill] = (skills[question.skill] ?? 0) + 1;
    difficulties[question.difficulty] =
      (difficulties[question.difficulty] ?? 0) + 1;
    if (question.asset_path) {
      visuals += 1;
    }
  }

  console.log(`Validated ${data.length} local questions.`);
  console.log(`Visuals: ${visuals}`);
  console.log(
    `Codes: ${data[0].question_code} … ${data.at(-1).question_code}`
  );
  console.log("Skills:", skills);
  console.log("Difficulties:", difficulties);
}
