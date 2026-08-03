"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import { USERNAME_MAX, validateUsername } from "@/lib/username";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const SAVE_TIMEOUT_MS = 20_000;

function mapRpcError(message: string | undefined): string {
  const code = message ?? "";
  if (code.includes("USERNAME_TAKEN")) {
    return "That username is already taken.";
  }
  if (code.includes("INVALID_USERNAME")) {
    return "Username can only use letters, numbers, and underscores (3–20 characters).";
  }
  if (code.includes("NOT_AUTHENTICATED")) {
    return "Your session expired. Refresh the page and try again.";
  }
  if (code.includes("PROFILE_NOT_FOUND")) {
    return "Profile not found. Sign out and sign in with Google again.";
  }
  if (
    code.includes("Could not find the function") ||
    code.includes("PGRST202")
  ) {
    return "Username setup is not ready yet. Apply migration 010_set_my_username_rpc.sql in Supabase.";
  }
  return "Failed to save username. Try again.";
}

export function UsernameOnboardingForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Wait for the browser session after Google OAuth so Continue doesn't hang.
  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        setSessionReady(Boolean(data.session));
      }
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setSessionReady(Boolean(session));
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!sessionReady) {
      setError("Still signing you in… wait a moment, then try again.");
      return;
    }

    const formatError = validateUsername(username);
    if (formatError) {
      setError(formatError);
      return;
    }

    setLoading(true);
    const desired = username.trim();

    try {
      const rpcPromise = supabase.rpc("set_my_username", { desired });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                "This is taking too long. Refresh the page and try again."
              )
            ),
          SAVE_TIMEOUT_MS
        );
      });

      const { error: rpcError } = await Promise.race([
        rpcPromise,
        timeoutPromise,
      ]);

      if (rpcError) {
        setError(mapRpcError(rpcError.message));
        setLoading(false);
        return;
      }

      // Hard navigation avoids soft-nav / proxy races after OAuth.
      window.location.assign("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save username. Refresh the page and try again."
      );
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const canSubmit = sessionReady && !loading && Boolean(username.trim());

  return (
    <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          <User className="h-6 w-6 text-accent" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Choose your username
        </h1>
        <p className="mt-2 text-sm text-muted">
          Pick a name friends will see. You can change it later in your profile.
        </p>
      </div>

      {!sessionReady && (
        <p className="mb-4 flex items-center justify-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finishing sign-in…
        </p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
          >
            <User className="h-4 w-4 text-accent" aria-hidden />
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            minLength={3}
            maxLength={USERNAME_MAX}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClassName}
            placeholder="e.g. kepleracademy"
            disabled={loading || !sessionReady}
          />
          <p className="mt-1.5 text-xs text-muted">
            3–20 characters: letters, numbers, and underscores
          </p>
        </div>

        {error && (
          <p
            className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Continue
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={loading}
        className="mt-4 w-full text-center text-sm text-muted transition hover:text-foreground disabled:opacity-60"
      >
        Sign out
      </button>
    </div>
  );
}

export function UsernameOnboardingPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
