import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SelectionOptionCard } from "@/components/SelectionOptionCard";
import { DIM_BURAXILIS_SUBJECTS } from "@/lib/dim";

export default async function DimBuraxilisPage() {
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
        title="BURAXILIŞ"
        backHref="/dashboard/dim"
        backLabel="DIM Practice"
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <BookOpen className="h-6 w-6 text-accent" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              BURAXILIŞ
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose a subject to start practicing.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIM_BURAXILIS_SUBJECTS.map((subject) => (
            <SelectionOptionCard key={subject.id} option={subject} />
          ))}
        </div>
      </main>
    </div>
  );
}
