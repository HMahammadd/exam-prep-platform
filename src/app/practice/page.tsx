import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PracticeSession } from "./PracticeSession";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="SAT Practice" backHref="/dashboard" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="rounded-2xl border border-card-border bg-card p-8 shadow-card">
          <PracticeSession />
        </div>
      </main>
    </div>
  );
}
