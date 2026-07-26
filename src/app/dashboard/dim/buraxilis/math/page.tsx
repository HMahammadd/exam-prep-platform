import { Calculator } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DimMathChapterRow } from "@/components/dim/DimMathChapterRow";
import { DIM_MATH_CHAPTERS } from "@/lib/dim-math-chapters";

export default async function DimBuraxilisMathPage() {
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
        title="Math"
        backHref="/dashboard/dim/buraxilis"
        backLabel="BURAXILIŞ"
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <Calculator className="h-6 w-6 text-accent" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-foreground">
              MATH
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose a chapter to practice.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {DIM_MATH_CHAPTERS.map((chapter) => (
            <DimMathChapterRow key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </main>
    </div>
  );
}
