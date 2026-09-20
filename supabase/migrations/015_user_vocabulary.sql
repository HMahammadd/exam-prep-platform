-- Per-user vocabulary state. Word content (word, definition, translations)
-- is static and lives in code (src/lib/vocabulary-words.ts), not here — these
-- tables only hold what's actually per-user: starred status, notes, and the
-- student's translation-language / column-order preferences. word_id is a
-- stable slug matching VocabularyWord["id"], not a foreign key, since the
-- word list has no admin-authored table of its own.

create table if not exists public.user_vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null,
  starred boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create table if not exists public.user_vocabulary_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  translation_language text not null default 'AZE'
    check (translation_language in ('AZE', 'RUS')),
  column_order text[],
  updated_at timestamptz not null default now()
);

create index if not exists user_vocabulary_words_user_id_idx
  on public.user_vocabulary_words (user_id);

alter table public.user_vocabulary_words enable row level security;
alter table public.user_vocabulary_prefs enable row level security;

create policy "Users can read own vocabulary word state"
  on public.user_vocabulary_words for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own vocabulary word state"
  on public.user_vocabulary_words for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own vocabulary word state"
  on public.user_vocabulary_words for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own vocabulary prefs"
  on public.user_vocabulary_prefs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own vocabulary prefs"
  on public.user_vocabulary_prefs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own vocabulary prefs"
  on public.user_vocabulary_prefs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
