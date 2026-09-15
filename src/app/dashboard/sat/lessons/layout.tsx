import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { createClient } from "@/lib/supabaseServer";

export default async function SatLessonsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader
        title="SAT Lessons"
        backHref="/dashboard/sat"
        backLabel="SAT Practice"
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-3 py-5 sm:px-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
