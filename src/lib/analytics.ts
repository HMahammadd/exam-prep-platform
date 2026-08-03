/** Product analytics should not run on local development hosts. */
export function shouldEnablePostHog(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]";
}
