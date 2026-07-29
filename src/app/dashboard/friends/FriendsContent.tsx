"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  getMyFriends,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  type FriendWithProfile,
  type UserSearchResult,
} from "@/lib/services/friends";

type Tab = "friends" | "find";

export function FriendsContent() {
  const [tab, setTab] = useState<Tab>("friends");
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [filter, setFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<FriendWithProfile | null>(
    null
  );
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    const data = await getMyFriends();
    setFriends(data);
    setLoadingFriends(false);
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Debounced search
  useEffect(() => {
    if (tab !== "find") return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      const results = await searchUsers(trimmed);
      setSearchResults(results);
      setSearching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, tab]);

  async function handleSendRequest(userId: string) {
    setActionLoading(userId);
    setMessage(null);
    const result = await sendFriendRequest(userId);
    if (result.success) {
      setSearchResults((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, friendship_status: "request_sent" as const }
            : u
        )
      );
      setMessage({ type: "success", text: "Friend request sent!" });
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to send request.",
      });
    }
    setActionLoading(null);
  }

  async function handleAcceptFromSearch(requestId: string, userId: string) {
    setActionLoading(userId);
    const result = await acceptFriendRequest(requestId);
    if (result.success) {
      setSearchResults((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, friendship_status: "friends" as const }
            : u
        )
      );
      loadFriends();
    }
    setActionLoading(null);
  }

  async function handleRemoveFriend() {
    if (!removeTarget) return;
    setRemoving(true);
    const result = await removeFriend(removeTarget.friendship_id);
    if (result.success) {
      setFriends((prev) =>
        prev.filter((f) => f.friendship_id !== removeTarget.friendship_id)
      );
      setMessage({
        type: "success",
        text: `Removed ${removeTarget.friend.nickname} from friends.`,
      });
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to remove friend.",
      });
    }
    setRemoving(false);
    setRemoveTarget(null);
  }

  const filteredFriends = friends.filter((f) =>
    f.friend.nickname.toLowerCase().includes(filter.toLowerCase())
  );

  const tabClass = (t: Tab) =>
    `flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      tab === t
        ? "bg-accent text-white shadow-sm"
        : "text-muted hover:bg-accent-soft hover:text-foreground"
    }`;

  return (
    <>
        {/* Tab bar */}
        <div className="mb-6 flex gap-2 rounded-xl border border-card-border bg-card p-1.5 shadow-card">
          <button
            type="button"
            className={tabClass("friends")}
            onClick={() => setTab("friends")}
          >
            <Users className="mr-1.5 inline h-4 w-4" aria-hidden />
            Friends{friends.length > 0 && ` (${friends.length})`}
          </button>
          <button
            type="button"
            className={tabClass("find")}
            onClick={() => setTab("find")}
          >
            <Search className="mr-1.5 inline h-4 w-4" aria-hidden />
            Find Friends
          </button>
        </div>

        {message && (
          <p
            className={`mb-4 rounded-lg px-4 py-2.5 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        {tab === "friends" && (
          <div className="space-y-4">
            {friends.length > 0 && (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  type="text"
                  placeholder="Filter friends…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            )}

            {loadingFriends ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
                <Users
                  className="mx-auto h-10 w-10 text-muted/50"
                  aria-hidden
                />
                <p className="mt-3 text-sm font-medium text-foreground">
                  {friends.length === 0 ? "No friends yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {friends.length === 0
                    ? "Search for users in the Find Friends tab to get started."
                    : "Try a different search term."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((f) => (
                  <div
                    key={f.friendship_id}
                    className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 shadow-sm transition hover:shadow-card"
                  >
                    <Avatar
                      avatarId={f.friend.avatar_id}
                      size={40}
                      alt={f.friend.nickname}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {f.friend.nickname}
                      </p>
                      <p className="text-xs text-muted">
                        Friends since{" "}
                        {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(f)}
                      className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                      aria-label={`Remove ${f.friend.nickname}`}
                    >
                      <UserMinus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "find" && (
          <div className="space-y-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Search by nickname…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-card py-2.5 pl-10 pr-3.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            )}

            {!searching &&
              searchQuery.trim().length >= 2 &&
              searchResults.length === 0 && (
                <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
                  <Search
                    className="mx-auto h-10 w-10 text-muted/50"
                    aria-hidden
                  />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No users found
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Try a different nickname.
                  </p>
                </div>
              )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-xl border border-card-border bg-card px-4 py-3 shadow-sm"
                  >
                    <Avatar
                      avatarId={user.avatar_id}
                      size={40}
                      alt={user.nickname}
                    />
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                      {user.nickname}
                    </p>

                    {user.friendship_status === "friends" && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
                        <UserCheck className="h-3.5 w-3.5" aria-hidden />
                        Friends
                      </span>
                    )}

                    {user.friendship_status === "request_sent" && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        Request sent
                      </span>
                    )}

                    {user.friendship_status === "request_received" && (
                      <button
                        type="button"
                        disabled={actionLoading === user.id}
                        onClick={() =>
                          user.request_id &&
                          handleAcceptFromSearch(user.request_id, user.id)
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Accept request
                      </button>
                    )}

                    {user.friendship_status === "none" && (
                      <button
                        type="button"
                        disabled={actionLoading === user.id}
                        onClick={() => handleSendRequest(user.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-accent bg-card px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent-soft disabled:opacity-60"
                      >
                        {actionLoading === user.id ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5" aria-hidden />
                        )}
                        Add friend
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove friend"
        message={`Are you sure you want to remove ${removeTarget?.friend.nickname ?? "this friend"}? You can always add them again later.`}
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={handleRemoveFriend}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  );
}
