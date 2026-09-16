"use client";

import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import {
  AuthDivider,
  GoogleSignInButton,
} from "@/components/GoogleSignInButton";
import { useI18n } from "@/components/I18nProvider";
import { LocaleLink } from "@/components/LocaleLink";
import { LogInIcon } from "@/components/LogInIcon";
import { withLocale } from "@/lib/i18n/config";
import { supabase } from "@/lib/supabaseClient";

const inputClassName =
  "w-full rounded-lg border border-card-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError(t("auth.authFailed"));
      void supabase.auth.signOut({ scope: "local" });
      router.replace(withLocale("/login", locale));
    }
  }, [router, searchParams, locale, t]);

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
        setError(isNetworkError ? t("auth.networkError") : authError.message);
        setLoading(false);
        return;
      }

      router.push(withLocale("/dashboard", locale));
      router.refresh();
    } catch {
      setError(t("auth.networkError"));
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
          {t("auth.welcomeBack")}
        </h1>
        <p className="mt-2 text-sm text-muted">{t("auth.signInContinue")}</p>
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
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Lock className="h-4 w-4 text-accent" aria-hidden />
              {t("auth.password")}
            </label>
            <LocaleLink
              href="/forgot-password"
              className="text-xs font-medium text-accent hover:underline"
            >
              {t("auth.forgotPassword")}
            </LocaleLink>
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
          className="group/login inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t("auth.signingIn")}
            </>
          ) : (
            <>
              <LogInIcon className="h-4 w-4" />
              {t("auth.signIn")}
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t("auth.noAccount")}{" "}
        <LocaleLink
          href="/signup"
          className="font-medium text-accent hover:underline"
        >
          {t("auth.signUpLink")}
        </LocaleLink>
      </p>
    </div>
  );
}

export default function LoginPage() {
  const t = useI18n().t;

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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
