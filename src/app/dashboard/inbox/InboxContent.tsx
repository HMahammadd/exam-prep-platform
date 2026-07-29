"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Inbox,
  Loader2,
  Mail,
  Megaphone,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  getInboxItems,
  markAsRead,
  markAllAsRead,
  type InboxItem,
} from "@/lib/services/inbox";
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/lib/services/friends";

type Filter = "all" | "friend_request" | "admin_message" | "news";

const filterLabels: Record<Filter, string> = {
  all: "All",
  friend_request: "Friend Requests",
  admin_message: "Administration",
  news: "News",
};

const filterIcons: Record<Filter, typeof Bell> = {
  all: Inbox,
  friend_request: UserPlus,
  admin_message: Mail,
  news: Megaphone,
};

function typeIcon(type: InboxItem["type"]) {
  switch (type) {
    case "friend_request":
      return UserPlus;
    case "admin_message":
      return Mail;
    case "news":
      return Megaphone;
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function InboxContent() {
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const filterParam = filter === "all" ? undefined : filter;
    const data = await getInboxItems(filterParam);
    setItems(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead();
    setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
  }

  async function handleAccept(item: InboxItem) {
    if (!item.related_request_id) return;
    setActionLoading(item.id);
    const result = await acceptFriendRequest(item.related_request_id);
    if (result.success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                is_read: true,
                related_request: {
                  id: item.related_request_id!,
                  status: "accepted",
                },
              }
            : i
        )
      );
    }
    setActionLoading(null);
  }

  async function handleDecline(item: InboxItem) {
    if (!item.related_request_id) return;
    setActionLoading(item.id);
    const result = await declineFriendRequest(item.related_request_id);
    if (result.success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                is_read: true,
                related_request: {
                  id: item.related_request_id!,
                  status: "declined",
                },
              }
            : i
        )
      );
    }
    setActionLoading(null);
  }

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <>
        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(filterLabels) as Filter[]).map((f) => {
            const Icon = filterIcons[f];
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "bg-accent text-white shadow-sm"
                    : "border border-card-border bg-card text-muted hover:bg-accent-soft hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {filterLabels[f]}
              </button>
            );
          })}
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden />
              Mark all as read ({unreadCount})
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-card-border bg-card p-8 text-center shadow-card">
            <Inbox className="mx-auto h-10 w-10 text-muted/50" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">
              Your inbox is empty
            </p>
            <p className="mt-1 text-xs text-muted">
              {filter !== "all"
                ? "No items in this category."
                : "Friend requests and announcements will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = typeIcon(item.type);
              const isPendingFR =
                item.type === "friend_request" &&
                item.related_request &&
                item.related_request.status === "pending";
              const isProcessedFR =
                item.type === "friend_request" &&
                item.related_request &&
                item.related_request.status !== "pending";

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border bg-card px-4 py-3 shadow-sm transition ${
                    item.is_read
                      ? "border-card-border"
                      : "border-accent/30 bg-accent-soft/30"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon or sender avatar */}
                    {item.sender_profile &&
                    item.type === "friend_request" ? (
                      <Avatar
                        avatarId={item.sender_profile.avatar_id}
                        size={40}
                        alt={item.sender_profile.nickname}
                      />
                    ) : (
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          item.is_read ? "bg-accent-soft/50" : "bg-accent-soft"
                        }`}
                      >
                        <Icon
                          className="h-5 w-5 text-accent"
                          aria-hidden
                        />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm ${
                              item.is_read
                                ? "text-foreground"
                                : "font-semibold text-foreground"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.content && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                              {item.content}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      {/* Friend request actions */}
                      {isPendingFR && (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => handleAccept(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => handleDecline(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent-soft disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden />
                            Decline
                          </button>
                        </div>
                      )}

                      {isProcessedFR && (
                        <p className="mt-1.5 text-xs italic text-muted">
                          Request {item.related_request!.status}
                        </p>
                      )}

                      {/* Mark as read */}
                      {!item.is_read && !isPendingFR && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent transition hover:underline"
                        >
                          <Check className="h-3 w-3" aria-hidden />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
  );
}
