import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { shouldEnablePostHog } from "@/lib/analytics";

// --- Sentry (client) ---
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
Sentry.init({
  dsn: "https://3128508f9cfb241aea69658d28b67117@o4511843047309312.ingest.us.sentry.io/4511843056943104",

  // Keep full tracing in development; sample in production to cut client overhead.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// --- PostHog ---
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (token && shouldEnablePostHog()) {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
    // Keep off until we intentionally enable it with exam-route masking.
    disable_session_recording: true,
  });
}
