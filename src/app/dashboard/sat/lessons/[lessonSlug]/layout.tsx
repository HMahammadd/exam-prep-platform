import type { ReactNode } from "react";
import { SatLessonNavigation } from "@/components/sat/SatLessonNavigation";

export default function SatLessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-168 w-full flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-card md:flex-row">
      <SatLessonNavigation />
      <section className="min-w-0 flex-1 p-6 sm:p-8 md:p-10">
        {children}
      </section>
    </div>
  );
}
