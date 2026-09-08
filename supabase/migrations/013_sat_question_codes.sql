-- Structured identifiers and idempotent batch import for sourced questions.
-- Safe to re-run. Apply in Supabase SQL Editor before running the importer.

alter table public.exam_questions
  add column if not exists skill text,
  add column if not exists question_code text,
  add column if not exists source_name text,
  add column if not exists source_id text;

create unique index if not exists exam_questions_question_code_unique_idx
  on public.exam_questions (question_code)
  where question_code is not null;

create unique index if not exists exam_questions_source_identity_unique_idx
  on public.exam_questions (source_name, source_id)
  where source_name is not null and source_id is not null;

create index if not exists exam_questions_exam_skill_idx
  on public.exam_questions (exam_type, skill, question_number);

create or replace function public.import_exam_question_batch(payload jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  choice jsonb;
  imported_count integer := 0;
  saved_question_id uuid;
begin
  if jsonb_typeof(payload) <> 'array' then
    raise exception 'Import payload must be a JSON array';
  end if;

  for item in select value from jsonb_array_elements(payload)
  loop
    if coalesce(item ->> 'source_name', '') = ''
      or coalesce(item ->> 'source_id', '') = ''
      or coalesce(item ->> 'question_code', '') = '' then
      raise exception 'source_name, source_id, and question_code are required';
    end if;

    insert into public.exam_questions (
      exam_type,
      section,
      group_key,
      group_label,
      question_number,
      question_type,
      passage,
      question_text,
      image_url,
      correct_answer,
      accepted_answers,
      explanation,
      difficulty,
      status,
      skill,
      question_code,
      source_name,
      source_id
    )
    values (
      item ->> 'exam_type',
      nullif(item ->> 'section', ''),
      item ->> 'group_key',
      nullif(item ->> 'group_label', ''),
      (item ->> 'question_number')::integer,
      coalesce(nullif(item ->> 'question_type', ''), 'multiple-choice'),
      nullif(item ->> 'passage', ''),
      item ->> 'question_text',
      nullif(item ->> 'image_url', ''),
      item ->> 'correct_answer',
      coalesce(
        array(select jsonb_array_elements_text(item -> 'accepted_answers')),
        '{}'
      ),
      nullif(item ->> 'explanation', ''),
      nullif(item ->> 'difficulty', ''),
      coalesce(nullif(item ->> 'status', ''), 'published'),
      nullif(item ->> 'skill', ''),
      item ->> 'question_code',
      item ->> 'source_name',
      item ->> 'source_id'
    )
    on conflict (source_name, source_id)
      where source_name is not null and source_id is not null
    do update set
      exam_type = excluded.exam_type,
      section = excluded.section,
      group_key = excluded.group_key,
      group_label = excluded.group_label,
      question_number = excluded.question_number,
      question_type = excluded.question_type,
      passage = excluded.passage,
      question_text = excluded.question_text,
      image_url = excluded.image_url,
      correct_answer = excluded.correct_answer,
      accepted_answers = excluded.accepted_answers,
      explanation = excluded.explanation,
      difficulty = excluded.difficulty,
      status = excluded.status,
      skill = excluded.skill,
      question_code = excluded.question_code,
      updated_at = now()
    returning id into saved_question_id;

    delete from public.exam_question_choices
    where question_id = saved_question_id;

    for choice in
      select value
      from jsonb_array_elements(coalesce(item -> 'choices', '[]'::jsonb))
    loop
      insert into public.exam_question_choices (
        question_id,
        label,
        choice_text,
        is_correct,
        display_order
      )
      values (
        saved_question_id,
        choice ->> 'label',
        choice ->> 'choice_text',
        coalesce((choice ->> 'is_correct')::boolean, false),
        (choice ->> 'display_order')::smallint
      );
    end loop;

    imported_count := imported_count + 1;
  end loop;

  return imported_count;
end;
$$;

revoke all on function public.import_exam_question_batch(jsonb) from public;
revoke all on function public.import_exam_question_batch(jsonb) from anon;
revoke all on function public.import_exam_question_batch(jsonb) from authenticated;
grant execute on function public.import_exam_question_batch(jsonb) to service_role;

create or replace function public.get_question_import_stats(p_source_name text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'questions', (
      select count(*)
      from public.exam_questions q
      where q.source_name = p_source_name
    ),
    'choices', (
      select count(*)
      from public.exam_question_choices c
      join public.exam_questions q on q.id = c.question_id
      where q.source_name = p_source_name
    ),
    'visuals', (
      select count(*)
      from public.exam_questions q
      where q.source_name = p_source_name and q.image_url is not null
    ),
    'skills', coalesce((
      select jsonb_object_agg(skill, amount)
      from (
        select q.skill, count(*) as amount
        from public.exam_questions q
        where q.source_name = p_source_name
        group by q.skill
      ) skill_counts
    ), '{}'::jsonb),
    'difficulties', coalesce((
      select jsonb_object_agg(difficulty, amount)
      from (
        select q.difficulty, count(*) as amount
        from public.exam_questions q
        where q.source_name = p_source_name
        group by q.difficulty
      ) difficulty_counts
    ), '{}'::jsonb)
  );
$$;

revoke all on function public.get_question_import_stats(text) from public;
revoke all on function public.get_question_import_stats(text) from anon;
revoke all on function public.get_question_import_stats(text) from authenticated;
grant execute on function public.get_question_import_stats(text) to service_role;
