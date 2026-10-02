import { redirect } from "next/navigation";
import { TimedResults } from "@/components/sat/timed-practice/TimedResults";
import { getCachedUser } from "@/lib/cached-auth";
import { getRequestLocale } from "@/lib/i18n/server";
import { TIMED_PRACTICE_PATH } from "@/lib/timed-practice";
import { loadLocalTimedResults } from "@/lib/timed-practice-local";

export default async function TimedPracticeResultsPage() {
  const user = await getCachedUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getRequestLocale();
  const results = await loadLocalTimedResults(user.id, locale);

  if (!results) {
    redirect(TIMED_PRACTICE_PATH);
  }

  return <TimedResults results={results} locale={locale} />;
}
