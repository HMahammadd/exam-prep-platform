"use client";

import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/GoogleSignInButton";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError(
        "Sign-in failed. Try again, or request a new password-reset link if that is what you were doing."
      );
      void supabase.auth.signOut({ scope: "local" });
      router.replace("/login");
    }
  }, [router, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        const isNetworkError =
          authError.message.toLowerCase().includes("failed to fetch") ||
          authError.name === "AuthRetryableFetchError";
        setError(
          isNetworkError
            ? "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local and that your project is active."
            : authError.message
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
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
          <LogIn className="h-6 w-6 text-accent" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to continue your exam prep
        </p>
      </div>

      <div className="mb-5 space-y-4">
        <GoogleSignInButton
          label="Continue with Google"
          disabled={loading}
          onError={(message) => setError(message || null)}
        />
        <AuthDivider />
      </div>

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

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Lock className="h-4 w-4 text-accent" aria-hidden />
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
            placeholder="••••••••"
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
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" aria-hidden />
              Sign in
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
