import { redirect } from "next/navigation";
import { getCachedUser } from "@/lib/cached-auth";
import { VocabularyPage } from "@/components/vocabulary/VocabularyPage";
import { VOCABULARY_WORDS } from "@/lib/vocabulary-words";
import { getMyVocabularyState } from "./actions";

export default async function DashboardVocabularyPage() {
  // getCachedUser is request-memoized, so this guard and the getUser() inside
  // getMyVocabularyState below share a single auth round-trip.
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const userState = await getMyVocabularyState();

  return (
    <VocabularyPage words={VOCABULARY_WORDS} initialState={userState} />
  );
}
