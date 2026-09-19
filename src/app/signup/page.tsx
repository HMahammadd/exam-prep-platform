"use client";

import { BetaBadge } from "@/components/BetaBadge";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/GoogleSignInButton";
import { useI18n } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import {
  isTurnstileRequired,
  TurnstileField,
} from "@/components/TurnstileField";
import {
  checkUsernameAvailability,
  verifySignupTurnstile,
} from "@/app/signup/actions";
import { withLocale } from "@/lib/i18n/config";
import { supabase } from "@/lib/supabaseClient";
import { validateUsername } from "@/lib/username";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function SignupPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setError(t("auth.passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
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
    router.push(withLocale("/login", locale));
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
              {t("auth.createAccountTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {t("auth.createAccountSubtitle")}
            </p>
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <BetaBadge tone="soft" />
              <p className="text-xs text-muted">{t("beta.signupNote")}</p>
            </div>
          </div>

          <div className="mb-5 space-y-4">
            <GoogleSignInButton
              label={t("auth.signInWithGoogle")}
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
                {t("auth.username")}
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
                placeholder={t("auth.usernamePlaceholder")}
              />
              <p className="mt-1.5 text-xs text-muted">
                {t("auth.usernameHint")}
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Mail className="h-4 w-4 text-accent" aria-hidden />
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Lock className="h-4 w-4 text-accent" aria-hidden />
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClassName} pr-10`}
                  placeholder={t("auth.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-foreground"
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Lock className="h-4 w-4 text-accent" aria-hidden />
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClassName} pr-10`}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <TurnstileField
              key={turnstileResetKey}
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              onWidgetError={() => setError(t("auth.turnstileError"))}
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
                  {t("auth.creating")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden />
                  {t("auth.createAccountCta")}
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {t("auth.alreadyHaveAccount")}{" "}
            <LocaleLink
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              {t("auth.signIn")}
            </LocaleLink>
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
                aria-label={t("auth.close")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <h2
              id="confirm-email-title"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              {t("auth.checkEmailTitle")}
            </h2>
            <p
              id="confirm-email-description"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              {t("auth.checkEmailBody", { email: submittedEmail })}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={goToLogin}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
              >
                {t("auth.goToSignIn")}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent-soft"
              >
                {t("auth.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
