"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  Inbox,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar } from "./Avatar";
import { UnreadBadge } from "./UnreadBadge";

type AccountDropdownProps = {
  username: string;
  avatarId: string;
  unreadCount: number;
};

export function AccountDropdown({ username, avatarId, unreadCount }: AccountDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  // Focus management for keyboard
  useEffect(() => {
    if (open && menuRef.current) {
      const firstItem = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || !menuRef.current) return;
    const items = menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    close();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const menuItems = [
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Friends", href: "/dashboard/friends", icon: Users },
    {
      label: "Inbox",
      href: "/dashboard/inbox",
      icon: Inbox,
      badge: unreadCount,
    },
  ];

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loggingOut}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent-soft disabled:opacity-60"
      >
        <Avatar avatarId={avatarId} size={24} />
        <span className="hidden max-w-[120px] truncate sm:inline">{username}</span>
        {unreadCount > 0 && <UnreadBadge count={unreadCount} className="sm:hidden" />}
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-xl border border-card-border bg-card py-1.5 shadow-card"
        >
          {/* User info header */}
          <div className="border-b border-card-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar avatarId={avatarId} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{username}</p>
                <p className="text-xs text-muted">Manage your account</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                tabIndex={-1}
                onClick={close}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition hover:bg-accent-soft focus:bg-accent-soft focus:outline-none"
              >
                <item.icon className="h-4 w-4 text-muted" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <UnreadBadge count={item.badge} />
                )}
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-card-border pt-1.5">
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 focus:bg-red-50 focus:outline-none dark:text-red-400 dark:hover:bg-red-950/30 dark:focus:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
