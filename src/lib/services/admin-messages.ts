"use server";

import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabaseServer";

export type AdminMessageType = "news" | "announcement" | "admin_message";

export type AdminAudience =
  | { mode: "all" }
  | { mode: "users"; recipientIds: string[] };

export type SentAdminMessage = {
  send_id: string;
  type: AdminMessageType;
  title: string;
  content: string | null;
  created_at: string;
  recipient_count: number;
};

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" as const };
  }

  return { supabase, user };
}

/** Unified admin send: news, announcement, or private (admin_message). */
export async function sendAdminInboxMessage(params: {
  type: AdminMessageType;
  title: string;
  content: string;
  audience: AdminAudience;
}): Promise<{ success: boolean; send_id?: string; error?: string }> {
  const title = params.title.trim();
  const content = params.content.trim();
  if (!title) return { success: false, error: "Title is required." };
  if (!content) return { success: false, error: "Message is required." };

  const auth = await requireAdminClient();
  if ("error" in auth) return { success: false, error: auth.error };
  const { supabase, user } = auth;

  let recipientIds: string[] = [];

  if (params.audience.mode === "all") {
    const { data: allProfiles, error } = await supabase
      .from("profiles")
      .select("id")
      .neq("id", user.id);

    if (error) {
      return { success: false, error: "Failed to load recipients." };
    }
    recipientIds = (allProfiles ?? []).map((p) => p.id);
  } else {
    recipientIds = [
      ...new Set(
        params.audience.recipientIds.filter(
          (id) => Boolean(id) && id !== user.id
        )
      ),
    ];
    if (recipientIds.length === 0) {
      return { success: false, error: "Select at least one recipient." };
    }
  }

  if (recipientIds.length === 0) {
    return { success: false, error: "No recipients found." };
  }

  const sendId = randomUUID();

  if (params.type === "news" || params.type === "announcement") {
    await supabase.from("announcements").insert({
      title,
      content,
      author_id: user.id,
    });
  }

  const items = recipientIds.map((recipientId) => ({
    recipient_id: recipientId,
    type: params.type,
    title,
    content,
    sender_profile_id: user.id,
    send_id: sendId,
  }));

  for (let i = 0; i < items.length; i += 100) {
    const { error } = await supabase
      .from("inbox_items")
      .insert(items.slice(i, i + 100));
    if (error) {
      return { success: false, error: describeInboxDbError(error.message) };
    }
  }

  return { success: true, send_id: sendId };
}

function describeInboxDbError(message: string): string {
  if (/send_id|schema cache|Could not find the .* column/i.test(message)) {
    return `${message} — run supabase/migrations/011_inbox_announcement_and_admin.sql in the Supabase SQL Editor.`;
  }
  if (/inbox_items_type_check|announcement/i.test(message)) {
    return `${message} — run supabase/migrations/011_inbox_announcement_and_admin.sql to allow announcement messages.`;
  }
  if (/row-level security|permission denied/i.test(message)) {
    return `${message} — your account needs role 'admin' in the profiles table.`;
  }
  return message || "Failed to send messages.";
}

/** @deprecated Prefer sendAdminInboxMessage */
export async function sendAdminMessage(params: {
  recipientIds: string[];
  title: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendAdminInboxMessage({
    type: "admin_message",
    title: params.title,
    content: params.content,
    audience: { mode: "users", recipientIds: params.recipientIds },
  });
}

/** @deprecated Prefer sendAdminInboxMessage with type news */
export async function publishAnnouncement(params: {
  title: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendAdminInboxMessage({
    type: "news",
    title: params.title,
    content: params.content,
    audience: { mode: "all" },
  });
}

/** One row per send_id for the admin's sent list. */
export async function listSentAdminMessages(): Promise<SentAdminMessage[]> {
  const auth = await requireAdminClient();
  if ("error" in auth) return [];
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("inbox_items")
    .select("send_id, type, title, content, created_at")
    .eq("sender_profile_id", user.id)
    .in("type", ["news", "announcement", "admin_message"])
    .not("send_id", "is", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const bySend = new Map<string, SentAdminMessage>();

  for (const row of data) {
    if (!row.send_id) continue;
    const existing = bySend.get(row.send_id);
    if (existing) {
      existing.recipient_count += 1;
      continue;
    }
    bySend.set(row.send_id, {
      send_id: row.send_id,
      type: row.type as AdminMessageType,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
      recipient_count: 1,
    });
  }

  return [...bySend.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function deleteSentAdminMessage(
  sendId: string
): Promise<{ success: boolean; error?: string }> {
  if (!sendId) return { success: false, error: "Missing send id." };

  const auth = await requireAdminClient();
  if ("error" in auth) return { success: false, error: auth.error };
  const { supabase, user } = auth;

  const { error } = await supabase
    .from("inbox_items")
    .delete()
    .eq("send_id", sendId)
    .eq("sender_profile_id", user.id);

  if (error) return { success: false, error: "Failed to delete message." };
  return { success: true };
}
