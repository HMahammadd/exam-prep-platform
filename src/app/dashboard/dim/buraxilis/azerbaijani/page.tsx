import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { ComingSoon } from "@/components/ComingSoon";

export default async function DimBuraxilisAzerbaijaniPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ComingSoon
      examName="AZERBAIJANI LANGUAGE"
      backHref="/dashboard/dim/buraxilis"
      backLabel="BURAXILIŞ"
    />
  );
}
