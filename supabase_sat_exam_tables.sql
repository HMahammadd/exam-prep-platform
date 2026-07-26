-- Run this in the Supabase SQL Editor before using SAT practice exams.

create table if not exists public.sat_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id text not null,
  score integer not null,
  total_questions integer not null,
  percentage numeric(5, 2) not null,
  time_spent_seconds integer not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sat_exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.sat_exam_attempts (id) on delete cascade,
  question_id text not null,
  selected_answer text,
  correct_answer text not null,
  is_correct boolean not null,
  marked_for_review boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists sat_exam_attempts_user_exam_idx
  on public.sat_exam_attempts (user_id, exam_id);

create index if not exists sat_exam_attempts_user_completed_idx
  on public.sat_exam_attempts (user_id, completed_at desc);

create index if not exists sat_exam_answers_attempt_id_idx
  on public.sat_exam_answers (attempt_id);

alter table public.sat_exam_attempts enable row level security;
alter table public.sat_exam_answers enable row level security;

create policy "Users can read own sat exam attempts"
  on public.sat_exam_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own sat exam attempts"
  on public.sat_exam_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own sat exam answers"
  on public.sat_exam_answers for select
  to authenticated
  using (
    exists (
      select 1
      from public.sat_exam_attempts a
      where a.id = attempt_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can insert own sat exam answers"
  on public.sat_exam_answers for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sat_exam_attempts a
      where a.id = attempt_id
        and a.user_id = auth.uid()
    )
  );
