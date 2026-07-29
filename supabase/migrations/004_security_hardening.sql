-- Security hardening for access control and exam integrity.
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent). Skips sections when a table does not exist yet.
--
-- Model: the browser (roles `anon` / `authenticated`) may NEVER read answer
-- keys or write scores directly. All grading and score persistence happens in
-- Next.js Server Actions using the service-role key, which bypasses RLS.
--
-- After this runs, set SUPABASE_SERVICE_ROLE_KEY in .env.local and on Vercel,
-- then restart the app. Without that key, SAT/practice submit will fail once
-- client inserts are revoked.

-- ---------------------------------------------------------------------------
-- 1. Legacy practice questions: don't leak drafts or answer keys to clients
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.questions') is not null then
    drop policy if exists "Authenticated users can read questions" on public.questions;
    create policy "Authenticated users can read questions"
      on public.questions for select
      to authenticated
      using (status = 'published' or auth.uid() = created_by);
  end if;

  if to_regclass('public.answer_choices') is not null then
    -- Hide the answer key column from client roles. Service role is unaffected.
    execute 'revoke select (is_correct) on public.answer_choices from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Exam integrity: scores/attempts are server-written only
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.question_attempts') is not null then
    drop policy if exists "Users can insert own question attempts" on public.question_attempts;
    execute 'revoke insert on public.question_attempts from anon, authenticated';
  end if;

  if to_regclass('public.sat_exam_attempts') is not null then
    drop policy if exists "Users can insert own sat exam attempts" on public.sat_exam_attempts;
    execute 'revoke insert on public.sat_exam_attempts from anon, authenticated';
  end if;

  if to_regclass('public.sat_exam_answers') is not null then
    drop policy if exists "Users can insert own sat exam answers" on public.sat_exam_answers;
    execute 'revoke insert on public.sat_exam_answers from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Unified question bank: answer keys are admin-only
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.exam_questions') is not null then
    drop policy if exists "Read published questions" on public.exam_questions;
    drop policy if exists "Admins read questions" on public.exam_questions;
    create policy "Admins read questions"
      on public.exam_questions for select
      to authenticated
      using (public.is_admin());
  end if;

  if to_regclass('public.exam_question_choices') is not null then
    drop policy if exists "Read choices of visible questions" on public.exam_question_choices;
    drop policy if exists "Admins read choices" on public.exam_question_choices;
    create policy "Admins read choices"
      on public.exam_question_choices for select
      to authenticated
      using (public.is_admin());
  end if;
end $$;
