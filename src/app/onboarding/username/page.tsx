import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { needsUsernameSetup } from "@/lib/username-setup";
import {
  UsernameOnboardingForm,
  UsernameOnboardingPageShell,
} from "./UsernameOnboardingForm";

export default async function UsernameOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!needsUsernameSetup(profile?.username)) {
    redirect("/dashboard");
  }

  return (
    <UsernameOnboardingPageShell>
      <UsernameOnboardingForm />
    </UsernameOnboardingPageShell>
  );
}
