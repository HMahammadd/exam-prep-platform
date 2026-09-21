import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SatShell } from "@/components/sat/SatShell";
import { getCachedUser } from "@/lib/cached-auth";

/**
 * The persistent dashboard shell.
 *
 * Sidebar and topbar are mounted here exactly once, so moving between the
 * sections below is a plain App Router navigation that swaps `children` only.
 * Pages must never render their own chrome (no DashboardHeader, no SatShell) —
 * they return the content for the right-hand column and nothing else.
 */
export default async function DashboardShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  return <SatShell>{children}</SatShell>;
}
