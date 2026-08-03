"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Inbox,
  Loader2,
  Mail,
  Megaphone,
  Newspaper,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import {
  getInboxItems,
  markAsRead,
  markAllAsRead,
  type InboxFilter,
  type InboxItem,
} from "@/lib/services/inbox";
import {
  acceptFriendRequest,
  declineFriendRequest,
} from "@/lib/services/friends";

type UiFilter = "all" | "news" | "announcement" | "friend_request";

const filterLabels: Record<UiFilter, string> = {
  all: "All messages",
  news: "News",
  announcement: "Announcements",
  friend_request: "Friend requests",
};

function typeIcon(type: InboxItem["type"]) {
  switch (type) {
    case "friend_request":
      return UserPlus;
    case "admin_message":
      return Mail;
    case "news":
      return Newspaper;
    case "announcement":
      return Megaphone;
  }
}

function senderLabel(item: InboxItem) {
  if (item.sender_profile?.username) return item.sender_profile.username;
  if (item.type === "news") return "News";
  if (item.type === "announcement") return "Announcements";
  if (item.type === "admin_message") return "Administration";
  return "Someone";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  if (diff < 2592000000) return `${Math.floor(diff / 604800000)} week${Math.floor(diff / 604800000) === 1 ? "" : "s"} ago`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function previewText(item: InboxItem) {
  const text = item.content?.trim() || item.title;
  return text;
}

export function InboxContent() {
  const [filter, setFilter] = useState<UiFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const filterParam: InboxFilter | undefined =
      filter === "all" ? undefined : filter;
    const data = await getInboxItems(filterParam);
    setItems(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    setSelectedId(null);
  }, [filter]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  async function handleSelect(item: InboxItem) {
    setSelectedId(item.id);
    if (!item.is_read) {
      await markAsRead(item.id);
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, is_read: true } : row
        )
      );
    }
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
    <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-card md:min-h-[32rem] md:flex-row">
      {/* Left: message list */}
      <aside className="flex w-full flex-col border-b border-card-border md:w-[38%] md:border-b-0 md:border-r">
        <div className="relative border-b border-card-border px-3 py-3">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-card-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft"
            aria-expanded={filterOpen}
            aria-haspopup="listbox"
          >
            <span>{filterLabels[filter]}</span>
            <ChevronDown
              className={`h-4 w-4 text-muted transition ${filterOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {filterOpen && (
            <ul
              role="listbox"
              className="absolute left-3 right-3 z-10 mt-1 overflow-hidden rounded-lg border border-card-border bg-card shadow-card"
            >
              {(Object.keys(filterLabels) as UiFilter[]).map((f) => (
                <li key={f} role="option" aria-selected={filter === f}>
                  <button
                    type="button"
                    className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-accent-soft ${
                      filter === f
                        ? "font-semibold text-accent"
                        : "text-foreground"
                    }`}
                    onClick={() => {
                      setFilter(f);
                      setFilterOpen(false);
                    }}
                  >
                    {filterLabels[f]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="flex justify-end border-b border-card-border px-3 py-2">
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Inbox className="mx-auto h-9 w-9 text-muted/50" aria-hidden />
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
            <ul className="divide-y divide-card-border">
              {items.map((item) => {
                const Icon = typeIcon(item.type);
                const active = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`flex w-full gap-3 px-3 py-3 text-left transition ${
                        active
                          ? "bg-accent-soft/60"
                          : "hover:bg-accent-soft/30"
                      }`}
                    >
                      {!item.is_read ? (
                        <span
                          className="mt-3 h-2 w-2 shrink-0 rounded-full bg-amber-400"
                          aria-label="Unread"
                          title="Unread"
                        />
                      ) : (
                        <span className="mt-3 h-2 w-2 shrink-0" aria-hidden />
                      )}

                      {item.sender_profile ? (
                        <Avatar
                          avatarId={item.sender_profile.avatar_id}
                          size={40}
                          alt={item.sender_profile.username}
                          className="shrink-0"
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                          <Icon className="h-5 w-5 text-accent" aria-hidden />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              item.is_read
                                ? "text-foreground"
                                : "font-semibold text-foreground"
                            }`}
                          >
                            {senderLabel(item)}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {previewText(item)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Right: message detail */}
      <section className="flex min-h-[16rem] flex-1 flex-col bg-background/40">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <Mail className="h-10 w-10 text-muted/40" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">
              Select a message
            </p>
            <p className="mt-1 text-xs text-muted">
              Choose an item from the list to read it here.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-card-border px-5 py-4">
              {selected.sender_profile ? (
                <Avatar
                  avatarId={selected.sender_profile.avatar_id}
                  size={44}
                  alt={selected.sender_profile.username}
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft">
                  {(() => {
                    const Icon = typeIcon(selected.type);
                    return (
                      <Icon className="h-5 w-5 text-accent" aria-hidden />
                    );
                  })()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">
                  {senderLabel(selected)}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(selected.created_at)}
                  {selected.type === "news"
                    ? " · News"
                    : selected.type === "announcement"
                      ? " · Announcement"
                      : selected.type === "admin_message"
                        ? " · Private message"
                        : selected.type === "friend_request"
                          ? " · Friend request"
                          : ""}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <h2 className="text-lg font-semibold text-foreground">
                {selected.title}
              </h2>
              {selected.content && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {selected.content}
                </p>
              )}

              {selected.type === "friend_request" &&
                selected.related_request?.status === "pending" && (
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      disabled={actionLoading === selected.id}
                      onClick={() => handleAccept(selected)}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === selected.id}
                      onClick={() => handleDecline(selected)}
                      className="inline-flex items-center gap-1 rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft disabled:opacity-60"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      Decline
                    </button>
                  </div>
                )}

              {selected.type === "friend_request" &&
                selected.related_request &&
                selected.related_request.status !== "pending" && (
                  <p className="mt-4 text-sm italic text-muted">
                    Request {selected.related_request.status}
                  </p>
                )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
