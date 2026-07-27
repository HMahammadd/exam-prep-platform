"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

type TurnstileFieldProps = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  onWidgetError?: () => void;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export function TurnstileField({
  onToken,
  onExpire,
  onError,
  onWidgetError,
}: TurnstileFieldProps) {
  const widgetRef = useRef<TurnstileInstance | null>(null);

  if (!siteKey) {
    if (process.env.NODE_ENV === "production") {
      return (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Sign-up protection is not configured. Contact support.
        </p>
      );
    }

    return (
      <p className="rounded-lg border border-dashed border-card-border px-3 py-2 text-xs text-muted">
        Add{" "}
        <code className="text-foreground">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code>{" "}
        and <code className="text-foreground">TURNSTILE_SECRET_KEY</code> to
        enable Turnstile in development.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={widgetRef}
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.();
          widgetRef.current?.reset();
        }}
        onError={() => {
          onError?.();
          onWidgetError?.();
          widgetRef.current?.reset();
        }}
        options={{
          theme: "auto",
          size: "normal",
        }}
      />
    </div>
  );
}

export function isTurnstileRequired(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}
