-- Stop storing Google given/family names on profiles.
-- full_name mirrors the chosen username only (or stays null until onboarding).
-- Safe to re-run.

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

-- Align existing rows: drop Google real names; mirror username when present.
update public.profiles
set
  full_name = username,
  updated_at = coalesce(updated_at, now())
where full_name is distinct from username;

-- Allow profile edits to keep full_name in sync with username.
revoke update on table public.profiles from authenticated;
grant update (username, full_name, avatar_id, updated_at) on table public.profiles to authenticated;
