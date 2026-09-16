import { Clock } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getMessages, translate } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/server";

type ComingSoonProps = {
  examName: string;
  backHref?: string;
  backLabel?: string;
};

export async function ComingSoon({
  examName,
  backHref = "/dashboard",
  backLabel,
}: ComingSoonProps) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const dashboardTitle = translate(messages, "dashboard.title");

  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader
        backHref={backHref}
        backLabel={backLabel ?? dashboardTitle}
        title={dashboardTitle}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
          <Clock className="h-8 w-8 text-accent" aria-hidden />
        </span>
        <p className="text-center text-3xl font-bold tracking-wide text-foreground sm:text-5xl">
          {translate(messages, "dashboard.comingSoonTitle", { exam: examName })}
        </p>
        <p className="max-w-md text-center text-muted">
          {translate(messages, "dashboard.comingSoonBody")}
        </p>
      </main>
    </div>
  );
}
