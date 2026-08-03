-- Unify nickname into a single editable username.
-- Rules: 3–20 chars, [a-zA-Z0-9_], case-insensitive unique.
-- Safe to re-run where possible (IF EXISTS / DROP IF EXISTS).

-- ---------------------------------------------------------------------------
-- 1. Ensure username column + format constraint
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

-- ---------------------------------------------------------------------------
-- 2. Backfill username from nickname (prefer live nickname handle)
-- ---------------------------------------------------------------------------

-- Temporarily drop unique index so we can reassign without mid-migration conflicts
drop index if exists public.profiles_username_lower_idx;

do $$
declare
  has_nickname boolean;
  r record;
  candidate text;
  base text;
  suffix int;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'nickname'
  ) into has_nickname;

  if has_nickname then
    for r in
      select id, username, nickname
      from public.profiles
    loop
      candidate := null;

      if r.nickname is not null and r.nickname ~ '^[a-zA-Z0-9_]{3,20}$' then
        candidate := r.nickname;
      elsif r.username is not null and r.username ~ '^[a-zA-Z0-9_]{3,20}$' then
        candidate := r.username;
      elsif r.nickname is not null then
        base := left(
          regexp_replace(replace(r.nickname, '.', '_'), '[^a-zA-Z0-9_]', '', 'g'),
          20
        );
        if length(base) >= 3 and base ~ '^[a-zA-Z0-9_]{3,20}$' then
          candidate := base;
        end if;
      end if;

      if candidate is null then
        candidate := 'user_' || left(r.id::text, 8);
      end if;

      base := candidate;
      suffix := 0;
      while exists (
        select 1
        from public.profiles p
        where p.id is distinct from r.id
          and p.username is not null
          and lower(p.username) = lower(candidate)
      ) loop
        suffix := suffix + 1;
        candidate := left(base, greatest(1, 20 - length(suffix::text) - 1))
          || '_' || suffix::text;
      end loop;

      update public.profiles
      set username = candidate
      where id = r.id;
    end loop;
  else
    -- No nickname column: fill any missing/invalid usernames
    for r in
      select id, username
      from public.profiles
      where username is null
         or username !~ '^[a-zA-Z0-9_]{3,20}$'
    loop
      candidate := 'user_' || left(r.id::text, 8);
      base := candidate;
      suffix := 0;
      while exists (
        select 1
        from public.profiles p
        where p.id is distinct from r.id
          and p.username is not null
          and lower(p.username) = lower(candidate)
      ) loop
        suffix := suffix + 1;
        candidate := left(base, greatest(1, 20 - length(suffix::text) - 1))
          || '_' || suffix::text;
      end loop;

      update public.profiles
      set username = candidate
      where id = r.id;
    end loop;
  end if;
end;
$$;

create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

-- ---------------------------------------------------------------------------
-- 3. Drop nickname column + related objects
-- ---------------------------------------------------------------------------

alter table public.profiles
  drop constraint if exists profiles_nickname_format;

drop index if exists public.profiles_nickname_lower_idx;

alter table public.profiles
  drop column if exists nickname;

-- ---------------------------------------------------------------------------
-- 4. handle_new_user: username only (+ avatar_id)
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
-- 5. Availability check (signup + rename; excludes self when authenticated)
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
    and length(trim(desired)) <= 20
    and trim(desired) ~ '^[a-zA-Z0-9_]{3,20}$'
    and not exists (
      select 1
      from public.profiles p
      where p.username is not null
        and lower(p.username) = lower(trim(desired))
        and p.id is distinct from auth.uid()
    );
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- Drop nickname RPCs
drop function if exists public.check_nickname_available(text);
drop function if exists public.search_users_by_nickname(text, int);

-- ---------------------------------------------------------------------------
-- 6. Search + public profiles by username
-- ---------------------------------------------------------------------------

create or replace function public.search_users_by_username(
  query text,
  max_results int default 20
)
returns table (
  id uuid,
  username text,
  avatar_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.username,
    p.avatar_id
  from public.profiles p
  where p.username is not null
    and p.id is distinct from auth.uid()
    and p.username ilike '%' || trim(query) || '%'
  order by p.username
  limit greatest(1, least(coalesce(max_results, 20), 50));
$$;

drop function if exists public.get_public_profiles(uuid[]);

create or replace function public.get_public_profiles(ids uuid[])
returns table (
  id uuid,
  username text,
  avatar_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.username, p.avatar_id
  from public.profiles p
  where p.id = any (ids);
$$;

grant execute on function public.search_users_by_username(text, int) to authenticated;
grant execute on function public.get_public_profiles(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Column privileges: users may update username + avatar
-- ---------------------------------------------------------------------------

drop policy if exists "Users can update own nickname and avatar" on public.profiles;
drop policy if exists "Users can update own username and avatar" on public.profiles;
create policy "Users can update own username and avatar"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

revoke update on table public.profiles from authenticated;
grant update (username, full_name, avatar_id, updated_at) on table public.profiles to authenticated;
