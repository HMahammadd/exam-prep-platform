-- Admin roles + unified question bank for every exam section (SAT, TOEFL, DIM, future exams).
-- Run this in the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- 1. Profiles + roles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Backfill profiles for users that signed up before this migration.
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- security definer so RLS on profiles cannot cause recursion inside policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Unified question bank
-- ---------------------------------------------------------------------------

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),

  -- 'sat' | 'toefl' | 'dim' | any future exam slug
  exam_type text not null,
  -- e.g. 'Reading and Writing', 'Math', 'Buraxılış'
  section text,
  -- stable slug of the set this question belongs to: 'exam-1', 'chapter-37'
  group_key text not null,
  -- human readable set name: 'SAT Practice Exam 1', 'Sınaq 10 - Qəbul'
  group_label text,

  question_number integer not null default 1,
  question_type text not null default 'multiple-choice'
    check (question_type in ('multiple-choice', 'open')),

  passage text,
  question_text text not null,
  image_url text,

  -- 'A'..'E' for multiple choice, free text for open questions
  correct_answer text not null,
  -- extra accepted spellings/formats for open questions
  accepted_answers text[] not null default '{}',

  explanation text,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  status text not null default 'published' check (status in ('draft', 'published')),

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exam_question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.exam_questions (id) on delete cascade,
  label text not null,
  choice_text text not null,
  is_correct boolean not null default false,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  unique (question_id, label)
);

create index if not exists exam_questions_type_group_idx
  on public.exam_questions (exam_type, group_key, question_number);

create index if not exists exam_questions_status_idx
  on public.exam_questions (status);

create index if not exists exam_question_choices_question_idx
  on public.exam_question_choices (question_id, display_order);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists exam_questions_touch_updated_at on public.exam_questions;
create trigger exam_questions_touch_updated_at
  before update on public.exam_questions
  for each row
  execute function public.touch_updated_at();

alter table public.exam_questions enable row level security;
alter table public.exam_question_choices enable row level security;

drop policy if exists "Read published questions" on public.exam_questions;
create policy "Read published questions"
  on public.exam_questions for select
  to authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage questions" on public.exam_questions;
create policy "Admins manage questions"
  on public.exam_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Read choices of visible questions" on public.exam_question_choices;
create policy "Read choices of visible questions"
  on public.exam_question_choices for select
  to authenticated
  using (
    exists (
      select 1
      from public.exam_questions q
      where q.id = question_id
        and (q.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins manage choices" on public.exam_question_choices;
create policy "Admins manage choices"
  on public.exam_question_choices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Storage bucket for question images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view question images" on storage.objects;
create policy "Public can view question images"
  on storage.objects for select
  using (bucket_id = 'question-images');

drop policy if exists "Admins upload question images" on storage.objects;
create policy "Admins upload question images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'question-images' and public.is_admin());

drop policy if exists "Admins update question images" on storage.objects;
create policy "Admins update question images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'question-images' and public.is_admin())
  with check (bucket_id = 'question-images' and public.is_admin());

drop policy if exists "Admins delete question images" on storage.objects;
create policy "Admins delete question images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'question-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Promote your account to admin (replace the email below, then run)
-- ---------------------------------------------------------------------------
-- update public.profiles set role = 'admin' where email = 'you@example.com';

