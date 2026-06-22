create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  question_text text not null,
  explanation text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.answer_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  label text not null,
  choice_text text not null,
  is_correct boolean not null default false,
  display_order smallint not null check (display_order between 0 and 3),
  created_at timestamptz not null default now(),
  unique (question_id, display_order),
  unique (question_id, label)
);

create index if not exists answer_choices_question_id_idx
  on public.answer_choices (question_id);

alter table public.questions enable row level security;
alter table public.answer_choices enable row level security;

create policy "Authenticated users can read questions"
  on public.questions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert questions"
  on public.questions for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Authenticated users can update questions"
  on public.questions for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Authenticated users can read answer choices"
  on public.answer_choices for select
  to authenticated
  using (true);

create policy "Authenticated users can insert answer choices"
  on public.answer_choices for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.questions q
      where q.id = question_id
        and q.created_by = auth.uid()
    )
  );
