import { Clock } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";

type ComingSoonProps = {
  examName: string;
  backHref?: string;
  backLabel?: string;
};

export function ComingSoon({
  examName,
  backHref = "/dashboard",
  backLabel = "Dashboard",
}: ComingSoonProps) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader backHref={backHref} backLabel={backLabel} />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
          <Clock className="h-8 w-8 text-accent" aria-hidden />
        </span>
        <p className="text-center text-3xl font-bold tracking-wide text-foreground sm:text-5xl">
          {examName} COMING SOON
        </p>
        <p className="max-w-md text-center text-muted">
          We&apos;re working on this section. Check back later for updates.
        </p>
      </main>
    </div>
  );
}
