-- Close the answer-key leak on public.answer_choices.
-- Safe to re-run. Apply in Supabase SQL Editor.
--
-- 004_security_hardening.sql tried to hide the key with:
--     revoke select (is_correct) on public.answer_choices from anon, authenticated;
-- That is a no-op. Supabase grants table-level SELECT on public tables to the
-- anon/authenticated roles, and Postgres will not carve a single column out of
-- a table-wide grant — it only logs "no privileges could be revoked" and the
-- role keeps SELECT on every column, is_correct included. Any signed-in student
-- could read the key before answering:
--     select question_id, label, is_correct from answer_choices;
--
-- The fix is the pattern already used for profiles in 009/010: drop the
-- table-level grant first, then grant back only the safe columns.

do $$
begin
  if to_regclass('public.answer_choices') is null then
    return;
  end if;

  -- anon has no business reading choices at all.
  revoke select on table public.answer_choices from anon;

  -- Replace the table-wide grant with an explicit safe-column list.
  -- is_correct is deliberately absent; grading runs server-side under the
  -- service role, which is unaffected by these grants.
  revoke select on table public.answer_choices from authenticated;
  grant select (id, question_id, label, choice_text, display_order, created_at)
    on table public.answer_choices to authenticated;
end $$;

-- Same treatment for the newer exam_question_choices table, so the key stays
-- hidden even if its admin-only SELECT policy is ever loosened.
do $$
begin
  if to_regclass('public.exam_question_choices') is null then
    return;
  end if;

  revoke select on table public.exam_question_choices from anon;
end $$;

-- Verify after applying — is_correct must NOT appear for authenticated:
--   select grantee, column_name
--   from information_schema.column_privileges
--   where table_name = 'answer_choices'
--     and privilege_type = 'SELECT'
--     and grantee in ('anon', 'authenticated')
--   order by grantee, column_name;
