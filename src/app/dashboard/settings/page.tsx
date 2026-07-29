import { DashboardHeader } from "@/components/DashboardHeader";
import { SettingsContent } from "./SettingsContent";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Settings" backHref="/dashboard" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <SettingsContent />
      </main>
    </div>
  );
}
