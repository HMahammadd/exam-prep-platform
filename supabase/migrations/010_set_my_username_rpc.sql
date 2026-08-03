-- Reliable first-time username set after Google/OAuth onboarding.
-- Single RPC: validate + uniqueness + update (bypasses column-grant edge cases).
-- Safe to re-run.

create or replace function public.set_my_username(desired text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed text := nullif(trim(desired), '');
  updated_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if trimmed is null
     or length(trimmed) < 3
     or length(trimmed) > 20
     or trimmed !~ '^[a-zA-Z0-9_]{3,20}$' then
    raise exception 'INVALID_USERNAME';
  end if;

  if exists (
    select 1
    from public.profiles p
    where p.username is not null
      and lower(p.username) = lower(trimmed)
      and p.id is distinct from auth.uid()
  ) then
    raise exception 'USERNAME_TAKEN';
  end if;

  update public.profiles
  set
    username = trimmed,
    full_name = trimmed,
    updated_at = now()
  where id = auth.uid()
  returning id into updated_id;

  if updated_id is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  return true;
end;
$$;

grant execute on function public.set_my_username(text) to authenticated;

-- Reaffirm column grants (idempotent with 009).
revoke update on table public.profiles from authenticated;
grant update (username, full_name, avatar_id, updated_at) on table public.profiles to authenticated;
