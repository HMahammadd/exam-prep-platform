"use client";

import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError(
        "That reset link is invalid or expired. Enter your email below to get a new one. Open the link in the same browser where you requested it."
      );
      void supabase.auth.signOut({ scope: "local" });
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim();
    // Land directly on the reset page so the browser can exchange the PKCE
    // code (same place the code verifier cookie was stored).
    const redirectTo = `${window.location.origin}/auth/reset-password`;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo }
      );

      if (resetError) {
        const isNetworkError =
          resetError.message.toLowerCase().includes("failed to fetch") ||
          resetError.name === "AuthRetryableFetchError";
        setError(
          isNetworkError
            ? "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and that your project is active."
            : resetError.message
        );
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError(
        "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and that your project is active."
      );
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          <KeyRound className="h-6 w-6 text-accent" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-muted">
          {sent
            ? "Check your inbox for a reset link"
            : "Enter your registered email and we will send a reset link"}
        </p>
      </div>

      {sent ? (
        <div className="space-y-5">
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-foreground">
            If an account exists for{" "}
            <span className="font-medium">{email.trim()}</span>, a password
            reset link is on its way. Open it in this same browser to choose a
            new password.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Mail className="h-4 w-4 text-accent" aria-hidden />
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
              placeholder="you@example.com"
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
                Sending link…
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" aria-hidden />
                Send reset link
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
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
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
