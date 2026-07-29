"use client";

import { CheckCircle2, Loader2, Lock, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      const code = searchParams.get("code");

      // Default Supabase ConfirmationURL lands here with ?code= — exchange in
      // the browser so the PKCE code verifier cookie is available.
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (cancelled) return;

        if (exchangeError) {
          setError(
            exchangeError.message.includes("code verifier")
              ? "Open the reset link in the same browser where you requested it, or request a new link."
              : "This reset link is invalid or has already been used. Request a new one."
          );
          setHasSession(false);
          setCheckingSession(false);
          // Drop the used/invalid code from the URL.
          router.replace("/auth/reset-password");
          return;
        }

        setHasSession(true);
        setCheckingSession(false);
        router.replace("/auth/reset-password");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    }

    void establishSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasSession(true);
        setCheckingSession(false);
        setError(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setPassword("");
    setConfirmPassword("");
  }

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          {done ? (
            <CheckCircle2 className="h-6 w-6 text-accent" aria-hidden />
          ) : (
            <KeyRound className="h-6 w-6 text-accent" aria-hidden />
          )}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {done ? "Password updated" : "Choose a new password"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {done
            ? "You can continue to your dashboard"
            : "Enter and confirm your new password below"}
        </p>
      </div>

      {checkingSession ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Verifying reset link…
        </p>
      ) : !hasSession ? (
        <div className="space-y-5">
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error ??
              "This reset link is invalid or has expired. Request a new one from the forgot password page."}
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Request a new link
          </Link>
        </div>
      ) : done ? (
        <button
          type="button"
          onClick={goToDashboard}
          className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          Go to dashboard
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Lock className="h-4 w-4 text-accent" aria-hidden />
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Lock className="h-4 w-4 text-accent" aria-hidden />
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <p className="flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading…
            </p>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
