"use client";

import {
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/GoogleSignInButton";
import {
  isTurnstileRequired,
  TurnstileField,
} from "@/components/TurnstileField";
import {
  checkUsernameAvailability,
  verifySignupTurnstile,
} from "@/app/signup/actions";
import { supabase } from "@/lib/supabaseClient";
import { validateUsername } from "@/lib/username";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const turnstileRequired = isTurnstileRequired();
  const canSubmit =
    !loading && (!turnstileRequired || Boolean(turnstileToken));

  useEffect(() => {
    if (!showConfirmModal) return;

    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowConfirmModal(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showConfirmModal]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const formatError = validateUsername(username);
    if (formatError) {
      setError(formatError);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const usernameCheck = await checkUsernameAvailability(username);
    if (!usernameCheck.success) {
      setError(usernameCheck.error);
      setLoading(false);
      return;
    }

    const turnstileCheck = await verifySignupTurnstile(turnstileToken ?? "");
    if (!turnstileCheck.success) {
      setError(turnstileCheck.error);
      setTurnstileToken(null);
      setTurnstileResetKey((k) => k + 1);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username: usernameCheck.username,
          full_name: usernameCheck.username,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setTurnstileToken(null);
      setTurnstileResetKey((k) => k + 1);
      setLoading(false);
      return;
    }

    setSubmittedEmail(email.trim());
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
    setShowConfirmModal(true);
  }

  function goToLogin() {
    setShowConfirmModal(false);
    router.push("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
              <UserPlus className="h-6 w-6 text-accent" aria-hidden />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-muted">
              Start practicing for your exams today
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
                htmlFor="username"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <User className="h-4 w-4 text-accent" aria-hidden />
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClassName}
                placeholder="e.g. kepler_student"
              />
              <p className="mt-1.5 text-xs text-muted">
                3–20 characters: letters, numbers, and underscores
              </p>
            </div>

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
              <label
                htmlFor="password"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Lock className="h-4 w-4 text-accent" aria-hidden />
                Password
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

            <TurnstileField
              key={turnstileResetKey}
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              onWidgetError={() =>
                setError(
                  "Could not load the security check. Try disabling ad blockers or use another browser."
                )
              }
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
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
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden />
                  Sign up
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-email-title"
            aria-describedby="confirm-email-description"
            className="w-full max-w-md rounded-2xl border border-card-border bg-card p-8 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                <CheckCircle2 className="h-6 w-6 text-accent" aria-hidden />
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-1.5 text-muted transition hover:bg-accent-soft hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <h2
              id="confirm-email-title"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Check your email
            </h2>
            <p
              id="confirm-email-description"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              We sent a confirmation link to{" "}
              <span className="font-medium text-foreground">
                {submittedEmail}
              </span>
              . Open it to activate your account, then sign in.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
              >
                Go to sign in
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
