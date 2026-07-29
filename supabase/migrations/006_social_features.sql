-- Social features: nicknames, avatars, friends, announcements, inbox.
-- Safe to re-run where possible (IF NOT EXISTS / DROP IF EXISTS).

-- ---------------------------------------------------------------------------
-- 1. Profiles: nickname, avatar_id, updated_at, role
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists nickname text;

alter table public.profiles
  add column if not exists avatar_id text default 'default';

alter table public.profiles
  add column if not exists updated_at timestamptz default now();

alter table public.profiles
  add column if not exists role text default 'user';

-- Role check (idempotent)
alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin'));

-- Nickname format
alter table public.profiles
  drop constraint if exists profiles_nickname_format;

alter table public.profiles
  add constraint profiles_nickname_format
  check (
    nickname is null
    or nickname ~ '^[a-zA-Z0-9_.]{3,24}$'
  );

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles (lower(nickname))
  where nickname is not null;

-- ---------------------------------------------------------------------------
-- 2. handle_new_user: also set nickname + avatar_id
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_username text;
  chosen_nickname text;
begin
  chosen_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  chosen_nickname := coalesce(
    chosen_username,
    'user_' || left(new.id::text, 8)
  );

  insert into public.profiles (id, email, full_name, username, nickname, avatar_id)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      chosen_username
    ),
    chosen_username,
    chosen_nickname,
    'default'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Backfill existing profiles
-- ---------------------------------------------------------------------------

update public.profiles
set nickname = username
where username is not null
  and nickname is null;

update public.profiles
set nickname = 'user_' || left(id::text, 8)
where nickname is null;

update public.profiles
set avatar_id = 'default'
where avatar_id is null;

-- ---------------------------------------------------------------------------
-- 4. friend_requests
-- ---------------------------------------------------------------------------

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id != receiver_id)
);

create unique index if not exists friend_requests_pending_pair_idx
  on public.friend_requests (
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id)
  )
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- 5. friendships
-- ---------------------------------------------------------------------------

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id_1 uuid not null references public.profiles (id) on delete cascade,
  user_id_2 uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_id_1 < user_id_2),
  unique (user_id_1, user_id_2)
);

-- ---------------------------------------------------------------------------
-- 6. announcements
-- ---------------------------------------------------------------------------

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid references public.profiles (id),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 7. inbox_items
-- ---------------------------------------------------------------------------

