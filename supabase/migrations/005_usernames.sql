-- Usernames for profiles. Paste into Supabase SQL Editor (safe to re-run).
-- Signup stores username in auth.users raw_user_meta_data; this trigger copies it.

-- ---------------------------------------------------------------------------
-- 1. Column + uniqueness (case-insensitive) + format
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (
    username is null
    or username ~ '^[a-zA-Z0-9_]{3,20}$'
  );

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

-- ---------------------------------------------------------------------------
-- 2. Copy username from auth metadata on signup
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

  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      chosen_username
    ),
    chosen_username
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Public availability check (for signup form)
-- ---------------------------------------------------------------------------

create or replace function public.is_username_available(desired text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    desired is not null
    and length(trim(desired)) >= 3
    and not exists (
      select 1
      from public.profiles p
      where p.username is not null
        and lower(p.username) = lower(trim(desired))
    );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;
