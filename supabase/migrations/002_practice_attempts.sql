create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam text not null,
  topic text not null,
  question_count smallint not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_choice_id uuid not null references public.answer_choices (id),
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create index if not exists practice_sessions_user_id_idx
  on public.practice_sessions (user_id);

create index if not exists question_attempts_session_id_idx
  on public.question_attempts (session_id);

alter table public.practice_sessions enable row level security;
alter table public.question_attempts enable row level security;

create policy "Users can read own practice sessions"
  on public.practice_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own practice sessions"
  on public.practice_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own practice sessions"
  on public.practice_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read own question attempts"
  on public.question_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own question attempts"
  on public.question_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);
