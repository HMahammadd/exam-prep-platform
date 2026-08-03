"use server";

import { createClient } from "@/lib/supabaseServer";

export type InboxItemType =
  | "friend_request"
  | "admin_message"
  | "news"
  | "announcement";

export type InboxItem = {
  id: string;
  recipient_id: string;
  type: InboxItemType;
  title: string;
  content: string | null;
  related_request_id: string | null;
  sender_profile_id: string | null;
  send_id: string | null;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    id: string;
    username: string;
    avatar_id: string;
  } | null;
  related_request?: {
    id: string;
    status: string;
  } | null;
};

export type InboxFilter = Exclude<InboxItemType, never>;

export async function getInboxItems(
  filter?: InboxFilter
): Promise<InboxItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from("inbox_items")
      .select(
        `
        id, recipient_id, type, title, content, related_request_id,
        sender_profile_id, send_id, is_read, created_at,
        related_request:friend_requests!inbox_items_related_request_id_fkey(id, status)
      `
      )
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (filter) {
      query = query.eq("type", filter);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const senderIds = data
      .map((row) => row.sender_profile_id)
      .filter((id): id is string => Boolean(id));

    const profileMap = new Map<
      string,
      { id: string; username: string; avatar_id: string }
    >();

    if (senderIds.length > 0) {
      const { data: profiles } = await supabase.rpc("get_public_profiles", {
        ids: [...new Set(senderIds)],
      });
      for (const p of profiles ?? []) {
        profileMap.set(p.id, {
          id: p.id,
          username: p.username ?? "user",
          avatar_id: p.avatar_id ?? "default",
        });
      }
    }

    return data.map((row) => {
      const related = Array.isArray(row.related_request)
        ? row.related_request[0] ?? null
        : row.related_request ?? null;

      return {
        id: row.id,
        recipient_id: row.recipient_id,
        type: row.type,
        title: row.title,
        content: row.content,
        related_request_id: row.related_request_id,
        sender_profile_id: row.sender_profile_id,
        send_id: row.send_id ?? null,
        is_read: row.is_read,
        created_at: row.created_at,
        sender_profile: row.sender_profile_id
          ? profileMap.get(row.sender_profile_id) ?? null
          : null,
        related_request: related,
      } as InboxItem;
    });
  } catch {
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("inbox_items")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function markAsRead(
  itemId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("inbox_items")
    .update({ is_read: true })
    .eq("id", itemId)
    .eq("recipient_id", user.id);

  return { success: !error };
}

export async function markAllAsRead(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from("inbox_items")
    .update({ is_read: true })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  return { success: !error };
}
