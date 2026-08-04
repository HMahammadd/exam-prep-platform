import type { ReactNode } from "react";
import { PostHogIdentify } from "@/components/PostHogIdentify";

/**
 * Shared signed-in shell extras (analytics identify).
 * Keeps PostHog identify off marketing/auth pages while global init still
 * records anonymous pageviews from instrumentation-client.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  );
}
