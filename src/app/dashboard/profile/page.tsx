import { DashboardHeader } from "@/components/DashboardHeader";
import { ProfileContent } from "./ProfileContent";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <DashboardHeader title="Profile" backHref="/dashboard" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <ProfileContent />
      </main>
    </div>
  );
}
