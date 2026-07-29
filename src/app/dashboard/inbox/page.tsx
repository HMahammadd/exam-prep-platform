import { DashboardHeader } from "@/components/DashboardHeader";
import { InboxContent } from "./InboxContent";

export default function InboxPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Inbox" backHref="/dashboard" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <InboxContent />
      </main>
    </div>
  );
}
