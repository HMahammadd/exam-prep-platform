#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // Environment variables may already be supplied by the shell or CI.
}

const SOURCE_NAME = "college-board-official-tests";
const EXPECTED_QUESTIONS = 1_688;
const EXPECTED_VISUALS = 127;
const EXPECTED_SKILLS = {
  "Words in Context": 241,
  Transitions: 173,
  Inferences: 124,
  "Cross-Text Connections": 58,
  "Command of Evidence": 258,
  Boundaries: 190,
  "Central Ideas and Details": 125,
  "Form, Structure, and Sense": 189,
  "Text Structure and Purpose": 138,
  "Rhetorical Synthesis": 192,
};
const EXPECTED_DIFFICULTIES = { easy: 593, medium: 562, hard: 533 };
const BATCH_SIZE = 50;
const BUCKET = "question-images";

const args = process.argv.slice(2);
const execute = args.includes("--execute");
const inputArg = args.find((arg) => !arg.startsWith("--"));
const inputPath = resolve(
  inputArg ?? ".question-import/official-tests/questions.json"
);
const inputDirectory = dirname(inputPath);
const questions = JSON.parse(await readFile(inputPath, "utf8"));

validateDataset(questions);
printLocalSummary(questions);

if (!execute) {
  console.log("\nDry run passed. Re-run with --execute after applying migration 013.");
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

let uploaded = 0;
for (const question of questions) {
  if (!question.asset_path) {
    continue;
  }

  const bytes = await readFile(resolve(inputDirectory, question.asset_path));
  const storagePath = `sat/official-tests/${question.source_id}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
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
  if (uploaded % 25 === 0 || uploaded === EXPECTED_VISUALS) {
    console.log(`Uploaded ${uploaded}/${EXPECTED_VISUALS} visuals`);
  }
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

validateRemoteStats(stats);
console.log("\nRemote verification passed:");
console.log(JSON.stringify(stats, null, 2));

function validateDataset(data) {
  if (!Array.isArray(data) || data.length !== EXPECTED_QUESTIONS) {
    throw new Error(
      `Expected ${EXPECTED_QUESTIONS} questions, received ${data?.length ?? 0}`
    );
  }

  const ids = new Set();
  const codes = new Set();
  const skills = {};
  const difficulties = {};
  let visuals = 0;

  for (const question of data) {
    if (question.source_name !== SOURCE_NAME) {
      throw new Error(`Unexpected source for ${question.source_id}`);
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

    ids.add(question.source_id);
    codes.add(question.question_code);
    skills[question.skill] = (skills[question.skill] ?? 0) + 1;
    difficulties[question.difficulty] =
      (difficulties[question.difficulty] ?? 0) + 1;
    visuals += question.asset_path ? 1 : 0;
  }

  assertCounts("skills", skills, EXPECTED_SKILLS);
  assertCounts("difficulties", difficulties, EXPECTED_DIFFICULTIES);
  if (visuals !== EXPECTED_VISUALS) {
    throw new Error(`Expected ${EXPECTED_VISUALS} visuals, received ${visuals}`);
  }
}

function toImportPayload(question) {
  const payload = { ...question };
  delete payload.asset_path;
  delete payload.source_pages;
  return payload;
}

function validateRemoteStats(stats) {
  if (Number(stats?.questions) !== EXPECTED_QUESTIONS) {
    throw new Error(`Remote question count is ${stats?.questions}`);
  }
  if (Number(stats?.choices) !== EXPECTED_QUESTIONS * 4) {
    throw new Error(`Remote choice count is ${stats?.choices}`);
  }
  if (Number(stats?.visuals) !== EXPECTED_VISUALS) {
    throw new Error(`Remote visual count is ${stats?.visuals}`);
  }
  assertCounts("remote skills", stats.skills, EXPECTED_SKILLS);
  assertCounts(
    "remote difficulties",
    stats.difficulties,
    EXPECTED_DIFFICULTIES
  );
}

function assertCounts(label, actual, expected) {
  for (const [key, amount] of Object.entries(expected)) {
    if (Number(actual?.[key]) !== amount) {
      throw new Error(
        `${label}: expected ${key}=${amount}, received ${actual?.[key]}`
      );
    }
  }
}

function printLocalSummary(data) {
  console.log(`Validated ${data.length} local questions.`);
  console.log(
    `Codes: ${data[0].question_code} … ${data.at(-1).question_code}; ` +
      `visuals: ${data.filter((question) => question.asset_path).length}`
  );
}
