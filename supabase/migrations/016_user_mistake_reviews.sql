-- Per-user review state for missed SAT questions ("Mistakes").
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent).
--
-- Question content (passage, choices, correct answer, explanation) stays where
-- it already lives — the hardcoded SAT_EXAM_*_QUESTIONS banks in
-- src/lib/sat-exam-*-questions.ts, resolved at read time via
-- src/lib/sat-questions.ts. This table holds only what's genuinely per-user
-- and didn't exist anywhere before: how far a student has gotten reviewing a
-- specific wrong answer from a specific attempt, why they think they missed
-- it, a private note, and what they answered on retry.
--
-- attempt_id + question_id (not just question_id) is the natural key: the
-- same question can be missed again on a retake, and each attempt's miss is
-- reviewed independently rather than collapsed into one row.
--
-- Same call as 015_user_vocabulary.sql: plain user-owned data with nothing to
-- forge (grading itself still happens only in sat_exam_answers, written by
-- the service role in actions.ts), so the browser writes these rows directly
-- under RLS rather than through a server-only path.

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------

create table if not exists public.user_mistake_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  attempt_id uuid not null references public.sat_exam_attempts (id) on delete cascade,
  question_id text not null,
  -- Single funnel: to_review -> reviewed -> corrected -> mastered. Never
  -- regresses automatically; "mastered" is only ever set by an explicit
  -- "Mark as mastered" action after a correct retry.
  status text not null default 'to_review'
    check (status in ('to_review', 'reviewed', 'corrected', 'mastered')),
  reason text
    check (reason in ('concept_gap', 'misread', 'time_pressure', 'rushed', 'other')),
  note text,
  retry_selected_answer text,
  retry_is_correct boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One row per user per missed question per attempt — repeated retries
  -- update the same row instead of piling up duplicates.
  unique (user_id, attempt_id, question_id)
);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security — a student sees and writes only their own rows
-- ---------------------------------------------------------------------------

alter table public.user_mistake_reviews enable row level security;

drop policy if exists "Users can read own mistake review state" on public.user_mistake_reviews;
create policy "Users can read own mistake review state"
  on public.user_mistake_reviews for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own mistake review state" on public.user_mistake_reviews;
create policy "Users can insert own mistake review state"
  on public.user_mistake_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own mistake review state" on public.user_mistake_reviews;
create policy "Users can update own mistake review state"
  on public.user_mistake_reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Grants — explicit list, no blanket table grant, no DELETE
-- ---------------------------------------------------------------------------
-- Same shape as 015_user_vocabulary.sql: nothing deletes these rows, a
-- question can always be re-reviewed, so there is deliberately no DELETE
-- policy and DELETE is not granted. anon gets nothing at all.

revoke all on table public.user_mistake_reviews from anon, authenticated;
grant select, insert, update on table public.user_mistake_reviews to authenticated;

create index if not exists user_mistake_reviews_user_idx
  on public.user_mistake_reviews (user_id);

-- Verify after applying — must report rowsecurity = true:
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public' and tablename = 'user_mistake_reviews';
--
-- And authenticated must hold SELECT/INSERT/UPDATE but never DELETE:
--   select table_name, grantee, privilege_type
--   from information_schema.table_privileges
--   where table_name = 'user_mistake_reviews'
--     and grantee in ('anon', 'authenticated')
--   order by grantee, privilege_type;