create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('friend_request', 'admin_message', 'news')),
  title text not null,
  content text,
  related_request_id uuid references public.friend_requests (id) on delete set null,
  sender_profile_id uuid references public.profiles (id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. accept_friend_request
-- ---------------------------------------------------------------------------

create or replace function public.accept_friend_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.friend_requests%rowtype;
  uid1 uuid;
  uid2 uuid;
begin
  select * into req
  from public.friend_requests
  where id = request_id
  for update;

  if not found then
    raise exception 'Friend request not found';
  end if;

  if req.receiver_id is distinct from auth.uid() then
    raise exception 'Only the receiver can accept this friend request';
  end if;

  if req.status is distinct from 'pending' then
    raise exception 'Friend request is not pending';
  end if;

  if req.sender_id is not distinct from req.receiver_id then
    raise exception 'Invalid friend request participants';
  end if;

  -- Parties are immutable (enforced by trigger); friendship uses locked row values.

  update public.friend_requests
  set
    status = 'accepted',
    responded_at = now()
  where id = request_id;

  if req.sender_id < req.receiver_id then
    uid1 := req.sender_id;
    uid2 := req.receiver_id;
  else
    uid1 := req.receiver_id;
    uid2 := req.sender_id;
  end if;

  insert into public.friendships (user_id_1, user_id_2)
  values (uid1, uid2)
  on conflict (user_id_1, user_id_2) do nothing;

  update public.inbox_items
  set is_read = true
  where related_request_id = request_id
    and recipient_id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. check_nickname_available
-- ---------------------------------------------------------------------------

create or replace function public.check_nickname_available(desired text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    desired is not null
    and length(trim(desired)) >= 3
    and length(trim(desired)) <= 24
    and trim(desired) ~ '^[a-zA-Z0-9_.]{3,24}$'
    and not exists (
      select 1
      from public.profiles p
      where p.nickname is not null
        and lower(p.nickname) = lower(trim(desired))
        and p.id is distinct from auth.uid()
    );
$$;

-- ---------------------------------------------------------------------------
-- 10. search_users_by_nickname
-- ---------------------------------------------------------------------------

create or replace function public.search_users_by_nickname(
  query text,
  max_results int default 20
)
returns table (
  id uuid,
  nickname text,
  avatar_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.nickname,
    p.avatar_id
  from public.profiles p
  where p.nickname is not null
    and p.id is distinct from auth.uid()
    and p.nickname ilike '%' || trim(query) || '%'
  order by p.nickname
  limit greatest(1, least(coalesce(max_results, 20), 50));
$$;

-- ---------------------------------------------------------------------------
-- 11. RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.announcements enable row level security;
alter table public.inbox_items enable row level security;

-- Public profile lookup (id / nickname / avatar only — never email/role)
create or replace function public.get_public_profiles(ids uuid[])
returns table (
  id uuid,
  nickname text,
  avatar_id text
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.nickname, p.avatar_id
  from public.profiles p
  where p.id = any (ids);
$$;

-- profiles -----------------------------------------------------------------
-- Own row only for full profile (includes email). Cross-user reads go through
-- get_public_profiles / search_users_by_nickname — never a blanket SELECT.

drop policy if exists "Authenticated can read public profile fields" on public.profiles;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update own nickname and avatar" on public.profiles;
create policy "Users can update own nickname and avatar"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Prevent role / email / id tampering via column privileges
revoke update on table public.profiles from authenticated;
grant update (nickname, avatar_id, updated_at) on table public.profiles to authenticated;

-- friend_requests ----------------------------------------------------------

drop policy if exists "Users can send friend requests" on public.friend_requests;
create policy "Users can send friend requests"
  on public.friend_requests for insert
  to authenticated
  with check (sender_id = auth.uid() and sender_id is distinct from receiver_id);

drop policy if exists "Users can view own friend requests" on public.friend_requests;
create policy "Users can view own friend requests"
  on public.friend_requests for select
  to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "Receivers can respond to pending requests" on public.friend_requests;
create policy "Receivers can respond to pending requests"
  on public.friend_requests for update
  to authenticated
  using (receiver_id = auth.uid() and status = 'pending')
  with check (
    receiver_id = auth.uid()
    and status in ('accepted', 'declined')
  );

-- Lock sender_id / receiver_id so receivers cannot force friendships
create or replace function public.friend_requests_lock_parties()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.sender_id is distinct from old.sender_id
     or new.receiver_id is distinct from old.receiver_id then
    raise exception 'Cannot change friend request participants';
  end if;
  return new;
end;
$$;

drop trigger if exists friend_requests_lock_parties on public.friend_requests;
create trigger friend_requests_lock_parties
  before update on public.friend_requests
  for each row
  execute function public.friend_requests_lock_parties();

revoke update on table public.friend_requests from authenticated;
grant update (status, responded_at) on table public.friend_requests to authenticated;

-- friendships --------------------------------------------------------------

drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view own friendships"
  on public.friendships for select
  to authenticated
  using (user_id_1 = auth.uid() or user_id_2 = auth.uid());

drop policy if exists "Users can delete own friendships" on public.friendships;
create policy "Users can delete own friendships"
  on public.friendships for delete
  to authenticated
  using (user_id_1 = auth.uid() or user_id_2 = auth.uid());

-- announcements ------------------------------------------------------------

drop policy if exists "Authenticated can read announcements" on public.announcements;
create policy "Authenticated can read announcements"
  on public.announcements for select
  to authenticated
  using (true);

drop policy if exists "Admins can insert announcements" on public.announcements;
create policy "Admins can insert announcements"
  on public.announcements for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update announcements" on public.announcements;
create policy "Admins can update announcements"
  on public.announcements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete announcements" on public.announcements;
create policy "Admins can delete announcements"
  on public.announcements for delete
  to authenticated
  using (public.is_admin());

-- inbox_items --------------------------------------------------------------

drop policy if exists "Users can read own inbox" on public.inbox_items;
create policy "Users can read own inbox"
  on public.inbox_items for select
  to authenticated
  using (recipient_id = auth.uid());

drop policy if exists "Users can mark inbox items read" on public.inbox_items;
create policy "Users can mark inbox items read"
  on public.inbox_items for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

revoke update on table public.inbox_items from authenticated;
grant update (is_read) on table public.inbox_items to authenticated;

drop policy if exists "Admins can insert inbox items" on public.inbox_items;
create policy "Admins can insert inbox items"
  on public.inbox_items for insert
  to authenticated
  with check (public.is_admin());

-- Users may notify a receiver about a friend request they just sent
drop policy if exists "Users can insert friend request inbox items" on public.inbox_items;
create policy "Users can insert friend request inbox items"
  on public.inbox_items for insert
  to authenticated
  with check (
    type = 'friend_request'
    and sender_profile_id = auth.uid()
    and recipient_id is distinct from auth.uid()
    and related_request_id is not null
    and exists (
      select 1
      from public.friend_requests fr
      where fr.id = related_request_id
        and fr.sender_id = auth.uid()
        and fr.receiver_id = recipient_id
        and fr.status = 'pending'
    )
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant execute on function public.accept_friend_request(uuid) to authenticated;
grant execute on function public.check_nickname_available(text) to authenticated;
grant execute on function public.search_users_by_nickname(text, int) to authenticated;
grant execute on function public.get_public_profiles(uuid[]) to authenticated;
