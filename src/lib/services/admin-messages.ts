"use server";

import { createClient } from "@/lib/supabaseServer";

/** Send an admin message to specific users. Only works for admin users. */
export async function sendAdminMessage(params: {
  recipientIds: string[];
  title: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const items = params.recipientIds.map(recipientId => ({
    recipient_id: recipientId,
    type: "admin_message" as const,
    title: params.title,
    content: params.content,
    sender_profile_id: user.id,
  }));

  const { error } = await supabase.from("inbox_items").insert(items);
  if (error) return { success: false, error: "Failed to send messages." };
  return { success: true };
}

/** Publish a news announcement to all users. Only works for admin users. */
export async function publishAnnouncement(params: {
  title: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  // Create announcement
  const { data: announcement, error: annError } = await supabase
    .from("announcements")
    .insert({
      title: params.title,
      content: params.content,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (annError) return { success: false, error: "Failed to publish announcement." };

  // Create inbox items for all users
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id")
    .neq("id", user.id);

  if (allProfiles && allProfiles.length > 0) {
    const items = allProfiles.map(p => ({
      recipient_id: p.id,
      type: "news" as const,
      title: params.title,
      content: params.content,
      sender_profile_id: user.id,
    }));

    // Insert in batches of 100
    for (let i = 0; i < items.length; i += 100) {
      await supabase.from("inbox_items").insert(items.slice(i, i + 100));
    }
  }

  return { success: true };
}
