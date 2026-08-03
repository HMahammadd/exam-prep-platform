-- Inbox: announcement type, send_id grouping, admin select/delete of sent items.
-- Safe to re-run where possible (IF NOT EXISTS / DROP IF EXISTS).

-- ---------------------------------------------------------------------------
-- 1. send_id — groups recipient copies from one admin send
-- ---------------------------------------------------------------------------

alter table public.inbox_items
  add column if not exists send_id uuid;

create index if not exists inbox_items_send_id_idx
  on public.inbox_items (send_id)
  where send_id is not null;

create index if not exists inbox_items_sender_created_idx
  on public.inbox_items (sender_profile_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Expand type check to include announcement
-- ---------------------------------------------------------------------------

alter table public.inbox_items
  drop constraint if exists inbox_items_type_check;

alter table public.inbox_items
  add constraint inbox_items_type_check
  check (type in ('friend_request', 'admin_message', 'news', 'announcement'));

-- ---------------------------------------------------------------------------
-- 3. RLS — admins can read and delete messages they sent
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can read sent inbox items" on public.inbox_items;
create policy "Admins can read sent inbox items"
  on public.inbox_items for select
  to authenticated
  using (
    public.is_admin()
    and sender_profile_id = auth.uid()
  );

drop policy if exists "Admins can delete sent inbox items" on public.inbox_items;
create policy "Admins can delete sent inbox items"
  on public.inbox_items for delete
  to authenticated
  using (
    public.is_admin()
    and sender_profile_id = auth.uid()
  );

-- Recipients still read own inbox; existing select policy remains.
-- Friend-request inserts and admin inserts remain unchanged.
