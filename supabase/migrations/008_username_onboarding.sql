-- Username onboarding for OAuth (Google) users.
-- - New users without a chosen username get username = NULL
-- - Auto-generated user_<id> rows are cleared so they must pick a name
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. handle_new_user: only set username when provided in auth metadata
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_username text;
begin
  chosen_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  -- Ignore invalid metadata usernames (force onboarding instead of user_xxx)
  if chosen_username is not null
     and chosen_username !~ '^[a-zA-Z0-9_]{3,20}$' then
    chosen_username := null;
  end if;

  -- Do NOT copy Google/OAuth name or surname into profiles.
  -- full_name tracks the chosen username only.
  insert into public.profiles (id, email, full_name, username, avatar_id)
  values (
    new.id,
    new.email,
    chosen_username,
    chosen_username,
    'default'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Clear auto-generated usernames so those users complete onboarding
-- ---------------------------------------------------------------------------

update public.profiles
set username = null,
    updated_at = now()
where username ~* '^user_[0-9a-f]{8}$';
