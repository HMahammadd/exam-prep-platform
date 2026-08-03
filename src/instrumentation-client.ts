import posthog from "posthog-js";
import { shouldEnablePostHog } from "@/lib/analytics";

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
