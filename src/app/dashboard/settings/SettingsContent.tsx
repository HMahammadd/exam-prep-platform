"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Mail, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { getMyProfile } from "@/lib/services/profile";

export function SettingsContent() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const profile = await getMyProfile();
      setEmail(profile?.email ?? null);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Palette className="h-5 w-5 text-accent" aria-hidden />
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted">Choose light or dark mode</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent-soft"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-accent" aria-hidden />
                Light mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-accent" aria-hidden />
                Dark mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Mail className="h-5 w-5 text-accent" aria-hidden />
          Account
        </h2>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <p className="rounded-lg border border-card-border bg-background px-3.5 py-2.5 text-sm text-muted">
            {email ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Your email cannot be changed here
          </p>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <KeyRound className="h-5 w-5 text-accent" aria-hidden />
          Password
        </h2>
        <p className="mb-4 text-sm text-muted">
          You can reset your password via email. A link will be sent to your
          registered email address.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent-soft"
        >
          <KeyRound className="h-4 w-4 text-accent" aria-hidden />
          Reset password
        </Link>
      </div>
    </div>
  );
}
