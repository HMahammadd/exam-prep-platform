import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AdminNav } from "@/components/admin/AdminNav";
import { PostHogIdentify } from "@/components/PostHogIdentify";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <PostHogIdentify />
      <DashboardHeader
        title="Admin"
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      <div className="border-b border-card-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <AdminNav />
          <p className="text-xs text-muted">
            Signed in as {profile.email ?? profile.fullName ?? "admin"}
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
