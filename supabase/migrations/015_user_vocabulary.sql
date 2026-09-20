-- Per-user vocabulary state.
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent).
--
-- Word content (word, definition, translations) is static and lives in code
-- (src/lib/vocabulary-words.ts), not here — the same call as SAT_PRACTICE_EXAMS
-- and SAT_LESSONS: there is no admin-authoring UI for that content, so a table
-- would buy nothing today. These two tables hold only what is genuinely
-- per-user: starred status, private notes, and the student's
-- translation-language / column-order preferences.
--
-- word_id is the stable slug from VocabularyWord["id"] ('abhor', 'abide', …),
-- never the row number the table happens to display, and deliberately not a
-- foreign key while the word list has no table of its own. If "Our Words" ever
-- moves into Postgres, these rows keep pointing at the same slugs.
--
-- Unlike sat_exam_attempts, this is plain user-owned data with nothing to
-- forge, so the browser roles write it directly under RLS (the
-- 002_practice_attempts.sql model) rather than through the service role.

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.user_vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null,
  starred boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One row per user per word: one editable note and one star, never a pile of
  -- duplicate relationships for the same word.
  unique (user_id, word_id)
);

create table if not exists public.user_vocabulary_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  translation_language text not null default 'AZE'
    check (translation_language in ('AZE', 'RUS')),
  column_order text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Re-running over an earlier copy of this file picks up the added columns.
alter table public.user_vocabulary_words
  add column if not exists created_at timestamptz not null default now();
alter table public.user_vocabulary_prefs
  add column if not exists created_at timestamptz not null default now();

-- The unique (user_id, word_id) constraint already indexes user_id as its
-- leading column, and `where user_id = auth.uid()` is the only filter the app
-- issues. A standalone user_id index would add write cost for nothing, so an
-- earlier draft's copy is removed here.
drop index if exists public.user_vocabulary_words_user_id_idx;

-- ---------------------------------------------------------------------------
-- 2. Row Level Security — a student sees and writes only their own rows
-- ---------------------------------------------------------------------------

alter table public.user_vocabulary_words enable row level security;
alter table public.user_vocabulary_prefs enable row level security;

drop policy if exists "Users can read own vocabulary word state" on public.user_vocabulary_words;
create policy "Users can read own vocabulary word state"
  on public.user_vocabulary_words for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own vocabulary word state" on public.user_vocabulary_words;
create policy "Users can insert own vocabulary word state"
  on public.user_vocabulary_words for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own vocabulary word state" on public.user_vocabulary_words;
create policy "Users can update own vocabulary word state"
  on public.user_vocabulary_words for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own vocabulary prefs" on public.user_vocabulary_prefs;
create policy "Users can read own vocabulary prefs"
  on public.user_vocabulary_prefs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own vocabulary prefs" on public.user_vocabulary_prefs;
create policy "Users can insert own vocabulary prefs"
  on public.user_vocabulary_prefs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own vocabulary prefs" on public.user_vocabulary_prefs;
create policy "Users can update own vocabulary prefs"
  on public.user_vocabulary_prefs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. Grants — replace Supabase's blanket table grant with an explicit list
-- ---------------------------------------------------------------------------
-- Same shape as 014_answer_key_column_grants.sql: drop the table-wide grant
-- first, then hand back only what the app actually performs. Nothing deletes
-- these rows — un-starring writes starred = false and clearing a note writes
-- null, each leaving the other column intact — so there is deliberately no
-- DELETE policy, and revoking DELETE keeps that an explicit decision rather
-- than an oversight. anon gets nothing at all.

revoke all on table public.user_vocabulary_words from anon, authenticated;
revoke all on table public.user_vocabulary_prefs from anon, authenticated;

grant select, insert, update on table public.user_vocabulary_words to authenticated;
grant select, insert, update on table public.user_vocabulary_prefs to authenticated;

-- Verify after applying — both tables must report rowsecurity = true:
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--     and tablename in ('user_vocabulary_words', 'user_vocabulary_prefs');
--
-- And authenticated must hold SELECT/INSERT/UPDATE but never DELETE:
--   select table_name, grantee, privilege_type
--   from information_schema.table_privileges
--   where table_name in ('user_vocabulary_words', 'user_vocabulary_prefs')
--     and grantee in ('anon', 'authenticated')
--   order by table_name, grantee, privilege_type;
