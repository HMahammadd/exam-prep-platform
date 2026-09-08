#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // Environment variables may already be supplied by the shell or CI.
}

const sourceName = "college-board-official-tests";
const expected = JSON.parse(
  await readFile(".question-import/official-tests/questions.json", "utf8")
);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase import credentials are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const remote = [];

for (let offset = 0; ; offset += 100) {
  const { data, error } = await supabase
    .from("exam_questions")
    .select(
      "source_id,question_code,skill,difficulty,question_text,correct_answer,explanation,image_url,exam_question_choices(label,choice_text,is_correct,display_order)"
    )
    .eq("source_name", sourceName)
    .order("source_id")
    .range(offset, offset + 99);
  if (error) {
    throw new Error(error.message);
  }
  remote.push(...data);
  if (data.length < 100) {
    break;
  }
}

if (remote.length !== expected.length) {
  throw new Error(`Expected ${expected.length} rows, received ${remote.length}`);
}

const expectedById = new Map(
  expected.map((question) => [question.source_id, question])
);
for (const question of remote) {
  const local = expectedById.get(question.source_id);
  if (!local) {
    throw new Error(`Unexpected remote source ID ${question.source_id}`);
  }

  for (const field of [
    "question_code",
    "skill",
    "difficulty",
    "question_text",
    "correct_answer",
    "explanation",
  ]) {
    if (question[field] !== local[field]) {
      throw new Error(`${question.source_id}: ${field} differs`);
    }
  }

  if (Boolean(question.image_url) !== Boolean(local.asset_path)) {
    throw new Error(`${question.source_id}: visual presence differs`);
  }

  const remoteChoices = [...question.exam_question_choices].sort(
    (a, b) => a.display_order - b.display_order
  );
  if (remoteChoices.length !== local.choices.length) {
    throw new Error(`${question.source_id}: choice count differs`);
  }
  for (let index = 0; index < local.choices.length; index += 1) {
    for (const field of [
      "label",
      "choice_text",
      "is_correct",
      "display_order",
    ]) {
      if (remoteChoices[index][field] !== local.choices[index][field]) {
        throw new Error(
          `${question.source_id}: choice ${index + 1} ${field} differs`
        );
      }
    }
  }
}

const visualUrls = remote
  .map((question) => question.image_url)
  .filter(Boolean);
for (let offset = 0; offset < visualUrls.length; offset += 10) {
  const batch = visualUrls.slice(offset, offset + 10);
  const responses = await Promise.all(
    batch.map((url) => fetch(url, { method: "HEAD" }))
  );
  const failed = responses.find((response) => !response.ok);
  if (failed) {
    throw new Error(`Visual check failed with HTTP ${failed.status}`);
  }
}

console.log(
  `Verified ${remote.length} exact rows, ${remote.length * 4} choices, and ${visualUrls.length} reachable visuals.`
);
