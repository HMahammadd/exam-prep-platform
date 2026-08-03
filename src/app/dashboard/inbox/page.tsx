import { DashboardHeader } from "@/components/DashboardHeader";
import { InboxContent } from "./InboxContent";

export default function InboxPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Inbox" backHref="/dashboard" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
        <InboxContent />
      </main>
    </div>
  );
}
