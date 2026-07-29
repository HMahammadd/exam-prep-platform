import { DashboardHeader } from "@/components/DashboardHeader";
import { FriendsContent } from "./FriendsContent";

export default function FriendsPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Friends" backHref="/dashboard" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <FriendsContent />
      </main>
    </div>
  );
}
