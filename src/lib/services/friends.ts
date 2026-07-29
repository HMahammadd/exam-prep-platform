"use server";

import { createClient } from "@/lib/supabaseServer";

export type FriendProfile = {
  id: string;
  nickname: string;
  avatar_id: string;
};

export type FriendWithProfile = {
  friendship_id: string;
  friend: FriendProfile;
  created_at: string;
};

export type UserSearchResult = {
  id: string;
  nickname: string;
  avatar_id: string;
  friendship_status: "none" | "request_sent" | "request_received" | "friends";
  request_id?: string;
};

async function loadPublicProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[]
): Promise<Map<string, FriendProfile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const { data } = await supabase.rpc("get_public_profiles", { ids: unique });
  const map = new Map<string, FriendProfile>();
  for (const row of data ?? []) {
    map.set(row.id, {
      id: row.id,
      nickname: row.nickname ?? "user",
      avatar_id: row.avatar_id ?? "default",
    });
  }
  return map;
}

export async function getMyFriends(): Promise<FriendWithProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: asUser1 }, { data: asUser2 }] = await Promise.all([
    supabase
      .from("friendships")
      .select("id, user_id_2, created_at")
      .eq("user_id_1", user.id),
    supabase
      .from("friendships")
      .select("id, user_id_1, created_at")
      .eq("user_id_2", user.id),
  ]);

  const pairs: { friendship_id: string; friendId: string; created_at: string }[] =
    [];

  for (const row of asUser1 ?? []) {
    pairs.push({
      friendship_id: row.id,
      friendId: row.user_id_2,
      created_at: row.created_at,
    });
  }
  for (const row of asUser2 ?? []) {
    pairs.push({
      friendship_id: row.id,
      friendId: row.user_id_1,
      created_at: row.created_at,
    });
  }

  const profiles = await loadPublicProfiles(
    supabase,
    pairs.map((p) => p.friendId)
  );

  const friends: FriendWithProfile[] = [];
  for (const pair of pairs) {
    const friend = profiles.get(pair.friendId);
    if (!friend) continue;
    friends.push({
      friendship_id: pair.friendship_id,
      friend,
      created_at: pair.created_at,
    });
  }

  return friends.sort((a, b) =>
    a.friend.nickname.localeCompare(b.friend.nickname)
  );
}

export async function removeFriend(
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) return { success: false, error: "Failed to remove friend." };
  return { success: true };
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const { data: users } = await supabase.rpc("search_users_by_nickname", {
    query: trimmed,
    max_results: 20,
  });

  if (!users || users.length === 0) return [];

  const userIds = users.map((u: { id: string }) => u.id);

  const [
    { data: sentRequests },
    { data: receivedRequests },
    { data: friendships1 },
    { data: friendships2 },
  ] = await Promise.all([
    supabase
      .from("friend_requests")
      .select("id, receiver_id, status")
      .eq("sender_id", user.id)
      .in("receiver_id", userIds)
      .eq("status", "pending"),
    supabase
      .from("friend_requests")
      .select("id, sender_id, status")
      .eq("receiver_id", user.id)
      .in("sender_id", userIds)
      .eq("status", "pending"),
    supabase
      .from("friendships")
      .select("user_id_2")
      .eq("user_id_1", user.id)
      .in("user_id_2", userIds),
    supabase
      .from("friendships")
      .select("user_id_1")
      .eq("user_id_2", user.id)
      .in("user_id_1", userIds),
  ]);

  const friendIds = new Set([
    ...(friendships1?.map((f) => f.user_id_2) ?? []),
    ...(friendships2?.map((f) => f.user_id_1) ?? []),
  ]);

  const sentMap = new Map(
    sentRequests?.map((r) => [r.receiver_id, r.id]) ?? []
  );
  const receivedMap = new Map(
    receivedRequests?.map((r) => [r.sender_id, r.id]) ?? []
  );

  return users.map(
    (u: { id: string; nickname: string; avatar_id: string }) => {
      let friendship_status: UserSearchResult["friendship_status"] = "none";
      let request_id: string | undefined;

      if (friendIds.has(u.id)) {
        friendship_status = "friends";
      } else if (sentMap.has(u.id)) {
        friendship_status = "request_sent";
        request_id = sentMap.get(u.id);
      } else if (receivedMap.has(u.id)) {
        friendship_status = "request_received";
        request_id = receivedMap.get(u.id);
      }

      return {
        id: u.id,
        nickname: u.nickname,
        avatar_id: u.avatar_id,
        friendship_status,
        request_id,
      };
    }
  );
}

export async function sendFriendRequest(
  receiverId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (user.id === receiverId) {
    return { success: false, error: "Cannot send request to yourself." };
  }

  const { data: existing } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("sender_id", receiverId)
    .eq("receiver_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "This user already sent you a request. Check your inbox.",
    };
  }

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const { data: request, error } = await supabase
    .from("friend_requests")
    .insert({ sender_id: user.id, receiver_id: receiverId })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Friend request already sent." };
    }
    return { success: false, error: "Failed to send friend request." };
  }

  const { error: inboxError } = await supabase.from("inbox_items").insert({
    recipient_id: receiverId,
    type: "friend_request",
    title: "New friend request",
    content: `${senderProfile?.nickname ?? "Someone"} wants to be your friend.`,
    related_request_id: request.id,
    sender_profile_id: user.id,
  });

  if (inboxError) {
    // Request exists; inbox notify is best-effort (receiver can still see requests)
    console.warn("[friends] inbox notify failed:", inboxError.message);
  }

  return { success: true };
}

export async function acceptFriendRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_friend_request", {
    request_id: requestId,
  });
  if (error) return { success: false, error: "Failed to accept request." };
  return { success: true };
}

export async function declineFriendRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) return { success: false, error: "Failed to decline request." };

  await supabase
    .from("inbox_items")
    .update({ is_read: true })
    .eq("related_request_id", requestId)
    .eq("recipient_id", user.id);

  return { success: true };
}
