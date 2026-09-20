import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { SatShell } from "@/components/sat/SatShell";
import { VocabularyPage } from "@/components/vocabulary/VocabularyPage";
import { VOCABULARY_WORDS } from "@/lib/vocabulary-words";
import { getMyVocabularyState } from "./actions";

export default async function DashboardVocabularyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userState = await getMyVocabularyState();

  return (
    <SatShell title="Vocabulary" breadcrumb="Dashboard / Vocabulary">
      <VocabularyPage words={VOCABULARY_WORDS} initialState={userState} />
    </SatShell>
  );
}
