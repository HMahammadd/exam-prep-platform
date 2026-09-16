"use client";

import { ArrowLeft, KeyRound, Loader2, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { useI18n } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError(t("auth.resetLinkInvalid"));
      void supabase.auth.signOut({ scope: "local" });
    }
  }, [searchParams, t]);

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
          isNetworkError ? t("auth.networkError") : resetError.message
        );
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError(t("auth.networkError"));
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
          {t("auth.forgotTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {sent ? t("auth.forgotSentSubtitle") : t("auth.forgotSubtitle")}
        </p>
      </div>

      {sent ? (
        <div className="space-y-5">
          <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-foreground">
            {t("auth.forgotSentBody", { email: email.trim() })}
          </p>
          <LocaleLink
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            {t("auth.backToSignIn")}
          </LocaleLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
                {t("auth.sending")}
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" aria-hidden />
                {t("auth.sendReset")}
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <LocaleLink
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t("auth.backToSignIn")}
        </LocaleLink>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <p className="flex items-center justify-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("auth.loading")}
            </p>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
