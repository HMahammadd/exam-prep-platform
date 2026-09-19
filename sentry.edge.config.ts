// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3128508f9cfb241aea69658d28b67117@o4511843047309312.ingest.us.sentry.io/4511843056943104",

  // Keep full tracing in development; sample in production to cut edge overhead.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // This app handles auth cookies, exam answers and profile data. Sentry's
  // defaults would attach request bodies, headers and user info to every
  // event, so both are turned off explicitly.
  sendDefaultPii: false,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});
