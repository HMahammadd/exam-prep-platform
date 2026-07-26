import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { ComingSoon } from "@/components/ComingSoon";

export default async function DimBlokPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ComingSoon
      examName="BLOK"
      backHref="/dashboard/dim"
      backLabel="DIM Practice"
    />
  );
}
