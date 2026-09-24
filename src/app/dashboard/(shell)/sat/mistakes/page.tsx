import { redirect } from "next/navigation";
import { getSatMistakes } from "@/app/dashboard/(shell)/sat/mistakes-actions";
import { MistakesContent } from "@/components/sat/mistakes/MistakesContent";
import { getCachedUser } from "@/lib/cached-auth";

export default async function SatMistakesPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const items = await getSatMistakes();

  return <MistakesContent initialItems={items} />;
}
