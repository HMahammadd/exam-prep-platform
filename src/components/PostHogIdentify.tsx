"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { shouldEnablePostHog } from "@/lib/analytics";
import { supabase } from "@/lib/supabaseClient";

/**
 * Links PostHog events to the logged-in Supabase user, and resets on logout.
 * No-ops on localhost where PostHog is not initialized.
 */
export function PostHogIdentify() {
  useEffect(() => {
    if (!shouldEnablePostHog()) return;

    let cancelled = false;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      posthog.identify(user.id, {
        email: user.email,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        posthog.reset();
        return;
      }

      const user = session?.user;
      if (!user) return;

      if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
        posthog.identify(user.id, {
          email: user.email,
        });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
