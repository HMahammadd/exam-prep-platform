"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Inbox,
  Loader2,
  Mail,
  Megaphone,
  Newspaper,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  deleteSentAdminMessage,
  listSentAdminMessages,
  sendAdminInboxMessage,
  type AdminMessageType,
  type SentAdminMessage,
} from "@/lib/services/admin-messages";
import {
  searchUsers,
  type UserSearchResult,
} from "@/lib/services/friends";

type AudienceMode = "all" | "users";

type RecipientChip = {
  id: string;
  username: string;
  avatar_id: string;
};

const typeLabels: Record<AdminMessageType, string> = {
  news: "News",
  announcement: "Announcement",
  admin_message: "Private message",
};

function typeIcon(type: AdminMessageType) {
  switch (type) {
    case "news":
      return Newspaper;
    case "announcement":
      return Megaphone;
    case "admin_message":
      return Mail;
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

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(80, el.scrollHeight)}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={3}
      className="w-full resize-none overflow-hidden rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent disabled:opacity-60"
    />
  );
}

export function AdminInboxContent() {
  const [sent, setSent] = useState<SentAdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSendId, setSelectedSendId] = useState<string | null>(null);
  const [composing, setComposing] = useState(true);

  const [msgType, setMsgType] = useState<AdminMessageType>("news");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("all");
  const [recipients, setRecipients] = useState<RecipientChip[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SentAdminMessage | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const loadSent = useCallback(async () => {
    setLoading(true);
    const data = await listSentAdminMessages();
    setSent(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSent();
  }, [loadSent]);

  useEffect(() => {
    if (audienceMode !== "users") return;
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
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery, audienceMode]);

  const selected = sent.find((m) => m.send_id === selectedSendId) ?? null;

  function startCompose() {
    setComposing(true);
    setSelectedSendId(null);
    setStatus(null);
  }

  function selectSent(message: SentAdminMessage) {
    setComposing(false);
    setSelectedSendId(message.send_id);
    setStatus(null);
  }

  function addRecipient(user: UserSearchResult) {
    setRecipients((prev) => {
      if (prev.some((r) => r.id === user.id)) return prev;
      return [
        ...prev,
        { id: user.id, username: user.username, avatar_id: user.avatar_id },
      ];
    });
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSend() {
    setSending(true);
    setStatus(null);

    const result = await sendAdminInboxMessage({
      type: msgType,
      title,
      content,
      audience:
        audienceMode === "all"
          ? { mode: "all" }
          : { mode: "users", recipientIds: recipients.map((r) => r.id) },
    });

    setSending(false);

    if (!result.success) {
      setStatus({ type: "error", text: result.error ?? "Failed to send." });
      return;
    }

    setTitle("");
    setContent("");
    setRecipients([]);
    setAudienceMode(msgType === "admin_message" ? "users" : "all");
    setStatus({ type: "success", text: "Message sent." });
    await loadSent();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteSentAdminMessage(deleteTarget.send_id);
    setDeleting(false);

    if (!result.success) {
      setStatus({
        type: "error",
        text: result.error ?? "Failed to delete.",
      });
      setDeleteTarget(null);
      return;
    }

    if (selectedSendId === deleteTarget.send_id) {
      setSelectedSendId(null);
      setComposing(true);
    }
    setDeleteTarget(null);
    await loadSent();
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-muted">
            Send news, announcements, or private messages to users.
          </p>
        </div>
        {!composing && (
          <button
            type="button"
            onClick={startCompose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New message
          </button>
        )}
      </div>

      <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-card md:min-h-[32rem] md:flex-row">
        {/* Left: sent list */}
        <aside className="flex w-full flex-col border-b border-card-border md:w-[38%] md:border-b-0 md:border-r">
          <div className="border-b border-card-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">Sent messages</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : sent.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Inbox className="mx-auto h-9 w-9 text-muted/50" aria-hidden />
                <p className="mt-3 text-sm font-medium text-foreground">
                  No sent messages
                </p>
                <p className="mt-1 text-xs text-muted">
                  Compose a message on the right to get started.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-card-border">
                {sent.map((message) => {
                  const Icon = typeIcon(message.type);
                  const active =
                    !composing && message.send_id === selectedSendId;
                  return (
                    <li key={message.send_id} className="relative">
                      <button
                        type="button"
                        onClick={() => selectSent(message)}
                        className={`flex w-full gap-3 px-3 py-3 pr-10 text-left transition ${
                          active
                            ? "bg-accent-soft/60"
                            : "hover:bg-accent-soft/30"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                          <Icon className="h-5 w-5 text-accent" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-medium text-foreground">
                              {message.title}
                            </p>
                            <span className="shrink-0 text-[11px] text-muted">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                            {message.content}
                          </p>
                          <p className="mt-1 text-[11px] text-muted">
                            {typeLabels[message.type]} ·{" "}
                            {message.recipient_count} recipient
                            {message.recipient_count === 1 ? "" : "s"}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(message)}
                        className="absolute right-2 top-3 rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                        aria-label="Delete message"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right: compose or detail */}
        <section className="flex min-h-[16rem] flex-1 flex-col bg-background/40">
          {composing ? (
            <div className="flex flex-1 flex-col px-5 py-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  Object.keys(typeLabels) as AdminMessageType[]
                ).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setMsgType(t);
                      if (t !== "admin_message") setAudienceMode("all");
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      msgType === t
                        ? "bg-accent text-white"
                        : "border border-card-border bg-card text-muted hover:bg-accent-soft hover:text-foreground"
                    }`}
                  >
                    {typeLabels[t]}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Recipients
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAudienceMode("all")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      audienceMode === "all"
                        ? "bg-accent/10 text-accent"
                        : "border border-card-border bg-card text-muted hover:bg-accent-soft"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    All users
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceMode("users")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      audienceMode === "users"
                        ? "bg-accent/10 text-accent"
                        : "border border-card-border bg-card text-muted hover:bg-accent-soft"
                    }`}
                  >
                    Selected users
                  </button>
                </div>

                {audienceMode === "users" && (
                  <div className="mt-3 space-y-2">
                    {recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipients.map((r) => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card py-1 pl-1 pr-2 text-xs font-medium text-foreground"
                          >
                            <Avatar
                              avatarId={r.avatar_id}
                              size={20}
                              alt={r.username}
                            />
                            {r.username}
                            <button
                              type="button"
                              onClick={() => removeRecipient(r.id)}
                              className="rounded p-0.5 text-muted hover:text-foreground"
                              aria-label={`Remove ${r.username}`}
                            >
                              <X className="h-3 w-3" aria-hidden />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by username…"
                        className="w-full rounded-lg border border-card-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-accent"
                      />
                      {(searching || searchResults.length > 0) &&
                        searchQuery.trim().length >= 2 && (
                          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-card-border bg-card shadow-card">
                            {searching ? (
                              <li className="px-3 py-2 text-xs text-muted">
                                Searching…
                              </li>
                            ) : (
                              searchResults
                                .filter(
                                  (u) =>
                                    !recipients.some((r) => r.id === u.id)
                                )
                                .map((u) => (
                                  <li key={u.id}>
                                    <button
                                      type="button"
                                      onClick={() => addRecipient(u)}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent-soft"
                                    >
                                      <Avatar
                                        avatarId={u.avatar_id}
                                        size={28}
                                        alt={u.username}
                                      />
                                      {u.username}
                                    </button>
                                  </li>
                                ))
                            )}
                          </ul>
                        )}
                    </div>
                  </div>
                )}
              </div>

              <label className="mb-3 block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                  Title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Subject"
                  disabled={sending}
                  className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
                />
              </label>

              <label className="mb-3 block flex-1">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
                  Message
                </span>
                <AutoGrowTextarea
                  value={content}
                  onChange={setContent}
                  placeholder="Write your message…"
                  disabled={sending}
                />
              </label>

              {status && (
                <p
                  className={`mb-3 text-sm ${
                    status.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500"
                  }`}
                >
                  {status.text}
                </p>
              )}

              <div className="mt-auto flex justify-end">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    sending ||
                    !title.trim() ||
                    !content.trim() ||
                    (audienceMode === "users" && recipients.length === 0)
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  Send
                </button>
              </div>
            </div>
          ) : selected ? (
            <>
              <header className="flex items-start justify-between gap-3 border-b border-card-border px-5 py-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {selected.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {typeLabels[selected.type]} · {formatDate(selected.created_at)}{" "}
                    · {selected.recipient_count} recipient
                    {selected.recipient_count === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selected)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete
                </button>
              </header>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {selected.content}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <Mail className="h-10 w-10 text-muted/40" aria-hidden />
              <p className="mt-3 text-sm font-medium text-foreground">
                Select a sent message
              </p>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message?"
        message="This removes the message from every recipient inbox. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
