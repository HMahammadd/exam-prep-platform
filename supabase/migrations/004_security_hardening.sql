-- Security hardening for access control and exam integrity.
-- Run this in the Supabase SQL Editor after 001–003.
--
-- Model: the browser (roles `anon` / `authenticated`) may NEVER read answer
-- keys or write scores directly. All grading and score persistence happens in
-- Next.js Server Actions using the service-role key, which bypasses RLS.

-- ---------------------------------------------------------------------------
-- 1. Legacy practice questions: don't leak drafts or answer keys to clients
-- ---------------------------------------------------------------------------

-- Only published questions (or the author's own drafts) are readable.
drop policy if exists "Authenticated users can read questions" on public.questions;
create policy "Authenticated users can read questions"
  on public.questions for select
  to authenticated
  using (status = 'published' or auth.uid() = created_by);

-- Hide the answer key column from client roles. Server-side grading uses the
-- service role, which is unaffected by column-level revokes.
revoke select (is_correct) on public.answer_choices from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Exam integrity: scores/attempts are server-written only
-- ---------------------------------------------------------------------------

-- Practice attempts: clients could previously insert arbitrary is_correct rows.
drop policy if exists "Users can insert own question attempts" on public.question_attempts;
revoke insert on public.question_attempts from anon, authenticated;

-- SAT attempts + answers: clients could previously forge score / is_correct.
drop policy if exists "Users can insert own sat exam attempts" on public.sat_exam_attempts;
drop policy if exists "Users can insert own sat exam answers" on public.sat_exam_answers;
revoke insert on public.sat_exam_attempts from anon, authenticated;
revoke insert on public.sat_exam_answers from anon, authenticated;

-- (SELECT policies for own rows are intentionally kept so users can read their
--  own results.)

-- ---------------------------------------------------------------------------
-- 3. Unified question bank: answer keys are admin-only
-- ---------------------------------------------------------------------------
-- `exam_questions` / `exam_question_choices` carry correct_answer / is_correct.
-- Until a key-free public projection (view or RPC) exists, restrict reads to
-- admins so authenticated non-admins cannot query answer keys via PostgREST.

drop policy if exists "Read published questions" on public.exam_questions;
create policy "Admins read questions"
  on public.exam_questions for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Read choices of visible questions" on public.exam_question_choices;
create policy "Admins read choices"
  on public.exam_question_choices for select
  to authenticated
  using (public.is_admin());
