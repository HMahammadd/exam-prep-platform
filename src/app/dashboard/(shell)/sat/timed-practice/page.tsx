import { redirect } from "next/navigation";
import { TimedPracticeContent } from "@/components/sat/timed-practice/TimedPracticeContent";
import { getCachedUser } from "@/lib/cached-auth";
import { getRequestLocale } from "@/lib/i18n/server";
import { loadTimedPracticeView } from "@/lib/timed-practice-local";

/**
 * SAT → Timed Practice. Runs without a database, like Daily Goal: sessions and
 * history live in a cookie — see timed-practice-local.ts.
 */
export default async function SatTimedPracticePage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const view = await loadTimedPracticeView(user.id, await getRequestLocale());
  return <TimedPracticeContent view={view} />;
}
